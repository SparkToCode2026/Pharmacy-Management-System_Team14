// ============================================================
// branches.js
// Logic for Branch Management using api.js
// ============================================================

let currentBranches = [];

// 1. GET ALL BRANCHES
async function getAllBranches() {
  try {
    const branches = await getBranches();
    currentBranches = branches || [];
    renderBranchesTable(currentBranches);
    loadBranchCount();
  } catch (err) {
    console.error("Failed to load branches:", err);
    const tbody = document.getElementById("branchesTable");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">${err.message}</td>
        </tr>`;
    }
  }
}

// 2. GET BRANCH BY ID / VIEW DETAILS
async function viewBranch(id) {
  try {
    const b = await getBranchById(id);
    const body = document.getElementById("viewBranchBody");
    body.innerHTML = `
      <p><strong>Branch ID:</strong> ${b.branchId ?? b.BranchId}</p>
      <p><strong>Name:</strong> ${b.branchName ?? b.BranchName}</p>
      <p><strong>Address:</strong> ${b.branchAddress ?? b.BranchAddress}</p>
      <p><strong>City:</strong> ${b.branchCity ?? b.BranchCity}</p>
      <p><strong>Phone:</strong> ${b.branchPhone ?? b.BranchPhone}</p>
    `;
    const modal = new bootstrap.Modal(document.getElementById("viewBranchModal"));
    modal.show();
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// 3. GET BY BRANCH CITY
async function searchByCity() {
  const city = document.getElementById("searchCityInput").value.trim();
  if (!city) {
    getAllBranches();
    return;
  }

  try {
    const branches = await getBranchesByCity(city);
    renderBranchesTable(branches);
  } catch (err) {
    alert(err.message);
  }
}

function clearCityFilter() {
  document.getElementById("searchCityInput").value = "";
  getAllBranches();
}

// 4. GET TOTAL BRANCHES
async function loadBranchCount() {
  try {
    const data = await fetchTotalBranches();
    const badge = document.getElementById("totalBranchesBadge");
    if (badge) {
      badge.textContent = `Total: ${data.totalBranches ?? data.TotalBranches ?? currentBranches.length}`;
    }
  } catch (err) {
    const badge = document.getElementById("totalBranchesBadge");
    if (badge) badge.textContent = `Total: ${currentBranches.length}`;
  }
}

// 5. ADD BRANCH
document.getElementById("branchForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const phoneInput = document.getElementById("BranchPhone").value.replace(/\D/g, "");

  const newBranch = {
    branchName: document.getElementById("BranchName").value.trim(),
    branchAddress: document.getElementById("BranchAddress").value.trim(),
    branchCity: document.getElementById("BranchCity").value.trim(),
    branchPhone: parseInt(phoneInput, 10) || 0,
  };

  try {
    await addBranch(newBranch);
    alert("Branch added successfully!");
    document.getElementById("branchForm").reset();
    getAllBranches();
  } catch (err) {
    console.error("Error adding branch:", err);
    alert("Failed to add branch: " + err.message);
  }
});

// 6. UPDATE ALL BRANCH
document.getElementById("editBranchForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editBranchId").value;
  if (!id) {
    alert("Invalid Branch ID.");
    return;
  }

  const phoneInput = document.getElementById("editBranchPhone").value.replace(/\D/g, "");

  const updatedBranch = {
    branchId: parseInt(id, 10),
    branchName: document.getElementById("editBranchName").value.trim(),
    branchAddress: document.getElementById("editBranchAddress").value.trim(),
    branchCity: document.getElementById("editBranchCity").value.trim(),
    branchPhone: parseInt(phoneInput, 10) || 0,
  };

  try {
    await updateBranch(id, updatedBranch);
    alert("Branch updated successfully!");
    const modalEl = document.getElementById("editBranchModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
    getAllBranches();
  } catch (err) {
    console.error("Error updating branch:", err);
    alert("Failed to update branch: " + err.message);
  }
});

// 7. UPDATE BRANCH NAME ONLY
async function promptUpdateBranchName(id, currentName) {
  const newName = prompt("Enter new branch name:", currentName);
  if (!newName || newName.trim() === "" || newName === currentName) return;

  try {
    await updateBranchName(id, newName.trim());
    alert("Branch renamed successfully!");
    getAllBranches();
  } catch (err) {
    console.error("Error updating branch name:", err);
    alert("Failed to update name: " + err.message);
  }
}

// 8. REMOVE BRANCH
async function removeBranchAction(id) {
  if (!id) return;
  if (!confirm("Are you sure you want to remove this branch?")) return;

  try {
    await removeBranch(id);
    alert("Branch removed successfully!");
    getAllBranches();
  } catch (err) {
    console.error("Error removing branch:", err);
    alert("Failed to remove branch: " + err.message);
  }
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
  if (!tbody) return;

  if (!branches || branches.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No branches found.</td></tr>`;
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
            <td class="fw-semibold">${name}</td>
            <td>${address}</td>
            <td>${city}</td>
            <td>${phone}</td>
            <td class="text-center text-nowrap">
              <button onclick="viewBranch(${id})" class="btn btn-sm btn-info text-white me-1">View</button>
              <button onclick="openEditModal(${id})" class="btn btn-sm btn-warning me-1">Edit</button>
              <button onclick="promptUpdateBranchName(${id}, '${escapeHtml(name)}')" class="btn btn-sm btn-outline-secondary me-1">Rename</button>
              <button onclick="removeBranchAction(${id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        </tr>`;
    })
    .join("");
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text).replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  getAllBranches();
});
