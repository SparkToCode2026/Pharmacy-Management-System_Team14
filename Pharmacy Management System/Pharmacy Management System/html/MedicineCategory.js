const API_URL = "https://localhost:7293/api/MedicineCategory";
let categoriesList = [];

function getAuthToken() {
  return localStorage.getItem("token");
}

function checkAuth() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "login.html";
    return false;
  }
  return token;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) return;

  loadCategories();

  document.getElementById("searchBtn")?.addEventListener("click", handleSearch);
  document.getElementById("searchInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  // Add Category Submit (POST)
  document
    .getElementById("addCategoryForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        medicineCategoryName: document.getElementById("categoryName").value,
        medicineCategoryDescription: document.getElementById(
          "categoryDescription",
        ).value,
      };

      if (
        await sendRequest(`${API_URL}/AddMedicineCategory`, "POST", payload)
      ) {
        e.target.reset();
        const modalEl = document.getElementById("addCategoryModal");
        const modalInstance =
          bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
        loadCategories();
      }
    });

  // Edit Category Submit (PUT)
  document
    .getElementById("editCategoryForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = parseInt(document.getElementById("editCategoryId").value);
      const payload = {
        medicineCategoryId: id,
        medicineCategoryName: document.getElementById("editCategoryName").value,
        medicineCategoryDescription: document.getElementById(
          "editCategoryDescription",
        ).value,
      };

      if (
        await sendRequest(
          `${API_URL}/UpdateMedicineCategory/${id}`,
          "PUT",
          payload,
        )
      ) {
        const modalEl = document.getElementById("editCategoryModal");
        const modalInstance =
          bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
        loadCategories();
      }
    });
});

async function sendRequest(url, method, body = null) {
  const token = checkAuth();
  if (!token) return false;

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const options = { method, headers };
    if (body !== null)
      options.body =
        typeof body === "string" ? JSON.stringify(body) : JSON.stringify(body);

    const res = await fetch(url, options);

    if (res.status === 401 || res.status === 403) {
      alert("Session expired or unauthorized. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return false;
    }

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

// Fetch All Categories (GET)
async function loadCategories() {
  const token = getAuthToken();

  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_URL}/GetAllMedicineCategories`, { headers });

    if (res.status === 401 || res.status === 403) {
      alert("Session expired or unauthorized. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

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
        <button class="btn btn-sm btn-info text-white me-1" onclick="openDetailsModal(${item.medicineCategoryId})">Details</button>
        <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${item.medicineCategoryId})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${item.medicineCategoryId})">Delete</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

// Handles local, Name API, and Description API searches
async function handleSearch() {
  const query = document.getElementById("searchInput")?.value.trim() || "";
  const type = document.getElementById("searchType")?.value || "client";

  if (!query) {
    loadCategories();
    return;
  }

  if (type === "client") {
    const filtered = categoriesList.filter(
      (c) =>
        c.medicineCategoryName?.toLowerCase().includes(query.toLowerCase()) ||
        c.medicineCategoryDescription
          ?.toLowerCase()
          .includes(query.toLowerCase()),
    );
    renderTable(filtered);
  } else if (type === "name") {
    // API Search by Name (GET)
    try {
      const res = await fetch(
        `${API_URL}/GetMedicineCategoriesByName?name=${encodeURIComponent(query)}`,
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      renderTable(data);
    } catch (err) {
      alert("Error searching by name: " + err.message);
    }
  } else if (type === "description") {
    // API Search by Description (GET)
    try {
      const res = await fetch(
        `${API_URL}/GetMedicineCategoriesByDescription?description=${encodeURIComponent(query)}`,
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      renderTable(data);
    } catch (err) {
      alert("Error searching by description: " + err.message);
    }
  }
}

// Fetch single category details from API (GET)
async function openDetailsModal(id) {
  try {
    const res = await fetch(`${API_URL}/GetMedicineCategoryById/${id}`);
    if (!res.ok) throw new Error("Failed to load details");
    const item = await res.json();

    document.getElementById("detailCategoryId").textContent =
      item.medicineCategoryId;
    document.getElementById("detailCategoryName").textContent =
      item.medicineCategoryName || "N/A";
    document.getElementById("detailCategoryDescription").textContent =
      item.medicineCategoryDescription || "N/A";

    const modal = new bootstrap.Modal(
      document.getElementById("categoryDetailsModal"),
    );
    modal.show();
  } catch (err) {
    alert("Error fetching category details: " + err.message);
  }
}

function openEditModal(id) {
  const item = categoriesList.find((c) => c.medicineCategoryId === id);
  if (!item) return;

  document.getElementById("editCategoryId").value = item.medicineCategoryId;
  document.getElementById("editCategoryName").value =
    item.medicineCategoryName || "";
  document.getElementById("editCategoryDescription").value =
    item.medicineCategoryDescription || "";

  const modal = new bootstrap.Modal(
    document.getElementById("editCategoryModal"),
  );
  modal.show();
}

// Patch Name Only (PATCH)
async function patchCategoryName() {
  const id = parseInt(document.getElementById("editCategoryId").value);
  const newName = document.getElementById("editCategoryName").value;

  if (
    await sendRequest(
      `${API_URL}/UpdateMedicineCategoryName/${id}`,
      "PATCH",
      newName,
    )
  ) {
    const modalEl = document.getElementById("editCategoryModal");
    const modalInstance =
      bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.hide();
    loadCategories();
  }
}

// Patch Description Only (PATCH)
async function patchCategoryDescription() {
  const id = parseInt(document.getElementById("editCategoryId").value);
  const newDescription = document.getElementById(
    "editCategoryDescription",
  ).value;

  if (
    await sendRequest(
      `${API_URL}/UpdateMedicineCategoryDescription/${id}`,
      "PATCH",
      newDescription,
    )
  ) {
    const modalEl = document.getElementById("editCategoryModal");
    const modalInstance =
      bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.hide();
    loadCategories();
  }
}

// Delete Category (DELETE)
async function deleteCategory(id) {
  if (confirm("Are you sure you want to delete this category?")) {
    if (
      await sendRequest(`${API_URL}/RemoveMedicineCategory/${id}`, "DELETE")
    ) {
      loadCategories();
    }
  }
}

window.openDetailsModal = openDetailsModal;
window.openEditModal = openEditModal;
window.patchCategoryName = patchCategoryName;
window.patchCategoryDescription = patchCategoryDescription;
window.deleteCategory = deleteCategory;
window.loadCategories = loadCategories;
