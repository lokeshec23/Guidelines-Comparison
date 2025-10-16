import React from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const YamlViewer = ({ yamlContent }) => {
  if (!yamlContent) return null;

  // Function to download YAML as file
  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guideline.yaml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        mt: 3,
        backgroundColor: "#fafafa",
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight="bold">
            YAML Output
          </Typography>
        }
        action={
          <Tooltip title="Download YAML">
            <IconButton onClick={handleDownload}>
              <DownloadIcon color="primary" />
            </IconButton>
          </Tooltip>
        }
      />

      <CardContent>
        <Box
          sx={{
            maxHeight: "65dvh",
            overflowY: "auto",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <SyntaxHighlighter
            language="yaml"
            style={materialLight}
            customStyle={{
              background: "transparent",
              fontSize: "0.9rem",
              padding: "1rem",
            }}
          >
            {yamlContent}
          </SyntaxHighlighter>
        </Box>
      </CardContent>
    </Card>
  );
};

export default YamlViewer;
