/**
 * Upload Progress Tracker
 *
 * Manages real-time progress tracking for file uploads and processing
 */

// In-memory store for tracking upload progress
// Format: { uploadId: { status: "extracting", progress: 40, message: "Extracting text..." } }
const uploadProgressMap = new Map();

/**
 * Update progress for an upload
 *
 * @param {string} uploadId - The upload ID
 * @param {string} status - Current status (uploading, extracting, ocr, generating, completed, failed)
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Human-readable progress message
 */
export function updateProgress(uploadId, status, progress, message) {
  uploadProgressMap.set(uploadId, {
    status,
    progress: Math.min(100, Math.max(0, progress)),
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get current progress for an upload
 *
 * @param {string} uploadId - The upload ID
 * @returns {Object|null} - Progress object or null if not found
 */
export function getProgress(uploadId) {
  return uploadProgressMap.get(uploadId) || null;
}

/**
 * Clear progress for an upload
 *
 * @param {string} uploadId - The upload ID
 */
export function clearProgress(uploadId) {
  uploadProgressMap.delete(uploadId);
}

/**
 * Start cleanup interval to remove stale progress data
 * Removes completed/failed uploads after 5 minutes
 */
export function startCleanupInterval() {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [uploadId, data] of uploadProgressMap.entries()) {
      if (data.status === "completed" || data.status === "failed") {
        const age = now - new Date(data.timestamp).getTime();
        if (age > 5 * 60 * 1000) {
          uploadProgressMap.delete(uploadId);
        }
      }
    }
  }, 60000); // Check every minute

  return cleanupInterval;
}
