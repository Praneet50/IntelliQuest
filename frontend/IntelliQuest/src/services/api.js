/**
 * API Service
 *
 * Handles all communication with the backend API
 */

const API_BASE_URL = "http://localhost:5001";

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Create headers with auth token if available
 */
const getHeaders = (includeAuth = true) => {
  const headers = {};
  const token = getAuthToken();

  if (includeAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Upload file and generate questions
 *
 * @param {File} file - The file to upload
 * @param {Object} options - Question generation options
 * @returns {Promise<Object>} - API response with generated questions
 */
export const uploadFile = async (file, options = {}) => {
  const {
    questionType = "multiple-choice",
    difficulty = "medium",
    numQuestions = 5,
  } = options;

  // Create form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("questionType", questionType);
  formData.append("difficulty", difficulty);
  formData.append("numQuestions", numQuestions);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: getHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Backend error:", error);
      throw new Error(
        error.error || error.message || `Upload failed (${response.status})`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Upload error:", error);
    console.error("Error details:", error.message);
    throw error;
  }
};

/**
 * Check server health
 *
 * @returns {Promise<Object>} - Server status
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
};

/**
 * Get upload history
 *
 * @returns {Promise<Object>} - List of uploaded files (without questions)
 */
export const getUploadHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/uploads/history`, {
      headers: getHeaders(),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get upload history:", error);
    throw error;
  }
};

/**
 * Get single upload with all questions
 *
 * @param {string} uploadId - The upload ID
 * @returns {Promise<Object>} - Upload data with questions
 */
export const getUploadById = async (uploadId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get upload");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get upload:", error);
    throw error;
  }
};

/**
 * Delete uploaded file
 *
 * @param {string} uploadId - Upload id to delete
 * @returns {Promise<Object>} - Deletion status
 */
export const deleteFile = async (uploadId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete upload");
    }

    return data;
  } catch (error) {
    console.error("Failed to delete file:", error);
    throw error;
  }
};

/**
 * Rename uploaded section
 *
 * @param {string} uploadId - Upload id to rename
 * @param {string} name - New section name
 * @returns {Promise<Object>} - Updated upload data
 */
export const renameUpload = async (uploadId, name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/uploads/${uploadId}/rename`, {
      method: "PATCH",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to rename section");
    }

    return data;
  } catch (error) {
    console.error("Failed to rename upload:", error);
    throw error;
  }
};

// ============================================
// AUTHENTICATION API
// ============================================

/**
 * Register a new user
 *
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - User data and token
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    // Store token in localStorage
    if (data.data && data.data.token) {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

/**
 * Login user
 *
 * @param {Object} credentials - User login credentials
 * @returns {Promise<Object>} - User data and token
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store token in localStorage
    if (data.data && data.data.token) {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Get current user profile
 *
 * @returns {Promise<Object>} - User profile data
 */
export const getProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get profile");
    }

    return data;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
};

/**
 * Update user profile
 *
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<Object>} - Updated user data
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    // Update localStorage with new user data
    if (data.data && data.data.user) {
      localStorage.setItem("user", JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

/**
 * Change user password
 *
 * @param {Object} passwordData - Current and new password
 * @returns {Promise<Object>} - Success status
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: "PUT",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to change password");
    }

    return data;
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
