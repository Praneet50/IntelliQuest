/**
 * IntelliQuest Backend Server
 * AI-based Question Generator API
 *
 * This server handles file uploads, text extraction, and AI-powered question generation
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

// Promisify exec for async/await usage
const execAsync = promisify(exec);

// Import database connection
import connectDB from "./config/database.js";

// Import routes
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Import progress tracker
import { getProgress, startCleanupInterval } from "./utils/progressTracker.js";

// Load environment variables
dotenv.config();

// ============================================
// CONFIGURE PATH FOR OCR DEPENDENCIES (WINDOWS)
// ============================================
// Add Ghostscript and GraphicsMagick to PATH so Node.js can find them
const ghostscriptBinPath = "C:\\Program Files\\gs\\gs10.07.0\\bin";
const graphicsmagickPath = "C:\\Program Files\\GraphicsMagick-1.3.46-Q16";

if (process.env.PATH) {
  process.env.PATH = `${ghostscriptBinPath};${graphicsmagickPath};${process.env.PATH}`;
} else {
  process.env.PATH = `${ghostscriptBinPath};${graphicsmagickPath}`;
}

console.log("✓ Added OCR dependency paths to NODE process.env.PATH");

// ============================================
// OCR DEPENDENCY CHECK FUNCTION
// ============================================
/**
 * Check if required OCR dependencies are installed and accessible
 *
 * @returns {Promise<boolean>} - Returns true if both Ghostscript and GraphicsMagick are available
 * @throws {Error} - Throws with clear error message if any dependency is missing
 */
async function checkOCRDependencies() {
  try {
    // Check Ghostscript first
    console.log("Checking Ghostscript availability...");
    try {
      const { stdout: gsVersion } = await execAsync("gswin64c -version");
      console.log("✓ Ghostscript detected");
      console.log(`  Version: ${gsVersion.split("\n")[0]}`);
    } catch (gsError) {
      throw new Error(
        "Ghostscript not found. Install Ghostscript from https://www.ghostscript.com/download/gsdnld.html " +
          'and ensure it\'s in PATH or at "C:\\Program Files\\gs\\gs10.07.0\\bin"',
      );
    }

    // Check GraphicsMagick
    console.log("Checking GraphicsMagick availability...");
    try {
      const { stdout: gmVersion } = await execAsync("gm.exe -version");
      console.log("✓ GraphicsMagick detected");
      console.log(`  Version: ${gmVersion.split("\n")[0]}`);
    } catch (gmError) {
      throw new Error(
        "GraphicsMagick not found. Install GraphicsMagick from http://www.graphicsmagick.org/download.html " +
          'and ensure it\'s in PATH or at "C:\\Program Files\\GraphicsMagick-1.3.46-Q16"',
      );
    }

    console.log("✓ All OCR dependencies are available\n");
    return true;
  } catch (error) {
    console.error("❌ OCR Dependency Check Failed:");
    console.error(`   ${error.message}\n`);
    throw error;
  }
}

// ES modules workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Enable CORS for React frontend
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Get upload progress
app.get("/upload-progress/:uploadId", (req, res) => {
  const { uploadId } = req.params;
  const progress = getProgress(uploadId);

  if (!progress) {
    return res.status(404).json({
      status: "error",
      message: "Upload not found or progress data expired",
    });
  }

  res.status(200).json({
    status: "success",
    data: progress,
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Use upload routes
app.use("/", uploadRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  if (err.message?.includes("Invalid file type")) {
    return res.status(400).json({
      status: "error",
      code: "INVALID_FILE_TYPE",
      message: "Invalid file type. Only PDF, DOCX, and TXT files are allowed.",
    });
  }

  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        code: "FILE_SIZE_LIMIT_EXCEEDED",
        message: "File is too large. Maximum size is 10MB.",
        detailsPayload: {
          maxSizeMB: 10,
        },
      });
    }
    return res.status(400).json({
      status: "error",
      code: "UPLOAD_VALIDATION_ERROR",
      message: err.message,
    });
  }

  res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: err.message || "Internal server error",
  });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Start progress cleanup interval
    startCleanupInterval();

    // Check OCR dependencies before starting server
    await checkOCRDependencies();

    await connectDB();

    app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log(`🚀 IntelliQuest Backend Server`);
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`📁 Uploads directory: ${uploadsDir}`);
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
