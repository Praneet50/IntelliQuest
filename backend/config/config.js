/**
 * Configuration Module
 *
 * Centralized configuration for the IntelliQuest backend
 * Loads environment variables and provides default values
 */

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 5000,
    env: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ],
    uploadDir: process.env.UPLOAD_DIR || "uploads",
  },

  // AI Service Configuration
  ai: {
    provider: process.env.AI_PROVIDER || "gemini", // 'gemini', 'openai', 'anthropic'

    // Google Gemini
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || "",
      model: process.env.GEMINI_MODEL || "gemini-pro",
    },

    // OpenAI
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      model: process.env.OPENAI_MODEL || "gpt-4",
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
    },

    // Anthropic Claude
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      model: process.env.ANTHROPIC_MODEL || "claude-3-opus-20240229",
    },

    // Default question generation settings
    defaults: {
      questionType: process.env.DEFAULT_QUESTION_TYPE || "multiple-choice",
      difficulty: process.env.DEFAULT_DIFFICULTY || "medium",
      numQuestions: parseInt(process.env.DEFAULT_NUM_QUESTIONS) || 5,
    },
  },

  // OCR Configuration
  ocr: {
    enabled: process.env.OCR_ENABLED === "true",
    provider: process.env.OCR_PROVIDER || "tesseract", // 'tesseract', 'google', 'aws', 'azure'

    // Google Cloud Vision
    googleVision: {
      apiKey: process.env.GOOGLE_VISION_API_KEY || "",
      projectId: process.env.GOOGLE_VISION_PROJECT_ID || "",
    },

    // AWS Textract
    awsTextract: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      region: process.env.AWS_REGION || "us-east-1",
    },

    // Azure Computer Vision
    azureVision: {
      apiKey: process.env.AZURE_VISION_API_KEY || "",
      endpoint: process.env.AZURE_VISION_ENDPOINT || "",
    },
  },

  // Database Configuration (for future use)
  database: {
    type: process.env.DB_TYPE || "mongodb", // 'mongodb', 'postgresql', 'mysql'
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 27017,
    name: process.env.DB_NAME || "intelliquest",
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    uri: process.env.DATABASE_URL || "",
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || "info", // 'debug', 'info', 'warn', 'error'
    enableConsole: process.env.LOG_CONSOLE !== "false",
    enableFile: process.env.LOG_FILE === "true",
    filePath: process.env.LOG_FILE_PATH || "logs/app.log",
  },

  // Security Configuration
  security: {
    corsOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : ["http://localhost:5173"],
    rateLimitWindowMs:
      parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

/**
 * Validate required configuration values
 *
 * @throws {Error} - If required configuration is missing
 */
export function validateConfig() {
  const errors = [];

  // Check if AI provider API key is configured
  if (config.ai.provider === "gemini" && !config.ai.gemini.apiKey) {
    errors.push("GEMINI_API_KEY is not configured");
  }

  if (config.ai.provider === "openai" && !config.ai.openai.apiKey) {
    errors.push("OPENAI_API_KEY is not configured");
  }

  if (config.ai.provider === "anthropic" && !config.ai.anthropic.apiKey) {
    errors.push("ANTHROPIC_API_KEY is not configured");
  }

  if (errors.length > 0) {
    console.warn("Configuration warnings:", errors.join(", "));
    console.warn("AI features may not work without proper API keys");
  }

  return errors.length === 0;
}

export default config;
