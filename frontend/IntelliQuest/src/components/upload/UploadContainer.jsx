import { useState } from "react";
import DropZone from "./DropZone";
import UploadButton from "./UploadButton";
import UploadInfoNote from "./UploadInfoNote";
import QuestionSettings from "./QuestionSettings";
import { getUploadProgress, uploadFile } from "../../services/api";

const getDefaultQuestionSettings = () => {
  const allowedQuestionTypes = [
    "multiple-choice",
    "true-false",
    "short-answer",
  ];
  const allowedDifficulties = ["easy", "medium", "hard"];
  const allowedQuestionCounts = [3, 5, 7, 10, 15, 20];

  const savedQuestionType = localStorage.getItem("defaultQuestionType");
  const savedDifficulty = localStorage.getItem("defaultDifficulty");
  const savedNumQuestions = Number(localStorage.getItem("defaultNumQuestions"));

  return {
    questionType: allowedQuestionTypes.includes(savedQuestionType)
      ? savedQuestionType
      : "multiple-choice",
    difficulty: allowedDifficulties.includes(savedDifficulty)
      ? savedDifficulty
      : "medium",
    numQuestions: allowedQuestionCounts.includes(savedNumQuestions)
      ? savedNumQuestions
      : 5,
    courseOutcomes: [
      { id: "CO1", description: "" },
      { id: "CO2", description: "" },
    ],
  };
};

const createProgressId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const mapUploadError = (error) => {
  const code = error?.code;
  const details = error?.detailsPayload || {};

  if (code === "FILE_SIZE_LIMIT_EXCEEDED") {
    return "File exceeds upload limit (10MB). Please upload a smaller file.";
  }

  if (code === "OCR_PAGE_LIMIT_EXCEEDED") {
    const totalPages = details.totalPages;
    const ocrPageLimit = details.ocrPageLimit;
    if (totalPages && ocrPageLimit) {
      return `This scanned PDF has ${totalPages} pages, but OCR limit is ${ocrPageLimit}. Split the PDF or increase OCR_PAGE_LIMIT on server.`;
    }
    return "This scanned PDF exceeds OCR page limit. Split the PDF or increase OCR_PAGE_LIMIT on server.";
  }

  if (code === "AI_RATE_LIMIT") {
    return "AI API rate limit reached. Please wait and try again.";
  }

  if (code === "AI_QUOTA_EXCEEDED") {
    return "AI quota exceeded or billing limit reached. Please check your Gemini usage/quota.";
  }

  if (code === "OCR_DEPENDENCIES_MISSING") {
    return "OCR tools are missing on server. Install Ghostscript and GraphicsMagick.";
  }

  if (
    code === "OCR_IMAGE_INVALID" ||
    code === "OCR_IMAGE_CONVERSION_FAILED" ||
    code === "OCR_PAGE_PROCESSING_FAILED"
  ) {
    return "OCR could not read this scanned PDF page image. Please try a cleaner PDF export or a higher-quality scan.";
  }

  if (code === "INVALID_FILE_TYPE") {
    return "Invalid file type. Upload a PDF, DOCX, or TXT file.";
  }

  if (code === "AUTH_TOKEN_EXPIRED") {
    return "Your session has expired. Please login again and retry upload.";
  }

  if (code === "BACKEND_UNAVAILABLE") {
    return "Backend server is not running. Start backend and try again.";
  }

  if (code === "NETWORK_OR_UNKNOWN_ERROR") {
    return "Network error. Please check backend connection and try again.";
  }

  return error?.message || "Failed to upload file. Please try again.";
};

const UploadContainer = ({ onQuestionsGenerated, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("Uploading...");

  // Question settings state
  const [questionSettings, setQuestionSettings] = useState(
    getDefaultQuestionSettings,
  );

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleDropZoneError = (message) => {
    setError(message);
  };

  const handleSettingsChange = (newSettings) => {
    setQuestionSettings(newSettings);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadStatus("Uploading file...");

    const progressId = createProgressId();
    let pollInterval;

    try {
      pollInterval = setInterval(async () => {
        try {
          const progressResponse = await getUploadProgress(progressId);
          if (
            progressResponse?.status === "success" &&
            progressResponse?.data
          ) {
            const nextProgress = Math.round(
              Math.max(
                0,
                Math.min(100, Number(progressResponse.data.progress) || 0),
              ),
            );
            setUploadProgress(nextProgress);
            setUploadStatus(progressResponse.data.message || "Processing...");

            if (
              ["completed", "failed"].includes(progressResponse.data.status)
            ) {
              clearInterval(pollInterval);
            }
          }
        } catch {
          // Progress may not exist in the first few moments; keep polling.
        }
      }, 600);

      // Upload the file
      const response = await uploadFile(selectedFile, {
        ...questionSettings,
        progressId,
      });

      clearInterval(pollInterval);
      setUploadProgress(100);
      setUploadStatus("Complete!");

      // Pass the generated questions to parent component
      if (onQuestionsGenerated) {
        onQuestionsGenerated(response.data, {
          uploadId: response.data.uploadId,
          filename: selectedFile.name,
          file: selectedFile,
          settings: {
            ...questionSettings,
            courseOutcomes:
              response.data?.metadata?.courseOutcomes ||
              questionSettings.courseOutcomes,
          },
        });
      }

      // Notify upload complete to refresh history
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      setError(mapUploadError(err));
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          Step 1: Upload Source Material
        </h2>
        <p className="text-gray-400">
          Let's start by adding the content you want to generate questions
          <br />
          from. We support PDF, Word, and text files.
        </p>
      </div>

      {/* Question Settings */}
      <QuestionSettings
        settings={questionSettings}
        onChange={handleSettingsChange}
      />

      <DropZone
        onFileSelect={handleFileSelect}
        onError={handleDropZoneError}
        selectedFile={selectedFile}
        isUploading={isUploading}
      />

      {selectedFile && (
        <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{uploadStatus}</span>
                <span className="text-sm text-primary">
                  {Math.round(Math.min(uploadProgress, 100))}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.round(Math.min(uploadProgress, 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      )}

      <UploadButton
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        isUploading={isUploading}
      />

      <div className="flex justify-center mt-8">
        <UploadInfoNote />
      </div>
    </div>
  );
};

export default UploadContainer;
