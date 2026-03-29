const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  icon = null,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className="btn btn-primary normal-case px-8 rounded-xl text-white gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 transition-all duration-200"
    >
      {children}
      {icon && icon}
    </button>
  );
};

export default PrimaryButton;
