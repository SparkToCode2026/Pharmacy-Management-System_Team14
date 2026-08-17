// ============================================================
// customer_profiles.js
// Logic for Customer Profiles using api.js
// ============================================================

let currentProfiles = [];
let userProfile = null; // Stores logged-in user's profile

// Check role access & fetch current user's profile
async function initializePage() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "auth.html";
    return;
  }

  const role = getUserRole();
  const profileListCard = document.getElementById("profileListCard");

  // Show table list only for Admin / Pharmacist
  if (["admin", "pharmacist"].includes(role)) {
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
    const profile = await apiGetMyProfile();
    if (profile && (profile.customerId || profile.CustomerId)) {
      userProfile = profile;
      renderMyProfileCard(userProfile);

      if (addProfileCard) addProfileCard.style.display = "none";
      if (myProfileCard) myProfileCard.style.display = "block";
    } else {
      userProfile = null;
      if (addProfileCard) addProfileCard.style.display = "block";
      if (myProfileCard) myProfileCard.style.display = "none";
    }
  } catch (err) {
    userProfile = null;
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
        ${String(name).charAt(0).toUpperCase()}
      </div>
      <div>
        <h5 class="mb-0">${name}</h5>
        <small class="text-muted">Customer Account (ID: ${p.userId ?? p.UserId})</small>
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
async function getAllProfiles() {
  try {
    const profiles = await apiGetAllCustomerProfiles();
    currentProfiles = profiles || [];
    renderProfilesTable(currentProfiles);
  } catch (err) {
    console.error("Failed to load profiles:", err);
    const tbody = document.getElementById("ProfileTable");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${err.message}</td></tr>`;
    }
  }
}

// 2. GET PROFILE BY ID
async function getProfileById(id) {
  try {
    const p = await apiGetCustomerProfileById(id);
    const body = document.getElementById("viewProfileBody");
    const name = p.userName ?? p.UserName ?? "N/A";
    const phone = p.customerPhone ?? p.CustomerPhone ?? "";
    const address = p.customerAddress ?? p.CustomerAddress ?? "";
    const dob = p.dateOfBirth ?? p.DateOfBirth ?? "";

    body.innerHTML = `
      <p><strong>Customer ID:</strong> ${p.customerId ?? p.CustomerId}</p>
      <p><strong>User Name:</strong> ${name}</p>
      <p><strong>User ID:</strong> ${p.userId ?? p.UserId}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Date of Birth:</strong> ${dob ? new Date(dob).toLocaleDateString() : "N/A"}</p>
    `;
    const modal = new bootstrap.Modal(document.getElementById("viewProfileModal"));
    modal.show();
  } catch (err) {
    alert(err.message);
  }
}

// 3. SEARCH BY USER ID
async function searchByUserId() {
  const userId = document.getElementById("searchUserIdInput").value.trim();
  if (!userId) {
    getAllProfiles();
    return;
  }

  try {
    const profile = await apiGetCustomerProfileByUserId(userId);
    renderProfilesTable(Array.isArray(profile) ? profile : [profile]);
  } catch (err) {
    alert(err.message || "No profile found for this User ID.");
  }
}

function clearUserIdFilter() {
  document.getElementById("searchUserIdInput").value = "";
  getAllProfiles();
}

// 4. ADD CUSTOMER PROFILE
document.getElementById("ProfileForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const phoneInput = document.getElementById("customerPhone").value.replace(/\D/g, "");

  const newProfile = {
    customerPhone: parseInt(phoneInput, 10) || 0,
    customerAddress: document.getElementById("customerAddress").value.trim(),
    dateOfBirth: document.getElementById("DateOfBirth").value,
  };

  try {
    await apiAddCustomerProfile(newProfile);
    alert("Profile created successfully!");
    document.getElementById("ProfileForm").reset();

    await loadMyProfile();

    const role = getUserRole();
    if (["admin", "pharmacist"].includes(role)) {
      getAllProfiles();
    }
  } catch (err) {
    console.error("Error adding Profile:", err);
    alert("Failed to add profile: " + err.message);
  }
});

// 5. UPDATE CUSTOMER PROFILE
document.getElementById("editProfileForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editProfileId").value;
  const phoneInput = document.getElementById("editCustomerPhone").value.replace(/\D/g, "");

  const updatedProfile = {
    customerId: parseInt(id, 10),
    customerPhone: parseInt(phoneInput, 10) || 0,
    customerAddress: document.getElementById("editCustomerAddress").value.trim(),
    dateOfBirth: document.getElementById("editDateOfBirth").value,
  };

  try {
    await apiUpdateCustomerProfile(id, updatedProfile);
    alert("Profile updated successfully!");
    const modalEl = document.getElementById("editProfileModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    await loadMyProfile();
    const role = getUserRole();
    if (["admin", "pharmacist"].includes(role)) {
      getAllProfiles();
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    alert("Failed to update profile: " + err.message);
  }
});

// 6. DELETE CUSTOMER PROFILE
async function deleteProfile(id) {
  if (!confirm("Are you sure you want to delete this profile?")) return;

  try {
    await apiDeleteCustomerProfile(id);
    alert("Profile deleted successfully!");
    await loadMyProfile();
    const role = getUserRole();
    if (["admin", "pharmacist"].includes(role)) {
      getAllProfiles();
    }
  } catch (err) {
    console.error("Error deleting profile:", err);
    alert("Failed to delete profile: " + err.message);
  }
}

// Open Edit Modal helper
function openEditModal(id) {
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

  const modal = new bootstrap.Modal(document.getElementById("editProfileModal"));
  modal.show();
}

// Render Profiles Table for Admins
function renderProfilesTable(profiles) {
  const tbody = document.getElementById("ProfileTable");
  if (!tbody) return;

  if (!profiles || profiles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No profiles found.</td></tr>`;
    return;
  }

  tbody.innerHTML = profiles
    .map((p) => {
      const id = p.customerId ?? p.CustomerId ?? "";
      const name = p.userName ?? p.UserName ?? "N/A";
      const userId = p.userId ?? p.UserId ?? "N/A";
      const phone = p.customerPhone ?? p.CustomerPhone ?? "";
      const address = p.customerAddress ?? p.CustomerAddress ?? "";
      const dob = p.dateOfBirth ?? p.DateOfBirth ?? "";
      const formattedDob = dob ? new Date(dob).toLocaleDateString() : "";

      return `
        <tr>
            <td>${id}</td>
            <td><strong>${name}</strong></td>
            <td>${userId}</td>
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
document.addEventListener("DOMContentLoaded", () => {
  initializePage();
});
