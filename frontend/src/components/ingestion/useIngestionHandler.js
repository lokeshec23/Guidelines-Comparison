// src/components/ingestion/useIngestionHandler.js
import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useIngestionHandler = () => {
  const [open, setOpen] = useState(false);
  const [guidelineName, setGuidelineName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // ✅ new state

  const location = useLocation();
  const navigate = useNavigate();

  const checkRouteForModal = useCallback(() => {
    try {
      if (location.pathname === "/home/ingestion") setOpen(true);
      else setOpen(false);
    } catch (error) {
      console.error("Error checking ingestion route:", error);
    }
  }, [location.pathname]);

  const handleNameChange = useCallback((e) => {
    try {
      setGuidelineName(e.target.value);
    } catch (error) {
      console.error("Error updating guideline name:", error);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    try {
      const file = e.target.files[0];
      if (file && file.type === "application/pdf") {
        setSelectedFile(file);
        setUploadSuccess(true);

        // ✅ Reset file input value so re-upload works properly
        e.target.value = "";
      } else if (file) {
        alert("Only PDF files are allowed.");
        e.target.value = "";
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  }, []);

  const handleDiscard = useCallback(() => {
    try {
      setOpen(false);
      navigate("/home/dashboard");
      setGuidelineName("");
      setSelectedFile(null);
      setUploadSuccess(false);
    } catch (error) {
      console.error("Error closing modal:", error);
    }
  }, [navigate]);

  const handleUpload = useCallback(() => {
    try {
      if (!guidelineName || !selectedFile) return;
      console.log("Uploading file:", selectedFile.name);

      // ✅ Mock upload
      setTimeout(() => {
        setSnackbarOpen(true); // show snackbar
        setOpen(false);
        setUploadSuccess(false);
        setGuidelineName("");
        setSelectedFile(null);
        navigate("/home/dashboard");
      }, 800);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }, [guidelineName, selectedFile, navigate]);

  const handleSnackbarClose = useCallback(() => {
    try {
      setSnackbarOpen(false);
    } catch (error) {
      console.error("Error closing snackbar:", error);
    }
  }, []);

  return {
    open,
    guidelineName,
    selectedFile,
    uploadSuccess,
    snackbarOpen, // ✅ export snackbar state
    handleNameChange,
    handleFileSelect,
    handleDiscard,
    handleUpload,
    handleSnackbarClose, // ✅ export close handler
    checkRouteForModal,
  };
};

export default useIngestionHandler;
