// ============================================================
// stocklevel.js
// Logic for Stock Level Management linked to Medicines and Branches
// ============================================================

let allStockLevels = [];
let medicinesCache = [];
let branchesCache = [];
let showingLowStockOnly = false;

// Set Today's Date Default
function setDefaultDate() {
  const dateInput = document.getElementById("lastRestockedDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

// 1. Load Dropdowns (Medicines & Branches)
async function loadDropdowns() {
  try {
    const [medicines, branches] = await Promise.all([
      getMedicines().catch(() => []),
      getBranches().catch(() => []),
    ]);

    medicinesCache = medicines || [];
    branchesCache = branches || [];

    // Populate Medicine Dropdown in Add Form
    const medSelect = document.getElementById("medicineSelect");
    if (medSelect) {
      if (medicinesCache.length === 0) {
        medSelect.innerHTML = '<option value="">No medicines found</option>';
      } else {
        medSelect.innerHTML =
          '<option value="">— Select a medicine —</option>' +
          medicinesCache
            .map((m) => {
              const id = m.medicineId ?? m.MedicineId;
              const name = m.medicineName ?? m.MedicineName;
              const price = Number(m.medicinePrice ?? m.MedicinePrice ?? m.price ?? 0).toFixed(2);
              return `<option value="${id}">${name} (ID #${id} • ${price} OMR)</option>`;
            })
            .join("");
      }
    }

    // Populate Branch Dropdown in Add Form
    const branchSelect = document.getElementById("branchSelect");
    if (branchSelect) {
      if (branchesCache.length === 0) {
        branchSelect.innerHTML = '<option value="">No branches found</option>';
      } else {
        branchSelect.innerHTML =
          '<option value="">— Select branch location —</option>' +
          branchesCache
            .map((b) => {
              const id = b.branchId ?? b.BranchId;
              const name = b.branchName ?? b.BranchName;
              const city = b.branchCity ?? b.BranchCity ?? "";
              return `<option value="${id}">${name} ${city ? `(${city})` : ""}</option>`;
            })
            .join("");
      }
    }

    // Populate Filter Branch Dropdown
    const filterBranch = document.getElementById("filterBranchSelect");
    if (filterBranch) {
      filterBranch.innerHTML =
        '<option value="">All Branches</option>' +
        branchesCache
          .map((b) => {
            const id = b.branchId ?? b.BranchId;
            const name = b.branchName ?? b.BranchName;
            return `<option value="${id}">${name}</option>`;
          })
          .join("");
    }
  } catch (err) {
    console.error("Error loading dropdowns:", err);
  }
}

// 2. GET ALL STOCK LEVELS
async function loadStockLevels() {
  try {
    const tbody = document.getElementById("stockLevelTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Loading stock levels...</td></tr>`;
    }

    const stockLevels = await apiGetStockLevels();
    allStockLevels = stockLevels || [];
    filterAndRenderStock();
  } catch (err) {
    console.error("Load failed:", err);
    const tbody = document.getElementById("stockLevelTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Failed to load stock levels: ${err.message}</td></tr>`;
    }
  }
}

// Render Table
function renderStockLevels(stockLevels) {
  const tbody = document.getElementById("stockLevelTableBody");
  const countBadge = document.getElementById("stockCountBadge");
  if (countBadge) {
    countBadge.textContent = `Total: ${stockLevels.length}`;
  }

  if (!tbody) return;

  if (!stockLevels || stockLevels.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No matching inventory records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = stockLevels
    .map((s) => {
      const id = s.stockLevelId ?? s.StockLevelId;
      const currentQty = s.currentQuantity ?? s.CurrentQuantity ?? 0;
      const reorderLvl = s.reorderLevel ?? s.ReorderLevel ?? 0;
      const isLowStock = currentQty <= reorderLvl;
      const rawDate = s.lastRestockedDate ?? s.LastRestockedDate;
      const formattedDate = rawDate
        ? new Date(rawDate).toLocaleDateString()
        : "—";

      const medId = s.medicineId ?? s.MedicineId;
      const med =
        s.medicine ||
        s.Medicine ||
        medicinesCache.find((m) => (m.medicineId ?? m.MedicineId) === medId);
      const medName = med
        ? med.medicineName ?? med.MedicineName
        : `Medicine #${medId}`;

      const branchId = s.branchId ?? s.BranchId;
      const branch =
        s.branch ||
        s.Branch ||
        branchesCache.find((b) => (b.branchId ?? b.BranchId) === branchId);
      const branchName = branch
        ? branch.branchName ?? branch.BranchName
        : `Branch #${branchId}`;

      return `
        <tr class="${isLowStock ? "table-warning" : ""}">
            <td class="fw-bold">#${id}</td>
            <td>
              <div class="fw-bold text-primary">${medName}</div>
              <small class="text-muted">ID: ${medId}</small>
            </td>
            <td>
              <span class="badge bg-light text-dark border">${branchName}</span>
            </td>
            <td>
              <span class="fs-6 fw-bold ${isLowStock ? "text-danger" : "text-success"}">${currentQty} units</span>
              ${isLowStock ? '<span class="badge bg-danger ms-1">Low Stock</span>' : ""}
            </td>
            <td>
              <span class="text-muted fw-semibold">${reorderLvl} units</span>
            </td>
            <td>${formattedDate}</td>
            <td class="text-center text-nowrap">
                <button class="btn btn-sm btn-outline-success me-1" onclick="restockStockLevel(${id})" title="Add stock units">
                  + Restock
                </button>
                <button class="btn btn-sm btn-warning text-dark me-1" onclick="editStockLevel(${id})" title="Change stock quantity or threshold">
                  Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteStockLevelAction(${id})" title="Delete stock record">
                  Delete
                </button>
            </td>
        </tr>`;
    })
    .join("");
}

// Filter and Search Handler
function filterAndRenderStock() {
  const searchTerm = (document.getElementById("stockSearchInput")?.value || "")
    .toLowerCase()
    .trim();
  const selectedBranch =
    document.getElementById("filterBranchSelect")?.value || "";

  let filtered = allStockLevels;

  if (showingLowStockOnly) {
    filtered = filtered.filter(
      (s) =>
        (s.currentQuantity ?? s.CurrentQuantity) <=
        (s.reorderLevel ?? s.ReorderLevel),
    );
  }

  if (selectedBranch) {
    filtered = filtered.filter(
      (s) => String(s.branchId ?? s.BranchId) === String(selectedBranch),
    );
  }

  if (searchTerm) {
    filtered = filtered.filter((s) => {
      const medId = s.medicineId ?? s.MedicineId;
      const med =
        s.medicine ||
        s.Medicine ||
        medicinesCache.find((m) => (m.medicineId ?? m.MedicineId) === medId);
      const name = (
        med ? med.medicineName ?? med.MedicineName : ""
      ).toLowerCase();
      return name.includes(searchTerm) || String(medId).includes(searchTerm);
    });
  }

  renderStockLevels(filtered);
}

// 3. CREATE / LINK STOCK TO MEDICINE
document
  .getElementById("stockLevelForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const medId = parseInt(document.getElementById("medicineSelect").value);
    const branchId = parseInt(document.getElementById("branchSelect").value);

    if (!medId) {
      alert("Please select a medicine.");
      return;
    }
    if (!branchId) {
      alert("Please select a pharmacy branch.");
      return;
    }

    const newStockLevel = {
      medicineId: medId,
      branchId: branchId,
      currentQuantity: parseInt(
        document.getElementById("currentQuantity").value,
      ),
      reorderLevel: parseInt(document.getElementById("reorderLevel").value),
      lastRestockedDate: document.getElementById("lastRestockedDate").value,
    };

    try {
      await apiCreateStockLevel(newStockLevel);
      alert("✓ Medicine stock record created and linked successfully!");
      document.getElementById("stockLevelForm").reset();
      setDefaultDate();
      await loadStockLevels();
    } catch (err) {
      console.error("Create stock level error:", err);
      alert(`Could not add stock level: ${err.message}`);
    }
  });

// 4. EDIT POPULATE (Shows Selected Medicine and Branch)
function editStockLevel(id) {
  const stock = allStockLevels.find(
    (s) => (s.stockLevelId ?? s.StockLevelId) === id,
  );
  if (!stock) return;

  const currentQty = stock.currentQuantity ?? stock.CurrentQuantity ?? 0;
  const reorderLvl = stock.reorderLevel ?? stock.ReorderLevel ?? 0;
  const medId = stock.medicineId ?? stock.MedicineId;
  const branchId = stock.branchId ?? stock.BranchId;

  const med =
    stock.medicine ||
    stock.Medicine ||
    medicinesCache.find((m) => (m.medicineId ?? m.MedicineId) === medId);
  const medName = med
    ? med.medicineName ?? med.MedicineName
    : `Medicine #${medId}`;

  const branch =
    stock.branch ||
    stock.Branch ||
    branchesCache.find((b) => (b.branchId ?? b.BranchId) === branchId);
  const branchName = branch
    ? branch.branchName ?? branch.BranchName
    : `Branch #${branchId}`;

  document.getElementById("editStockLevelId").value = id;
  document.getElementById("editMedicineName").textContent = medName;
  document.getElementById("editBranchName").textContent = branchName;
  document.getElementById("editCurrentQuantity").value = currentQty;
  document.getElementById("editReorderLevel").value = reorderLvl;

  const modalEl = document.getElementById("editStockLevelModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// 5. UPDATE STOCK LEVEL
document
  .getElementById("editStockLevelForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editStockLevelId").value;
    const updatedData = {
      stockLevelId: parseInt(id),
      currentQuantity: parseInt(
        document.getElementById("editCurrentQuantity").value,
      ),
      reorderLevel: parseInt(document.getElementById("editReorderLevel").value),
    };

    try {
      await apiUpdateStockLevel(id, updatedData);
      alert("✓ Medicine stock quantity updated successfully!");
      const modalEl = document.getElementById("editStockLevelModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
      await loadStockLevels();
    } catch (err) {
      console.error("Update error:", err);
      alert(`Update failed: ${err.message}`);
    }
  });

// 6. RESTOCK ACTION WITH MEDICINE CONTEXT
async function restockStockLevel(id) {
  const stock = allStockLevels.find(
    (s) => (s.stockLevelId ?? s.StockLevelId) === id,
  );
  const medId = stock ? stock.medicineId ?? stock.MedicineId : id;
  const med =
    stock?.medicine ||
    stock?.Medicine ||
    medicinesCache.find((m) => (m.medicineId ?? m.MedicineId) === medId);
  const medName = med
    ? med.medicineName ?? med.MedicineName
    : `Medicine #${medId}`;

  const quantityStr = prompt(
    `📦 Restock "${medName}":\nEnter quantity of units to add to current inventory:`,
  );
  if (!quantityStr) return;

  const quantityAdded = parseInt(quantityStr);
  if (isNaN(quantityAdded) || quantityAdded <= 0) {
    alert("Please enter a valid positive number.");
    return;
  }

  try {
    await apiRestockStockLevel(id, quantityAdded);
    alert(`✓ Successfully added ${quantityAdded} units to "${medName}" inventory!`);
    await loadStockLevels();
  } catch (err) {
    console.error("Restock error:", err);
    alert(`Restock failed: ${err.message}`);
  }
}

// 7. DELETE STOCK LEVEL
async function deleteStockLevelAction(id) {
  if (!confirm("Are you sure you want to delete this stock entry?")) return;

  try {
    await apiDeleteStockLevel(id);
    alert("✓ Stock entry deleted!");
    await loadStockLevels();
  } catch (err) {
    console.error("Delete error:", err);
    alert(`Delete failed: ${err.message}`);
  }
}

// 8. TOGGLE LOW STOCK
function toggleLowStock() {
  showingLowStockOnly = !showingLowStockOnly;
  const btn = document.getElementById("showLowStockBtn");

  if (showingLowStockOnly) {
    if (btn) btn.textContent = "Show All Stock Records";
  } else {
    if (btn) btn.textContent = "⚠️ Show Low Stock Only";
  }

  filterAndRenderStock();
}

// INIT & LISTENERS
document.addEventListener("DOMContentLoaded", async () => {
  setDefaultDate();
  await loadDropdowns();
  await loadStockLevels();

  document
    .getElementById("refreshStockLevels")
    ?.addEventListener("click", async () => {
      await loadDropdowns();
      await loadStockLevels();
    });

  document
    .getElementById("stockSearchInput")
    ?.addEventListener("input", filterAndRenderStock);
  document
    .getElementById("filterBranchSelect")
    ?.addEventListener("change", filterAndRenderStock);
});
