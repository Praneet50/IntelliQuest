/**
 * Session Context
 *
 * Manages the current session state for uploads and questions
 */

import { createContext, useContext, useState } from "react";
import { getUploadById } from "../services/api";

const SessionContext = createContext(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [currentUploadData, setCurrentUploadData] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  /**
   * Start a new session
   */
  const startNewSession = () => {
    setCurrentSession(null);
    setGeneratedQuestions(null);
    setCurrentUploadData(null);
  };

  /**
   * Load a session from history
   * Fetches the full upload with questions from the server
   */
  const loadSession = async (upload) => {
    try {
      console.log("Loading session for upload:", upload._id);

      // Fetch the full upload with questions from server
      const response = await getUploadById(upload._id);

      if (response.status === "success") {
        const fullUpload = response.data.upload;
        console.log(
          `Loaded ${fullUpload.questions?.length || 0} questions from history`,
        );

        setCurrentSession(fullUpload);
        setGeneratedQuestions(fullUpload.questions);

        // Store upload data for potential regeneration
        setCurrentUploadData({
          uploadId: fullUpload._id,
          filename: fullUpload.originalFilename,
          fileType: fullUpload.fileType,
        });
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      // Fallback to basic data without questions
      setCurrentSession(upload);
      setGeneratedQuestions([]);
    }
  };

  /**
   * Set questions for current session
   */
  const setQuestions = (questions, uploadData = null) => {
    setGeneratedQuestions(questions);
    if (uploadData) {
      setCurrentUploadData(uploadData);
    }
    // Trigger history refresh
    setRefreshHistory((prev) => prev + 1);
  };

  const value = {
    currentSession,
    generatedQuestions,
    currentUploadData,
    refreshHistory,
    startNewSession,
    loadSession,
    setQuestions,
    setCurrentUploadData,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
