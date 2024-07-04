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
import AuthApi from "api/auth"; // Import AuthApi
import SignedPDFViewerModal from "layouts/view-signed-pdfs/SignedPDFViewerModal"; // Import SignedPDFViewerModal

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
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function SignedCustomizedTables({ certificates }) {
  const [SignedpdfModalOpen, setSignedpdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  // Function to handle download
  const SignedhandleDownload = async (id, file) => {
    await AuthApi.SignedhandleDownload(id, file);
  };

  // Function to handle view
  const SignedhandleView = async (id) => {
    const url = await AuthApi.SignedhandleView(id);
    console.log("url data:", url);
    setPdfUrl(url);
    setSignedpdfModalOpen(true);
  };

  const handleClosePdfModal = () => {
    setSignedpdfModalOpen(false);
    setPdfUrl("");
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
                <StyledTableCell>{certificate.signed_pdf}</StyledTableCell>
                <StyledTableCell>{certificate.uploaded_by}</StyledTableCell>
                <StyledTableCell>{certificate.created_at}</StyledTableCell>
                <StyledTableCell>
                  <Tooltip title="Download" placement="top">
                    <SuiButton
                      size="small"
                      onClick={() => SignedhandleDownload(certificate.id, certificate.signed_pdf)}
                    >
                      <Icon>download</Icon>
                    </SuiButton>
                  </Tooltip>
                  <Tooltip title="View" placement="top">
                    <SuiButton
                      size="small"
                      onClick={() => SignedhandleView(certificate.id)}
                    >
                      <Icon>visibility</Icon>
                    </SuiButton>
                  </Tooltip>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <SignedPDFViewerModal open={SignedpdfModalOpen} onClose={handleClosePdfModal} url={pdfUrl} />
    </div>
  );
}

SignedCustomizedTables.propTypes = {
  certificates: PropTypes.array.isRequired,
};

export default SignedCustomizedTables;
