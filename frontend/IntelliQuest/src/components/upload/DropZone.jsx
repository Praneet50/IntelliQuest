import { useState, useRef } from "react";

const DropZone = ({ onFileSelect, selectedFile, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileChange = (file) => {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload PDF, DOCX, or TXT files.");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    onFileSelect(file);
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleInputChange}
        className="hidden"
      />
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/10"
            : selectedFile
              ? "border-primary/50 bg-primary/5"
              : isUploading
                ? "border-base-300 cursor-not-allowed opacity-50"
                : "border-base-300 hover:border-base-content/40"
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
              selectedFile ? "bg-primary/30" : "bg-primary/20"
            }`}
          >
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-base-content mb-2">
              {selectedFile
                ? "File selected! Drop another to replace"
                : "Drop your documents here or click to browse"}
            </h3>
            <p className="text-base-content/70 text-sm">
              {isUploading ? (
                "Please wait while we process your file..."
              ) : (
                <>
                  Supports PDF, DOCX, and TXT files (max 10MB)
                  <br />
                  The AI will analyze the content to create questions
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DropZone;
