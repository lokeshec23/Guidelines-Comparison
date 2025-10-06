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
  Snackbar,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import useIngestionHandler from "./useIngestionHandler";

const IngestionModal = () => {
  const {
    open,
    guidelineName,
    selectedFiles,
    uploadSuccess,
    snackbarOpen,
    uploading,
    isDragActive,
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
  } = useIngestionHandler();

  useEffect(() => {
    checkRouteForModal();
  }, [checkRouteForModal]);

  return (
    <>
      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, overflow: "visible" } }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.3rem" }}>
          Upload Documents
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Upload or Drag and Drop PDFs to Start Extracting
          </Typography>

          {/* Drag-and-Drop Zone */}
          <Paper
            variant="outlined"
            sx={{
              borderStyle: "dashed",
              borderColor: isDragActive ? "primary.main" : "#b0bec5",
              borderWidth: isDragActive ? 2.5 : 1,
              borderRadius: 2,
              background: isDragActive
                ? "rgba(25, 118, 210, 0.05)"
                : "linear-gradient(180deg, #f9fbfc, #ffffff)",
              height: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              mb: 3,
              transition: "all 0.2s ease",
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudUploadIcon
              color="primary"
              sx={{ fontSize: 50, mb: 1, opacity: 0.8 }}
            />
            <Typography variant="body2" color="text.secondary">
              {isDragActive
                ? "Drop files here..."
                : "Click below or drag and drop your PDFs"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.75rem" }}
            >
              Supported File Types: .pdf
            </Typography>
          </Paper>

          {/* Guideline Name */}
          <TextField
            label="Guideline Name"
            variant="outlined"
            fullWidth
            value={guidelineName}
            onChange={handleNameChange}
            sx={{ mb: 3 }}
          />

          {/* File Upload Button */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                alignSelf: "flex-start",
              }}
            >
              Select PDFs
              <input
                type="file"
                hidden
                accept=".pdf"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </Button>

            {/* Uploaded File List */}
            {uploadSuccess && selectedFiles.length > 0 && (
              <List dense sx={{ borderTop: "1px solid #e0e0e0", mt: 1 }}>
                {selectedFiles.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <Tooltip title="Remove file" arrow>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <DeleteForeverIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemIcon>
                      <PictureAsPdfIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
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
            disabled={!guidelineName || selectedFiles.length === 0 || uploading}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 500,
              minWidth: 100,
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

      {/* ✅ Snackbar for success */}
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
          All PDFs uploaded successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default IngestionModal;
