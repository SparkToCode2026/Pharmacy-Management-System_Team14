// ============================================================
// Medicine.js
// Logic for Medicine Catalog Management using api.js
// ============================================================

let currentMedicines = [];
let currentCategories = [];
let currentManufacturers = [];
let currentSuppliers = [];
let sortPriceAsc = true;

// Check Access
function checkAccess() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "auth.html";
    return false;
  }
  return true;
}

// 1. POPULATE DROPDOWNS
async function loadDropdowns() {
  try {
    const [cats, manus, supps] = await Promise.allSettled([
      apiGetMedicineCategories(),
      apiGetManufacturers(),
      apiGetSuppliers(),
    ]);

    currentCategories = cats.status === "fulfilled" && cats.value ? cats.value : [];
    currentManufacturers = manus.status === "fulfilled" && manus.value ? manus.value : [];
    currentSuppliers = supps.status === "fulfilled" && supps.value ? supps.value : [];

    // Filter dropdown
    const filterCat = document.getElementById("filterCategory");
    if (filterCat) {
      filterCat.innerHTML =
        '<option value="">All Categories</option>' +
        currentCategories
          .map(
            (c) =>
              `<option value="${c.medicineCategoryId}">${c.medicineCategoryName || c.MedicineCategoryName}</option>`,
          )
          .join("");
    }

    // Add Form Dropdowns
    populateSelect("addMedCategory", currentCategories, "medicineCategoryId", "medicineCategoryName");
    populateSelect("addMedManufacturer", currentManufacturers, "manufacturerId", "manufacturerName");
    populateSelect("addMedSupplier", currentSuppliers, "supplierId", "supplierName");

    // Edit Form Dropdowns
    populateSelect("editMedCategory", currentCategories, "medicineCategoryId", "medicineCategoryName");
    populateSelect("editMedManufacturer", currentManufacturers, "manufacturerId", "manufacturerName");
    populateSelect("editMedSupplier", currentSuppliers, "supplierId", "supplierName");
  } catch (error) {
    console.error("Error loading dropdown lists:", error);
  }
}

function populateSelect(selectId, dataList, idKey, nameKey) {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML =
    '<option value="">-- Select --</option>' +
    dataList
      .map((item) => {
        const id = item[idKey] ?? item[idKey.charAt(0).toUpperCase() + idKey.slice(1)];
        const name = item[nameKey] ?? item[nameKey.charAt(0).toUpperCase() + nameKey.slice(1)];
        return `<option value="${id}">${name}</option>`;
      })
      .join("");
}

// 2. GET ALL MEDICINES
async function fetchMedicines() {
  try {
    const data = await getMedicines();
    currentMedicines = data || [];
    renderTable(currentMedicines);
  } catch (error) {
    console.error("Error loading medicines:", error);
    const tbody = document.getElementById("medicinesTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load medicines: ${error.message}</td></tr>`;
    }
  }
}

