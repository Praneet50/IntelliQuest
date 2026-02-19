const HistoryItem = ({ title, icon = "📄", isActive = false }) => {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
        isActive
          ? "bg-primary/20 text-white border border-primary/30"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium truncate">{title}</span>
    </button>
  );
};

export default HistoryItem;
