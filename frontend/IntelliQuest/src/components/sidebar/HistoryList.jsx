import HistoryItem from "./HistoryItem";

const HistoryList = () => {
  const historyItems = [
    { id: 1, title: "Biology Quiz", icon: "📚", isActive: true },
    { id: 2, title: "Modern Physics", icon: "📄", isActive: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
        History
      </h3>
      <div className="space-y-2">
        {historyItems.map((item) => (
          <HistoryItem
            key={item.id}
            title={item.title}
            icon={item.icon}
            isActive={item.isActive}
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
