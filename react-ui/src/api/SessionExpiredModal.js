import React from 'react';
import './SessionExpiredModal.css'; // Add CSS for modal styling

const SessionExpiredModal = ({ show, onLogout }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Session Expired</h2>
        <p>Your session has expired. Please log in again.</p>
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
