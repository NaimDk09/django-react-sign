import React, { useState } from "react";
import Card from "@mui/material/Card";
import SuiBox from "components/SuiBox";
import SuiTypography from "components/SuiTypography";
import SuiButton from "components/SuiButton";
import Icon from "@mui/material/Icon";
import Modal from "@mui/material/Modal";
import AuthApi from "api/auth";
import PDFViewerModal from "./PDFViewerModal";

function Invoices() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFiles([...selectedFiles, ...event.target.files]);
    setUploadSuccess(false); 
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handlePreviewFile = (file) => {
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleConfirm = async () => {
    try {
      const userData = localStorage.getItem("user");

      if (!userData) {
        throw new Error("User data not found in local storage");
      }

      const user = JSON.parse(userData);
      const token = user.token;

      if (!token) {
        throw new Error("Token not found in user data");
      }

      const uploadPromises = selectedFiles.map(async (file) => {
        const data = { token };
        const response = await AuthApi.UploadFile(file, data);
        console.log("File uploaded successfully:", response.data);
      });

      await Promise.all(uploadPromises);

      setUploadSuccess(true);
      setSelectedFiles([]); // Reset selected files
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadSuccess(false);
    }
  };

  const handleCloseModal = () => {
    setUploadSuccess(false);
  };

  return (
    <Card id="delete-account">
      <SuiBox
        pt={2}
        px={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <SuiTypography variant="h6" fontWeight="medium">
          Upload Invoice (PDF)
        </SuiTypography>
        <SuiButton variant="gradient" buttonColor="dark" size="small" component="label">
          <Icon className="font-bold">add</Icon>
          &nbsp;Upload PDF
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
            multiple
          />
        </SuiButton>
      </SuiBox>
      {selectedFiles.length > 0 && (
        <SuiBox p={2}>
          {selectedFiles.map((file, index) => (
            <div key={index} style={{ marginBottom: "16px" }}>
              <SuiTypography variant="body2" fontWeight="medium">
                Filename: {file.name}
              </SuiTypography>
              <SuiButton
                variant="contained"
                color="primary"
                onClick={() => handlePreviewFile(file)}
                style={{ marginRight: "8px" }}
              >
                Preview
              </SuiButton>
              <SuiButton
                variant="contained"
                color="error"
                onClick={() => handleDeleteFile(index)}
              >
                Delete
              </SuiButton>
            </div>
          ))}
          <SuiButton onClick={handleConfirm} disabled={uploadSuccess}>
            Confirm Upload
          </SuiButton>
        </SuiBox>
      )}
      <PDFViewerModal open={!!previewUrl} onClose={() => setPreviewUrl(null)} url={previewUrl} />
      <Modal
        open={uploadSuccess}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div style={modalStyle}>
          <SuiBox
            p={2}
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
          >
            <SuiTypography id="modal-title" variant="h6" component="h2" mb={2}>
              Success
            </SuiTypography>
            <SuiTypography
              id="modal-description"
              variant="body2"
              color="success"
            >
              Document uploaded successfully!
            </SuiTypography>
            <SuiButton
              variant="contained"
              color="primary"
              onClick={handleCloseModal}
              mt={2}
            >
              Close
            </SuiButton>
          </SuiBox>
        </div>
      </Modal>
    </Card>
  );
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #1976d2",
  boxShadow: 24,
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "#ffffff", // White background
};

export default Invoices;
