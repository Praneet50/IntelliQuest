const SidebarHeader = () => {
  return (
    <div className="flex items-center gap-3 p-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-1.26-7-5.26-7-10V8.3l7-3.5 7 3.5V10c0 4.74-3.14 8.74-7 10z" />
        </svg>
      </div>
      <div>
        <h1 className="text-xl font-bold text-white">QuestAI</h1>
        <p className="text-xs text-secondary uppercase tracking-wider">
          Smart Assistant
        </p>
      </div>
    </div>
  );
};

export default SidebarHeader;
