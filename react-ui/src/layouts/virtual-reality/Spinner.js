// Spinner.js
import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import SuiBox from 'components/SuiBox';

function Spinner() {
  return (
    <SuiBox display="flex" justifyContent="center" alignItems="center" mt={2}>
      <CircularProgress />
    </SuiBox>
  );
}

export default Spinner;
