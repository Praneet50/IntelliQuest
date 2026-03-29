/**
 * API Service
 *
 * Handles all communication with the backend API
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

class ApiError extends Error {
  constructor(message, code, status, detailsPayload) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.detailsPayload = detailsPayload;
  }
}

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
    progressId,
    courseOutcomes = [],
  } = options;

  // Create form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("questionType", questionType);
  formData.append("difficulty", difficulty);
  formData.append("numQuestions", numQuestions);
  formData.append("courseOutcomes", JSON.stringify(courseOutcomes));
  if (progressId) {
    formData.append("progressId", progressId);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: getHeaders(),
      body: formData,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      console.error("Backend error:", payload);
      throw new ApiError(
        payload?.message ||
          payload?.error ||
          `Upload failed (${response.status})`,
        payload?.code || "UPLOAD_FAILED",
        response.status,
        payload?.detailsPayload,
      );
    }

    return payload;
  } catch (error) {
    console.error("Upload error:", error);
    console.error("Error details:", error.message);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error.message ||
        "Network error. Please check your connection and try again.",
      "NETWORK_OR_UNKNOWN_ERROR",
      0,
    );
  }
};

/**
 * Get upload progress by progress ID
 *
 * @param {string} progressId - Progress tracking ID
 * @returns {Promise<Object>} - Progress payload
 */
export const getUploadProgress = async (progressId) => {
  const response = await fetch(`${API_BASE_URL}/upload-progress/${progressId}`);

  if (!response.ok) {
    throw new Error("Progress not available yet");
  }

  return response.json();
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

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new ApiError(
          "Session expired. Please login again.",
          "AUTH_TOKEN_EXPIRED",
          401,
        );
      }

      throw new ApiError(
        data?.message || "Failed to get profile",
        data?.code || "GET_PROFILE_FAILED",
        response.status,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "Backend is unreachable. Please start the backend server.",
      "BACKEND_UNAVAILABLE",
      0,
    );
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
