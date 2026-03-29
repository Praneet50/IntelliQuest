import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { updateProfile, changePassword, getProfile } from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import CustomSelect from "../components/common/CustomSelect";

const Settings = () => {
  const { user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Password settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  // Preferences
  const [defaultQuestionType, setDefaultQuestionType] = useState(
    localStorage.getItem("defaultQuestionType") || "multiple-choice",
  );
  const [defaultDifficulty, setDefaultDifficulty] = useState(
    localStorage.getItem("defaultDifficulty") || "medium",
  );
  const [defaultNumQuestions, setDefaultNumQuestions] = useState(
    parseInt(localStorage.getItem("defaultNumQuestions")) || 5,
  );

  useEffect(() => {
    const refreshProfileStats = async () => {
      try {
        const response = await getProfile();
        if (response?.status === "success" && response?.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to refresh profile stats:", error);
      }
    };

    refreshProfileStats();
  }, [setUser]);

  // Update profile handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage("");

    try {
      const response = await updateProfile(profileData);
      if (response.status === "success") {
        setUser(response.data.user);
        setProfileMessage("Profile updated successfully!");
        setTimeout(() => setProfileMessage(""), 3000);
      }
    } catch (error) {
      setProfileMessage(error.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("New passwords do not match");
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.status === "success") {
        setPasswordMessage("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setPasswordMessage(""), 3000);
      }
    } catch (error) {
      setPasswordMessage(error.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Save preferences
  const handleSavePreferences = () => {
    localStorage.setItem("defaultQuestionType", defaultQuestionType);
    localStorage.setItem("defaultDifficulty", defaultDifficulty);
    localStorage.setItem("defaultNumQuestions", defaultNumQuestions);

    const message = document.getElementById("preferences-message");
    message.textContent = "Preferences saved!";
    message.classList.remove("hidden");
    setTimeout(() => {
      message.classList.add("hidden");
    }, 3000);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Theme Settings */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <span>🎨</span> Appearance
            </h2>
            <p className="text-sm opacity-70 mb-4">
              Switch between light and dark mode
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Theme:</span>
              <button
                onClick={toggleTheme}
                className="btn btn-circle btn-lg swap swap-rotate"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg
                    className="w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                  </svg>
                )}
              </button>
              <span className="text-sm opacity-70 capitalize">
                {theme} mode
              </span>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <span>👤</span> Profile
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="input input-bordered"
                  required
                />
              </div>

              {profileMessage && (
                <div
                  className={`alert ${
                    profileMessage.includes("success")
                      ? "alert-success"
                      : "alert-error"
                  }`}
                >
                  {profileMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Update Profile"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Password Settings */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <span>🔒</span> Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="input input-bordered"
                  minLength="6"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="input input-bordered"
                  minLength="6"
                  required
                />
              </div>

              {passwordMessage && (
                <div
                  className={`alert ${
                    passwordMessage.includes("success")
                      ? "alert-success"
                      : "alert-error"
                  }`}
                >
                  {passwordMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Preferences */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <span>⚙️</span> Preferences
            </h2>
            <div className="space-y-4">
              {/* Default Question Settings */}
              <div className="divider">Default Question Settings</div>

              <div className="form-control">
                <CustomSelect
                  label="Default Question Type"
                  value={defaultQuestionType}
                  onChange={(value) => setDefaultQuestionType(value)}
                  options={[
                    { value: "multiple-choice", label: "Multiple Choice" },
                    { value: "true-false", label: "True/False" },
                    { value: "short-answer", label: "Short Answer" },
                  ]}
                />
              </div>

              <div className="form-control">
                <CustomSelect
                  label="Default Difficulty"
                  value={defaultDifficulty}
                  onChange={(value) => setDefaultDifficulty(value)}
                  options={[
                    { value: "easy", label: "Easy" },
                    { value: "medium", label: "Medium" },
                    { value: "hard", label: "Hard" },
                  ]}
                />
              </div>

              <div className="form-control">
                <CustomSelect
                  label="Default Number of Questions"
                  value={defaultNumQuestions}
                  onChange={(value) => setDefaultNumQuestions(Number(value))}
                  options={[3, 5, 7, 10, 15, 20].map((num) => ({
                    value: num,
                    label: `${num} Questions`,
                  }))}
                />
              </div>

              <div
                id="preferences-message"
                className="alert alert-success hidden"
              >
                Preferences saved!
              </div>

              <button
                onClick={handleSavePreferences}
                className="btn btn-primary"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <span>📊</span> Account Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat bg-base-300 rounded-lg min-w-0">
                <div className="stat-title whitespace-normal leading-tight min-h-[2.5rem]">
                  Total Uploads
                </div>
                <div className="stat-value text-primary text-3xl break-words">
                  {Math.max(
                    0,
                    user?.uploadCount ?? user?.stats?.totalFiles ?? 0,
                  )}
                </div>
              </div>
              <div className="stat bg-base-300 rounded-lg min-w-0">
                <div className="stat-title whitespace-normal leading-tight min-h-[2.5rem]">
                  Questions Generated
                </div>
                <div className="stat-value text-secondary text-3xl break-words">
                  {Math.max(
                    0,
                    user?.questionCount ?? user?.stats?.totalQuestions ?? 0,
                  )}
                </div>
              </div>
              <div className="stat bg-base-300 rounded-lg min-w-0">
                <div className="stat-title whitespace-normal leading-tight min-h-[2.5rem]">
                  Account Type
                </div>
                <div className="stat-value text-sm break-words">
                  {user?.role === "premium" ? "Premium" : "Free"}
                </div>
              </div>
              <div className="stat bg-base-300 rounded-lg min-w-0">
                <div className="stat-title whitespace-normal leading-tight min-h-[2.5rem]">
                  Member Since
                </div>
                <div className="stat-value text-sm break-words">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
