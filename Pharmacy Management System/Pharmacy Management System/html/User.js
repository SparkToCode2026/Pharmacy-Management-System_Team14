// ============================================================
// User.js
// Logic for User Management using api.js
// ============================================================

const ROLE_MAP = {
  Admin: 1,
  Pharmacist: 2,
  User: 3,
};

const ROLE_NAMES = {
  1: "Admin",
  2: "Pharmacist",
  3: "User",
};

let currentUsers = [];
let isAscending = true;

// 1. Fetch and display users in the table
async function loadUsers() {
  try {
    const users = await apiGetUsers();
    currentUsers = users || [];
    renderTable(currentUsers);
  } catch (err) {
    console.error("Failed to load users:", err);
    const tbody = document.getElementById("usersTableBody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger">Error loading users from server.</td>
        </tr>`;
    }
  }
}

// Render user array to table
function renderTable(users) {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;

  if (!users || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No registered users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = users
    .map((u) => {
      const roleId = u.roleId || u.RoleId;
      const roleName = ROLE_NAMES[roleId] || u.role?.roleName || u.Role?.RoleName || "User";
      const badgeColor = roleId === 1 ? "primary" : roleId === 2 ? "info" : "secondary";

      return `
      <tr>
        <td>${u.userId}</td>
        <td class="fw-semibold">${u.username}</td>
        <td>${u.email}</td>
        <td><span class="badge bg-${badgeColor}">${roleName}</span></td>
        <td class="text-center text-nowrap">
          <button class="btn btn-sm btn-warning me-1" onclick="editUser(${u.userId}, '${escapeHtml(u.username)}', '${escapeHtml(u.email)}', ${roleId || 3})">Edit</button>
          <button class="btn btn-sm btn-dark me-1" onclick="openPasswordModal(${u.userId})">Password</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.userId})">Delete</button>
        </td>
      </tr>
    `;
    })
    .join("");
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;");
}

// Search Filter
function filterUsers() {
  const query = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
  if (!query) {
    renderTable(currentUsers);
    return;
  }

  const filtered = currentUsers.filter((u) => {
    const username = (u.username || u.Username || "").toLowerCase();
    const email = (u.email || u.Email || "").toLowerCase();
    const roleId = u.roleId || u.RoleId;
    const roleName = (ROLE_NAMES[roleId] || "").toLowerCase();
    return username.includes(query) || email.includes(query) || roleName.includes(query);
  });

  renderTable(filtered);
}

function clearUserSearch() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  renderTable(currentUsers);
}

// Sort function for the Sort by ID button
function sortUsersById() {
  isAscending = !isAscending;
  currentUsers.sort((a, b) => (isAscending ? a.userId - b.userId : b.userId - a.userId));
  const sortBtn = document.getElementById("sortBtn");
  if (sortBtn) {
    sortBtn.textContent = isAscending ? "Sort by ID (Asc)" : "Sort by ID (Desc)";
  }
  filterUsers();
}

// 2. Add New User (POST /User/register)
document.getElementById("addUserForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const roleValue = document.getElementById("userRole").value;
  const roleId = ROLE_MAP[roleValue] || 3;

  const newUser = {
    username: document.getElementById("userName").value.trim(),
    email: document.getElementById("userEmail").value.trim(),
    password: document.getElementById("userPassword").value,
    roleId: roleId,
  };

  try {
    await apiRegisterUser(newUser);
    alert("User registered successfully!");
    document.getElementById("addUserForm").reset();
    loadUsers();
  } catch (err) {
    console.error("Error adding user:", err);
    alert(`Registration failed: ${err.message}`);
  }
});

// 3. Open and populate Edit User Modal
function editUser(id, name, email, roleId) {
  document.getElementById("editUserId").value = id;
  document.getElementById("editUserName").value = name;
  document.getElementById("editUserEmail").value = email;

  const editRoleSelect = document.getElementById("editUserRole");
  if (editRoleSelect) {
    editRoleSelect.value = ROLE_NAMES[roleId] || "User";
  }

  const modalElement = document.getElementById("editUserModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// 4. Update User (PUT /User/UpdateUser?id={id})
document.getElementById("editUserForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = parseInt(document.getElementById("editUserId").value);
  const roleValue = document.getElementById("editUserRole").value;
  const roleId = ROLE_MAP[roleValue] || 3;

  const updatedData = {
    userId: id,
    username: document.getElementById("editUserName").value.trim(),
    email: document.getElementById("editUserEmail").value.trim(),
    roleId: roleId,
  };

  try {
    await apiUpdateUser(id, updatedData);
    alert("User updated successfully!");
    const modalElement = document.getElementById("editUserModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();

    loadUsers();
  } catch (err) {
    console.error("Error updating user:", err);
    alert(`Update failed: ${err.message}`);
  }
});

// 5. Open Update Password Modal
function openPasswordModal(id) {
  document.getElementById("pwdUserId").value = id;
  document.getElementById("newPasswordInput").value = "";

  const modalElement = document.getElementById("updatePasswordModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// 6. Update Password Submit Event (PATCH /User/UpdatePassword?id={id})
document.getElementById("updatePasswordForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = parseInt(document.getElementById("pwdUserId").value);
  const newPassword = document.getElementById("newPasswordInput").value;

  try {
    await apiUpdatePassword(id, newPassword);
    alert("Password updated successfully!");

    const modalElement = document.getElementById("updatePasswordModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();

    document.getElementById("updatePasswordForm").reset();
  } catch (err) {
    console.error("Error updating password:", err);
    alert(`Failed to update password: ${err.message}`);
  }
});

// 7. Delete User (DELETE /User/DeleteUser?id={id})
async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    await apiDeleteUser(id);
    alert("User deleted successfully!");
    loadUsers();
  } catch (err) {
    console.error("Error deleting user:", err);
    alert(`Failed to delete user: ${err.message}`);
  }
}

// Setup search listener
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", filterUsers);
  }
  loadUsers();
});
