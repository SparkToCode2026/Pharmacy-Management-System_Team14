function renderNavbarAuth() {
  const authContainer = document.getElementById("nav-auth-section");
  if (!authContainer) return;

  const userJson = localStorage.getItem("currentUser");
  const token = localStorage.getItem("token");

  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);
      const username = user.username || user.Username || "User";

      authContainer.innerHTML = `
        <div class="dropdown">
          <button 
            class="btn btn-outline-primary btn-sm dropdown-toggle d-flex align-items-center gap-2" 
            type="button" 
            id="userMenuBtn" 
            data-bs-toggle="dropdown" 
            aria-expanded="false">
            👤 <span>${username}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userMenuBtn">
            <li><a class="dropdown-item" href="customer_profile.html">⚙️ Profile</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button id="nav-logout-btn" class="dropdown-item text-danger">🚪 Logout</button></li>
          </ul>
        </div>
      `;

      // Initialize Bootstrap dropdown manually
      const dropdownBtn = document.getElementById("userMenuBtn");
      if (dropdownBtn && window.bootstrap) {
        new bootstrap.Dropdown(dropdownBtn);
      }

      // Handle Logout click
      document
        .getElementById("nav-logout-btn")
        ?.addEventListener("click", () => {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          window.location.href = "auth.html"; // Changed to auth.html
        });
      return;
    } catch (e) {
      console.error("Error parsing user data for navbar:", e);
    }
  }

  // Render Login button if logged out -> points to auth.html
  authContainer.innerHTML = `
    <a href="auth.html" class="btn btn-primary btn-sm">Login</a>
  `;
}

// Fetch and inject navbar & footer
document.addEventListener("DOMContentLoaded", () => {
  const navPlaceholder = document.getElementById("navbar-placeholder");
  if (navPlaceholder) {
    fetch("navbar.html")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load navbar HTML");
        return response.text();
      })
      .then((html) => {
        navPlaceholder.innerHTML = html;
        renderNavbarAuth();
      })
      .catch((err) => console.error("Navbar loading error:", err));
  }

  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) {
    fetch("footer.html")
      .then((response) => response.text())
      .then((html) => {
        footerPlaceholder.innerHTML = html;
      })
      .catch((err) => console.error("Footer loading error:", err));
  }
});
