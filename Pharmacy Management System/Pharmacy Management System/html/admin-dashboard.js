// ============================================================
// admin-dashboard.js
// Logic for Admin Dashboard & Statistics
// ============================================================

function checkAdminAccess() {
  const token = localStorage.getItem("token");
  const role = getUserRole();

  if (!token) {
    window.location.href = "auth.html";
    return false;
  }

  if (!["admin", "pharmacist"].includes(role)) {
    console.warn("Access denied: User is not an admin/pharmacist");
    window.location.href = "user-dashboard.html";
    return false;
  }

  return true;
}

// Load statistics for the dashboard
async function loadStatistics() {
  try {
    const [usersRes, medicinesRes, ordersRes, branchesRes] = await Promise.allSettled([
      getAllUsers(),
      getMedicines(),
      getAllOrders(),
      getBranches(),
    ]);

    const users = usersRes.status === "fulfilled" ? usersRes.value : [];
    const medicines = medicinesRes.status === "fulfilled" ? medicinesRes.value : [];
    const orders = ordersRes.status === "fulfilled" ? ordersRes.value : [];
    const branches = branchesRes.status === "fulfilled" ? branchesRes.value : [];

    const userCountEl = document.getElementById("stat-users");
    const medCountEl = document.getElementById("stat-medicines");
    const orderCountEl = document.getElementById("stat-orders");
    const branchCountEl = document.getElementById("stat-branches");

    if (userCountEl) userCountEl.textContent = Array.isArray(users) ? users.length : 0;
    if (medCountEl) medCountEl.textContent = Array.isArray(medicines) ? medicines.length : 0;
    if (orderCountEl) orderCountEl.textContent = Array.isArray(orders) ? orders.length : 0;
    if (branchCountEl) branchCountEl.textContent = Array.isArray(branches) ? branches.length : 0;
  } catch (error) {
    console.error("Error loading statistics:", error);
  }
}

// Update welcome message with username
function updateWelcomeMessage() {
  const userJson = localStorage.getItem("currentUser");
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const username = user.username || user.Username || "Admin";
      const welcomeEl = document.getElementById("welcome-message");
      if (welcomeEl) welcomeEl.textContent = `Welcome, ${username}`;
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
}

// Initialize admin dashboard
document.addEventListener("DOMContentLoaded", () => {
  if (checkAdminAccess()) {
    updateWelcomeMessage();
    loadStatistics();
  }
});
