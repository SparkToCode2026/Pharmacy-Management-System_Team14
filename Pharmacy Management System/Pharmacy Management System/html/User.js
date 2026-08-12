const API = "https://localhost:7293/User";

// Map Role Names to Database Role IDs
const ROLE_MAP = {
  Admin: 1,
  Pharmacist: 2,
  User: 3,
};

// Map Role IDs back to Display Names
const ROLE_NAMES = {
  1: "Admin",
  2: "Pharmacist",
  3: "User",
};

let currentUsers = [];
let isAscending = true;

// 1. Fetch and display users in the table
function loadUsers() {
  fetch(`${API}/GetAllUsers`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return res.json();
    })
    .then((users) => {
      currentUsers = users || [];
      renderTable(currentUsers);
    })
    .catch((err) => {
      console.error("Failed to load users:", err);
      document.getElementById("usersTableBody").innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger">Error connecting to server.</td>
        </tr>`;
    });
}

// Render user array to table
function renderTable(users) {
  const tbody = document.getElementById("usersTableBody");

  if (!users || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">No registered users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = users
    .map(
      (u) => `
    <tr>
      <td>${u.userId}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${ROLE_NAMES[u.roleId] || u.roleId || "N/A"}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning me-1" onclick="editUser(${u.userId}, '${u.username}', '${u.email}', ${u.roleId || 0})">Edit</button>
        <button class="btn btn-sm btn-dark me-1" onclick="openPasswordModal(${u.userId})">Password</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.userId})">Delete</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

// Sort function for the Sort by ID button
function sortUsersById() {
  currentUsers.sort((a, b) =>
    isAscending ? a.userId - b.userId : b.userId - a.userId,
  );
  isAscending = !isAscending;
  renderTable(currentUsers);
}

// 2. Add New User (POST /User/register)
document.getElementById("addUserForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const roleValue = document.getElementById("userRole").value;
  const roleId = ROLE_MAP[roleValue] || 3;

  const newUser = {
    username: document.getElementById("userName").value,
    email: document.getElementById("userEmail").value,
    password: document.getElementById("userPassword").value,
    roleId: roleId,
  };

  fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  })
    .then(async (res) => {
      if (res.ok) {
        document.getElementById("addUserForm").reset();
        loadUsers();
      } else {
        const errorMsg = await res.text();
        alert(`Registration failed: ${errorMsg}`);
      }
    })
    .catch((err) => console.error("Error adding user:", err));
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
document.getElementById("editUserForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("editUserId").value;
  const roleValue = document.getElementById("editUserRole").value;
  const roleId = ROLE_MAP[roleValue] || 3;

  const updatedData = {
    userId: parseInt(id),
    username: document.getElementById("editUserName").value,
    email: document.getElementById("editUserEmail").value,
    roleId: roleId,
  };

  fetch(`${API}/UpdateUser?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  })
    .then(async (res) => {
      if (res.ok) {
        const modalElement = document.getElementById("editUserModal");
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();

        loadUsers();
      } else {
        const errText = await res.text();
        alert(`Update failed: ${errText}`);
      }
    })
    .catch((err) => console.error("Error updating user:", err));
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
document
  .getElementById("updatePasswordForm")
  ?.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("pwdUserId").value;
    const newPassword = document.getElementById("newPasswordInput").value;

    fetch(`${API}/UpdatePassword?id=${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      // JSON.stringify wraps the raw string in quotes, which ASP.NET [FromBody] string expects
      body: JSON.stringify(newPassword),
    })
      .then(async (res) => {
        if (res.ok) {
          alert("Password updated successfully!");

          // Hide modal
          const modalElement = document.getElementById("updatePasswordModal");
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) modal.hide();

          // Reset form
          document.getElementById("updatePasswordForm").reset();
        } else {
          const errText = await res.text();
          console.error("Backend error response:", errText);
          alert(`Failed to update password: ${errText || res.statusText}`);
        }
      })
      .catch((err) => console.error("Error updating password:", err));
  });

// 7. Delete User (DELETE /User/DeleteUser?id={id})
function deleteUser(id) {
  if (confirm("Are you sure you want to delete this user?")) {
    fetch(`${API}/DeleteUser?id=${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) {
          loadUsers();
        } else {
          alert("Failed to delete user.");
        }
      })
      .catch((err) => console.error("Error deleting user:", err));
  }
}

// Load user data on startup
loadUsers();
