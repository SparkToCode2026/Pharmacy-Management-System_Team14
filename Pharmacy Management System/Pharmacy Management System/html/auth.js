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
      const responseData = await response.json();

      // Store JWT Token if returned by the backend
      if (responseData.token) {
        localStorage.setItem("token", responseData.token);
      } else if (typeof responseData === "string") {
        localStorage.setItem("token", responseData);
      }

      // Store user info
      const user = responseData.user || responseData;
      localStorage.setItem("currentUser", JSON.stringify(user));

      showAlert(
        `Welcome back, ${user.username || "User"}! Redirecting...`,
        "success",
      );

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
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
        `User registered successfully (ID: ${createdUserId})! Switching to login...`,
        "success",
      );

      registerForm.reset();
      setTimeout(() => {
        toggleAuthBtn.click();
      }, 1500);
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
