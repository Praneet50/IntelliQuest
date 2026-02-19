import { useState } from "react";

const DropZone = () => {
  const [isDragging, setIsDragging] = useState(false);

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
    // Handle file drop
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-gray-700 hover:border-gray-600"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
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
          <h3 className="text-xl font-semibold text-white mb-2">
            Drop your documents here
          </h3>
          <p className="text-gray-400 text-sm">
            The AI will analyze the content to create high-quality,
            <br />
            relevant questions automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
