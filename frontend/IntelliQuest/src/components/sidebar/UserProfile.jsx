import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  // Default values if user data is not available
  const userName = user?.name || "User";
  const userRole = user?.role === "premium" ? "Premium Tier" : "Free Tier";
  const avatarUrl =
    user?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;

  return (
    <div className="p-4 border-t border-base-300">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <img
              src={avatarUrl}
              alt={userName}
              className="w-full h-full rounded-full"
            />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-base-content">
            {userName}
          </h4>
          <p className="text-xs text-primary uppercase tracking-wide">
            {userRole}
          </p>
        </div>

        {/* Settings Button */}
        <button
          onClick={handleSettings}
          className="btn btn-ghost btn-sm btn-square"
          title="Settings"
        >
          <svg
            className="w-5 h-5 text-base-content/70 hover:text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm btn-square"
          title="Logout"
        >
          <svg
            className="w-5 h-5 text-base-content/70 hover:text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
