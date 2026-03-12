import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HistoryItem from "./HistoryItem";
import { deleteFile, getUploadHistory, renameUpload } from "../../services/api";
import { useSession } from "../../context/SessionContext";

const HistoryList = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [pendingRename, setPendingRename] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const { currentSession, loadSession, refreshHistory, startNewSession } =
    useSession();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [refreshHistory]);

  const fetchHistory = async () => {
    try {
      const response = await getUploadHistory();
      if (response.status === "success") {
        setUploads(response.data.uploads);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return "📕";
      case "docx":
      case "doc":
        return "📘";
      case "txt":
        return "📄";
      default:
        return "📄";
    }
  };

  const handleItemClick = (upload) => {
    loadSession(upload);
    navigate("/dashboard");
  };

  const handleDeleteClick = (upload) => {
    setDeleteError("");
    setPendingDelete(upload);
  };

  const handleRenameClick = (upload) => {
    setRenameError("");
    setPendingRename(upload);
    setRenameValue(upload.originalFilename || "");
  };

  const handleConfirmRename = async () => {
    if (!pendingRename) {
      return;
    }

    const nextName = renameValue.trim();
    if (!nextName) {
      setRenameError("Section name cannot be empty.");
      return;
    }

    try {
      setRenamingId(pendingRename._id);
      const response = await renameUpload(pendingRename._id, nextName);
      const updatedUpload = response.data.upload;

      setUploads((prevUploads) =>
        prevUploads.map((item) =>
          item._id === updatedUpload._id
            ? { ...item, originalFilename: updatedUpload.originalFilename }
            : item,
        ),
      );

      if (currentSession?._id === updatedUpload._id) {
        await loadSession(updatedUpload);
      }

      setToastMessage(`Renamed to ${updatedUpload.originalFilename}`);
      setPendingRename(null);
      setRenameValue("");
      setRenameError("");
    } catch (error) {
      console.error("Failed to rename upload:", error);
      setRenameError(error.message || "Failed to rename section.");
    } finally {
      setRenamingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      setDeletingId(pendingDelete._id);
      await deleteFile(pendingDelete._id);
      setUploads((prevUploads) =>
        prevUploads.filter((item) => item._id !== pendingDelete._id),
      );

      if (currentSession?._id === pendingDelete._id) {
        startNewSession();
        navigate("/dashboard");
      }

      setToastMessage(`Deleted ${pendingDelete.originalFilename}`);
      setPendingDelete(null);
    } catch (error) {
      console.error("Failed to delete upload:", error);
      setDeleteError(error.message || "Failed to delete upload.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    if (deletingId || renamingId) {
      return;
    }

    setPendingDelete(null);
    setDeleteError("");
    setPendingRename(null);
    setRenameValue("");
    setRenameError("");
  };

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage("");
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4">
        <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3 px-2">
          History
        </h3>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-4">
              <div className="text-base-content/50 text-sm">Loading...</div>
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-base-content/50 text-sm">No uploads yet</div>
            </div>
          ) : (
            uploads.map((upload) => (
              <HistoryItem
                key={upload._id}
                title={upload.originalFilename}
                icon={getFileIcon(upload.fileType)}
                isActive={currentSession?._id === upload._id}
                isDeleting={deletingId === upload._id}
                isRenaming={renamingId === upload._id}
                onClick={() => handleItemClick(upload)}
                onRename={() => handleRenameClick(upload)}
                onDelete={() => handleDeleteClick(upload)}
              />
            ))
          )}
        </div>
      </div>

      {pendingRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
            aria-label="Close rename dialog"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            <div className="p-6">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-2xl">
                  ✏️
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-base-content">
                    Rename Section
                  </h4>
                  <p className="mt-1 text-sm text-base-content/70">
                    Choose a new name for this history section.
                  </p>
                </div>
              </div>

              <div className="mb-5">
                <label className="label px-0">
                  <span className="label-text text-base-content/80">
                    Section name
                  </span>
                </label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="input input-bordered w-full"
                  maxLength={120}
                  autoFocus
                />
              </div>

              {renameError && (
                <div className="alert alert-error mb-5">
                  <span>{renameError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCloseModal}
                  disabled={Boolean(renamingId)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmRename}
                  disabled={Boolean(renamingId)}
                >
                  {renamingId ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Saving...
                    </>
                  ) : (
                    "Save Name"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
            aria-label="Close delete dialog"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-error via-warning to-error" />
            <div className="p-6">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-error/15 text-2xl">
                  🗑️
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-base-content">
                    Remove From History?
                  </h4>
                  <p className="mt-1 text-sm text-base-content/70">
                    This upload, its generated questions, and stored file record
                    will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-base-300 bg-base-200 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-base-content/50">
                  Selected file
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xl">
                    {getFileIcon(pendingDelete.fileType)}
                  </span>
                  <span className="truncate text-sm font-medium text-base-content">
                    {pendingDelete.originalFilename}
                  </span>
                </div>
              </div>

              {deleteError && (
                <div className="alert alert-error mb-5">
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCloseModal}
                  disabled={Boolean(deletingId)}
                >
                  Keep It
                </button>
                <button
                  type="button"
                  className="btn btn-error"
                  onClick={handleConfirmDelete}
                  disabled={Boolean(deletingId)}
                >
                  {deletingId ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Forever"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50">
          <div className="alert border border-success/30 bg-success text-success-content shadow-2xl">
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default HistoryList;
