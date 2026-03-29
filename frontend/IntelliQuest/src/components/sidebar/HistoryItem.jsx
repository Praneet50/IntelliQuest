const HistoryItem = ({
  title,
  icon = "📄",
  isActive = false,
  isDeleting = false,
  isRenaming = false,
  onClick,
  onRename,
  onDelete,
}) => {
  return (
    <div
      className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl transition-all ${
        isActive
          ? "bg-primary/20 text-base-content border border-primary/30"
          : "text-base-content/70 hover:bg-base-300 hover:text-base-content"
      }`}
    >
      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-3 min-w-0 px-2 py-1 text-left"
      >
        <span className="text-lg flex-shrink-0">{icon}</span>
        <span className="text-sm font-medium truncate" title={title}>
          {title}
        </span>
      </button>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={onRename}
          disabled={isDeleting || isRenaming}
          className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary"
          aria-label={`Rename ${title}`}
          title="Rename section"
        >
          {isRenaming ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <svg
              aria-hidden="true"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L12 15l-4 1 1-4 8.586-8.586z"
              />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting || isRenaming}
          className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-error"
          aria-label={`Delete ${title}`}
          title="Delete upload"
        >
          {isDeleting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <svg
              aria-hidden="true"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;
