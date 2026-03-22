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
import { fromPath } from "pdf2pic";
import { createWorker } from "tesseract.js";
import { updateProgress } from "./progressTracker.js";

class FileParserError extends Error {
  constructor(code, message, status = 400, details) {
    super(message);
    this.name = "FileParserError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function parsePositiveInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const ENABLE_PDF_OCR = process.env.ENABLE_PDF_OCR !== "false";
const OCR_PAGE_LIMIT = parsePositiveInt(process.env.OCR_PAGE_LIMIT, 20);
const OCR_LANGUAGE = process.env.OCR_LANGUAGE || "eng";

/**
 * Detect whether a PDF is likely scanned based on extracted text quality.
 *
 * Rules:
 * - null/undefined/empty -> scanned
 * - trimmed length < 100 -> scanned
 * - total words < 20 -> scanned
 *
 * @param {string} text - Text extracted from pdf-parse
 * @returns {boolean} - True when PDF is likely scanned
 */
export function isScannedPDF(text) {
  if (!text) {
    return true;
  }

  const trimmedText = String(text).trim();
  if (trimmedText.length === 0) {
    return true;
  }

  if (trimmedText.length < 100) {
    return true;
  }

  const words = trimmedText.split(/\s+/).filter(Boolean);
  if (words.length < 20) {
    return true;
  }

  return false;
}

/**
 * Parse and extract text from uploaded files based on file type
 *
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - MIME type of the file
 * @param {string} uploadId - Optional upload ID for progress tracking
 * @returns {Promise<string>} - Extracted text content
 */
export async function parseFile(filePath, mimeType, uploadId) {
  try {
    console.log(`Extracting text from file type: ${mimeType}`);

    switch (mimeType) {
      case "application/pdf":
        return await extractTextFromPDF(filePath, uploadId);

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/msword":
        return await extractTextFromDOCX(filePath);

      case "text/plain":
        return await extractTextFromTXT(filePath);

      default:
        throw new FileParserError(
          "UNSUPPORTED_FILE_TYPE",
          `Unsupported file type: ${mimeType}`,
          400,
        );
    }
  } catch (error) {
    console.error("Error in parseFile:", error);

    if (error instanceof FileParserError) {
      throw error;
    }

    throw new FileParserError(
      "TEXT_EXTRACTION_FAILED",
      `Failed to extract text: ${error.message}`,
      400,
    );
  }
}

/**
 * Extract text from PDF files
 *
 * Uses pdf-parse library for text extraction
 *
 * @param {string} filePath - Path to the PDF file
 * @param {string} uploadId - Optional upload ID for progress tracking
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(filePath, uploadId) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    console.log(
      `PDF parsed: ${data.numpages} pages, ${data.text.length} characters`,
    );

    const parsedText = data.text || "";

    if (!isScannedPDF(parsedText)) {
      const wordCount = parsedText.trim().split(/\s+/).filter(Boolean).length;
      console.log(
        `✓ PDF text extraction complete: ${parsedText.length} characters, ${wordCount} words`,
      );
      return parsedText;
    }

    const wordCount = parsedText.trim()
      ? parsedText.trim().split(/\s+/).filter(Boolean).length
      : 0;
    console.warn(
      `PDF appears scanned (chars=${parsedText.trim().length}, words=${wordCount}). Attempting OCR fallback...`,
    );

    if (!ENABLE_PDF_OCR) {
      throw new FileParserError(
        "OCR_DISABLED",
        "PDF appears to be scanned. OCR fallback is disabled (ENABLE_PDF_OCR=false).",
        400,
      );
    }

    // Update progress: starting OCR
    if (uploadId) {
      updateProgress(
        uploadId,
        "ocr",
        35,
        `Starting OCR for ${data.numpages} page(s)...`,
      );
    }

    const ocrText = await performOCR(filePath, data.numpages, uploadId);

    if (!ocrText || ocrText.trim().length === 0) {
      throw new FileParserError(
        "OCR_NO_TEXT",
        "PDF appears to be scanned, but OCR did not return readable text.",
        400,
      );
    }

    const ocrWordCount = ocrText.trim().split(/\s+/).filter(Boolean).length;
    console.log(
      `✓ OCR text extraction complete: ${ocrText.length} characters, ${ocrWordCount} words`,
    );
    return ocrText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);

    if (error instanceof FileParserError) {
      throw error;
    }

    throw new FileParserError(
      "PDF_EXTRACTION_FAILED",
      `PDF extraction failed: ${error.message}`,
      400,
    );
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
      throw new FileParserError(
        "DOCX_EMPTY",
        "DOCX file appears to be empty",
        400,
      );
    }

    const wordCount = result.value.trim().split(/\s+/).filter(Boolean).length;
    console.log(
      `✓ DOCX text extraction complete: ${result.value.length} characters, ${wordCount} words`,
    );

    return result.value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);

    if (error instanceof FileParserError) {
      throw error;
    }

    throw new FileParserError(
      "DOCX_EXTRACTION_FAILED",
      `DOCX extraction failed: ${error.message}`,
      400,
    );
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
      throw new FileParserError("TXT_EMPTY", "TXT file is empty", 400);
    }

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    console.log(
      `✓ TXT text extraction complete: ${text.length} characters, ${wordCount} words`,
    );

    return text;
  } catch (error) {
    console.error("Error reading TXT file:", error);

    if (error instanceof FileParserError) {
      throw error;
    }

    throw new FileParserError(
      "TXT_EXTRACTION_FAILED",
      `TXT extraction failed: ${error.message}`,
      400,
    );
  }
}

/**
 * Perform OCR on scanned documents or images
 *
 * Uses pdf2pic to rasterize each page and Tesseract.js to extract text.
 * This is used as a fallback when standard PDF text extraction returns little/no text.
 *
 * @param {string} filePath - Path to PDF file
 * @param {number} numPages - Total pages in PDF
 * @param {string} uploadId - Optional upload ID for progress tracking
 * @returns {Promise<string>} - Extracted text from OCR
 */
async function performOCR(filePath, numPages, uploadId) {
  const totalPages = Math.max(1, numPages || 1);
  const pagesToProcess = Math.min(totalPages, OCR_PAGE_LIMIT);

  if (totalPages > OCR_PAGE_LIMIT) {
    throw new FileParserError(
      "OCR_PAGE_LIMIT_EXCEEDED",
      `Scanned PDF has ${totalPages} pages, but OCR limit is ${OCR_PAGE_LIMIT}. Please upload a smaller file or increase OCR_PAGE_LIMIT.`,
      400,
      { totalPages, ocrPageLimit: OCR_PAGE_LIMIT },
    );
  }

  console.log(
    `Starting OCR for ${pagesToProcess} page(s) using language: ${OCR_LANGUAGE}`,
  );

  const converter = fromPath(filePath, {
    density: 220,
    format: "png",
    width: 1600,
    height: 2200,
    preserveAspectRatio: true,
  });

  const worker = await createWorker(OCR_LANGUAGE, 1, {
    logger: (message) => {
      if (message?.status === "recognizing text") {
        const percent = Math.round((message.progress || 0) * 100);
        console.log(`OCR progress: ${percent}%`);
      }
    },
  });

  try {
    const pageTexts = [];

    for (let page = 1; page <= pagesToProcess; page += 1) {
      // Update progress for each page
      const pageProgress = 35 + Math.round((page / pagesToProcess) * 30);
      if (uploadId) {
        updateProgress(
          uploadId,
          "ocr",
          pageProgress,
          `Processing page ${page}/${pagesToProcess}...`,
        );
      }

      console.log(`OCR page ${page}/${pagesToProcess}`);
      const pageImage = await converter(page, { responseType: "buffer" });
      const pageBuffer = pageImage?.buffer;

      // Guard against invalid conversion output before passing to OCR worker.
      if (!Buffer.isBuffer(pageBuffer) || pageBuffer.length === 0) {
        throw new FileParserError(
          "OCR_IMAGE_CONVERSION_FAILED",
          `Failed to convert page ${page} to an OCR-ready image.`,
          400,
          { page },
        );
      }

      // PNG signature validation helps avoid Tesseract worker crashes on bad/truncated buffers.
      const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const hasPngSignature =
        pageBuffer.length >= 4 &&
        pageBuffer.subarray(0, 4).equals(pngSignature);

      if (!hasPngSignature) {
        throw new FileParserError(
          "OCR_IMAGE_INVALID",
          `Converted page ${page} is not a valid PNG image.`,
          400,
          { page },
        );
      }

      let result;
      try {
        result = await worker.recognize(pageBuffer);
      } catch (ocrPageError) {
        throw new FileParserError(
          "OCR_PAGE_PROCESSING_FAILED",
          `OCR failed on page ${page}. The scan may be corrupted or too low quality.`,
          400,
          { page, reason: ocrPageError?.message },
        );
      }

      const { data } = result;
      pageTexts.push(data.text || "");
    }

    return pageTexts.join("\n\n").trim();
  } catch (error) {
    const message = String(error?.message || error);

    // Specific error handling for OCR image processing issues
    if (/truncated file|read image|findFileFormatStream/i.test(message)) {
      throw new FileParserError(
        "OCR_IMAGE_INVALID",
        "OCR could not read converted PDF page image. Please try a cleaner PDF or re-export it.",
        400,
      );
    }

    // All other errors (dependencies are checked at startup)
    throw error;
  } finally {
    await worker.terminate();
  }
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
