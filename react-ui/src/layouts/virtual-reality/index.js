import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import SuiBox from "components/SuiBox";
import SuiTypography from "components/SuiTypography";
import AuthApi from "api/auth";
import CustomizedTables from "./CustomizedTables";

function VirtualReality() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await AuthApi.getPDFs();
      console.log("Certificates data:", response.data);
      setCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const handleRefresh = () => {
    fetchCertificates();
  };

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
            <CustomizedTables certificates={certificates} onRefresh={handleRefresh} />
          </SuiBox>
        </Card>
      </Grid>
    </Grid>
  );
}

export default VirtualReality;
