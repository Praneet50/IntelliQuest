/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getProfile,
} from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // Verify token by fetching profile
          const response = await getProfile();
          if (response.status === "success") {
            setUser(response.data.user);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (err) {
          // Token invalid or expired
          if (err?.code !== "AUTH_TOKEN_EXPIRED") {
            console.error("Auth check failed:", err);
            setError(err?.message || "Authentication check failed.");
          }
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setError(null);
      const response = await apiRegister(userData);
      if (response.status === "success") {
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Login user
   */
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await apiLogin(credentials);
      if (response.status === "success") {
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    apiLogout();
    setUser(null);
    setError(null);
  };

  /**
   * Update user data
   */
  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
    localStorage.setItem("user", JSON.stringify({ ...user, ...userData }));
  };

  const value = {
    user,
    setUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
