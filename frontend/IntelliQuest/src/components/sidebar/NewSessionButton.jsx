import { useSession } from "../../context/SessionContext";
import { useNavigate } from "react-router-dom";

const NewSessionButton = () => {
  const { startNewSession } = useSession();
  const navigate = useNavigate();

  const handleNewSession = () => {
    startNewSession();
    navigate("/dashboard");
  };

  return (
    <button
      onClick={handleNewSession}
      className="btn btn-outline border-base-300 hover:border-primary hover:bg-primary/10 w-full normal-case rounded-xl gap-2"
    >
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
