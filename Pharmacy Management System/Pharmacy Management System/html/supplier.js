// ============================================================
// supplier.js
// Logic for Supplier Management using api.js
// ============================================================

let currentSuppliers = [];

// Check Access
function checkAccess() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "auth.html";
    return false;
  }
  return true;
}

// 1. GET ALL SUPPLIERS
async function fetchSuppliers() {
  try {
    const data = await apiGetSuppliers();
    currentSuppliers = data || [];
    renderTable(currentSuppliers);
  } catch (error) {
    console.error("Error loading suppliers:", error);
    const tbody = document.getElementById("suppliersTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load suppliers: ${error.message}</td></tr>`;
    }
  }
}

// Render data to table
function renderTable(data) {
  const tbody = document.getElementById("suppliersTableBody");
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No suppliers found.</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map((item) => {
      const id = item.supplierId ?? item.SupplierId;
      const name = item.supplierName ?? item.SupplierName ?? "";
      const email = item.supplierEmail ?? item.SupplierEmail ?? "";
      const phone = item.supplierPhone ?? item.SupplierPhone ?? "";
      const address = item.supplierAddress ?? item.SupplierAddress ?? "";

      return `
        <tr>
          <td class="fw-bold">#${id}</td>
          <td class="fw-semibold">${name}</td>
          <td>${email || "—"}</td>
          <td>${phone || "—"}</td>
          <td>${address || "—"}</td>
          <td class="text-center text-nowrap">
            <button class="btn btn-info btn-sm text-white me-1" onclick="openDetailsModal(${id})">Details</button>
            <button class="btn btn-warning btn-sm me-1" onclick="openEditModal(${id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteSupplierAction(${id})">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

// 2. CREATE SUPPLIER
document.getElementById("createForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newSupplier = {
    supplierName: document.getElementById("createName").value.trim(),
    supplierEmail: document.getElementById("createEmail").value.trim(),
    supplierPhone: document.getElementById("createPhone").value.trim(),
    supplierAddress: document.getElementById("createAddress").value.trim(),
  };

  try {
    await apiCreateSupplier(newSupplier);
    alert("Supplier created successfully!");

    document.getElementById("createForm").reset();
    const modalEl = document.getElementById("createModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    fetchSuppliers();
  } catch (error) {
    console.error("Error creating supplier:", error);
    alert(`Failed to create supplier: ${error.message}`);
  }
});

// 3. EDIT FULL SUPPLIER (PUT)
document.getElementById("editForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = parseInt(document.getElementById("editId").value);
  const updatedSupplier = {
    supplierId: id,
    supplierName: document.getElementById("editName").value.trim(),
    supplierEmail: document.getElementById("editEmail").value.trim(),
    supplierPhone: document.getElementById("editPhone").value.trim(),
    supplierAddress: document.getElementById("editAddress").value.trim(),
  };

  try {
    await apiUpdateSupplier(id, updatedSupplier);
    alert("Supplier updated successfully!");

    const modalEl = document.getElementById("editModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    fetchSuppliers();
  } catch (error) {
    console.error("Error updating supplier:", error);
    alert(`Failed to update supplier: ${error.message}`);
  }
});

// 4. DELETE SUPPLIER
async function deleteSupplierAction(id) {
  if (!confirm(`Are you sure you want to delete Supplier ID: #${id}?`)) return;

  try {
    await apiDeleteSupplier(id);
    alert("Supplier deleted successfully!");
    fetchSuppliers();
  } catch (error) {
    console.error("Error deleting supplier:", error);
    alert(`Failed to delete supplier: ${error.message}`);
  }
}

// 5. OPEN DETAILS MODAL
async function openDetailsModal(id) {
  try {
    const data = await apiGetSupplierById(id);
    const idVal = data.supplierId ?? data.SupplierId;
    const nameVal = data.supplierName ?? data.SupplierName ?? "";
    const emailVal = data.supplierEmail ?? data.SupplierEmail ?? "";
    const phoneVal = data.supplierPhone ?? data.SupplierPhone ?? "";
    const addressVal = data.supplierAddress ?? data.SupplierAddress ?? "";

    document.getElementById("detailId").innerText = `#${idVal}`;
    document.getElementById("detailName").innerText = nameVal;
    document.getElementById("detailEmail").innerText = emailVal || "—";
    document.getElementById("detailPhone").innerText = phoneVal || "—";
    document.getElementById("detailAddress").innerText = addressVal || "—";

    const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
    modal.show();
  } catch (error) {
    console.error("Error loading supplier details:", error);
    alert(`Failed to fetch details: ${error.message}`);
  }
}

// 6. OPEN EDIT MODAL
async function openEditModal(id) {
  try {
    const data = await apiGetSupplierById(id);
    const idVal = data.supplierId ?? data.SupplierId;
    const nameVal = data.supplierName ?? data.SupplierName ?? "";
    const emailVal = data.supplierEmail ?? data.SupplierEmail ?? "";
    const phoneVal = data.supplierPhone ?? data.SupplierPhone ?? "";
    const addressVal = data.supplierAddress ?? data.SupplierAddress ?? "";

    document.getElementById("editId").value = idVal;
    document.getElementById("editName").value = nameVal;
    document.getElementById("editEmail").value = emailVal;
    document.getElementById("editPhone").value = phoneVal;
    document.getElementById("editAddress").value = addressVal;

    const modal = new bootstrap.Modal(document.getElementById("editModal"));
    modal.show();
  } catch (error) {
    console.error("Error loading supplier for edit:", error);
    alert(`Failed to load supplier data: ${error.message}`);
  }
}

// 7. SEARCH SUPPLIERS
async function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();

  if (!query) {
    renderTable(currentSuppliers);
    return;
  }

  try {
    const results = await apiSearchSuppliers(query);
    renderTable(Array.isArray(results) ? results : [results]);
  } catch {
    // Client-side fallback
    const filtered = currentSuppliers.filter((s) => {
      const name = (s.supplierName ?? s.SupplierName ?? "").toLowerCase();
      const email = (s.supplierEmail ?? s.SupplierEmail ?? "").toLowerCase();
      const phone = (s.supplierPhone ?? s.SupplierPhone ?? "").toLowerCase();
      const addr = (s.supplierAddress ?? s.SupplierAddress ?? "").toLowerCase();
      return (
        name.includes(query.toLowerCase()) ||
        email.includes(query.toLowerCase()) ||
        phone.includes(query.toLowerCase()) ||
        addr.includes(query.toLowerCase())
      );
    });
    renderTable(filtered);
  }
}

function clearSupplierSearch() {
  document.getElementById("searchInput").value = "";
  renderTable(currentSuppliers);
}

// 8. SORT BY NAME
let sortAsc = true;
function sortSuppliers() {
  currentSuppliers.sort((a, b) => {
    const nameA = (a.supplierName ?? a.SupplierName ?? "").toLowerCase();
    const nameB = (b.supplierName ?? b.SupplierName ?? "").toLowerCase();
    return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });
  sortAsc = !sortAsc;
  renderTable(currentSuppliers);
}

// Event Listeners & Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (checkAccess()) {
    fetchSuppliers();

    document.getElementById("searchBtn")?.addEventListener("click", handleSearch);
    document.getElementById("searchInput")?.addEventListener("keyup", (e) => {
      if (e.key === "Enter") handleSearch();
      if (e.target.value === "") renderTable(currentSuppliers);
    });
  }
});
