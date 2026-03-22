/**
 * Upload Controller
 *
 * Handles all upload-related operations including:
 * - File upload and question generation
 * - Upload history retrieval
 * - File deletion
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseFile } from "../utils/fileParser.js";
import { generateQuestions } from "../services/questionService.js";
import { updateProgress } from "../utils/progressTracker.js";
import Upload from "../models/Upload.js";
import User from "../models/User.js";

// ES modules workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

/**
 * Health Check Handler
 * GET /health
 *
 * Tests if the server is running properly
 */
export const healthCheck = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

/**
 * Upload File and Generate Questions Handler
 * POST /upload
 *
 * Accepts file uploads (PDF, DOCX, TXT)
 * Extracts text from the file
 * Generates AI-powered questions
 *
 * Request: multipart/form-data with 'file' field
 * Optional fields: questionType, difficulty, numQuestions
 */
export const uploadFile = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    console.log(`File uploaded: ${req.file.originalname}`);
    console.log(`File path: ${req.file.path}`);
    console.log(`File size: ${req.file.size} bytes`);

    // Extract optional parameters from request body
    const {
      questionType = "multiple-choice",
      difficulty = "medium",
      numQuestions = 5,
      progressId,
    } = req.body;

    // Get file extension
    const fileExt = path.extname(req.file.originalname).toLowerCase().slice(1);

    // Create upload record in database
    // Let MongoDB auto-generate _id naturally
    const upload = await Upload.create({
      user: req.user._id,
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      fileType: fileExt,
      fileSize: req.file.size,
      filePath: req.file.path,
      questionType,
      difficulty,
      numQuestions: parseInt(numQuestions),
      textLength: 0,
      status: "processing",
    });

    const progressKey = progressId || upload._id.toString();

    // Track progress for this upload
    updateProgress(
      progressKey,
      "extracting",
      10,
      "Extracting text from document...",
    );

    // Step 1: Extract text from the uploaded file
    console.log("Extracting text from file...");
    const extractedText = await parseFile(
      req.file.path,
      req.file.mimetype,
      progressKey,
    );

    if (!extractedText || extractedText.trim().length === 0) {
      // Update upload status
      upload.status = "failed";
      await upload.save();

      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);

      updateProgress(
        progressKey,
        "failed",
        0,
        "Failed to extract text from document.",
      );

      return res.status(400).json({
        status: "error",
        message:
          "Could not extract text from the file. The file may be empty or corrupted.",
      });
    }

    console.log(`Extracted ${extractedText.length} characters of text`);

    // Update text length
    upload.textLength = extractedText.length;
    await upload.save();

    // Update progress: now generating questions
    updateProgress(progressKey, "generating", 70, "Generating AI questions...");

    // Step 2: Generate questions using AI
    console.log("Generating questions using AI...");
    const questions = await generateQuestions(extractedText, {
      questionType,
      difficulty,
      numQuestions: parseInt(numQuestions),
    });

    console.log(`Generated ${questions.length} questions`);
    console.log(
      "First question structure:",
      JSON.stringify(questions[0], null, 2),
    );

    // Update progress: saving
    updateProgress(progressKey, "saving", 85, "Saving questions...");

    // Step 3: Save questions to database
    upload.questions = questions;
    upload.status = "completed";

    console.log("Saving upload with questions...");
    await upload.save();
    console.log("Upload saved successfully");

    // Mark as completed
    updateProgress(
      progressKey,
      "completed",
      100,
      "Questions generated successfully!",
    );

    // Step 4: Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        uploadCount: 1,
        questionCount: questions.length,
      },
    });

    // Step 5: Return the generated questions
    res.status(200).json({
      status: "success",
      message: "Questions generated successfully",
      data: {
        uploadId: upload._id,
        progressId: progressKey,
        filename: req.file.originalname,
        textLength: extractedText.length,
        questions: questions,
        metadata: {
          questionType,
          difficulty,
          numQuestions: questions.length,
        },
      },
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    console.error("Error stack:", error.stack);

    // Clean up file only on error
    if (req.file && fs.existsSync(req.file.path)) {
      console.log("Cleaning up uploaded file due to error");
      fs.unlinkSync(req.file.path);
    }

    // Mark as failed in progress tracker
    try {
      const fallbackProgressId =
        req.body.progressId || req.body.uploadId || "unknown";
      updateProgress(
        fallbackProgressId,
        "failed",
        0,
        `Error: ${error.message}`,
      );
    } catch (progressError) {
      // Ignore progress tracking errors
    }

    const statusCode = error.status || 500;
    const errorCode = error.code || "UPLOAD_PROCESSING_FAILED";

    res.status(statusCode).json({
      status: "error",
      code: errorCode,
      message: error.message || "Failed to process file",
      error: error.message,
      detailsPayload: error.details,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Get Upload History Handler
 * GET /uploads/history
 *
 * Returns list of user's uploaded files and generated questions
 */
export const getUploadHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const uploads = await Upload.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-questions"); // Exclude full questions from list

    const count = await Upload.countDocuments({ user: req.user._id });

    res.status(200).json({
      status: "success",
      data: {
        uploads,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve upload history",
      error: error.message,
    });
  }
};

/**
 * Get Single Upload with Questions
 * GET /uploads/:id
 *
 * Returns a specific upload with all questions
 */
export const getUploadById = async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!upload) {
      return res.status(404).json({
        status: "error",
        message: "Upload not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { upload },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve upload",
      error: error.message,
    });
  }
};

/**
 * Rename Upload Section Handler
 * PATCH /uploads/:id/rename
 *
 * Updates the display name for a specific upload
 */
export const renameUpload = async (req, res) => {
  try {
    const { name } = req.body;
    const trimmedName = (name || "").trim();

    if (!trimmedName) {
      return res.status(400).json({
        status: "error",
        message: "Section name is required",
      });
    }

    if (trimmedName.length > 120) {
      return res.status(400).json({
        status: "error",
        message: "Section name must be 120 characters or fewer",
      });
    }

    const upload = await Upload.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!upload) {
      return res.status(404).json({
        status: "error",
        message: "Upload not found",
      });
    }

    upload.originalFilename = trimmedName;
    await upload.save();

    res.status(200).json({
      status: "success",
      message: "Section renamed successfully",
      data: {
        upload,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to rename section",
      error: error.message,
    });
  }
};

/**
 * Delete Uploaded File Handler
 * DELETE /uploads/:id
 *
 * Deletes a specific uploaded file and its database record
 */
export const deleteFile = async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!upload) {
      return res.status(404).json({
        status: "error",
        message: "Upload not found",
      });
    }

    // Delete physical file if it exists
    if (fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }

    // Delete database record
    await Upload.findByIdAndDelete(req.params.id);

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        uploadCount: -1,
        questionCount: -upload.questions.length,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Upload deleted successfully",
      data: {
        deletedUploadId: req.params.id,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete upload",
      error: error.message,
    });
  }
};
