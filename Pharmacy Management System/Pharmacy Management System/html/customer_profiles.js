const API = "https://localhost:7293/api/CustomerProfile";

let currentProfiles = [];
let userProfile = null; // Stores logged-in user's profile

// Helper function to decode payload from JWT token
function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload.role ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      null
    );
  } catch (e) {
    console.error("Failed to parse JWT token:", e);
    return null;
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in first.");
    window.location.href = "auth.html";
    return {};
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Check role access & fetch current user's profile
async function initializePage() {
  const role = getUserRole();
  const profileListCard = document.getElementById("profileListCard");

  // Show table list only for Admin / Pharmacist
  if (
    role === "1" ||
    role === "2" ||
    role === "Admin" ||
    role === "Pharmacist"
  ) {
    if (profileListCard) profileListCard.style.display = "block";
    getAllProfiles();
  } else {
    if (profileListCard) profileListCard.style.display = "none";
  }

  // Fetch logged-in user's personal profile
  await loadMyProfile();
}

// Fetch current user's profile and toggle UI cards
async function loadMyProfile() {
  const addProfileCard = document.getElementById("addProfileCard");
  const myProfileCard = document.getElementById("myProfileCard");

  try {
    const res = await fetch(`${API}/GetMyProfile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      userProfile = await res.json();
      renderMyProfileCard(userProfile);

      // Hide Add Form and Show Profile Display Card
      if (addProfileCard) addProfileCard.style.display = "none";
      if (myProfileCard) myProfileCard.style.display = "block";
    } else {
      // Profile does not exist yet for this user
      if (addProfileCard) addProfileCard.style.display = "block";
      if (myProfileCard) myProfileCard.style.display = "none";
    }
  } catch (err) {
    console.error("Error loading profile:", err);
    if (addProfileCard) addProfileCard.style.display = "block";
    if (myProfileCard) myProfileCard.style.display = "none";
  }
}

// Render User Profile Card
function renderMyProfileCard(p) {
  const container = document.getElementById("myProfileDetails");
  if (!container) return;

  const phone = p.customerPhone ?? p.CustomerPhone ?? "N/A";
  const address = p.customerAddress ?? p.CustomerAddress ?? "N/A";
  const dob = p.dateOfBirth ?? p.DateOfBirth ?? "";
  const formattedDob = dob ? new Date(dob).toLocaleDateString() : "N/A";
  const name = p.userName ?? p.UserName ?? "Customer";

  container.innerHTML = `
    <div class="d-flex align-items-center mb-3">
      <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px; font-size: 1.25rem; font-weight: bold;">
        ${name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h5 class="mb-0">${name}</h5>
        <small class="text-muted">Customer Account</small>
      </div>
    </div>
    <hr>
    <div class="row g-3">
      <div class="col-md-4">
        <strong>Phone:</strong>
        <p class="mb-0 text-secondary">${phone}</p>
      </div>
      <div class="col-md-4">
        <strong>Address:</strong>
        <p class="mb-0 text-secondary">${address}</p>
      </div>
      <div class="col-md-4">
        <strong>Date of Birth:</strong>
        <p class="mb-0 text-secondary">${formattedDob}</p>
      </div>
    </div>
  `;
}

// Open Edit Modal for Current User Profile
function openEditMyProfileModal() {
  if (!userProfile) return;
  const id = userProfile.customerId ?? userProfile.CustomerId;
  openEditModal(id);
}

// 1. GET ALL PROFILES (Admin / Pharmacist Only)
function getAllProfiles() {
  fetch(`${API}/GetAllCustomerProfiles`, {
    method: "GET",
    headers: getAuthHeaders(),
  })
    .then((res) => {
      if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized access.");
      }
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return res.json();
    })
    .then((profiles) => {
      currentProfiles = profiles || [];
      renderProfilesTable(currentProfiles);
    })
    .catch((err) => {
      console.error("Failed to load profiles:", err);
      const tbody = document.getElementById("ProfileTable");
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${err.message}</td></tr>`;
      }
    });
}

// 2. GET PROFILE BY ID
function getProfileById(id) {
  fetch(`${API}/GetCustomerProfile/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch profile details.");
      return res.json();
    })
    .then((p) => {
      const body = document.getElementById("viewProfileBody");
      const name = p.userName ?? p.UserName ?? "N/A";
      const phone = p.customerPhone ?? p.CustomerPhone ?? "";
      const address = p.customerAddress ?? p.CustomerAddress ?? "";
      const dob = p.dateOfBirth ?? p.DateOfBirth ?? "";

      body.innerHTML = `
        <p><strong>Customer ID:</strong> ${p.customerId ?? p.CustomerId}</p>
        <p><strong>User Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Date of Birth:</strong> ${dob ? new Date(dob).toLocaleDateString() : "N/A"}</p>
      `;
      const modal = new bootstrap.Modal(
        document.getElementById("viewProfileModal"),
      );
      modal.show();
    })
    .catch((err) => alert(err.message));
}

// 3. SEARCH BY USER ID
function searchByUserId() {
  const userId = document.getElementById("searchUserIdInput").value.trim();
  if (!userId) {
    getAllProfiles();
    return;
  }

  fetch(`${API}/GetCustomerProfileByUserId/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  })
    .then((res) => {
      if (!res.ok) throw new Error("No profile found for this User ID.");
      return res.json();
    })
    .then((profile) =>
      renderProfilesTable(Array.isArray(profile) ? profile : [profile]),
    )
    .catch((err) => alert(err.message));
}

