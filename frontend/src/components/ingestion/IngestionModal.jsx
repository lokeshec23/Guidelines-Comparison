// src/components/ingestion/IngestionModal.jsx
import React, { useEffect } from "react";
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
    handleNameChange,
    handleFileSelect,
    handleDiscard,
    handleUpload,
    checkRouteForModal,
  } = useIngestionHandler();

  // Check route and open modal when on /home/ingestion
  useEffect(() => {
    checkRouteForModal();
  }, [checkRouteForModal]);

  return (
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
          Upload Documents to Start Extracting
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
          label="Guideline Name"
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
          <Button
            variant="outlined"
            component="label"
            color="primary"
            disabled={!guidelineName}
            startIcon={<CloudUploadIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 2,
            }}
          >
            Upload Document
            <input
              type="file"
              hidden
              accept=".pdf"
              onChange={handleFileSelect}
            />
          </Button>

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

      <DialogActions sx={{ justifyContent: "flex-end", px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDiscard}
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
          onClick={handleUpload}
          disabled={!guidelineName || !selectedFile}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 500,
          }}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngestionModal;
