const API = "https://localhost:7293/api/Branch";

let currentBranches = [];

// Helper function for authorization headers
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

// 1. GET ALL BRANCHES [AllowAnonymous]
function getAllBranches() {
  fetch(`${API}/GetAllBranch`, { method: "GET" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return res.json();
    })
    .then((branches) => {
      currentBranches = branches || [];
      renderBranchesTable(currentBranches);
      getTotalBranches(); // Refresh counter as well
    })
    .catch((err) => {
      console.error("Failed to load branches:", err);
      document.getElementById("branchesTable").innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">${err.message}</td>
        </tr>`;
    });
}

// 2. GET BRANCH BY ID [AllowAnonymous]
function getBranch(id) {
  fetch(`${API}/GetBranch/${id}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch branch details");
      return res.json();
    })
    .then((b) => {
      const body = document.getElementById("viewBranchBody");
      body.innerHTML = `
        <p><strong>Branch ID:</strong> ${b.branchId ?? b.BranchId}</p>
        <p><strong>Name:</strong> ${b.branchName ?? b.BranchName}</p>
        <p><strong>Address:</strong> ${b.branchAddress ?? b.BranchAddress}</p>
        <p><strong>City:</strong> ${b.branchCity ?? b.BranchCity}</p>
        <p><strong>Phone:</strong> ${b.branchPhone ?? b.BranchPhone}</p>
      `;
      const modal = new bootstrap.Modal(
        document.getElementById("viewBranchModal"),
      );
      modal.show();
    })
    .catch((err) => alert("Error: " + err.message));
}

// 3. GET BY BRANCH CITY [AllowAnonymous]
function searchByCity() {
  const city = document.getElementById("searchCityInput").value.trim();
  if (!city) {
    getAllBranches();
    return;
  }

  fetch(`${API}/GetByBranchCity?city=${encodeURIComponent(city)}`)
    .then((res) => {
      if (!res.ok) throw new Error("No branches found for this city");
      return res.json();
    })
    .then((branches) => renderBranchesTable(branches))
    .catch((err) => alert(err.message));
}

function clearCityFilter() {
  document.getElementById("searchCityInput").value = "";
  getAllBranches();
}

// 4. GET TOTAL BRANCHES [AllowAnonymous]
function getTotalBranches() {
  fetch(`${API}/GetTotalBranches`)
    .then((res) => res.json())
    .then((data) => {
      const badge = document.getElementById("totalBranchesBadge");
      if (badge)
        badge.textContent = `Total: ${data.totalBranches ?? data.TotalBranches ?? 0}`;
    })
    .catch((err) => console.error("Error getting branch count:", err));
}

// 5. ADD BRANCH [Roles: 1, 2]
document.getElementById("branchForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const phoneInput = document
    .getElementById("BranchPhone")
    .value.replace(/\D/g, "");

  const newBranch = {
    branchName: document.getElementById("BranchName").value.trim(),
    branchAddress: document.getElementById("BranchAddress").value.trim(),
    branchCity: document.getElementById("BranchCity").value.trim(),
    branchPhone: parseInt(phoneInput, 10) || 0,
  };

  fetch(`${API}/AddBranch`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(newBranch),
  })
    .then(async (res) => {
      if (res.ok) {
        document.getElementById("branchForm").reset();
        getAllBranches();
      } else if (res.status === 401 || res.status === 403) {
        alert("Permission denied. Please log in as Admin or Pharmacist.");
      } else {
        const txt = await res.text();
        alert("Failed to add branch: " + txt);
      }
    })
    .catch((err) => console.error("Error adding branch:", err));
});

