const UploadInfoNote = () => {
  return (
    <div className="flex items-start gap-3 bg-base-200/50 border border-base-300/50 rounded-xl p-4 max-w-2xl">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <svg
            aria-hidden="true"
            className="w-5 h-5 text-primary"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      <p className="text-sm text-base-content/70 italic">
        "Uploading clear, structured PDFs yields the best question results."
      </p>
    </div>
  );
};

export default UploadInfoNote;
