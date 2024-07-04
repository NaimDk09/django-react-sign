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
import TextField from '@mui/material/TextField';
import AuthApi from "api/auth";
import PDFViewerModal from "layouts/virtual-reality/PDFViewerModal";
import PasswordPromptModal from "./PasswordPromptModal";
import ImageSignatureModal from "./ImageUploadModal"; // Assuming you have this component

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    wordBreak: "break-word",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    maxWidth: "300px",
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

function EmailModal({ open, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState([]);

  const handleAddEmail = () => {
    if (email && !emailList.includes(email)) {
      setEmailList([...emailList, email]);
      setEmail('');
    }
  };

  const handleRemoveEmail = (index) => {
    setEmailList(emailList.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSubmit(emailList);
    setEmailList([]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="email-modal-title" aria-describedby="email-modal-description">
      <div style={modalStyle}>
        <SuiBox p={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <SuiTypography id="email-modal-title" variant="h6" component="h2" mb={2}>
            Add Recipients
          </SuiTypography>
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
            InputLabelProps={{
              style: {
                transformOrigin: 'center',
                textAlign: 'center',
                width: '100%',
              },
            }}
            sx={{
              '& .MuiInputLabel-root': {
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
              },
              '& .MuiInputLabel-shrink': {
                transform: 'translateX(-30%) translateY(-50%) scale(0.75)',
                left: 0,
                top: 0,
                transformOrigin: 'top left',
                color: '#344767',
              },
              '& .MuiOutlinedInput-input': {
                textAlign: 'center',
              },
            }}
          />
          <SuiButton variant="contained" color="primary" onClick={handleAddEmail} sx={{ mt: 1 }}>
            Add Email
          </SuiButton>
          <SuiBox mt={2} width="100%">
            {emailList.map((email, index) => (
              <SuiBox key={index} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <SuiTypography variant="body2">{email}</SuiTypography>
                <SuiButton variant="text" color="error" onClick={() => handleRemoveEmail(index)}>
                  Remove
                </SuiButton>
              </SuiBox>
            ))}
          </SuiBox>
          <SuiButton variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
            Send Email
          </SuiButton>
        </SuiBox>
      </div>
    </Modal>
  );
}

EmailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

function CustomizedTables({ certificates, onRefresh }) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [pfxFile, setPfxFile] = useState(null);
  const [signingId, setSigningId] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [currentEmailId, setCurrentEmailId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (id, file) => {
    await AuthApi.handleDownload(id, file);
  };

  const handleView = async (id) => {
    const url = await AuthApi.handleView(id);
    setPdfUrl(url);
    setPdfModalOpen(true);
  };

  const handleEmail = async (id) => {
    setCurrentEmailId(id);
    setEmailModalOpen(true);
  };

  const handleEmailSubmit = async (emailList) => {
    try {
      if (emailList.length === 0) {
        console.log("No emails provided");
        return;
      }

      const body = JSON.stringify({ to: emailList });

      const response = await AuthApi.handleEmail(body, currentEmailId);

      console.log("Email sent response:", response);

      if (response.message === 'Emails sent successfully') {
        setSuccessMessage("Emails sent successfully!");
      } else {
        setSuccessMessage("Error sending email");
      }
      
      setSuccessModalOpen(true);
    } catch (error) {
      console.error("Error sending email:", error);
      setSuccessMessage("Error sending email");
      setSuccessModalOpen(true);
    }
  };

  const signPDF = async (id) => {
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

      const response = await AuthApi.signPDF(formData);

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

  const handleDelete = async (id) => {
    try {
      await AuthApi.deletePDF(id);
      setSuccessMessage("Document deleted successfully!");
      setSuccessModalOpen(true);
      // Refresh the data after deletion
      onRefresh();
    } catch (error) {
      console.error("Error deleting PDF:", error);
    }
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1050 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Uploaded At</StyledTableCell>
              <StyledTableCell>File</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell sx={{ width: "450px" }}>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certificates.map((certificate) => (
              <StyledTableRow key={certificate.id}>
                <StyledTableCell>{certificate.uploaded_at}</StyledTableCell>
                <StyledTableCell>{certificate.file}</StyledTableCell>
                <StyledTableCell>{certificate.status}</StyledTableCell>
                <StyledTableCell>
                  <Tooltip title="Download" placement="top">
                    <SuiButton size="small" onClick={() => handleDownload(certificate.id, certificate.file)}>
                      <Icon>download</Icon>
                    </SuiButton>
                  </Tooltip>
                  <Tooltip title="View" placement="top">
                    <SuiButton size="small" onClick={() => handleView(certificate.id)}>
                      <Icon>visibility</Icon>
                    </SuiButton>
                  </Tooltip>
                  <Tooltip title="Sign" placement="top">
                    <SuiButton size="small" onClick={() => signPDF(certificate.id)} disabled={certificate.status === 'signed'}>
                      <Icon>edit</Icon>
                    </SuiButton>
                  </Tooltip>
                  <Tooltip title="Email" placement="top">
                    <SuiButton size="small" onClick={() => handleEmail(certificate.id)}>
                      <Icon>email</Icon>
                    </SuiButton>
                  </Tooltip>
                  <Tooltip title="Delete" placement="top">
                    <SuiButton size="small" onClick={() => handleDelete(certificate.id)}>
                      <Icon>delete</Icon>
                    </SuiButton>
                  </Tooltip>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <PDFViewerModal open={pdfModalOpen} onClose={handleClosePdfModal} url={pdfUrl} />
      <PasswordPromptModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} onSubmit={handlePasswordSubmit} loading={loading} />
      <EmailModal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} onSubmit={handleEmailSubmit} />
      <ImageSignatureModal open={imageModalOpen} onClose={() => setImageModalOpen(false)} onUpload={handleImageUpload} />
      <Modal open={successModalOpen} onClose={handleCloseSuccessModal} aria-labelledby="modal-title" aria-describedby="modal-description">
        <div style={modalStyle}>
          <SuiBox p={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <SuiTypography id="modal-title" variant="h6" component="h2" mb={2}>
              Success
            </SuiTypography>
            <SuiTypography id="modal-description" variant="body2" color="success">
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

CustomizedTables.propTypes = {
  certificates: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default CustomizedTables;