// 6. UPDATE ALL BRANCH [Roles: 1, 2]
document.getElementById("editBranchForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("editBranchId").value;
  if (!id || id === "undefined") {
    alert("Invalid Branch ID.");
    return;
  }

  const phoneInput = document
    .getElementById("editBranchPhone")
    .value.replace(/\D/g, "");

  const updatedBranch = {
    branchId: parseInt(id, 10),
    branchName: document.getElementById("editBranchName").value.trim(),
    branchAddress: document.getElementById("editBranchAddress").value.trim(),
    branchCity: document.getElementById("editBranchCity").value.trim(),
    branchPhone: parseInt(phoneInput, 10) || 0,
  };

  fetch(`${API}/UpdateAllBranch/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedBranch),
  })
    .then(async (res) => {
      if (res.ok) {
        const modalEl = document.getElementById("editBranchModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
        getAllBranches();
      } else if (res.status === 401 || res.status === 403) {
        alert("Permission denied.");
      } else {
        const txt = await res.text();
        alert("Failed to update branch: " + txt);
      }
    })
    .catch((err) => console.error("Error updating branch:", err));
});

// 7. UPDATE BRANCH NAME ONLY [Roles: 1, 2]
function promptUpdateBranchName(id, currentName) {
  const newName = prompt("Enter new branch name:", currentName);
  if (!newName || newName.trim() === "" || newName === currentName) return;

  fetch(`${API}/UpdateBranchName/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(newName.trim()),
  })
    .then(async (res) => {
      if (res.ok) {
        getAllBranches();
      } else {
        const txt = await res.text();
        alert("Failed to update name: " + txt);
      }
    })
    .catch((err) => console.error("Error updating branch name:", err));
}

// 8. REMOVE BRANCH [Roles: 1, 2]
function removeBranch(id) {
  if (!id || id === "undefined") return;
  if (!confirm("Are you sure you want to remove this branch?")) return;

  fetch(`${API}/RemoveBranch/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
    .then(async (res) => {
      if (res.ok) {
        getAllBranches();
      } else if (res.status === 401 || res.status === 403) {
        alert("Permission denied.");
      } else {
        const txt = await res.text();
        alert("Failed to remove branch: " + txt);
      }
    })
    .catch((err) => console.error("Error removing branch:", err));
}

// Open Edit Modal
function openEditModal(id) {
  const branch = currentBranches.find((b) => (b.branchId ?? b.BranchId) === id);
  if (!branch) return;

  const branchId = branch.branchId ?? branch.BranchId;
  const branchName = branch.branchName ?? branch.BranchName ?? "";
  const branchAddress = branch.branchAddress ?? branch.BranchAddress ?? "";
  const branchCity = branch.branchCity ?? branch.BranchCity ?? "";
  const branchPhone = branch.branchPhone ?? branch.BranchPhone ?? "";

  document.getElementById("editBranchId").value = branchId;
  document.getElementById("editBranchName").value = branchName;
  document.getElementById("editBranchAddress").value = branchAddress;
  document.getElementById("editBranchCity").value = branchCity;
  document.getElementById("editBranchPhone").value = branchPhone;

  const modal = new bootstrap.Modal(document.getElementById("editBranchModal"));
  modal.show();
}

// Render Table
function renderBranchesTable(branches) {
  const tbody = document.getElementById("branchesTable");

  if (!branches || branches.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">No branches found.</td></tr>`;
    return;
  }

  tbody.innerHTML = branches
    .map((b) => {
      const id = b.branchId ?? b.BranchId;
      const name = b.branchName ?? b.BranchName ?? "";
      const address = b.branchAddress ?? b.BranchAddress ?? "";
      const city = b.branchCity ?? b.BranchCity ?? "";
      const phone = b.branchPhone ?? b.BranchPhone ?? "";

      return `
        <tr>
            <td>${id ?? ""}</td>
            <td>${name}</td>
            <td>${address}</td>
            <td>${city}</td>
            <td>${phone}</td>
            <td>
              <button onclick="getBranch(${id})" class="btn btn-sm btn-info text-white me-1">View</button>
              <button onclick="openEditModal(${id})" class="btn btn-sm btn-warning me-1">Edit</button>
              <button onclick="promptUpdateBranchName(${id}, '${name}')" class="btn btn-sm btn-outline-secondary me-1">Rename</button>
              <button onclick="removeBranch(${id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        </tr>`;
    })
    .join("");
}

// Initial Load
getAllBranches();
