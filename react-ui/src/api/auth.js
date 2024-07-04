import axios from "./index";

class AuthApi {
  static Login = (data) => {
    return axios.post(`${base}/login/`, data);
  };
  
  

  static Register = (data) => {
    return axios.post(`${base}/register/`, data);
  };

  static Logout = (data) => {
    console.log("Token:", data.token); // Print the token
    return axios.post(`${base}/logout/`, { token: data.token });
  };

  static setupInterceptors = (setUser, history) => {
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response.status === 401 && error.response.data.code === "token_not_valid") {
          // Token has expired, perform logout action
          console.log("Token has expired. Logging out...");
          
          console.log("Triggering alert"); // Add this log

          // Show alert
          alert("Session expired. Please log in again.");
          
          // Clear user data from local storage
          localStorage.removeItem("user");

          // Update user context to null
          setUser(null);

          // Redirect to sign-in page
          history.push("/authentication/sign-in");
        }
        return Promise.reject(error);
      }
    );
  };
  static UploadFile = (file, token) => {
    // Print the token
    console.log("Tok:", token);
  
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", file);
    
    const tokenString = token.token;
    // Add the token to the request headers
    const headers = {
      Authorization: `Bearer ${tokenString}`,
      "Content-Type": "multipart/form-data", // Set content type to multipart/form-data
    };
    console.log(headers);
  
    // Send POST request to upload endpoint with file and token
    return axios.post(`${base}/upload/`, formData, { headers });
  };
  static getPDFs = () => {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem("user");
    
    // Parse user data to extract token
    const user = JSON.parse(userData);
    const token = user.token;

    // Print the token for verification
    console.log("Token_getpdf:", token);

    // Add the token to the request headers
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    // Send GET request to fetch PDF files
    return axios.get(`${base}/pdfs/`, { headers });
};
static handleDownload = async (id, file) => {
  try {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem("user");
    
    // Parse user data to extract token
    const user = JSON.parse(userData);
    const token = user.token;

    // Print the token for verification
    console.log("Token for download:", token);

    // Add the token to the request headers
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Send request to download certificate with provided ID and token
    const response = await axios.get(`${base}/pdfs/${id}/download/`, {
      responseType: "blob",
      headers: headers,
    });

    // Create a blob object from the response data
    const blob = new Blob([response.data], { type: "application/pdf" });

    // Create a URL for the blob object
    const url = window.URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");
    link.href = url;

    // Set the filename for the downloaded file
    link.download = `downloaded_${file}`;

    // Dispatch a click event on the link to trigger download
    link.click();

    // Cleanup by revoking the URL object
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading certificate:", error);
  }
};
static async handleView(id) {
  try {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem("user");

    // Parse user data to extract token
    const user = JSON.parse(userData);
    const token = user.token;

    // Add the token to the request headers
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Send request to fetch PDF file with provided ID and token
    const response = await axios.get(`${base}/pdfs/${id}/download/`, {
      responseType: "blob",
      headers: headers,
    });

    // Create a blob object from the response data
    const blob = new Blob([response.data], { type: "application/pdf" });

    // Create a URL for the blob object
    const url = window.URL.createObjectURL(blob);

    // Return the URL for viewing the PDF
    return url;
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return null;
  }
};
static async signPDF(formData) {
  try {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem("user");

    // Parse user data to extract token
    const user = JSON.parse(userData);
    const token = user.token;

    // Add the token to the request headers
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };

    // Send request to sign PDF with provided form data
    const response = await axios.post(`${base}/sign-pdf/`, formData, { headers });

    // Handle response accordingly
    return response.data;
  } catch (error) {
    console.error("Error signing PDF:", error);
    // Ensure error is thrown for the catch block in handlePasswordSubmit
    throw new Error(error.response?.data?.message || "Error signing document.");
  }
};
static getSignedPDFs = () => {
  // Retrieve user data from localStorage
  const userData = localStorage.getItem("user");
  
  // Parse user data to extract token
  const user = JSON.parse(userData);
  const token = user.token;

  // Print the token for verification
  console.log("Token_getpdf:", token);

  // Add the token to the request headers
  const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
  };

  // Send GET request to fetch PDF files
  return axios.get(`${base}/signed-pdfs/`, { headers });
};
static SignedhandleDownload = async (id, signed_pdf) => {
  try {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem("user");
    
    // Parse user data to extract token
    const user = JSON.parse(userData);
    const token = user.token;

    // Print the token for verification
    console.log("Token for download:", token);

    // Add the token to the request headers
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Send request to download certificate with provided ID and token
    const response = await axios.get(`${base}/signed-pdfs/${id}/download/`, {
      responseType: "blob",
      headers: headers,
    });

    // Create a blob object from the response data
    const blob = new Blob([response.data], { type: "application/pdf" });

    // Create a URL for the blob object
    const url = window.URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");
    link.href = url;

    // Set the filename for the downloaded file
    link.download = `downloaded_${signed_pdf}`;

    // Dispatch a click event on the link to trigger download
    link.click();

    // Cleanup by revoking the URL object
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading certificate:", error);
  }
};
static async SignedhandleView(id) {
  try {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem("user");

    // Parse user data to extract token
    const user = JSON.parse(userData);
    const token = user.token;

    // Add the token to the request headers
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Send request to fetch PDF file with provided ID and token
    const response = await axios.get(`${base}/signed-pdfs/${id}/download/`, {
      responseType: "blob",
      headers: headers,
    });

    // Create a blob object from the response data
    const blob = new Blob([response.data], { type: "application/pdf" });

    // Create a URL for the blob object
    const url = window.URL.createObjectURL(blob);

    // Return the URL for viewing the PDF
    return url;
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return null;
  }
};
static async handleEmail(body, id) {
  try {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem("user");

    // Parse user data to extract token
    const user = JSON.parse(userData);
    const token = user.token;

    // Add the token to the request headers
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    
    // Send request to send email with recipient's email address
    const response = await axios.post(`${base}/send-email/${id}/`, body, { headers });

    // Handle response accordingly
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};

static async handleViewEmail(tokens) {
  try {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem("user");

    // Parse user data to extract token
    const user = JSON.parse(userData);
    const token = user.token;

    // Add the token to the request headers
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Send request to fetch PDF file with provided ID and token
    const response = await axios.get(`${base}/pdfs-email/${tokens}/`, {
      responseType: "blob",
      headers: headers,
    });

    // Create a blob object from the response data
    const blob = new Blob([response.data], { type: "application/pdf" });

    // Create a URL for the blob object
    const url = window.URL.createObjectURL(blob);

    // Return the URL for viewing the PDF
    return url;
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return null;
  }
};
static getEmailPDFs = () => {
  // Parse token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const tokens = urlParams.get('tokens');

  // Log the parsed token
  console.log("Token from URL:", tokens);

  // Send GET request to fetch PDF files
  return axios.get(`${base}/pdfs-email/${tokens}`)
    .then((response) => {
      console.log('PDFs:', response.data);
      return response.data;
    })
    .catch((error) => {
      console.error('Error fetching PDFs:', error);
      throw error;
    });
};
static async signEmailPDF(formData) {
  try {
    // Retrieve user data from localStorage
    
    


    // Send request to sign PDF with provided form data
    const response = await axios.post(`${base}/sign-pdf/`, formData);

    // Handle response accordingly
    return response.data;
  } catch (error) {
    console.error("Error signing PDF:", error);
    throw new Error(error.response?.data?.message || "Error signing document.");
  }
};

static async deletePDF(pdf_file_id) {
  try {
    const response = await axios.post(`${base}/delete/${pdf_file_id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting PDF:", error);
    return null;
  }
};
}
  
  

let base = "";

export default AuthApi;
