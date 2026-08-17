// ============================================================
// user-dashboard.js
// Logic for Customer / User Dashboard
// ============================================================

function checkUserAccess() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "auth.html";
    return false;
  }
  return true;
}

// Update welcome message with username
function updateWelcomeMessage() {
  const userJson = localStorage.getItem("currentUser");
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const username = user.username || user.Username || "User";
      const welcomeMsg = document.getElementById("welcome-message");
      const welcomeSub = document.getElementById("welcome-subtitle");
      if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${username}`;
      if (welcomeSub) welcomeSub.textContent = "Manage your prescriptions, orders, and customer profile";
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
}

// Initialize user dashboard
document.addEventListener("DOMContentLoaded", () => {
  if (checkUserAccess()) {
    updateWelcomeMessage();
  }
});
