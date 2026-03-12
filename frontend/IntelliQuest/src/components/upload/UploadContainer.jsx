import { useState } from "react";
import DropZone from "./DropZone";
import UploadButton from "./UploadButton";
import UploadInfoNote from "./UploadInfoNote";
import QuestionSettings from "./QuestionSettings";
import { uploadFile } from "../../services/api";

const UploadContainer = ({ onQuestionsGenerated, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Question settings state
  const [questionSettings, setQuestionSettings] = useState({
    questionType: "multiple-choice",
    difficulty: "medium",
    numQuestions: 5,
  });

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError(null);
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

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadFile(selectedFile, questionSettings);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Pass the generated questions to parent component
      if (onQuestionsGenerated) {
        onQuestionsGenerated(response.data, {
          uploadId: response.data.upload?._id,
          filename: selectedFile.name,
          file: selectedFile,
          settings: questionSettings,
        });
      }

      // Notify upload complete to refresh history
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      setError(err.message || "Failed to upload file. Please try again.");
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
                <span className="text-sm text-gray-400">Uploading...</span>
                <span className="text-sm text-primary">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
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
