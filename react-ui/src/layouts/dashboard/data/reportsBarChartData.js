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

export default {
  chart: {
    labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: { label: "Sales", data: [450, 200, 100, 220, 500, 100, 400, 230, 500] },
  },
  items: [
    {
      icon: { color: "primary", component: "library_books" },
      label: "Signers",
      progress: { content: "0", percentage: 0 },
    },
    {
      icon: { color: "info", component: "touch_app" },
      label: "Signed",
      progress: { content: "0", percentage: 0 },
    },
    {
      icon: { color: "unsigned documents", component: "payment" },
      label: "Pending",
      progress: { content: "0", percentage: 0 },
    },
    {
      icon: { color: "pending", component: "extension" },
      label: "All",
      progress: { content: "0", percentage: 0 },
    },
  ],
};
