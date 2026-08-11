const API = "http://localhost:5009/StockLevel"; 

// 1. GET ALL
function loadStockLevels() {
  fetch(`${API}/GetAllStockLevels`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return res.json();
    })
    .then(stockLevels => {
      const tbody = document.getElementById("stockLevelTableBody");
      if (!stockLevels || stockLevels.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No records found.</td></tr>`;
        return;
      }
      tbody.innerHTML = stockLevels.map(s => {
        const lowStock = s.currentQuantity <= s.reorderLevel;
        return `
        <tr class="${lowStock ? 'table-warning' : ''}">
          <td>${s.stockLevelId}</td>
          <td>${s.currentQuantity}</td>
          <td>${s.reorderLevel}</td>
          <td>${s.lastRestockedDate.split('T')[0]}</td>
          <td>${s.medicineId}</td>
          <td>${s.branchId}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-warning me-1" onclick="editStockLevel(${s.stockLevelId}, ${s.currentQuantity}, ${s.reorderLevel})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteStockLevel(${s.stockLevelId})">Delete</button>
          </td>
        </tr>`;
      }).join("");
    })
    .catch(err => console.error("Load failed:", err));
}

// 2. CREATE
document.getElementById("stockLevelForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const newStockLevel = {
    currentQuantity: parseInt(document.getElementById("currentQuantity").value),
    reorderLevel: parseInt(document.getElementById("reorderLevel").value),
    lastRestockedDate: document.getElementById("lastRestockedDate").value,
    medicineId: parseInt(document.getElementById("medicineId").value),
    branchId: parseInt(document.getElementById("branchId").value)
  };
  fetch(`${API}/CreateStockLevel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newStockLevel)
  })
  .then(res => {
    if (res.ok) {
      document.getElementById("stockLevelForm").reset();
      loadStockLevels();
    } else {
      return res.text().then(msg => alert(`Could not add stock level: ${msg}`));
    }
  });
});

// 3. EDIT POPULATE
function editStockLevel(id, quantity, reorder) {
  document.getElementById("editStockLevelId").value = id;
  document.getElementById("editCurrentQuantity").value = quantity;
  document.getElementById("editReorderLevel").value = reorder;
  const modal = new bootstrap.Modal(document.getElementById("editStockLevelModal"));
  modal.show();
}

// 4. UPDATE
document.getElementById("editStockLevelForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("editStockLevelId").value;
  const updatedData = {
    stockLevelId: parseInt(id),
    currentQuantity: parseInt(document.getElementById("editCurrentQuantity").value),
    reorderLevel: parseInt(document.getElementById("editReorderLevel").value)
  };
  fetch(`${API}/UpdateStockLevel?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
  })
  .then(res => {
    if (res.ok) {
      const modal = bootstrap.Modal.getInstance(document.getElementById("editStockLevelModal"));
      if (modal) modal.hide();
      loadStockLevels();
    }
  });
});

// 5. DELETE
function deleteStockLevel(id) {
  if (confirm("Are you sure?")) {
    fetch(`${API}/DeleteStockLevel?id=${id}`, { method: "DELETE" })
      .then(res => { if (res.ok) loadStockLevels(); });
  }
}

loadStockLevels();