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
import { fileURLToPath } from "url";

// Import database connection
import connectDB from "./config/database.js";

// Import routes
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();

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

  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "File is too large. Maximum size is 10MB.",
      });
    }
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }

  res.status(500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
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