function clearUserIdFilter() {
  document.getElementById("searchUserIdInput").value = "";
  getAllProfiles();
}

// 4. ADD CUSTOMER PROFILE
document.getElementById("ProfileForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const phoneInput = document
    .getElementById("customerPhone")
    .value.replace(/\D/g, "");

  const newProfile = {
    customerPhone: parseInt(phoneInput, 10) || 0,
    customerAddress: document.getElementById("customerAddress").value.trim(),
    dateOfBirth: document.getElementById("DateOfBirth").value,
  };

  fetch(`${API}/AddCustomerProfile`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(newProfile),
  })
    .then(async (res) => {
      if (res.ok) {
        alert("Profile created successfully!");
        document.getElementById("ProfileForm").reset();

        // Reload current user's profile card
        await loadMyProfile();

        // Refresh list if user has admin view
        const role = getUserRole();
        if (role === "1" || role === "2" || role === "Admin") {
          getAllProfiles();
        }
      } else {
        const txt = await res.text();
        alert("Failed to add profile: " + txt);
      }
    })
    .catch((err) => console.error("Error adding Profile:", err));
});

// 5. UPDATE CUSTOMER PROFILE
document.getElementById("editProfileForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("editProfileId").value;
  const phoneInput = document
    .getElementById("editCustomerPhone")
    .value.replace(/\D/g, "");

  const updatedProfile = {
    customerId: parseInt(id, 10),
    customerPhone: parseInt(phoneInput, 10) || 0,
    customerAddress: document
      .getElementById("editCustomerAddress")
      .value.trim(),
    dateOfBirth: document.getElementById("editDateOfBirth").value,
  };

  fetch(`${API}/UpdateCustomerProfile/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedProfile),
  })
    .then(async (res) => {
      if (res.ok) {
        const modalEl = document.getElementById("editProfileModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();

        // Reload current profile card & admin list
        await loadMyProfile();
        const role = getUserRole();
        if (role === "1" || role === "2" || role === "Admin") {
          getAllProfiles();
        }
      } else {
        const txt = await res.text();
        alert("Failed to update profile: " + txt);
      }
    })
    .catch((err) => console.error("Error updating profile:", err));
});

// 6. DELETE CUSTOMER PROFILE
function deleteProfile(id) {
  if (!confirm("Are you sure you want to delete this profile?")) return;

  fetch(`${API}/DeleteCustomerProfile/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
    .then(async (res) => {
      if (res.ok) {
        await loadMyProfile();
        getAllProfiles();
      } else {
        const txt = await res.text();
        alert("Failed to delete profile: " + txt);
      }
    })
    .catch((err) => console.error("Error deleting profile:", err));
}

// Open Edit Modal helper
function openEditModal(id) {
  // If editing own profile directly from card
  let profile =
    userProfile && (userProfile.customerId ?? userProfile.CustomerId) === id
      ? userProfile
      : currentProfiles.find((p) => (p.customerId ?? p.CustomerId) === id);

  if (!profile) return;

  const phone = profile.customerPhone ?? profile.CustomerPhone ?? "";
  const address = profile.customerAddress ?? profile.CustomerAddress ?? "";
  let rawDob = profile.dateOfBirth ?? profile.DateOfBirth ?? "";

  if (rawDob && rawDob.includes("T")) {
    rawDob = rawDob.split("T")[0];
  }

  document.getElementById("editProfileId").value = id;
  document.getElementById("editCustomerPhone").value = phone;
  document.getElementById("editCustomerAddress").value = address;
  document.getElementById("editDateOfBirth").value = rawDob;

  const modal = new bootstrap.Modal(
    document.getElementById("editProfileModal"),
  );
  modal.show();
}

// Render Profiles Table for Admins
function renderProfilesTable(profiles) {
  const tbody = document.getElementById("ProfileTable");
  if (!tbody) return;

  if (!profiles || profiles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">No profiles found.</td></tr>`;
    return;
  }

  tbody.innerHTML = profiles
    .map((p) => {
      const id = p.customerId ?? p.CustomerId ?? "";
      const name = p.userName ?? p.UserName ?? "N/A";
      const phone = p.customerPhone ?? p.CustomerPhone ?? "";
      const address = p.customerAddress ?? p.CustomerAddress ?? "";
      const dob = p.dateOfBirth ?? p.DateOfBirth ?? "";
      const formattedDob = dob ? new Date(dob).toLocaleDateString() : "";

      return `
        <tr>
            <td>${id}</td>
            <td><strong>${name}</strong></td>
            <td>${phone}</td>
            <td>${address}</td>
            <td>${formattedDob}</td>
            <td>
              <button onclick="getProfileById(${id})" class="btn btn-sm btn-info text-white me-1">View</button>
              <button onclick="openEditModal(${id})" class="btn btn-sm btn-warning me-1">Edit</button>
              <button onclick="deleteProfile(${id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        </tr>`;
    })
    .join("");
}

// Initialize on page load
initializePage();
