/**
 * Upload Model
 *
 * Stores information about uploaded files and generated questions
 */

import mongoose from "mongoose";

// Define question subdocument schema explicitly
const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String },
    explanation: { type: String },
    sampleAnswer: { type: String },
    keyPoints: [{ type: String }],
    guidelines: { type: String },
    suggestedLength: { type: String },
    type: { type: String },
    difficulty: { type: String },
  },
  { _id: false },
); // Disable _id for subdocuments

const uploadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "docx", "txt"],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    textLength: {
      type: Number,
      required: true,
    },
    questionType: {
      type: String,
      enum: ["multiple-choice", "true-false", "short-answer", "essay"],
      default: "multiple-choice",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    numQuestions: {
      type: Number,
      default: 5,
    },
    questions: [questionSchema],
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
uploadSchema.index({ user: 1, createdAt: -1 });

const Upload = mongoose.model("Upload", uploadSchema);

export default Upload;
