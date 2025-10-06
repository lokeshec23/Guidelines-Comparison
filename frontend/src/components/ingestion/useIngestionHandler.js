// src/components/ingestion/useIngestionHandler.js
import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useIngestionHandler = () => {
  const [open, setOpen] = useState(false);
  const [guidelineName, setGuidelineName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false); // ✅ NEW: for drag UI feedback

  const location = useLocation();
  const navigate = useNavigate();

  const checkRouteForModal = useCallback(() => {
    if (location.pathname === "/home/ingestion") setOpen(true);
    else setOpen(false);
  }, [location.pathname]);

  const handleNameChange = useCallback((e) => {
    setGuidelineName(e.target.value);
  }, []);

  const handleFileSelect = useCallback((files) => {
    try {
      const fileArray = Array.from(files);
      const pdfFiles = fileArray.filter(
        (file) => file.type === "application/pdf"
      );

      if (pdfFiles.length !== fileArray.length) {
        alert("Only PDF files are allowed.");
      }

      setSelectedFiles(pdfFiles);
      setUploadSuccess(pdfFiles.length > 0);
    } catch (error) {
      console.error("Error selecting files:", error);
    }
  }, []);

  // ✅ Drag & drop handlers
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
    navigate("/home/dashboard");
    setGuidelineName("");
    setSelectedFiles([]);
    setUploadSuccess(false);
  }, [navigate]);

  const handleUpload = useCallback(() => {
    if (!guidelineName || selectedFiles.length === 0) return;
    setUploading(true);

    setTimeout(() => {
      setUploading(false);
      setSnackbarOpen(true);
      setOpen(false);
      setUploadSuccess(false);
      setGuidelineName("");
      setSelectedFiles([]);
      navigate("/home/dashboard");
    }, 1200);
  }, [guidelineName, selectedFiles, navigate]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  return {
    open,
    guidelineName,
    selectedFiles,
    uploadSuccess,
    snackbarOpen,
    uploading,
    isDragActive, // ✅ export drag state
    handleNameChange,
    handleFileSelect,
    handleDragOver, // ✅ export drag handlers
    handleDragLeave,
    handleDrop,
    handleDiscard,
    handleUpload,
    handleSnackbarClose,
    checkRouteForModal,
  };
};

export default useIngestionHandler;
