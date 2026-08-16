// ============================================================
// user-medicines.js
// Logic for Customer Browsing of Medicines
// ============================================================

let allMedicines = [];
let allCategories = [];

// Load all medicines
async function loadMedicines() {
  try {
    const grid = document.getElementById("medicinesGrid");
    if (!grid) return;
    grid.innerHTML =
      '<div class="text-center text-muted py-4">Loading medicines...</div>';

    allMedicines = (await getMedicines()) || [];
    if (!allMedicines || allMedicines.length === 0) {
      grid.innerHTML =
        '<div class="text-center text-muted py-4">No medicines found</div>';
      return;
    }

    renderMedicines(allMedicines);
  } catch (error) {
    console.error("Error loading medicines:", error);
    const grid = document.getElementById("medicinesGrid");
    if (grid) {
      grid.innerHTML =
        '<div class="text-center text-danger py-4">Error loading medicines from catalog</div>';
    }
  }
}

// Load categories for filter dropdown
async function loadCategories() {
  try {
    allCategories = (await apiGetMedicineCategories()) || [];
    const categorySelect = document.getElementById("categoryFilter");
    if (!categorySelect) return;

    allCategories.forEach((category) => {
      const categoryId =
        category.medicineCategoryId ?? category.MedicineCategoryId;
      const categoryName =
        category.medicineCategoryName ?? category.MedicineCategoryName ?? category.categoryName ?? "General";
      const option = document.createElement("option");
      option.value = categoryId;
      option.textContent = categoryName;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// Render medicines in responsive cards grid
function renderMedicines(medicines) {
  const grid = document.getElementById("medicinesGrid");
  if (!grid) return;

  if (!medicines || medicines.length === 0) {
    grid.innerHTML =
      '<div class="text-center text-muted py-4 col-12">No matching medicines found.</div>';
    return;
  }

  grid.innerHTML = medicines
    .map((medicine) => {
      const medicineId = medicine.medicineId ?? medicine.MedicineId;
      const medicineName = medicine.medicineName ?? medicine.MedicineName ?? "";
      const price = Number(medicine.medicinePrice ?? medicine.MedicinePrice ?? medicine.price ?? 0).toFixed(2);
      const description =
        medicine.medicineDescription ?? medicine.MedicineDescription ?? medicine.description ?? "No description available.";
      const categoryId =
        medicine.medicineCategoryId ?? medicine.MedicineCategoryId;
      const category = allCategories.find(
        (c) => (c.medicineCategoryId ?? c.MedicineCategoryId) === categoryId,
      );
      const categoryName = category
        ? (category.medicineCategoryName ?? category.MedicineCategoryName ?? "General")
        : "General";

      return `
      <div class="medicine-card">
        <div class="medicine-name">${medicineName}</div>
        <div class="medicine-info"><span class="badge bg-secondary">${categoryName}</span></div>
        <div class="medicine-info mt-2 text-muted">${description.substring(0, 90)}${description.length > 90 ? "..." : ""}</div>
        <div class="medicine-price text-success fw-bold fs-4 mt-2">$${price}</div>
        <button class="btn btn-sm btn-primary mt-3 w-100" onclick="viewMedicineDetails(${medicineId})">
          View Details
        </button>
      </div>
    `;
    })
    .join("");
}

// View medicine details modal
async function viewMedicineDetails(medicineId) {
  try {
    const medicine = allMedicines.find(
      (m) => (m.medicineId ?? m.MedicineId) === medicineId,
    );
    if (!medicine) {
      alert("Medicine details not found.");
      return;
    }

    const medicineName = medicine.medicineName ?? medicine.MedicineName;
    const price = Number(medicine.medicinePrice ?? medicine.MedicinePrice ?? medicine.price ?? 0).toFixed(2);
    const description = medicine.medicineDescription ?? medicine.MedicineDescription ?? "No description available.";
    const categoryId =
      medicine.medicineCategoryId ?? medicine.MedicineCategoryId;
    const category = allCategories.find(
      (c) => (c.medicineCategoryId ?? c.MedicineCategoryId) === categoryId,
    );
    const categoryName = category
      ? (category.medicineCategoryName ?? category.MedicineCategoryName ?? "General")
      : "General";

    const content = `
      <div class="mb-3">
        <h4 class="text-primary fw-bold">${medicineName}</h4>
        <p class="text-muted"><span class="badge bg-secondary">${categoryName}</span></p>
        <p class="fs-4 text-success fw-bold">Price: $${price}</p>
        <hr>
        <p class="fw-bold mb-1">Description & Indications:</p>
        <p class="text-secondary">${description}</p>
      </div>
    `;

    document.getElementById("medicineDetailsContent").innerHTML = content;
    new bootstrap.Modal(document.getElementById("medicineDetailsModal")).show();
  } catch (error) {
    console.error("Error loading medicine details:", error);
    alert("Error loading medicine details");
  }
}

// Filter medicines
function filterMedicines() {
  const categoryId = document.getElementById("categoryFilter").value;
  const searchTerm = document
    .getElementById("medicineSearch")
    .value.toLowerCase().trim();

  let filtered = allMedicines;

  if (categoryId) {
    filtered = filtered.filter((m) => {
      const mCategoryId = m.medicineCategoryId ?? m.MedicineCategoryId;
      return String(mCategoryId) === String(categoryId);
    });
  }

  if (searchTerm) {
    filtered = filtered.filter((m) => {
      const name = (m.medicineName ?? m.MedicineName ?? "").toLowerCase();
      const desc = (m.medicineDescription ?? m.MedicineDescription ?? "").toLowerCase();
      return name.includes(searchTerm) || desc.includes(searchTerm);
    });
  }

  renderMedicines(filtered);
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  await loadCategories();
  await loadMedicines();

  const categoryFilter = document.getElementById("categoryFilter");
  const medicineSearch = document.getElementById("medicineSearch");

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterMedicines);
  }

  if (medicineSearch) {
    medicineSearch.addEventListener("input", filterMedicines);
  }
});
