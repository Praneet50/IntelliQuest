const StepItem = ({ number, label, isActive = false, isCompleted = false }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="img"
        aria-label={`Step ${number}: ${label}${isCompleted ? ", completed" : ""}`}
        aria-current={isActive ? "step" : undefined}
        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${
          isActive
            ? "bg-primary text-white shadow-lg shadow-primary/50"
            : isCompleted
              ? "bg-primary/30 text-primary"
              : "bg-base-300 text-base-content/50"
        }`}
      >
        {isCompleted ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          number
        )}
      </div>
      <span
        className={`text-xs font-medium uppercase tracking-wider ${
          isActive ? "text-white" : "text-base-content/50"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

export default StepItem;
