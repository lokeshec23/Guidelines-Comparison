// src/components/ingestion/IngestionModal.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import useIngestionHandler from "./useIngestionHandler";

const IngestionModal = () => {
  const {
    open,
    guidelineName,
    selectedFile,
    uploadSuccess,
    snackbarOpen,
    handleNameChange,
    handleFileSelect,
    handleDiscard,
    handleUpload,
    handleSnackbarClose,
    checkRouteForModal,
  } = useIngestionHandler();

  const [uploading, setUploading] = useState(false);

  // Auto open modal on /home/ingestion route
  useEffect(() => {
    checkRouteForModal();
  }, [checkRouteForModal]);

  // Handle Upload click (simulate loading)
  const handleUploadWithLoader = async () => {
    try {
      setUploading(true);
      setTimeout(() => {
        handleUpload();
        setUploading(false);
      }, 1000);
    } catch (error) {
      console.error("Error in upload simulation:", error);
      setUploading(false);
    }
  };

  return (
    <>
      {/* ================= Modal ================= */}
      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3, overflow: "visible" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.3rem" }}>
          Upload Documents
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Upload documents to start extracting
          </Typography>

          {/* Upload Area */}
          <Paper
            variant="outlined"
            sx={{
              borderStyle: "dashed",
              borderColor: "#b0bec5",
              borderRadius: 2,
              background: "linear-gradient(180deg, #f9fbfc, #ffffff)",
              height: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              mb: 3,
            }}
          >
            <CloudUploadIcon
              color="primary"
              sx={{ fontSize: 50, mb: 1, opacity: 0.8 }}
            />
            <Typography variant="body2" color="text.secondary">
              Upload or Drag and Drop
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.75rem" }}
            >
              Supported File Types: .pdf
            </Typography>
          </Paper>

          {/* Guideline Name Field */}
          <TextField
            label="Guideline Name *"
            variant="outlined"
            fullWidth
            value={guidelineName}
            onChange={handleNameChange}
            sx={{ mb: 3 }}
          />

          {/* Upload Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Stable Input Upload Button */}
            <Box position="relative">
              <input
                type="file"
                id="pdfUpload"
                accept=".pdf"
                hidden
                onChange={handleFileSelect}
              />
              <label htmlFor="pdfUpload">
                <Button
                  variant="outlined"
                  color="primary"
                  component="span"
                  disabled={!guidelineName || uploading}
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    borderRadius: 2,
                  }}
                >
                  {uploading ? "Uploading..." : "Upload Document"}
                </Button>
              </label>
            </Box>

            {uploadSuccess && selectedFile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="body2" color="success.main">
                  {selectedFile.name} uploaded successfully
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ justifyContent: "flex-end", px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDiscard}
            disabled={uploading}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 500,
            }}
          >
            Discard
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleUploadWithLoader}
            disabled={!guidelineName || !selectedFile || uploading}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 500,
              minWidth: "100px",
            }}
          >
            {uploading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Upload"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= Snackbar ================= */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          PDF uploaded successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default IngestionModal;
