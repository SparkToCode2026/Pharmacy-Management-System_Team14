const API = "https://localhost:7293/User";

// Map Role Names to Database Role IDs (adjust IDs based on your DB)
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

// 1. Fetch and display users in the table
function loadUsers() {
  fetch(`${API}/GetAllUsers`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return res.json();
    })
    .then((users) => {
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
            <button class="btn btn-sm btn-danger btn-sm" onclick="deleteUser(${u.userId})">Delete</button>
          </td>
        </tr>
      `,
        )
        .join("");
    })
    .catch((err) => {
      console.error("Failed to load users:", err);
      document.getElementById("usersTableBody").innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger">Error connecting to server.</td>
        </tr>`;
    });
}

// 2. Add New User (POST /User/register)
document.getElementById("addUserForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const roleValue = document.getElementById("userRole").value;
  const roleId = ROLE_MAP[roleValue] || 3; // Default to Cashier/User if undefined

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

  // Set selected dropdown value by matching role name
  const editRoleSelect = document.getElementById("editUserRole");
  if (editRoleSelect) {
    editRoleSelect.value = ROLE_NAMES[roleId] || "Cashier";
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

// 5. Delete User (DELETE /User/DeleteUser?id={id})
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
