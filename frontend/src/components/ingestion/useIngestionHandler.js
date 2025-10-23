// src/components/ingestion/useIngestionHandler.js
import { useState, useCallback, useRef, useEffect } from "react";
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

  const eventSourceRef = useRef(null);
  const uploadAbortControllerRef = useRef(null);
  const location = useLocation();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (uploadAbortControllerRef.current) {
        uploadAbortControllerRef.current.abort();
      }
    };
  }, []);

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
    // Clean up EventSource if exists
    if (eventSourceRef.current) {
      console.log("🔌 Closing EventSource connection");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Abort ongoing upload if exists
    if (uploadAbortControllerRef.current) {
      uploadAbortControllerRef.current.abort();
      uploadAbortControllerRef.current = null;
    }

    setOpen(false);
    setGuidelineName("");
    setSelectedFiles([]);
    setUploadSuccess(false);
    setUploading(false);
    hideLoader();
  }, [hideLoader]);

  /**
   * ✅ FIXED: Real-time progress tracking synced with backend tasks
   * Progress breakdown:
   * - 0-25%: OCR Extraction
   * - 25-30%: Text Chunking
   * - 30-95%: AI Processing (4 parallel tasks)
   * - 95-100%: Merging Results
   */
  const handleUpload = useCallback(async () => {
    if (!guidelineName || selectedFiles.length === 0) return;

    console.log("🚀 Starting upload process...");

    showLoader();
    updateProgress(0);
    updateMessage("Preparing upload...");
    setUploading(true);

    const abortController = new AbortController();
    uploadAbortControllerRef.current = abortController;

    let sessionId = null;

    try {
      // Prepare file upload
      const formData = new FormData();
      formData.append("file", selectedFiles[0]);

      console.log("📤 Uploading file:", selectedFiles[0].name);
      updateProgress(1);
      updateMessage("Uploading file to server...");

      // ✅ Upload file and get session ID immediately
      const uploadResponse = await api.post("/process-guideline", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: abortController.signal,
      });

      sessionId = uploadResponse.data.session_id;

      if (!sessionId) {
        throw new Error("No session ID received from server");
      }

      console.log("✅ Session ID received:", sessionId);
      console.log("🔄 Processing started in background");

      // ✅ Connect to SSE immediately
      const baseURL = api.defaults.baseURL || "http://localhost:8000";
      const eventSourceURL = `${baseURL}/progress/${sessionId}`;

      console.log("🔌 Connecting to SSE:", eventSourceURL);
      const eventSource = new EventSource(eventSourceURL);
      eventSourceRef.current = eventSource;

      let processingComplete = false;

      // Handle SSE messages
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { progress, message } = data;

          console.log(`📊 Progress: ${progress}% - ${message}`);

          // Update loader
          updateProgress(progress);
          updateMessage(message);

          // Check if complete
          if (progress >= 100) {
            console.log("✅ Processing complete, fetching results...");
            processingComplete = true;

            eventSource.close();
            eventSourceRef.current = null;

            // ✅ Fetch final results
            api
              .get(`/result/${sessionId}`)
              .then((response) => {
                console.log("📦 Results received:", response.data);

                setYamlData(response.data?.output_file || "");
                setSnackbarOpen(true);
                setUploadSuccess(true);
                setOpen(false);

                setTimeout(() => {
                  hideLoader();
                  setUploading(false);
                  updateProgress(0);
                  updateMessage("");
                }, 800);
              })
              .catch((err) => {
                console.error("❌ Error fetching results:", err);
                updateMessage("❌ Error retrieving results");

                setTimeout(() => {
                  hideLoader();
                  setUploading(false);
                }, 2000);
              });
          }
        } catch (err) {
          console.error("❌ Error parsing SSE message:", err);
        }
      };

      // Handle SSE connection opened
      eventSource.onopen = () => {
        console.log("✅ SSE connection established");
      };

      // Handle SSE errors
      eventSource.onerror = (error) => {
        console.error("❌ SSE connection error:", error);

        eventSource.close();
        eventSourceRef.current = null;

        // If processing was complete, try to fetch results
        if (processingComplete) {
          api
            .get(`/result/${sessionId}`)
            .then((response) => {
              if (response.data?.output_file) {
                setYamlData(response.data.output_file);
                setSnackbarOpen(true);
                setUploadSuccess(true);
                setOpen(false);

                setTimeout(() => {
                  hideLoader();
                  setUploading(false);
                  updateProgress(0);
                  updateMessage("");
                }, 800);
              }
            })
            .catch(() => {
              updateMessage("❌ Connection lost");
              setTimeout(() => {
                hideLoader();
                setUploading(false);
              }, 2000);
            });
        } else {
          updateMessage("❌ Connection lost during processing");
          setTimeout(() => {
            hideLoader();
            setUploading(false);
            updateProgress(0);
            updateMessage("");
          }, 2000);
        }
      };
    } catch (error) {
      console.error("❌ Upload error:", error);

      if (error.name === "CanceledError" || error.name === "AbortError") {
        updateMessage("Upload cancelled");
      } else {
        updateMessage(
          error.response?.data?.message || "Upload failed. Please try again."
        );
      }

      setTimeout(() => {
        hideLoader();
        setUploading(false);
        updateProgress(0);
        updateMessage("");
      }, 2000);

      setUploadSuccess(false);
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
    console.log("🔄 Resetting upload form after JSON viewer close");

    // Close JSON viewer
    setYamlData("");

    // Reset all form states
    setGuidelineName("");
    setSelectedFiles([]);
    setUploadSuccess(false);
    setSnackbarOpen(false);
    setUploading(false);
    setIsDragActive(false);

    // Clean up any lingering connections
    if (eventSourceRef.current) {
      console.log("🔌 Closing any remaining EventSource connection");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (uploadAbortControllerRef.current) {
      uploadAbortControllerRef.current = null;
    }

    // Reset loader context
    hideLoader();
    updateProgress(0);
    updateMessage("");

    // ✅ Keep modal open for next upload
    setOpen(true);

    console.log("✅ Form reset complete, ready for new upload");
  }, [hideLoader, updateProgress, updateMessage]);

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
    handleRemoveFile,
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
