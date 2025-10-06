// src/components/ingestion/useIngestionHandler.js
import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useIngestionHandler = () => {
  const [open, setOpen] = useState(false);
  const [guidelineName, setGuidelineName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Auto-open modal when user navigates to /home/ingestion
  const checkRouteForModal = useCallback(() => {
    try {
      if (location.pathname === "/home/ingestion") {
        setOpen(true);
      } else {
        setOpen(false);
      }
    } catch (error) {
      console.error("Error checking ingestion route:", error);
    }
  }, [location.pathname]);

  // ✅ Handle name input
  const handleNameChange = useCallback((e) => {
    try {
      setGuidelineName(e.target.value);
    } catch (error) {
      console.error("Error updating guideline name:", error);
    }
  }, []);

  // ✅ Handle file selection
  const handleFileSelect = useCallback((e) => {
    try {
      const file = e.target.files[0];
      if (file && file.type === "application/pdf") {
        setSelectedFile(file);
        setUploadSuccess(true);
      } else {
        alert("Only PDF files are allowed.");
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  }, []);

  // ✅ Close modal (Discard)
  const handleDiscard = useCallback(() => {
    try {
      setOpen(false);
      navigate("/home/dashboard"); // redirect back to dashboard
      setGuidelineName("");
      setSelectedFile(null);
      setUploadSuccess(false);
    } catch (error) {
      console.error("Error closing modal:", error);
    }
  }, [navigate]);

  // ✅ Simulate upload (later replaced by backend)
  const handleUpload = useCallback(() => {
    try {
      if (!guidelineName || !selectedFile) return;
      console.log("Uploading file:", selectedFile.name);
      alert("PDF successfully uploaded!");
      setUploadSuccess(false);
      setGuidelineName("");
      setSelectedFile(null);
      navigate("/home/dashboard");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }, [guidelineName, selectedFile, navigate]);

  return {
    open,
    guidelineName,
    selectedFile,
    uploadSuccess,
    handleNameChange,
    handleFileSelect,
    handleDiscard,
    handleUpload,
    checkRouteForModal,
  };
};

export default useIngestionHandler;
