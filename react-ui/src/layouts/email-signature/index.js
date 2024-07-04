import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import SuiBox from "components/SuiBox";
import SuiTypography from "components/SuiTypography";
import AuthApi from "api/auth";
import CustomizedTablesEmail from "./CustomizedTablesEmail";

// Define the component styles
const styles = `
  /* Override the .makeStyles-sidenav-11 class */
  body .makeStyles-sidenav-11 {
    display: none;
  }
`;

function EmailSignature() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await AuthApi.getEmailPDFs();
      console.log("Certificates data:", response); // Log the data received from the endpoint
      setCertificates(response);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const handleRefresh = () => {
    fetchCertificates();
  };

  return (
    <>
      {/* Add the style tag with overridden styles */}
      <style>{styles}</style>
      
      <Grid container justifyContent="center">
        <Grid item>
          <Card>
            <SuiBox
              pt={2}
              px={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <SuiTypography variant="h6" fontWeight="medium">
                Certificates
              </SuiTypography>
            </SuiBox>
            <SuiBox p={2}>
              <CustomizedTablesEmail certificates={certificates} onRefresh={handleRefresh} />
            </SuiBox>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

export default EmailSignature;
