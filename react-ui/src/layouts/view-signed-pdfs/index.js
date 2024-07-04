import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import SuiBox from "components/SuiBox";
import SuiTypography from "components/SuiTypography";
import AuthApi from "api/auth";
import SignedCustomizedTables from "./SignedCustomizedTables";

function SignPdfView() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const response = await AuthApi.getSignedPDFs();
        console.log("Certificates data:", response.data); // Log the data received from the endpoint
        setCertificates(response.data);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      }
    }

    fetchCertificates();
  }, []);

  return (
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
            <SignedCustomizedTables certificates={certificates} />
          </SuiBox>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SignPdfView;
