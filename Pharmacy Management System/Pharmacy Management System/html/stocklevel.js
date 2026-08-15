// StockLevel.js — Front-end Logic for Stock Level Management

const API = "https://localhost:7293/api/StockLevel";

// Auth Helper
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Set Today's Date Default
function setDefaultDate() {
  const dateInput = document.getElementById("lastRestockedDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

// 1. GET ALL STOCK LEVELS
function loadStockLevels() {
  fetch(`${API}/GetAllStockLevels`, {
    headers: getAuthHeaders(),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return res.json();
    })
    .then((stockLevels) => {
      const tbody = document.getElementById("stockLevelTableBody");
      if (!stockLevels || stockLevels.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No stock records found.</td></tr>`;
        return;
      }

      tbody.innerHTML = stockLevels
        .map((s) => {
          const lowStock = s.currentQuantity <= s.reorderLevel;
          const formattedDate = s.lastRestockedDate
            ? s.lastRestockedDate.split("T")[0]
            : "";

          return `
            <tr class="${lowStock ? "table-warning" : ""}">
                <td>${s.stockLevelId}</td>
                <td><strong>${s.currentQuantity}</strong> ${lowStock ? '<span class="badge bg-danger ms-1">Low</span>' : ""}</td>
                <td>${s.reorderLevel}</td>
                <td>${formattedDate}</td>
                <td>${s.medicineId}</td>
                <td>${s.branchId}</td>
                <td class="text-center text-nowrap">
                    <button class="btn btn-sm btn-info me-1 text-white" onclick="restockStockLevel(${s.stockLevelId})">Restock</button>
                    <button class="btn btn-sm btn-warning me-1" onclick="editStockLevel(${s.stockLevelId}, ${s.currentQuantity}, ${s.reorderLevel})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStockLevel(${s.stockLevelId})">Delete</button>
                </td>
            </tr>`;
        })
        .join("");
    })
    .catch((err) => {
      console.error("Load failed:", err);
      const tbody = document.getElementById("stockLevelTableBody");
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load stock levels from server.</td></tr>`;
    });
}

// 2. CREATE STOCK LEVEL
document.getElementById("stockLevelForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const newStockLevel = {
    currentQuantity: parseInt(document.getElementById("currentQuantity").value),
    reorderLevel: parseInt(document.getElementById("reorderLevel").value),
    lastRestockedDate: document.getElementById("lastRestockedDate").value,
    medicineId: parseInt(document.getElementById("medicineId").value),
    branchId: parseInt(document.getElementById("branchId").value),
  };

  fetch(`${API}/CreateStockLevel`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(newStockLevel),
  })
    .then(async (res) => {
      if (res.ok) {
        document.getElementById("stockLevelForm").reset();
        setDefaultDate();
        loadStockLevels();
      } else {
        const msg = await res.text();
        alert(`Could not add stock level: ${msg}`);
      }
    })
    .catch((err) => console.error("Create stock level error:", err));
});

// 3. EDIT POPULATE
function editStockLevel(id, quantity, reorder) {
  document.getElementById("editStockLevelId").value = id;
  document.getElementById("editCurrentQuantity").value = quantity;
  document.getElementById("editReorderLevel").value = reorder;

  const modalEl = document.getElementById("editStockLevelModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// 4. UPDATE STOCK LEVEL
document
  .getElementById("editStockLevelForm")
  ?.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("editStockLevelId").value;
    const updatedData = {
      stockLevelId: parseInt(id),
      currentQuantity: parseInt(
        document.getElementById("editCurrentQuantity").value,
      ),
      reorderLevel: parseInt(document.getElementById("editReorderLevel").value),
    };

    fetch(`${API}/UpdateStockLevel/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedData),
    })
      .then(async (res) => {
        if (res.ok) {
          const modalEl = document.getElementById("editStockLevelModal");
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
          loadStockLevels();
        } else {
          const msg = await res.text();
          alert(`Update failed: ${msg}`);
        }
      })
      .catch((err) => console.error("Update error:", err));
  });

// 5. RESTOCK ACTION
function restockStockLevel(id) {
  const quantityStr = prompt("Enter quantity to add to stock:");
  if (!quantityStr) return;

  const quantityAdded = parseInt(quantityStr);
  if (isNaN(quantityAdded) || quantityAdded <= 0) {
    alert("Please enter a valid positive number.");
    return;
  }

  fetch(`${API}/restock/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(quantityAdded),
  })
    .then(async (res) => {
      if (res.ok) {
        alert("Stock restocked successfully!");
        loadStockLevels();
      } else {
        const msg = await res.text();
        alert(`Restock failed: ${msg}`);
      }
    })
    .catch((err) => console.error("Restock error:", err));
}

// 6. DELETE STOCK LEVEL
function deleteStockLevel(id) {
  if (confirm("Are you sure you want to delete this stock entry?")) {
    fetch(`${API}/DeleteStockLevel/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
      .then(async (res) => {
        if (res.ok) {
          loadStockLevels();
        } else {
          const msg = await res.text();
          alert(`Delete failed: ${msg}`);
        }
      })
      .catch((err) => console.error("Delete error:", err));
  }
}

// INIT & LISTENERS
document
  .getElementById("refreshStockLevels")
  ?.addEventListener("click", loadStockLevels);

setDefaultDate();
loadStockLevels();