// Render data to table
function renderTable(data) {
  const tbody = document.getElementById("medicinesTableBody");
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No medicines found.</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map((m) => {
      const id = m.medicineId ?? m.MedicineId;
      const name = m.medicineName ?? m.MedicineName ?? "";
      const price = Number(m.medicinePrice ?? m.MedicinePrice ?? m.price ?? 0).toFixed(2);
      const catId = m.medicineCategoryId ?? m.MedicineCategoryId;
      const cat = currentCategories.find((c) => (c.medicineCategoryId ?? c.MedicineCategoryId) === catId);
      const catName = cat?.medicineCategoryName ?? cat?.MedicineCategoryName ?? "General";
      const expDate = m.medicineExpiryDate ?? m.MedicineExpiryDate;
      const formattedExp = expDate ? new Date(expDate).toLocaleDateString() : "—";

      return `
        <tr>
          <td class="fw-bold">${id}</td>
          <td class="fw-semibold text-primary">${name}</td>
          <td><strong>$${price}</strong></td>
          <td><span class="badge bg-secondary">${catName}</span></td>
          <td>${formattedExp}</td>
          <td class="text-center text-nowrap">
            <button class="btn btn-info btn-sm text-white me-1" onclick="openDetailsModal(${id})">Details</button>
            <button class="btn btn-warning btn-sm me-1" onclick="openEditModal(${id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteMedicineAction(${id})">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

// 3. ADD MEDICINE
document.getElementById("addMedicineForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newMedicine = {
    medicineName: document.getElementById("addMedName").value.trim(),
    medicinePrice: parseFloat(document.getElementById("addMedPrice").value),
    medicineDescription: document.getElementById("addMedDesc").value.trim(),
    medicineProductionDate: document.getElementById("addMedProdDate").value || new Date().toISOString(),
    medicineExpiryDate: document.getElementById("addMedExpDate").value,
    medicineCategoryId: parseInt(document.getElementById("addMedCategory").value),
    manufacturerId: parseInt(document.getElementById("addMedManufacturer").value),
    supplierId: parseInt(document.getElementById("addMedSupplier").value),
  };

  try {
    await addMedicine(newMedicine);
    alert("Medicine created successfully!");

    document.getElementById("addMedicineForm").reset();
    const modalEl = document.getElementById("addMedicineModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    fetchMedicines();
  } catch (error) {
    console.error("Error creating medicine:", error);
    alert(`Failed to create medicine: ${error.message}`);
  }
});

// 4. EDIT FULL MEDICINE (PUT)
document.getElementById("editMedicineForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = parseInt(document.getElementById("editMedId").value);
  const updatedMedicine = {
    medicineId: id,
    medicineName: document.getElementById("editMedName").value.trim(),
    medicinePrice: parseFloat(document.getElementById("editMedPrice").value),
    medicineDescription: document.getElementById("editMedDesc").value.trim(),
    medicineProductionDate: document.getElementById("editMedProdDate").value || new Date().toISOString(),
    medicineExpiryDate: document.getElementById("editMedExpDate").value,
    medicineCategoryId: parseInt(document.getElementById("editMedCategory").value),
    manufacturerId: parseInt(document.getElementById("editMedManufacturer").value),
    supplierId: parseInt(document.getElementById("editMedSupplier").value),
  };

  try {
    await updateMedicine(id, updatedMedicine);
    alert("Medicine updated successfully!");

    const modalEl = document.getElementById("editMedicineModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    fetchMedicines();
  } catch (error) {
    console.error("Error updating medicine:", error);
    alert(`Failed to update medicine: ${error.message}`);
  }
});

// 5. DELETE MEDICINE
async function deleteMedicineAction(id) {
  if (!confirm(`Are you sure you want to delete Medicine ID: ${id}?`)) return;

  try {
    await deleteMedicine(id);
    alert("Medicine deleted successfully!");
    fetchMedicines();
  } catch (error) {
    console.error("Error deleting medicine:", error);
    alert(`Failed to delete medicine: ${error.message}`);
  }
}

// 6. OPEN DETAILS MODAL
async function openDetailsModal(id) {
  try {
    const med = await getMedicineById(id);
    const cat = currentCategories.find(
      (c) => (c.medicineCategoryId ?? c.MedicineCategoryId) === (med.medicineCategoryId ?? med.MedicineCategoryId),
    );
    const manu = currentManufacturers.find(
      (m) => (m.manufacturerId ?? m.ManufacturerId) === (med.manufacturerId ?? med.ManufacturerId),
    );
    const supp = currentSuppliers.find(
      (s) => (s.supplierId ?? s.SupplierId) === (med.supplierId ?? med.SupplierId),
    );

    const price = Number(med.medicinePrice ?? med.MedicinePrice ?? med.price ?? 0).toFixed(2);
    const prodDate = med.medicineProductionDate ? new Date(med.medicineProductionDate).toLocaleDateString() : "—";
    const expDate = med.medicineExpiryDate ? new Date(med.medicineExpiryDate).toLocaleDateString() : "—";

    document.getElementById("medicineDetailsBody").innerHTML = `
      <div class="row g-3">
        <div class="col-md-6">
          <p><strong>Medicine ID:</strong> ${med.medicineId ?? med.MedicineId}</p>
          <p><strong>Name:</strong> ${med.medicineName ?? med.MedicineName}</p>
          <p><strong>Price:</strong> $${price}</p>
          <p><strong>Category:</strong> ${cat?.medicineCategoryName ?? cat?.MedicineCategoryName ?? "General"}</p>
        </div>
        <div class="col-md-6">
          <p><strong>Manufacturer:</strong> ${manu?.manufacturerName ?? manu?.ManufacturerName ?? "—"}</p>
          <p><strong>Supplier:</strong> ${supp?.supplierName ?? supp?.SupplierName ?? "—"}</p>
          <p><strong>Production Date:</strong> ${prodDate}</p>
          <p><strong>Expiry Date:</strong> ${expDate}</p>
        </div>
        <div class="col-12">
          <strong>Description / Indications:</strong>
          <p class="text-muted mt-1">${med.medicineDescription ?? med.MedicineDescription ?? "No description provided."}</p>
        </div>
      </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById("medicineDetailsModal"));
    modal.show();
  } catch (error) {
    console.error("Error loading details:", error);
    alert(`Failed to load details: ${error.message}`);
  }
}

