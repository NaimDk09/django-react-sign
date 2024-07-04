import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, DialogTitle, Button } from "@mui/material"; // Import components from Material-UI

const SignedPDFViewerModal = ({ open, onClose, url }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>View PDF</DialogTitle>
      <DialogContent>
        <embed src={url} type="application/pdf" width="100%" height="500px" />
      </DialogContent>
      <Button onClick={onClose}>Close</Button>
    </Dialog>
  );
};

SignedPDFViewerModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
};

export default SignedPDFViewerModal;
