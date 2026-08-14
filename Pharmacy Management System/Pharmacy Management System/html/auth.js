// Base API Endpoint targeting UserController [Route("User")]
const API_BASE_URL = "https://localhost:7293/User";

// UI Elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const toggleAuthBtn = document.getElementById("toggleAuthBtn");
const toggleText = document.getElementById("toggleText");
const authSubtitle = document.getElementById("authSubtitle");
const authAlert = document.getElementById("authAlert");

let isLoginState = true;

// 1. Toggle View State
toggleAuthBtn.addEventListener("click", () => {
  isLoginState = !isLoginState;
  hideAlert();

  if (isLoginState) {
    loginForm.classList.remove("d-none");
    registerForm.classList.add("d-none");
    authSubtitle.textContent = "Welcome back! Sign in to continue.";
    toggleText.textContent = "Don't have an account? ";
    toggleAuthBtn.textContent = "Register here";
  } else {
    loginForm.classList.add("d-none");
    registerForm.classList.remove("d-none");
    authSubtitle.textContent = "Create an account to access the system.";
    toggleText.textContent = "Already have an account? ";
    toggleAuthBtn.textContent = "Login here";
  }
});

// Helper: Safely parse JWT token to extract claims (username, role)
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
}

// 2. Handle Login Submission calling POST /User/login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const searchInput = document.getElementById("loginEmail").value.trim();
  const passwordInput = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Username: searchInput,
        Email: searchInput,
        Password: passwordInput,
      }),
    });

    if (response.ok) {
      const contentType = response.headers.get("content-type");
      let token = "";
      let userData = {};

      if (contentType && contentType.includes("application/json")) {
        const responseData = await response.json();

        // Extract token depending on whether backend sends object or plain token string
        token = responseData.token || responseData.Token || responseData;
        userData = responseData.user || responseData.User || responseData;
      } else {
        // Plain text token response
        token = await response.text();
      }

      // Store JWT Token
      localStorage.setItem("token", token);

      // Parse JWT payload claims for role and username fallback
      const tokenClaims = parseJwt(token);
      const username =
        userData.username ||
        userData.Username ||
        (tokenClaims
          ? tokenClaims[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ] || tokenClaims.sub
          : null) ||
        searchInput;

      const role =
        userData.role ||
        userData.Role ||
        userData.roleId ||
        (tokenClaims
          ? tokenClaims[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ] || tokenClaims.role
          : null);

      // Save user object
      const currentUser = {
        username: username,
        role: role,
      };
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      showAlert(`Welcome back, ${username}! Redirecting...`, "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    } else {
      const errorMsg = await response.text();
      showAlert(errorMsg || "Invalid username/email or password.", "danger");
    }
  } catch (err) {
    console.error("Login error:", err);
    showAlert("Unable to connect to the backend server.", "danger");
  }
});

// 3. Handle Register Submission calling POST /User/register
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("regUsername").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;

  const userPayload = {
    Username: username,
    Email: email,
    Password: password,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });

    if (response.ok) {
      const createdUserId = await response.text();
      showAlert(
        `User registered successfully! Switching to login...`,
        "success",
      );

      registerForm.reset();
      setTimeout(() => {
        toggleAuthBtn.click();
      }, 1200);
    } else {
      const errorText = await response.text();
      showAlert(
        errorText ||
          "Registration failed. Username or email may already be taken.",
        "danger",
      );
    }
  } catch (err) {
    console.error("Register error:", err);
    showAlert("Unable to connect to the backend server.", "danger");
  }
});

// Helper Function: Show Banner
function showAlert(message, type) {
  authAlert.className = `alert alert-${type}`;
  authAlert.textContent = message;
  authAlert.classList.remove("d-none");
}

// Helper Function: Hide Banner
function hideAlert() {
  authAlert.classList.add("d-none");
}
