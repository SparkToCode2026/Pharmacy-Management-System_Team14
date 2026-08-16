// ============================================================
// auth.js
// Authentication & Registration Logic using api.js
// ============================================================

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const toggleAuthBtn = document.getElementById("toggleAuthBtn");
const toggleText = document.getElementById("toggleText");
const authSubtitle = document.getElementById("authSubtitle");
const authAlert = document.getElementById("authAlert");

let isLoginState = true;

if (
  !loginForm ||
  !registerForm ||
  !toggleAuthBtn ||
  !toggleText ||
  !authSubtitle ||
  !authAlert
) {
  console.info("Auth page elements not found. Skipping auth initialization.");
} else {
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
      const responseData = await apiLoginUser({
        Username: searchInput,
        Email: searchInput,
        Password: passwordInput,
      });

      let token = "";
      let userId = null;
      let roleRaw = null;

      if (typeof responseData === "object" && responseData !== null) {
        token = responseData.token || responseData.Token || "";
        userId = responseData.userId || responseData.UserId || null;
        roleRaw = responseData.role || responseData.Role || responseData.roleId || responseData.RoleId || null;
      } else if (typeof responseData === "string") {
        token = responseData;
      }

      if (token) {
        localStorage.setItem("token", token);

        const tokenClaims = parseJwt(token);
        if (!userId && tokenClaims) {
          userId =
            tokenClaims[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ] ||
            tokenClaims.nameid ||
            tokenClaims.sub ||
            null;
        }

        const username =
          (tokenClaims
            ? tokenClaims[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
              ] || tokenClaims.unique_name
            : null) || searchInput;

        const role = normalizeRole(
          roleRaw ||
            (tokenClaims
              ? tokenClaims[
                  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                ] ||
                tokenClaims[
                  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"
                ] ||
                tokenClaims.role
              : null),
        );

        const currentUser = {
          username: username,
          role: role,
          roleName:
            role === "admin"
              ? "Admin"
              : role === "pharmacist"
                ? "Pharmacist"
                : "User",
          userId: userId ? parseInt(userId) : null,
        };

        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        showAlert(`Welcome back, ${username}! Redirecting...`, "success");

        let redirectUrl = "user-dashboard.html";
        if (["admin", "pharmacist"].includes(role)) {
          redirectUrl = "admin-dashboard.html";
        }

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 800);
      } else {
        showAlert("Login failed. No authentication token received.", "danger");
      }
    } catch (err) {
      console.error("Login error:", err);
      showAlert(err.message || "Invalid username/email or password.", "danger");
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
      RoleId: 3, // Default customer/user role
    };

    try {
      await apiRegisterUser(userPayload);
      showAlert(
        `Account created successfully! Please sign in.`,
        "success",
      );

      registerForm.reset();
      setTimeout(() => {
        toggleAuthBtn.click();
      }, 1000);
    } catch (err) {
      console.error("Register error:", err);
      showAlert(
        err.message || "Registration failed. Username or email may already be taken.",
        "danger",
      );
    }
  });
}

// Helper: Parse JWT token
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

function normalizeRole(roleValue) {
  if (roleValue === null || roleValue === undefined || roleValue === "") {
    return "user";
  }

  if (typeof roleValue === "object") {
    const candidate =
      roleValue.roleName ||
      roleValue.RoleName ||
      roleValue.name ||
      roleValue.Name ||
      roleValue.roleId ||
      roleValue.RoleId ||
      roleValue.id ||
      "user";
    return normalizeRole(candidate);
  }

  const value = String(roleValue).trim().toLowerCase();
  if (["1", "admin", "administrator"].includes(value)) return "admin";
  if (["2", "pharmacist"].includes(value)) return "pharmacist";
  if (["3", "user", "customer"].includes(value)) return "user";
  return value || "user";
}

function showAlert(message, type) {
  if (!authAlert) return;
  authAlert.className = `alert alert-${type}`;
  authAlert.textContent = message;
  authAlert.classList.remove("d-none");
}

function hideAlert() {
  if (!authAlert) return;
  authAlert.classList.add("d-none");
}
