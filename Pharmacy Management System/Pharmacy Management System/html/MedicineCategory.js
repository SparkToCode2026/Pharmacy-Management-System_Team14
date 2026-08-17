// ============================================================
// MedicineCategory.js
// Logic for Medicine Category Management using api.js
// ============================================================

let currentCategories = [];

// Check Access
function checkAccess() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "auth.html";
    return false;
  }
  return true;
}

// 1. GET ALL CATEGORIES
async function fetchCategories() {
  try {
    const data = await apiGetMedicineCategories();
    currentCategories = data || [];
    renderTable(currentCategories);
  } catch (error) {
    console.error("Error loading categories:", error);
    const tbody = document.getElementById("categoriesTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Failed to load categories: ${error.message}</td></tr>`;
    }
  }
}

// Render data to table
function renderTable(data) {
  const tbody = document.getElementById("categoriesTableBody");
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No categories found.</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map((item) => {
      const id = item.medicineCategoryId ?? item.MedicineCategoryId;
      const name = item.medicineCategoryName ?? item.MedicineCategoryName ?? item.categoryName ?? item.CategoryName ?? "";
      const desc = item.medicineCategoryDescription ?? item.MedicineCategoryDescription ?? item.categoryDescription ?? item.CategoryDescription ?? "";

      return `
        <tr>
          <td class="fw-bold">${id}</td>
          <td>${name}</td>
          <td>${desc}</td>
          <td class="text-center text-nowrap">
            <button class="btn btn-info btn-sm text-white me-1" onclick="openDetailsModal(${id})">Details</button>
            <button class="btn btn-warning btn-sm me-1" onclick="openEditModal(${id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteCategory(${id})">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

// 2. ADD CATEGORY
document.getElementById("addCategoryForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("categoryName").value.trim();
  const description = document.getElementById("categoryDescription").value.trim();

  const newCategory = {
    medicineCategoryName: name,
    medicineCategoryDescription: description,
  };

  try {
    await apiAddMedicineCategory(newCategory);
    alert("Category added successfully!");

    document.getElementById("addCategoryForm").reset();
    const modalEl = document.getElementById("addCategoryModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    fetchCategories();
  } catch (error) {
    console.error("Error adding category:", error);
    alert(`Failed to add category: ${error.message}`);
  }
});

// 3. EDIT FULL CATEGORY (PUT)
document.getElementById("editCategoryForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editCategoryId").value;
  const name = document.getElementById("editCategoryName").value.trim();
  const description = document.getElementById("editCategoryDescription").value.trim();

  const updatedCategory = {
    medicineCategoryId: parseInt(id),
    medicineCategoryName: name,
    medicineCategoryDescription: description,
  };

  try {
    await apiUpdateMedicineCategory(id, updatedCategory);
    alert("Category updated successfully!");

    const modalEl = document.getElementById("editCategoryModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    fetchCategories();
  } catch (error) {
    console.error("Error updating category:", error);
    alert(`Failed to update category: ${error.message}`);
  }
});

// 4. PATCH CATEGORY NAME
async function patchCategoryName() {
  const id = document.getElementById("editCategoryId").value;
  const name = document.getElementById("editCategoryName").value.trim();

  if (!name) return alert("Category Name cannot be empty.");

  try {
    await apiUpdateMedicineCategoryName(id, name);
    alert("Category Name patched successfully!");
    fetchCategories();
  } catch (error) {
    console.error("Error patching category name:", error);
    alert(`Patch failed: ${error.message}`);
  }
}

// 5. PATCH CATEGORY DESCRIPTION
async function patchCategoryDescription() {
  const id = document.getElementById("editCategoryId").value;
  const description = document.getElementById("editCategoryDescription").value.trim();

  try {
    await apiUpdateMedicineCategoryDescription(id, description);
    alert("Category Description patched successfully!");
    fetchCategories();
  } catch (error) {
    console.error("Error patching category description:", error);
    alert(`Patch failed: ${error.message}`);
  }
}

// 6. DELETE CATEGORY
async function deleteCategory(id) {
  if (!confirm(`Are you sure you want to delete Category ID: ${id}?`)) return;

  try {
    await apiDeleteMedicineCategory(id);
    alert("Category deleted successfully!");
    fetchCategories();
  } catch (error) {
    console.error("Error deleting category:", error);
    alert(`Failed to delete category: ${error.message}`);
  }
}

// 7. OPEN DETAILS MODAL
async function openDetailsModal(id) {
  try {
    const data = await apiGetMedicineCategoryById(id);
    const idVal = data.medicineCategoryId ?? data.MedicineCategoryId;
    const nameVal = data.medicineCategoryName ?? data.MedicineCategoryName ?? data.categoryName ?? data.CategoryName ?? "";
    const descVal = data.medicineCategoryDescription ?? data.MedicineCategoryDescription ?? data.categoryDescription ?? data.CategoryDescription ?? "";

    document.getElementById("detailCategoryId").innerText = idVal;
    document.getElementById("detailCategoryName").innerText = nameVal;
    document.getElementById("detailCategoryDescription").innerText = descVal;

    const modal = new bootstrap.Modal(document.getElementById("categoryDetailsModal"));
    modal.show();
  } catch (error) {
    console.error("Error loading category details:", error);
    alert(`Failed to fetch details: ${error.message}`);
  }
}

// 8. OPEN EDIT MODAL
async function openEditModal(id) {
  try {
    const data = await apiGetMedicineCategoryById(id);
    const idVal = data.medicineCategoryId ?? data.MedicineCategoryId;
    const nameVal = data.medicineCategoryName ?? data.MedicineCategoryName ?? data.categoryName ?? data.CategoryName ?? "";
    const descVal = data.medicineCategoryDescription ?? data.MedicineCategoryDescription ?? data.categoryDescription ?? data.CategoryDescription ?? "";

    document.getElementById("editCategoryId").value = idVal;
    document.getElementById("editCategoryName").value = nameVal;
    document.getElementById("editCategoryDescription").value = descVal;

    const modal = new bootstrap.Modal(document.getElementById("editCategoryModal"));
    modal.show();
  } catch (error) {
    console.error("Error loading category for edit:", error);
    alert(`Failed to load category data: ${error.message}`);
  }
}

// 9. SEARCH HANDLING
async function handleSearch() {
  const type = document.getElementById("searchType").value;
  const input = document.getElementById("searchInput").value.trim();

  if (!input) {
    renderTable(currentCategories);
    return;
  }

  if (type === "client") {
    const query = input.toLowerCase();
    const filtered = currentCategories.filter((c) => {
      const name = (c.medicineCategoryName ?? c.MedicineCategoryName ?? c.categoryName ?? c.CategoryName ?? "").toLowerCase();
      const desc = (c.medicineCategoryDescription ?? c.MedicineCategoryDescription ?? c.categoryDescription ?? c.CategoryDescription ?? "").toLowerCase();
      return name.includes(query) || desc.includes(query);
    });
    renderTable(filtered);
    return;
  }

  try {
    let result = [];
    if (type === "name") {
      result = await apiGetMedicineCategoriesByName(input);
    } else if (type === "description") {
      result = await apiGetMedicineCategoriesByDescription(input);
    }
    renderTable(Array.isArray(result) ? result : [result]);
  } catch (error) {
    renderTable([]);
  }
}

function clearCategorySearch() {
  document.getElementById("searchInput").value = "";
  renderTable(currentCategories);
}

// Event Listeners & Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (checkAccess()) {
    fetchCategories();

    document.getElementById("searchBtn")?.addEventListener("click", handleSearch);
    document.getElementById("searchInput")?.addEventListener("keyup", (e) => {
      if (e.key === "Enter") handleSearch();
      if (document.getElementById("searchType").value === "client") handleSearch();
    });
  }
});
