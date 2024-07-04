import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '@mui/material/Modal';
import SuiBox from 'components/SuiBox';
import SuiButton from 'components/SuiButton';
import SuiTypography from 'components/SuiTypography';
import SuiInput from 'components/SuiInput';

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

function ImageSignatureModal({ open, onClose, onUpload }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
    setPreviewSrc(URL.createObjectURL(file));
  };

  const handleUpload = () => {
    if (imageFile) {
      onUpload(imageFile);
      onClose();
    }
  };

  const handleClear = () => {
    setImageFile(null);
    setPreviewSrc(null);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div style={modalStyle}>
        <SuiBox p={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <SuiTypography variant="h6" component="h2" mb={2}>
            Upload Image Signature
          </SuiTypography>
          <SuiInput
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            inputProps={{ style: { padding: '10px' } }}
          />
          {previewSrc && (
            <SuiBox mt={2} display="flex" flexDirection="column" alignItems="center">
              <img src={previewSrc} alt="Image Preview" style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '10px' }} />
              <SuiButton variant="contained" color="secondary" onClick={handleClear}>
                Clear
              </SuiButton>
            </SuiBox>
          )}
          {imageFile && (
            <SuiTypography variant="body1" mt={2} mb={1}>
              Please upload your PFX file
            </SuiTypography>
          )}
          <SuiButton variant="contained" color="primary" onClick={handleUpload} sx={{ mt: 2 }} disabled={!imageFile}>
            Upload
          </SuiButton>
        </SuiBox>
      </div>
    </Modal>
  );
}

ImageSignatureModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
};

export default ImageSignatureModal;
