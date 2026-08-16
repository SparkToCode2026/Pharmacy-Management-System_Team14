// ============================================================
// stocklevel.js
// Logic for Stock Level Management using api.js
// ============================================================

let allStockLevels = [];
let showingLowStockOnly = false;

// Set Today's Date Default
function setDefaultDate() {
  const dateInput = document.getElementById("lastRestockedDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

// 1. GET ALL STOCK LEVELS
async function loadStockLevels() {
  try {
    const stockLevels = await apiGetStockLevels();
    allStockLevels = stockLevels || [];
    renderStockLevels(allStockLevels);
  } catch (err) {
    console.error("Load failed:", err);
    const tbody = document.getElementById("stockLevelTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Failed to load stock levels: ${err.message}</td></tr>`;
    }
  }
}

function renderStockLevels(stockLevels) {
  const tbody = document.getElementById("stockLevelTableBody");
  if (!tbody) return;

  if (!stockLevels || stockLevels.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No stock records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = stockLevels
    .map((s) => {
      const id = s.stockLevelId ?? s.StockLevelId;
      const currentQty = s.currentQuantity ?? s.CurrentQuantity ?? 0;
      const reorderLvl = s.reorderLevel ?? s.ReorderLevel ?? 0;
      const lowStock = currentQty <= reorderLvl;
      const rawDate = s.lastRestockedDate ?? s.LastRestockedDate;
      const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString() : "—";
      const medId = s.medicineId ?? s.MedicineId;
      const branchId = s.branchId ?? s.BranchId;

      return `
        <tr class="${lowStock ? "table-warning" : ""}">
            <td class="fw-bold">${id}</td>
            <td><strong>${currentQty}</strong> ${lowStock ? '<span class="badge bg-danger ms-1">Low</span>' : ""}</td>
            <td>${reorderLvl}</td>
            <td>${formattedDate}</td>
            <td>#${medId}</td>
            <td>#${branchId}</td>
            <td class="text-center text-nowrap">
                <button class="btn btn-sm btn-info me-1 text-white" onclick="restockStockLevel(${id})">Restock</button>
                <button class="btn btn-sm btn-warning me-1" onclick="editStockLevel(${id}, ${currentQty}, ${reorderLvl})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteStockLevelAction(${id})">Delete</button>
            </td>
        </tr>`;
    })
    .join("");
}

// 2. CREATE STOCK LEVEL
document.getElementById("stockLevelForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newStockLevel = {
    currentQuantity: parseInt(document.getElementById("currentQuantity").value),
    reorderLevel: parseInt(document.getElementById("reorderLevel").value),
    lastRestockedDate: document.getElementById("lastRestockedDate").value,
    medicineId: parseInt(document.getElementById("medicineId").value),
    branchId: parseInt(document.getElementById("branchId").value),
  };

  try {
    await apiCreateStockLevel(newStockLevel);
    alert("Stock level record added!");
    document.getElementById("stockLevelForm").reset();
    setDefaultDate();
    loadStockLevels();
  } catch (err) {
    console.error("Create stock level error:", err);
    alert(`Could not add stock level: ${err.message}`);
  }
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
document.getElementById("editStockLevelForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editStockLevelId").value;
  const updatedData = {
    stockLevelId: parseInt(id),
    currentQuantity: parseInt(document.getElementById("editCurrentQuantity").value),
    reorderLevel: parseInt(document.getElementById("editReorderLevel").value),
  };

  try {
    await apiUpdateStockLevel(id, updatedData);
    alert("Stock level updated!");
    const modalEl = document.getElementById("editStockLevelModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
    loadStockLevels();
  } catch (err) {
    console.error("Update error:", err);
    alert(`Update failed: ${err.message}`);
  }
});

// 5. RESTOCK ACTION
async function restockStockLevel(id) {
  const quantityStr = prompt("Enter quantity to add to stock:");
  if (!quantityStr) return;

  const quantityAdded = parseInt(quantityStr);
  if (isNaN(quantityAdded) || quantityAdded <= 0) {
    alert("Please enter a valid positive number.");
    return;
  }

  try {
    await apiRestockStockLevel(id, quantityAdded);
    alert("Stock restocked successfully!");
    loadStockLevels();
  } catch (err) {
    console.error("Restock error:", err);
    alert(`Restock failed: ${err.message}`);
  }
}

// 6. DELETE STOCK LEVEL
async function deleteStockLevelAction(id) {
  if (!confirm("Are you sure you want to delete this stock entry?")) return;

  try {
    await apiDeleteStockLevel(id);
    alert("Stock entry deleted!");
    loadStockLevels();
  } catch (err) {
    console.error("Delete error:", err);
    alert(`Delete failed: ${err.message}`);
  }
}

// 7. TOGGLE LOW STOCK
async function toggleLowStock() {
  showingLowStockOnly = !showingLowStockOnly;
  const btn = document.getElementById("showLowStockBtn");

  if (showingLowStockOnly) {
    if (btn) btn.textContent = "Show All Stock";
    try {
      const lowStock = await apiGetLowStock();
      renderStockLevels(lowStock);
    } catch {
      const filtered = allStockLevels.filter((s) => (s.currentQuantity ?? s.CurrentQuantity) <= (s.reorderLevel ?? s.ReorderLevel));
      renderStockLevels(filtered);
    }
  } else {
    if (btn) btn.textContent = "Show Low Stock Only";
    renderStockLevels(allStockLevels);
  }
}

// INIT & LISTENERS
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshStockLevels")?.addEventListener("click", loadStockLevels);
  setDefaultDate();
  loadStockLevels();
});
