/**
 * Theme utility functions
 */

/**
 * Initialize theme on app load
 */
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
};

/**
 * Change theme
 */
export const changeTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

/**
 * Get current theme
 */
export const getCurrentTheme = () => {
  return localStorage.getItem("theme") || "dark";
};
