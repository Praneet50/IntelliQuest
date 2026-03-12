/**
 * Upload Routes
 *
 * Defines all routes related to file uploads and question generation
 */

import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  healthCheck,
  uploadFile,
  getUploadHistory,
  getUploadById,
  renameUpload,
  deleteFile,
} from "../controllers/uploadController.js";
import { protect } from "../middleware/auth.js";

// ES modules workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Define uploads directory
const uploadsDir = path.join(__dirname, "..", "uploads");

// ============================================
// MULTER CONFIGURATION
// ============================================

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOCX, and TXT files are allowed.",
      ),
      false,
    );
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// ============================================
// ROUTE DEFINITIONS
// ============================================

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get("/health", healthCheck);

/**
 * @route   POST /upload
 * @desc    Upload file and generate questions
 * @access  Private
 */
router.post("/upload", protect, upload.single("file"), uploadFile);

/**
 * @route   GET /uploads/history
 * @desc    Get upload history
 * @access  Private
 */
router.get("/uploads/history", protect, getUploadHistory);

/**
 * @route   GET /uploads/:id
 * @desc    Get single upload with questions
 * @access  Private
 */
router.get("/uploads/:id", protect, getUploadById);

/**
 * @route   PATCH /uploads/:id/rename
 * @desc    Rename uploaded section
 * @access  Private
 */
router.patch("/uploads/:id/rename", protect, renameUpload);

/**
 * @route   DELETE /uploads/:id
 * @desc    Delete uploaded file
 * @access  Private
 */
router.delete("/uploads/:id", protect, deleteFile);

export default router;
