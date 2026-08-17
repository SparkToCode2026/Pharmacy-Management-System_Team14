// ============================================================
// navbar.js
// Dynamic Navigation Bar & Shared Component Injection
// ============================================================

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
    return String(candidate).toLowerCase();
  }

  const value = String(roleValue).trim().toLowerCase();
  if (["1", "admin", "administrator"].includes(value)) return "admin";
  if (["2", "pharmacist"].includes(value)) return "pharmacist";
  if (["3", "user", "customer"].includes(value)) return "user";
  return value || "user";
}

// Get user role from localStorage
function getUserRole() {
  const userJson = localStorage.getItem("currentUser");
  const token = localStorage.getItem("token");
  if (!token && !userJson) return null;

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const roleValue =
        user.role ||
        user.Role ||
        user.roleName ||
        user.RoleName ||
        user.roleId ||
        user.RoleId ||
        "user";
      return normalizeRole(roleValue);
    } catch {
      // Fall through to token decoding
    }
  }

  if (token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));
      const roleValue =
        payload.role ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
        "user";
      return normalizeRole(roleValue);
    } catch {
      return null;
    }
  }

  return null;
}

// Admin / Pharmacist Navigation Items
function getAdminNavItems() {
  return [
    { label: "Dashboard", href: "admin-dashboard.html" },
    { label: "Orders", href: "orders.html" },
    { label: "Branches", href: "branch.html" },
    { label: "Medicines", href: "Medicine.html" },
    { label: "Categories", href: "MedicineCategory.html" },
    { label: "Manufacturers", href: "Manufacturer.html" },
    { label: "Suppliers", href: "suppliers.html" },
    { label: "Order Items", href: "orderitems.html" },
    { label: "Prescriptions", href: "prescriptions.html" },
    { label: "Payments", href: "payment.html" },
    { label: "Stock Levels", href: "stocklevel.html" },
    { label: "Users", href: "users.html" },
    { label: "Customer Profiles", href: "customer_profile.html" },
  ];
}

// User Navigation Items (limited customer access)
function getUserNavItems() {
  return [
    { label: "Dashboard", href: "user-dashboard.html" },
    { label: "My Orders", href: "user-orders.html" },
    { label: "My Prescriptions", href: "user-prescriptions.html" },
    { label: "Browse Medicines", href: "user-medicines.html" },
    { label: "My Profile", href: "customer_profile.html" },
  ];
}

// Guest Navigation Items (unauthenticated)
function getGuestNavItems() {
  return [
    { label: "Home", href: "index.html" },
    { label: "Browse Medicines", href: "user-medicines.html" },
  ];
}

// Generate dynamic navbar HTML
function generateDynamicNavbar() {
  const token = localStorage.getItem("token");
  const role = getUserRole();

  let navItems = [];
  if (token && role) {
    navItems = ["admin", "pharmacist"].includes(role)
      ? getAdminNavItems()
      : getUserNavItems();
  } else {
    navItems = getGuestNavItems();
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  const navItemsHtml = navItems
    .map((item) => {
      const isActive = currentPage.toLowerCase() === item.href.toLowerCase();
      return `
      <li class="nav-item">
        <a class="nav-link ${isActive ? "active fw-bold" : ""}" href="${item.href}">${item.label}</a>
      </li>
    `;
    })
    .join("");

  return `
    <nav class="navbar navbar-expand-xl navbar-dark shadow-sm" style="background-color: #0f172a; border-bottom: 1px solid rgba(148, 163, 184, 0.2);">
      <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold fs-5" href="index.html" style="letter-spacing: 0.3px; color: #ffffff;">💊 Pharmacy System</a>
        <button
          class="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavigation"
          aria-controls="navbarNavigation"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavigation">
          <ul class="navbar-nav me-auto mb-2 mb-xl-0 align-items-xl-center">
            ${navItemsHtml}
          </ul>
          <div id="nav-auth-section" class="d-flex gap-2 align-items-center mt-2 mt-xl-0">
            <!-- Injected dynamically -->
          </div>
        </div>
      </div>
    </nav>
  `;
}

function renderNavbarAuth() {
  const authContainer = document.getElementById("nav-auth-section");
  if (!authContainer) return;

  const userJson = localStorage.getItem("currentUser");
  const token = localStorage.getItem("token");

  if (token) {
    let username = "Account";
    let roleLabel = "";
    const role = getUserRole();

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        username = user.username || user.Username || "Account";
      } catch {
        username = "Account";
      }
    }

    if (role === "admin") {
      roleLabel = '<span class="badge bg-primary ms-1">Admin</span>';
    } else if (role === "pharmacist") {
      roleLabel = '<span class="badge bg-info ms-1">Pharmacist</span>';
    }

    authContainer.innerHTML = `
      <div class="dropdown">
        <button 
          class="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-1" 
          type="button" 
          id="userMenuBtn" 
          data-bs-toggle="dropdown" 
          aria-expanded="false">
          <span>👤 ${username}</span> ${roleLabel}
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userMenuBtn">
          <li><a class="dropdown-item" href="customer_profile.html">My Profile</a></li>
          ${["admin", "pharmacist"].includes(role) ? '<li><a class="dropdown-item" href="admin-dashboard.html">Admin Dashboard</a></li>' : '<li><a class="dropdown-item" href="user-dashboard.html">User Dashboard</a></li>'}
          <li><hr class="dropdown-divider"></li>
          <li><button id="nav-logout-btn" class="dropdown-item text-danger">Logout</button></li>
        </ul>
      </div>
    `;

    document.getElementById("nav-logout-btn")?.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      window.location.href = "auth.html";
    });

    return;
  }

  // Render Login / Register button if logged out
  authContainer.innerHTML = `
    <a href="auth.html" class="btn btn-primary btn-sm px-3 fw-semibold">Sign In / Register</a>
  `;
}

// Fetch and inject navbar & footer
document.addEventListener("DOMContentLoaded", () => {
  const navPlaceholder = document.getElementById("navbar-placeholder");
  if (navPlaceholder) {
    navPlaceholder.innerHTML = generateDynamicNavbar();
    renderNavbarAuth();
  }

  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder && !footerPlaceholder.innerHTML.trim()) {
    footerPlaceholder.innerHTML = `
      <footer class="site-footer mt-auto py-4 bg-dark text-light border-top">
        <div class="container text-center">
          <p class="mb-1 fw-semibold">Pharmacy Management System &copy; 2026</p>
          <small class="text-secondary">Designed with high performance and security.</small>
        </div>
      </footer>
    `;
  }
});
