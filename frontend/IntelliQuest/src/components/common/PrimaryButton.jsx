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
      className="btn btn-primary normal-case px-8 rounded-xl text-white gap-2 disabled:opacity-50"
    >
      {children}
      {icon && icon}
    </button>
  );
};

export default PrimaryButton;
