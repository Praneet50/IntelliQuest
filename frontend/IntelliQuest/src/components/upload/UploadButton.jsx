const UploadButton = ({ onClick, disabled, isUploading }) => {
  return (
    <div className="flex items-center justify-center mt-8">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-disabled={disabled}
        className={`px-8 py-3 rounded-xl font-semibold text-white transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 ${
          disabled
            ? "bg-base-300 cursor-not-allowed opacity-60"
            : "bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95"
        }`}
      >
        {isUploading ? (
          <span className="flex items-center gap-2">
            <svg
              aria-hidden="true"
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating Questions...
          </span>
        ) : (
          "Generate Questions"
        )}
      </button>
    </div>
  );
};

export default UploadButton;
