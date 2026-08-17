// ============================================================
// OrderItem.js
// Logic for Order Item Management using api.js
// ============================================================

let medicineCache = [];
let allOrderItems = [];

// 1. UI LOGIC & LOAD
async function loadItems(url) {
  try {
    const items = await apiGetOrderItems(url);
    allOrderItems = items || [];
    renderItems(allOrderItems);
  } catch (err) {
    console.error("Failed to load order items:", err);
    const tbody = document.getElementById("itemsTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Error loading order items: ${err.message}</td></tr>`;
    }
  }
}

function renderItems(items) {
  const tbody = document.getElementById("itemsTableBody");
  if (!tbody) return;

  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No order items found.</td></tr>`;
    return;
  }

  tbody.innerHTML = items
    .map((it) => {
      const id = it.orderItemId ?? it.OrderItemId;
      const orderId = it.orderId ?? it.OrderId;
      const medId = it.medicineId ?? it.MedicineId;
      const med = medicineCache.find((m) => (m.medicineId ?? m.MedicineId) === medId);
      const medName = med
        ? (med.medicineName ?? med.MedicineName)
        : it.medicine
          ? (it.medicine.medicineName ?? it.medicine.MedicineName)
          : `#${medId}`;
      const qty = it.quantity ?? it.Quantity ?? 0;
      const unitPrice = it.unitPrice ?? it.UnitPrice ?? 0;
      const subtotal = it.subtotal ?? it.Subtotal ?? unitPrice * qty;

      return `
      <tr>
        <td class="fw-bold">${id}</td>
        <td>#${orderId}</td>
        <td class="fw-semibold">${medName}</td>
        <td>${qty}</td>
        <td>${Number(unitPrice).toFixed(2)} OMR</td>
        <td><strong>${Number(subtotal).toFixed(2)} OMR</strong></td>
        <td class="text-center text-nowrap">
          <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${id}, ${medId}, ${qty}, ${unitPrice})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="handleDeleteItem(${id})">Delete</button>
        </td>
      </tr>`;
    })
    .join("");
}

// 2. POPULATE DROPDOWNS
async function loadDropdowns() {
  try {
    const orders = await getOrders();
    const orderSelect = document.getElementById("itemOrder");
    const filterSelect = document.getElementById("filterOrder");

    const orderOptions =
      `<option value="">— select order —</option>` +
      (orders || [])
        .map((o) => {
          const id = o.orderId ?? o.OrderId;
          return `<option value="${id}">Order #${id}</option>`;
        })
        .join("");

    if (orderSelect) orderSelect.innerHTML = orderOptions;
    if (filterSelect) {
      filterSelect.innerHTML =
        `<option value="">All orders</option>` +
        (orders || [])
          .map((o) => {
            const id = o.orderId ?? o.OrderId;
            return `<option value="${id}">Order #${id}</option>`;
          })
          .join("");
    }
  } catch (err) {
    console.error("Error loading orders for dropdown:", err);
  }

  try {
    const meds = await getMedicines();
    medicineCache = meds || [];

    const medOptions =
      `<option value="">— select medicine —</option>` +
      medicineCache
        .map((m) => {
          const id = m.medicineId ?? m.MedicineId;
          const name = m.medicineName ?? m.MedicineName;
          const price = m.medicinePrice ?? m.MedicinePrice ?? m.price ?? 0;
          return `<option value="${id}" data-price="${price}">${name} (${Number(price).toFixed(2)} OMR)</option>`;
        })
        .join("");

    const itemMedSelect = document.getElementById("itemMedicine");
    const editMedSelect = document.getElementById("editMedicine");
    if (itemMedSelect) itemMedSelect.innerHTML = medOptions;
    if (editMedSelect) editMedSelect.innerHTML = medOptions;
  } catch (err) {
    console.error("Error loading medicines for dropdown:", err);
  }
}

