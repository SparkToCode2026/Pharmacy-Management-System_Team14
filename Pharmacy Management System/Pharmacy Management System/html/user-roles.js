// ============================================================
// user-roles.js
// Logic for User Roles Management
// ============================================================

const ROLE_NAMES = {
  1: "Admin",
  2: "Pharmacist",
  3: "User",
};

const ALL_ROLES = [
  { roleId: 1, roleName: "Admin" },
  { roleId: 2, roleName: "Pharmacist" },
  { roleId: 3, roleName: "User" },
];

function checkAdminAccess() {
  const token = localStorage.getItem("token");
  const role = getUserRole();

  if (!token) {
    window.location.href = "auth.html";
    return false;
  }

  if (!["admin", "pharmacist"].includes(role)) {
    console.warn("Access denied: User is not an admin");
    window.location.href = "user-dashboard.html";
    return false;
  }

  return true;
}

let allUsers = [];
let selectedUserIdForChange = null;

// Load all users
async function loadUsers() {
  try {
    const tbody = document.getElementById("usersTableBody");
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Loading users...</td></tr>';
    }

    allUsers = (await getAllUsers()) || [];
    if (!allUsers || allUsers.length === 0) {
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No users found</td></tr>';
      }
      return;
    }

    tbody.innerHTML = "";
    allUsers.forEach((user) => {
      const userId = user.userId || user.UserId;
      const username = user.username || user.Username;
      const email = user.email || user.Email;
      const roleId = user.roleId || user.RoleId || 3;
      const roleName = ROLE_NAMES[roleId] || user.role?.roleName || user.Role?.RoleName || "User";
      const badgeColor = roleId === 1 ? "primary" : roleId === 2 ? "info" : "secondary";

      const selectOptions = ALL_ROLES.map(
        (r) => `<option value="${r.roleId}" ${r.roleId === roleId ? "selected" : ""}>${r.roleName}</option>`,
      ).join("");

      tbody.innerHTML += `
        <tr>
          <td>${userId}</td>
          <td class="fw-semibold">${username}</td>
          <td>${email}</td>
          <td><span class="badge bg-${badgeColor}">${roleName}</span></td>
          <td>
            <select class="form-select form-select-sm" style="max-width: 170px;" onchange="changeUserRole(${userId}, this.value)">
              ${selectOptions}
            </select>
          </td>
          <td>
            <button class="btn btn-sm btn-danger" onclick="deleteUser(${userId})">Delete</button>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error loading users:", error);
    const tbody = document.getElementById("usersTableBody");
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading users</td></tr>';
    }
  }
}

// Load available roles in modal selects
function loadRoles() {
  const newUserRoleSelect = document.getElementById("newUserRole");
  const roleSelect = document.getElementById("roleSelect");

  if (newUserRoleSelect) {
    newUserRoleSelect.innerHTML = '<option value="">-- Select a Role --</option>';
    ALL_ROLES.forEach((role) => {
      const option = document.createElement("option");
      option.value = role.roleId;
      option.textContent = role.roleName;
      newUserRoleSelect.appendChild(option);
    });
  }

  if (roleSelect) {
    roleSelect.innerHTML = '<option value="">-- Select a Role --</option>';
    ALL_ROLES.forEach((role) => {
      const option = document.createElement("option");
      option.value = role.roleId;
      option.textContent = role.roleName;
      roleSelect.appendChild(option);
    });
  }
}

// Change user role directly from dropdown
async function changeUserRole(userId, newRoleId) {
  if (!newRoleId) return;

  try {
    const user = allUsers.find((u) => (u.userId || u.UserId) === userId);
    if (!user) return;

    const updatedUser = {
      userId: userId,
      username: user.username || user.Username,
      email: user.email || user.Email,
      roleId: parseInt(newRoleId),
    };

    await updateUser(userId, updatedUser);
    alert("User role updated successfully!");
    loadUsers();
  } catch (error) {
    console.error("Error updating user role:", error);
    alert(`Error updating user role: ${error.message}`);
    loadUsers();
  }
}

// Open Change Role Modal
function openChangeRoleModal(userId, username, currentRoleId) {
  selectedUserIdForChange = userId;
  const usernameSpan = document.getElementById("changeRoleUsername");
  const roleSelect = document.getElementById("roleSelect");

  if (usernameSpan) usernameSpan.textContent = username;
  if (roleSelect) roleSelect.value = currentRoleId || "";

  const modal = new bootstrap.Modal(document.getElementById("changeRoleModal"));
  modal.show();
}

// Confirm Change Role from Modal
async function confirmRoleChange() {
  const newRoleId = document.getElementById("roleSelect").value;
  if (!newRoleId || !selectedUserIdForChange) {
    alert("Please select a valid role");
    return;
  }

  await changeUserRole(selectedUserIdForChange, newRoleId);

  const modalEl = document.getElementById("changeRoleModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
}

// Delete user
async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) {
    return;
  }

  try {
    await removeUser(userId);
    alert("User deleted successfully!");
    loadUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
    alert(`Error deleting user: ${error.message}`);
  }
}

// Save new user from modal
async function saveNewUser() {
  const username = document.getElementById("newUsername").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value;
  const roleId = parseInt(document.getElementById("newUserRole").value);

  if (!username || !email || !password || !roleId) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const newUser = {
      username: username,
      email: email,
      password: password,
      roleId: roleId,
    };

    await addUser(newUser);
    alert("User added successfully!");

    document.getElementById("addUserForm").reset();

    const modalEl = document.getElementById("addUserModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    loadUsers();
  } catch (error) {
    console.error("Error adding user:", error);
    alert(`Error adding user: ${error.message}`);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (checkAdminAccess()) {
    loadRoles();
    loadUsers();
  }
});
