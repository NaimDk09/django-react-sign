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
import { useEffect } from "react";
import AuthApi from "../../../api/auth";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../../auth-context/auth.context";

function SignOut() {
  const history = useHistory();
  const { setUser } = useAuth();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      // Send logout request to backend to delete the active session
      await AuthApi.Logout(user);
    } catch (error) {
      console.error("Error logging out:", error);
      // Handle any errors if necessary
    } finally {
      // Clear user data from local storage
      localStorage.removeItem("user");

      // Update user context to null
      setUser(null);

      // Redirect to sign-in page
      history.push("/authentication/sign-in");
    }
  };

  useEffect(() => {
    handleLogout(); // Automatically trigger logout when component mounts

    // No need to have any dependencies for useEffect, just want it to run once
  }, []);

  return null;
}

export default SignOut;





/* function SignOut() {
  const history = useHistory();
  const { setUser } = useAuth();
  let { user } = useAuth();

  const handleLogout = async () => {
    await AuthApi.Logout(user);
    await setUser(null);
    localStorage.removeItem("user");
    return history.push("/authentication/sign-in");
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return null;
}

export default SignOut;
 */