// Auto-fill price on medicine selection
document.getElementById("itemMedicine")?.addEventListener("change", (e) => {
  const selectedOption = e.target.options[e.target.selectedIndex];
  const priceInput = document.getElementById("itemPrice");

  if (!e.target.value) {
    if (priceInput) priceInput.value = "";
    return;
  }

  const price = parseFloat(selectedOption.getAttribute("data-price") || 0);
  if (priceInput) priceInput.value = price.toFixed(2);
});

// Auto-fill price on edit medicine selection
document.getElementById("editMedicine")?.addEventListener("change", (e) => {
  const selectedOption = e.target.options[e.target.selectedIndex];
  const priceInput = document.getElementById("editPrice");
  if (!e.target.value) return;

  const price = parseFloat(selectedOption.getAttribute("data-price") || 0);
  if (priceInput) priceInput.value = price.toFixed(2);
});

// 3. ADD ORDER ITEM
document.getElementById("addItemBtn")?.addEventListener("click", async () => {
  const orderId = parseInt(document.getElementById("itemOrder").value);
  const medicineId = parseInt(document.getElementById("itemMedicine").value);
  const quantity = parseInt(document.getElementById("itemQty").value);
  const unitPrice = parseFloat(document.getElementById("itemPrice").value);

  if (!orderId) return alert("Select an order.");
  if (!medicineId) return alert("Select a medicine.");
  if (!quantity || quantity <= 0) return alert("Quantity must be greater than 0.");
  if (isNaN(unitPrice) || unitPrice < 0) return alert("Enter a valid unit price.");

  try {
    await apiCreateOrderItem({ orderId, medicineId, quantity, unitPrice });
    alert("Order item added successfully!");
    document.getElementById("itemQty").value = 1;
    document.getElementById("itemPrice").value = "";
    document.getElementById("itemMedicine").value = "";
    loadItems();
  } catch (err) {
    alert(`Could not add item: ${err.message}`);
  }
});

// 4. EDIT MODAL
function openEditModal(id, medicineId, qty, price) {
  document.getElementById("editItemId").value = id;
  document.getElementById("editMedicine").value = medicineId;
  document.getElementById("editQty").value = qty;
  document.getElementById("editPrice").value = price;

  const modal = new bootstrap.Modal(document.getElementById("editItemModal"));
  modal.show();
}

// 5. SAVE EDIT
document.getElementById("saveEditBtn")?.addEventListener("click", async () => {
  const id = parseInt(document.getElementById("editItemId").value);
  const body = {
    orderItemId: id,
    medicineId: parseInt(document.getElementById("editMedicine").value),
    quantity: parseInt(document.getElementById("editQty").value),
    unitPrice: parseFloat(document.getElementById("editPrice").value),
  };

  try {
    await apiUpdateOrderItem(id, body);
    alert("Order item updated successfully!");
    const modalEl = document.getElementById("editItemModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
    loadItems();
  } catch (err) {
    alert(`Update failed: ${err.message}`);
  }
});

// 6. DELETE ORDER ITEM
async function handleDeleteItem(id) {
  if (!confirm(`Are you sure you want to delete order item #${id}?`)) return;

  try {
    await apiDeleteOrderItem(id);
    alert("Order item deleted successfully!");
    loadItems();
  } catch (err) {
    alert(`Delete failed: ${err.message}`);
  }
}

// 7. FILTER LOGIC
document.getElementById("applyFilterBtn")?.addEventListener("click", async () => {
  const orderId = document.getElementById("filterOrder").value;
  if (orderId) {
    try {
      const items = await apiFilterOrderItems(orderId);
      renderItems(items);
    } catch {
      // Client filter fallback
      const filtered = allOrderItems.filter(
        (it) => String(it.orderId ?? it.OrderId) === String(orderId),
      );
      renderItems(filtered);
    }
  } else {
    loadItems();
  }
});

document.getElementById("clearFilterBtn")?.addEventListener("click", () => {
  document.getElementById("filterOrder").value = "";
  loadItems();
});

document.getElementById("refreshBtn")?.addEventListener("click", () => loadItems());

// INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  loadDropdowns();
  loadItems();
});
