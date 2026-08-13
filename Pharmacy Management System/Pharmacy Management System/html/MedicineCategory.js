const API_URL = "https://localhost:7293/MedicineCategory";
let categoriesList = [];

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();

  // Search Input Listener
  document.getElementById("searchInput")?.addEventListener("input", handleSearch);

  // Add Category Submit
  document.getElementById("addCategoryForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      medicineCategoryName: document.getElementById("categoryName").value,
      medicineCategoryDescription: document.getElementById("categoryDescription").value
    };

    if (await sendRequest(`${API_URL}/AddMedicineCategory`, "POST", payload)) {
      e.target.reset();
      loadCategories();
    }
  });

  // Edit Category Submit
  document.getElementById("editCategoryForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      medicineCategoryId: parseInt(document.getElementById("editCategoryId").value),
      medicineCategoryName: document.getElementById("editCategoryName").value,
      medicineCategoryDescription: document.getElementById("editCategoryDescription").value
    };

    if (await sendRequest(`${API_URL}/UpdateMedicineCategory`, "PUT", payload)) {
      const modalEl = document.getElementById("editCategoryModal");
      const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalInstance.hide();
      loadCategories();
    }
  });
});

// HTTP Request Helper
async function sendRequest(url, method, body = null) {
  try {
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Action failed");
    }
    return true;
  } catch (err) {
    alert("Error: " + err.message);
    return false;
  }
}

// Fetch All Categories
async function loadCategories() {
  try {
    const res = await fetch(`${API_URL}/GetAllMedicineCategories`);
    if (!res.ok) throw new Error("Failed to load categories");
    categoriesList = await res.json();
    renderTable(categoriesList);
  } catch (err) {
    alert("Error loading categories: " + err.message);
  }
}

// Render Table
function renderTable(data) {
  const tbody = document.getElementById("categoriesTableBody");
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No categories found.</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map(
      (item) => `
    <tr>
      <td>${item.medicineCategoryId}</td>
      <td class="fw-bold">${item.medicineCategoryName || "N/A"}</td>
      <td>${item.medicineCategoryDescription || "N/A"}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${item.medicineCategoryId})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${item.medicineCategoryId})">Delete</button>
      </td>
    </tr>
  `
    )
    .join("");
}

// Search Filter
function handleSearch() {
  const query = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
  const filtered = categoriesList.filter(
    (c) =>
      c.medicineCategoryName?.toLowerCase().includes(query) ||
      c.medicineCategoryDescription?.toLowerCase().includes(query)
  );
  renderTable(filtered);
}

// Open Edit Modal
function openEditModal(id) {
  const item = categoriesList.find((c) => c.medicineCategoryId === id);
  if (!item) return;

  document.getElementById("editCategoryId").value = item.medicineCategoryId;
  document.getElementById("editCategoryName").value = item.medicineCategoryName || "";
  document.getElementById("editCategoryDescription").value = item.medicineCategoryDescription || "";

  const modal = new bootstrap.Modal(document.getElementById("editCategoryModal"));
  modal.show();
}

// Delete Category
async function deleteCategory(id) {
  if (confirm("Are you sure you want to delete this category?")) {
    if (await sendRequest(`${API_URL}/RemoveMedicineCategory?medicineCategoryId=${id}`, "DELETE")) {
      loadCategories();
    }
  }
}

// Global Attachments
window.openEditModal = openEditModal;
window.deleteCategory = deleteCategory;
window.loadCategories = loadCategories;