// src/components/ingestion/useIngestionHandler.js
import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import { useLoader } from "../../context/LoaderContext";

const useIngestionHandler = () => {
  const { showLoader, hideLoader, updateProgress, updateMessage } = useLoader();
  const [open, setOpen] = useState(false);
  const [guidelineName, setGuidelineName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [yamlData, setYamlData] = useState("");

  const location = useLocation();
  // const navigate = useNavigate();

  const checkRouteForModal = useCallback(() => {
    if (location.pathname === "/home/ingestion") setOpen(true);
    else setOpen(false);
  }, [location.pathname]);

  const handleNameChange = useCallback((e) => {
    setGuidelineName(e.target.value);
  }, []);

  const handleFileSelect = useCallback(async (files) => {
    try {
      const fileArray = Array.from(files);
      const pdfFiles = fileArray.filter(
        (file) => file.type === "application/pdf"
      );
      if (pdfFiles.length !== fileArray.length)
        alert("Only PDF files are allowed.");
      setSelectedFiles((prev) => [...prev, ...pdfFiles]);
      setUploadSuccess(true);
    } catch (error) {
      console.error("Error selecting files:", error);
    }
  }, []);

  // ✅ Remove a selected file
  const handleRemoveFile = useCallback((index) => {
    try {
      setSelectedFiles((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        if (updated.length === 0) setUploadSuccess(false);
        return updated;
      });
    } catch (error) {
      console.error("Error removing file:", error);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragActive(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDiscard = useCallback(() => {
    setOpen(false);
    // navigate("/home/dashboard");
    setGuidelineName("");
    setSelectedFiles([]);
    setUploadSuccess(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!guidelineName || selectedFiles.length === 0) return;

    showLoader();
    updateProgress(0);
    updateMessage("Uploading file...");

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFiles[0]);

      const progressInterval = setInterval(() => {
        updateProgress((prev) => Math.min(prev + Math.random() * 5, 90));
      }, 300);

      const response = await api.post("/process-guideline", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      updateProgress(100);
      updateMessage("Processing complete!");

      setSnackbarOpen(true);
      setUploadSuccess(true);
      setYamlData(response.data?.output_file || "");
      setOpen(false);

      setTimeout(() => {
        hideLoader();
        updateProgress(0);
        updateMessage("");
      }, 500);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      updateMessage("Something went wrong during processing.");
      hideLoader();
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  }, [
    guidelineName,
    selectedFiles,
    showLoader,
    hideLoader,
    updateProgress,
    updateMessage,
  ]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handleJSONViewerClose = useCallback(() => {
    setYamlData("");
  }, []);

  return {
    open,
    guidelineName,
    selectedFiles,
    uploadSuccess,
    snackbarOpen,
    uploading,
    isDragActive,
    yamlData,
    setYamlData,
    handleNameChange,
    handleFileSelect,
    handleRemoveFile, // ✅ export remove handler
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDiscard,
    handleUpload,
    handleSnackbarClose,
    checkRouteForModal,
    handleJSONViewerClose,
  };
};

export default useIngestionHandler;
