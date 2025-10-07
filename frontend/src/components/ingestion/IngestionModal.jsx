import React, { useEffect, useRef } from "react";
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

  const fileInputRef = useRef(null);

  useEffect(() => {
    checkRouteForModal();
  }, [checkRouteForModal]);

  // ✅ trigger file input when drop zone clicked
  const handleDropZoneClick = () => {
    if (guidelineName) fileInputRef.current?.click();
  };

  return (
    <>
      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden", // ✅ ensures internal scroll, not external
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh", // ✅ prevents dialog overflow on smaller screens
          },
        }}
      >
        {/* Title */}
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.3rem",
            pb: 0,
            flexShrink: 0,
          }}
        >
          Upload Documents
        </DialogTitle>

        {/* Scrollable main content */}
        <DialogContent
          sx={{
            flexGrow: 1,
            overflowY: "auto", // ✅ scroll only inside content
            px: 3,
            pt: 3,
            pb: 1,
            position: "relative",
            zIndex: 2,
            bgcolor: "background.paper",
          }}
        >
          {/* Guideline Name */}
          <TextField
            label="Guideline Name"
            variant="outlined"
            fullWidth
            value={guidelineName}
            onChange={handleNameChange}
            sx={{
              mb: 3,
              mt: 1, // ✅ gives breathing space below title
              position: "relative",
              zIndex: 10, // ✅ ensures label floats above DialogTitle
              "& .MuiInputLabel-root": {
                backgroundColor: "background.paper", // ✅ clean background under label
                px: 0.5,
                zIndex: 11, // ✅ ensures label text is never hidden
              },
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
              },
            }}
          />

          {/* Drop zone */}
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
              height: 180,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              mb: 3,
              transition: "all 0.2s ease",
              cursor: guidelineName ? "pointer" : "not-allowed",
              opacity: guidelineName ? 1 : 0.6,
            }}
            onClick={() => guidelineName && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudUploadIcon color="primary" sx={{ fontSize: 55, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {isDragActive
                ? "Drop files here..."
                : guidelineName
                ? "Click or drag and drop your PDFs"
                : "Enter a Guideline Name to enable upload"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.75rem" }}
            >
              Supported File Types: .pdf
            </Typography>

            {/* Hidden Input */}
            <input
              type="file"
              hidden
              accept=".pdf"
              multiple
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </Paper>

          {/* Scrollable File List */}
          {uploadSuccess && selectedFiles.length > 0 && (
            <Box
              sx={{
                borderTop: "1px solid #e0e0e0",
                mt: 1,
                maxHeight: 180,
                overflowY: "auto",
                pr: 1,
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "rgba(0,0,0,0.3)",
                },
              }}
            >
              <List dense disablePadding>
                {selectedFiles.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <Tooltip title="Remove file" arrow>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveFile(index)}
                          size="small"
                        >
                          <DeleteForeverIcon color="error" fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                    sx={{
                      py: 0.5,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <PictureAsPdfIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      primaryTypographyProps={{
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>

        {/* ✅ Footer Actions (always visible) */}
        <DialogActions
          sx={{
            justifyContent: "flex-end",
            px: 3,
            py: 1.5,
            flexShrink: 0,
            bgcolor: "background.paper",
            borderTop: "1px solid #e0e0e0",
          }}
        >
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

      {/* ✅ Snackbar */}
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
