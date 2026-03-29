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
          settings: {
            questionType: fullUpload.questionType,
            difficulty: fullUpload.difficulty,
            numQuestions: fullUpload.numQuestions,
            courseOutcomes: fullUpload.courseOutcomes || [],
          },
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

      // Ensure current session identity/name is available immediately after upload.
      if (uploadData.uploadId) {
        setCurrentSession((prevSession) => {
          if (prevSession?._id === uploadData.uploadId) {
            return {
              ...prevSession,
              originalFilename:
                uploadData.filename || prevSession.originalFilename,
            };
          }

          return {
            _id: uploadData.uploadId,
            originalFilename: uploadData.filename,
            fileType: uploadData.fileType,
          };
        });
      }
    }

    // Trigger history refresh
    setRefreshHistory((prev) => prev + 1);
  };

  /**
   * Update current session/upload filename in memory after rename
   */
  const updateCurrentSessionName = (uploadId, newFilename) => {
    setCurrentSession((prevSession) => {
      if (!prevSession || prevSession._id !== uploadId) {
        return prevSession;
      }

      return {
        ...prevSession,
        originalFilename: newFilename,
      };
    });

    setCurrentUploadData((prevUploadData) => {
      if (!prevUploadData || prevUploadData.uploadId !== uploadId) {
        return prevUploadData;
      }

      return {
        ...prevUploadData,
        filename: newFilename,
      };
    });
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
    updateCurrentSessionName,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
