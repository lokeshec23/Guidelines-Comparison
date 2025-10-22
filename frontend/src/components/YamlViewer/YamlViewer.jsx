// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   Typography,
//   IconButton,
//   Tooltip,
//   Paper,
//   Tabs,
//   Tab,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import DownloadIcon from "@mui/icons-material/Download";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// const JsonViewer = ({ jsonContent, onClose }) => {
//   const [copied, setCopied] = useState(false);
//   const [activeTab, setActiveTab] = useState(0);

//   // Parse JSON content
//   const parsedJson = React.useMemo(() => {
//     try {
//       return typeof jsonContent === "string"
//         ? JSON.parse(jsonContent)
//         : jsonContent;
//     } catch (e) {
//       console.error("Failed to parse JSON:", e);
//       return null;
//     }
//   }, [jsonContent]);

//   // Extract sections from parsed JSON
//   const sections = React.useMemo(() => {
//     if (!parsedJson?.guideline_knowledge_base) return {};
//     return {
//       taxonomy: parsedJson.guideline_knowledge_base.taxonomy || [],
//       ontology: parsedJson.guideline_knowledge_base.ontology || {},
//       semantics: parsedJson.guideline_knowledge_base.semantics || {},
//       rules: parsedJson.guideline_knowledge_base.rules || {},
//     };
//   }, [parsedJson]);

//   const handleCopy = () => {
//     const textToCopy =
//       typeof jsonContent === "string"
//         ? jsonContent
//         : JSON.stringify(jsonContent, null, 2);

//     navigator.clipboard.writeText(textToCopy);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleDownload = () => {
//     const textToDownload =
//       typeof jsonContent === "string"
//         ? jsonContent
//         : JSON.stringify(jsonContent, null, 2);

//     const blob = new Blob([textToDownload], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `guideline_ingested_${Date.now()}.json`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   const renderJsonSection = (data, title) => {
//     if (
//       !data ||
//       (Array.isArray(data) && data.length === 0) ||
//       (typeof data === "object" && Object.keys(data).length === 0)
//     ) {
//       return (
//         <Typography
//           variant="body2"
//           color="text.secondary"
//           sx={{ fontStyle: "italic" }}
//         >
//           No {title.toLowerCase()} data available
//         </Typography>
//       );
//     }

//     return (
//       <Box
//         component="pre"
//         sx={{
//           backgroundColor: "#f5f5f5",
//           padding: 2,
//           borderRadius: 1,
//           overflowX: "auto",
//           fontSize: "0.875rem",
//           fontFamily: "monospace",
//           margin: 0,
//           whiteSpace: "pre-wrap",
//           wordBreak: "break-word",
//         }}
//       >
//         {JSON.stringify(data, null, 2)}
//       </Box>
//     );
//   };

//   return (
//     <Dialog
//       open={true}
//       onClose={onClose}
//       fullWidth
//       maxWidth="lg"
//       PaperProps={{
//         sx: {
//           borderRadius: 3,
//           maxHeight: "90vh",
//         },
//       }}
//     >
//       {/* Header */}
//       <DialogTitle
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           borderBottom: "1px solid #e0e0e0",
//           pb: 2,
//         }}
//       >
//         <Typography variant="h6" fontWeight={600}>
//           📊 Guideline Knowledge Base (JSON)
//         </Typography>
//         <Box>
//           <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
//             <IconButton onClick={handleCopy} size="small" sx={{ mr: 1 }}>
//               {copied ? (
//                 <CheckCircleIcon color="success" fontSize="small" />
//               ) : (
//                 <ContentCopyIcon fontSize="small" />
//               )}
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Download JSON">
//             <IconButton onClick={handleDownload} size="small" sx={{ mr: 1 }}>
//               <DownloadIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Close">
//             <IconButton onClick={onClose} size="small">
//               <CloseIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>
//         </Box>
//       </DialogTitle>

//       {/* Metadata */}
//       {parsedJson?.guideline_knowledge_base?.metadata && (
//         <Box sx={{ px: 3, pt: 2, pb: 1, backgroundColor: "#f9f9f9" }}>
//           <Typography variant="caption" color="text.secondary">
//             Version: {parsedJson.guideline_knowledge_base.metadata.version} |
//             Format: {parsedJson.guideline_knowledge_base.metadata.format}
//           </Typography>
//         </Box>
//       )}

//       {/* Tabs */}
//       <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
//         <Tabs
//           value={activeTab}
//           onChange={(e, newValue) => setActiveTab(newValue)}
//           variant="scrollable"
//           scrollButtons="auto"
//         >
//           <Tab label="All Data" />
//           <Tab label="Taxonomy" />
//           <Tab label="Ontology" />
//           <Tab label="Semantics" />
//           <Tab label="Rules" />
//         </Tabs>
//       </Box>

//       {/* Content */}
//       <DialogContent sx={{ p: 3, overflowY: "auto" }}>
//         {activeTab === 0 && renderJsonSection(parsedJson, "All Data")}
//         {activeTab === 1 && renderJsonSection(sections.taxonomy, "Taxonomy")}
//         {activeTab === 2 && renderJsonSection(sections.ontology, "Ontology")}
//         {activeTab === 3 && renderJsonSection(sections.semantics, "Semantics")}
//         {activeTab === 4 && renderJsonSection(sections.rules, "Rules")}
//       </DialogContent>

//       {/* Footer */}
//       <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e0e0e0" }}>
//         <Button
//           variant="contained"
//           onClick={onClose}
//           sx={{
//             textTransform: "none",
//             borderRadius: 2,
//             fontWeight: 500,
//           }}
//         >
//           Close
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default JsonViewer;

import React from "react";
import ReactJson from "react-json-view";
import { Card, CardHeader, CardContent } from "@mui/material";

const YamlViewer = ({ yamlContent }) => {
  if (!yamlContent) return null;

  return (
    <Card sx={{ borderRadius: 3, mt: 3 }}>
      <CardHeader title="JSON Output" />
      <CardContent>
        <ReactJson
          src={yamlContent}
          theme="rjv-default"
          collapsed={2}
          enableClipboard
          displayDataTypes={false}
        />
      </CardContent>
    </Card>
  );
};

export default YamlViewer;