// 7. OPEN EDIT MODAL
async function openEditModal(id) {
  try {
    const med = await getMedicineById(id);

    document.getElementById("editMedId").value = med.medicineId ?? med.MedicineId;
    document.getElementById("editMedName").value = med.medicineName ?? med.MedicineName ?? "";
    document.getElementById("editMedPrice").value = med.medicinePrice ?? med.MedicinePrice ?? med.price ?? 0;
    document.getElementById("editMedCategory").value = med.medicineCategoryId ?? med.MedicineCategoryId ?? "";
    document.getElementById("editMedManufacturer").value = med.manufacturerId ?? med.ManufacturerId ?? "";
    document.getElementById("editMedSupplier").value = med.supplierId ?? med.SupplierId ?? "";

    const prodDate = med.medicineProductionDate ?? med.MedicineProductionDate;
    const expDate = med.medicineExpiryDate ?? med.MedicineExpiryDate;

    document.getElementById("editMedProdDate").value = prodDate ? prodDate.substring(0, 10) : "";
    document.getElementById("editMedExpDate").value = expDate ? expDate.substring(0, 10) : "";
    document.getElementById("editMedDesc").value = med.medicineDescription ?? med.MedicineDescription ?? "";

    const modal = new bootstrap.Modal(document.getElementById("editMedicineModal"));
    modal.show();
  } catch (error) {
    console.error("Error loading medicine for edit:", error);
    alert(`Failed to load medicine: ${error.message}`);
  }
}

// 8. SEARCH & FILTER
async function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const categoryId = document.getElementById("filterCategory").value;

  let filtered = currentMedicines;

  if (categoryId) {
    filtered = filtered.filter(
      (m) => String(m.medicineCategoryId ?? m.MedicineCategoryId) === String(categoryId),
    );
  }

  if (query) {
    filtered = filtered.filter((m) => {
      const name = (m.medicineName ?? m.MedicineName ?? "").toLowerCase();
      const desc = (m.medicineDescription ?? m.MedicineDescription ?? "").toLowerCase();
      return name.includes(query.toLowerCase()) || desc.includes(query.toLowerCase());
    });
  }

  renderTable(filtered);
}

function clearSearch() {
  document.getElementById("searchInput").value = "";
  document.getElementById("filterCategory").value = "";
  renderTable(currentMedicines);
}

// 9. SORT BY PRICE
function sortMedicinesByPrice() {
  currentMedicines.sort((a, b) => {
    const priceA = a.medicinePrice ?? a.MedicinePrice ?? a.price ?? 0;
    const priceB = b.medicinePrice ?? b.MedicinePrice ?? b.price ?? 0;
    return sortPriceAsc ? priceA - priceB : priceB - priceA;
  });
  sortPriceAsc = !sortPriceAsc;
  const btn = document.getElementById("sortPriceBtn");
  if (btn) {
    btn.textContent = sortPriceAsc ? "Sort by Price (Low-High)" : "Sort by Price (High-Low)";
  }
  handleSearch();
}

// Event Listeners & Initialize
document.addEventListener("DOMContentLoaded", async () => {
  if (checkAccess()) {
    await loadDropdowns();
    await fetchMedicines();

    document.getElementById("searchBtn")?.addEventListener("click", handleSearch);
    document.getElementById("searchInput")?.addEventListener("keyup", (e) => {
      if (e.key === "Enter" || e.target.value === "") handleSearch();
    });
    document.getElementById("filterCategory")?.addEventListener("change", handleSearch);
  }
});
