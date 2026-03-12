/**
 * File Parser Utilities
 *
 * This module handles text extraction from various file formats:
 * - PDF files
 * - DOCX files (Microsoft Word)
 * - TXT files (plain text)
 *
 * Future enhancements:
 * - OCR for scanned PDFs and images
 * - Support for additional formats
 */

import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";

/**
 * Parse and extract text from uploaded files based on file type
 *
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Extracted text content
 */
export async function parseFile(filePath, mimeType) {
  try {
    console.log(`Extracting text from file type: ${mimeType}`);

    switch (mimeType) {
      case "application/pdf":
        return await extractTextFromPDF(filePath);

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/msword":
        return await extractTextFromDOCX(filePath);

      case "text/plain":
        return await extractTextFromTXT(filePath);

      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error("Error in parseFile:", error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

/**
 * Extract text from PDF files
 *
 * Uses pdf-parse library for text extraction
 *
 * TODO: Implement OCR for scanned PDFs using Tesseract.js or similar
 *
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    console.log(
      `PDF parsed: ${data.numpages} pages, ${data.text.length} characters`,
    );

    if (!data.text || data.text.trim().length === 0) {
      console.warn("PDF appears to be empty or scanned. OCR may be needed.");
      // TODO: Implement OCR fallback here
      // return await performOCR(filePath);
    }

    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from DOCX files
 *
 * Uses mammoth library for DOCX parsing
 *
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });

    console.log(`DOCX parsed: ${result.value.length} characters`);

    if (result.messages.length > 0) {
      console.warn("DOCX parsing warnings:", result.messages);
    }

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("DOCX file appears to be empty");
    }

    return result.value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from plain text files
 *
 * Simple file read operation
 *
 * @param {string} filePath - Path to the TXT file
 * @returns {Promise<string>} - File content
 */
async function extractTextFromTXT(filePath) {
  try {
    const text = fs.readFileSync(filePath, "utf8");

    console.log(`TXT parsed: ${text.length} characters`);

    if (!text || text.trim().length === 0) {
      throw new Error("TXT file is empty");
    }

    return text;
  } catch (error) {
    console.error("Error reading TXT file:", error);
    throw new Error(`TXT extraction failed: ${error.message}`);
  }
}

/**
 * Perform OCR on scanned documents or images
 *
 * TODO: Implement OCR functionality using Tesseract.js or cloud OCR services
 *
 * Potential libraries:
 * - tesseract.js (client-side OCR)
 * - Google Cloud Vision API
 * - AWS Textract
 * - Azure Computer Vision
 *
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - Extracted text from OCR
 */
async function performOCR(filePath) {
  // Placeholder for OCR implementation
  console.log("OCR functionality not yet implemented");

  // Example implementation structure:
  /*
  const Tesseract = require('tesseract.js');
  const { data: { text } } = await Tesseract.recognize(
    filePath,
    'eng',
    { logger: m => console.log(m) }
  );
  return text;
  */

  throw new Error(
    "OCR functionality is not yet implemented. Cannot extract text from scanned documents.",
  );
}

/**
 * Clean and normalize extracted text
 *
 * Removes excessive whitespace, normalizes line breaks, etc.
 *
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
export function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/\r\n/g, "\n") // Normalize line breaks
    .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
    .replace(/[ \t]{2,}/g, " ") // Remove excessive spaces
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Split text into chunks for better processing
 *
 * Useful when dealing with large documents that need to be processed in batches
 *
 * @param {string} text - Full text content
 * @param {number} maxChunkSize - Maximum characters per chunk
 * @returns {Array<string>} - Array of text chunks
 */
export function splitTextIntoChunks(text, maxChunkSize = 5000) {
  const chunks = [];
  const sentences = text.split(/[.!?]+\s+/);

  let currentChunk = "";

  for (const sentence of sentences) {
    if (
      (currentChunk + sentence).length > maxChunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ". " : "") + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
