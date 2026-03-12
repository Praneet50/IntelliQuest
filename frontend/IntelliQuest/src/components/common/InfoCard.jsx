const InfoCard = ({ icon, title, description }) => {
  return (
    <div className="bg-base-200 border border-base-300 rounded-xl p-6 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            {title}
          </h3>
          <p className="text-sm text-base-content/70">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
