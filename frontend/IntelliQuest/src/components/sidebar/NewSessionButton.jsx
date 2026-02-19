const NewSessionButton = () => {
  return (
    <button className="btn btn-outline border-gray-600 hover:border-primary hover:bg-primary/10 w-full text-white normal-case rounded-xl gap-2">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      New Session
    </button>
  );
};

export default NewSessionButton;
