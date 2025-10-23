// src/components/ingestion/useIngestionHandler.js
import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";

const useIngestionHandler = () => {
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

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFiles[0]); // Only first file is sent

      console.log("📤 Uploading file:", selectedFiles[0].name);

      const response = await api.post("/process-guideline", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(" Upload successful:", response.data);

      // Optional UI updates
      setSnackbarOpen(true);
      setUploadSuccess(true);
      setOpen(false);
      setYamlData(response.data?.output_file || "");
      // navigate("/home/dashboard");
    } catch (error) {
      console.error("❌ Upload failed:", error);
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  }, [guidelineName, selectedFiles]);

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
