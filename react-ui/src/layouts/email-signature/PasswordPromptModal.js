import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '@mui/material/Modal';
import SuiBox from 'components/SuiBox';
import SuiTypography from 'components/SuiTypography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Spinner from './Spinner'; // Import the Spinner component

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

function PasswordPromptModal({ open, onClose, onSubmit, loading }) {
  const [password, setPassword] = useState('');

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = () => {
    onSubmit(password);
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
      <div style={modalStyle}>
        <SuiBox p={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <SuiTypography id="modal-title" variant="h6" component="h2" mb={2}>
            {loading ? 'Signing your document, please wait...' : 'Enter Password'}
          </SuiTypography>
          {loading ? (
            <Spinner /> // Render the Spinner component when loading is true
          ) : (
            <>
              <TextField
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
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
              <Button variant="contained" color="white" onClick={handleSubmit} sx={{ mt: 2 }}>
                Submit
              </Button>
            </>
          )}
        </SuiBox>
      </div>
    </Modal>
  );
}

PasswordPromptModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default PasswordPromptModal;
