/**
=========================================================
* Soft UI Dashboard React - v2.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-material-ui
* Copyright 2021 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import SuiBox from "components/SuiBox";
import SuiTypography from "components/SuiTypography";

// Soft UI Dashboard React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";

// Soft UI Dashboard React base styles
import typography from "assets/theme/base/typography";

// Dashboard layout components
import BuildByDevelopers from "layouts/dashboard/components/BuildByDevelopers";
import WorkWithTheRockets from "layouts/dashboard/components/WorkWithTheRockets";
//import Projects from "layouts/dashboard/components/Projects";
//import OrderOverview from "layouts/dashboard/components/OrderOverview";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import gradientLineChartData from "layouts/dashboard/data/gradientLineChartData";

function Dashboard() {
  const { size } = typography;
  const { chart, items } = reportsBarChartData;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SuiBox py={3}>
        <SuiBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Total Documents" }}
                count="0"
                percentage={{ color: "success", text: "+0%" }}
                icon={{ color: "info", component: "article" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Signed Documents" }}
                count="0"
                percentage={{ color: "success", text: "+0%" }}
                icon={{ color: "info", component: "article" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Unsigned Documents" }}
                count="0"
                percentage={{ color: "error", text: "+0%" }}
                icon={{ color: "info", component: "article" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Sent for Signing" }}
                count="0"
                percentage={{ color: "success", text: "+0%" }}
                icon={{
                  color: "info",
                  component: "article",
                }}
              />
            </Grid>
          </Grid>
        </SuiBox>
        <SuiBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <BuildByDevelopers />
            </Grid>
            <Grid item xs={12} lg={5}>
              <WorkWithTheRockets />
            </Grid>
          </Grid>
        </SuiBox>
        <SuiBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={5}>
              <ReportsBarChart
                title="active signatures"
                description={
                  <>
                    (<strong>+0%</strong>) than last week
                  </>
                }
                chart={chart}
                items={items}
              />
            </Grid>
            <Grid item xs={12} lg={7}>
              <GradientLineChart
                title="Signatures Overview"
                description={
                  <SuiBox display="flex" alignItems="center">
                    <SuiBox fontSize={size.lg} color="success" mb={0.3} mr={0.5} lineHeight={0}>
                      <Icon className="font-bold">arrow_upward</Icon>
                    </SuiBox>
                    <SuiTypography variant="button" textColor="text" fontWeight="medium">
                      0% more{" "}
                      <SuiTypography variant="button" textColor="text" fontWeight="regular">
                        in 2024
                      </SuiTypography>
                    </SuiTypography>
                  </SuiBox>
                }
                height="20.25rem"
                chart={gradientLineChartData}
              />
            </Grid>
          </Grid>
        </SuiBox>
        <Grid container spacing={3}>
          {/* <Grid item xs={12} md={6} lg={8}>
            <Projects />
          </Grid> */}
          {/* <Grid item xs={12} md={6} lg={4}>
            <OrderOverview />
          </Grid> */}
        </Grid>
      </SuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
