import React, { useState } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import SuiButton from "components/SuiButton";
import Icon from "@mui/material/Icon";
import Modal from "@mui/material/Modal";
import SuiBox from "components/SuiBox";
import SuiTypography from "components/SuiTypography";
import AuthApi from "api/auth";
import PDFViewerModalEmail from "layouts/email-signature/PDFViewerModalEmail";
import PasswordPromptModal from "./PasswordPromptModal"; // Import PasswordPromptModal
import ImageSignatureModal from "./ImageUploadModal"; // Assuming you have this component

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function CustomizedTablesEmail({ certificates, onRefresh }) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [pfxFile, setPfxFile] = useState(null);
  const [signingId, setSigningId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (id, file) => {
    await AuthApi.handleDownload(id, file);
  };

  const handleView = async (id) => {
    const url = await AuthApi.handleView(id);
    console.log("url signed:", url);
    setPdfUrl(url);
    setPdfModalOpen(true);
  };

  const signEmailPDF = async (id) => {
    setSigningId(id);
    setImageModalOpen(true);
  };

  const handleImageUpload = (imageFile) => {
    setImage(imageFile);
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pfx";

    fileInput.addEventListener("change", async (event) => {
      const pfxFile = event.target.files[0];
      setPfxFile(pfxFile);
      setPasswordModalOpen(true);
    });

    fileInput.click();
  };

  const handlePasswordSubmit = async (password) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdf_id", signingId);
      formData.append("pfx", pfxFile);
      formData.append("password", password);
      if (image) {
        formData.append("image", image);
      }

      const response = await AuthApi.signEmailPDF(formData);

      setPfxFile(null);
      setImage(null);
      console.log("Response:", response);

      setSuccessMessage("Document signed successfully!");
      setSuccessModalOpen(true);
      onRefresh();
    } catch (error) {
      console.error("Error signing PDF:", error);
    } finally {
      setLoading(false);
      setPasswordModalOpen(false);
    }
  };

  const handleClosePdfModal = () => {
    setPdfModalOpen(false);
    setPdfUrl("");
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    setSuccessMessage("");
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>File</StyledTableCell>
              <StyledTableCell>Uploaded By</StyledTableCell>
              <StyledTableCell>Uploaded At</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certificates.map((certificate) => (
              <StyledTableRow key={certificate.id}>
                <StyledTableCell>{certificate.id}</StyledTableCell>
                <StyledTableCell>{certificate.file}</StyledTableCell>
                <StyledTableCell>{certificate.uploaded_by}</StyledTableCell>
                <StyledTableCell>{certificate.uploaded_at}</StyledTableCell>
                <StyledTableCell>
                  <Tooltip title="Download" placement="top">
                    <SuiButton
                      size="small"
                      onClick={() => handleDownload(certificate.id, certificate.file)}
                    >
                      <Icon>download</Icon>
                    </SuiButton>
                  </Tooltip>
                  <Tooltip title="View" placement="top">
                    <SuiButton
                      size="small"
                      onClick={() => handleView(certificate.id)}
                    >
                      <Icon>visibility</Icon>
                    </SuiButton>
                  </Tooltip>
                  <Tooltip title="Sign" placement="top">
                    <SuiButton
                      size="small"
                      onClick={() => signEmailPDF(certificate.id)} disabled={certificate.status === 'signed'}
                    >
                      <Icon>edit</Icon>
                    </SuiButton>
                  </Tooltip>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <PDFViewerModalEmail open={pdfModalOpen} onClose={handleClosePdfModal} url={pdfUrl} />
      <PasswordPromptModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} onSubmit={handlePasswordSubmit} loading={loading} />
      <ImageSignatureModal open={imageModalOpen} onClose={() => setImageModalOpen(false)} onUpload={handleImageUpload} />
      <Modal
        open={successModalOpen}
        onClose={handleCloseSuccessModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div style={modalStyle}>
          <SuiBox p={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <SuiTypography id="modal-title" variant="h6" component="h2" mb={2}>
              {successMessage.startsWith("Document signed successfully!") ? "Success" : "Error"}
            </SuiTypography>
            <SuiTypography id="modal-description" variant="body2" color={successMessage.startsWith("Document signed successfully!") ? "success" : "error"}>
              {successMessage}
            </SuiTypography>
            <SuiButton variant="contained" color="primary" onClick={handleCloseSuccessModal} sx={{ mt: 2 }}>
              Close
            </SuiButton>
          </SuiBox>
        </div>
      </Modal>
    </div>
  );
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #1976d2',
  boxShadow: 24,
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#ffffff',
};

CustomizedTablesEmail.propTypes = {
  certificates: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default CustomizedTablesEmail;
