const InfoCard = ({ icon, title, description }) => {
  return (
    <div className="bg-darker/50 border border-gray-700/50 rounded-xl p-6 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
