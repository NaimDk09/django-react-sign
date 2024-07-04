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

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, useHistory  } from "react-router-dom";
import App from "App";
import AuthApi from "api/auth"
// Soft UI Dashboard React Context Provider
import { SoftUIControllerProvider } from "context";

import { AuthProvider, useAuth } from "auth-context/auth.context";


let user = localStorage.getItem("user");
user = JSON.parse(user);

// Component to setup interceptors
const SetupInterceptors = () => {
  const history = useHistory();
  const { setUser } = useAuth();

  useEffect(() => {
    AuthApi.setupInterceptors(setUser, history);
  }, [setUser, history]);

  return null;
};

ReactDOM.render(
  <BrowserRouter>
    <SoftUIControllerProvider>
      <AuthProvider userData={user}>
        <SetupInterceptors /> {/* Ensure this component is used */}
        <App />
      </AuthProvider>
    </SoftUIControllerProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
