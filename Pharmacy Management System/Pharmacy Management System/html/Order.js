// ============================================================
// Order.js
// Logic for Order Management using api.js
// ============================================================

let newItems = [];
let allOrders = [];

// 1. UI LOGIC & LOAD
async function loadOrders() {
  try {
    const orders = await getAllOrders();
    allOrders = orders || [];
    renderOrders(allOrders);
  } catch (err) {
    console.error("Failed to load orders:", err);
    const tbody = document.getElementById("ordersTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Error loading orders: ${err.message}</td></tr>`;
    }
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No orders found.</td></tr>`;
    return;
  }

  const statuses = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Ready",
    "Completed",
    "Cancelled",
  ];

  tbody.innerHTML = orders
    .map((o) => {
      const orderId = o.orderId ?? o.OrderId;
      const orderDate = o.orderDate ?? o.OrderDate;
      const formattedDate = orderDate ? new Date(orderDate).toLocaleString() : "—";
      const userId = o.userId ?? o.UserId ?? "—";
      const branchId = o.branchId ?? o.BranchId ?? "—";
      const total = Number(o.totalAmount ?? o.TotalAmount ?? 0).toFixed(2);
      const currentStatus = o.status ?? o.Status ?? "Pending";

      return `
      <tr>
        <td class="fw-bold">#${orderId}</td>
        <td>${formattedDate}</td>
        <td>${userId}</td>
        <td>${branchId}</td>
        <td class="fw-semibold">${total} OMR</td>
        <td>
          <select class="form-select form-select-sm" style="max-width: 140px;" onchange="handleStatusChange(${orderId}, this.value)">
            ${statuses.map((s) => `<option ${currentStatus === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
        <td class="text-center text-nowrap">
          <button class="btn btn-sm btn-warning me-1" onclick="openEditOrderModal(${orderId}, ${userId}, ${branchId}, ${total}, '${currentStatus}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="handleDeleteOrder(${orderId})">Delete</button>
        </td>
      </tr>
    `;
    })
    .join("");
}

// 2. POPULATE DROPDOWNS
async function loadDropdowns() {
  try {
    const branches = await getBranches();
    const branchSelect = document.getElementById("orderBranch");
    if (branchSelect) {
      branchSelect.innerHTML =
        `<option value="">— select branch —</option>` +
        (branches || [])
          .map(
            (b) =>
              `<option value="${b.branchId ?? b.BranchId}">${b.branchName ?? b.BranchName ?? "Branch " + (b.branchId ?? b.BranchId)}</option>`,
          )
          .join("");
    }
  } catch {
    const branchSelect = document.getElementById("orderBranch");
    if (branchSelect) branchSelect.innerHTML = `<option value="">(couldn't load)</option>`;
  }

  try {
    const meds = await getMedicines();
    const medSelect = document.getElementById("itemMedicine");
    if (medSelect) {
      medSelect.innerHTML =
        `<option value="">— select medicine —</option>` +
        (meds || [])
          .map((m) => {
            const id = m.medicineId ?? m.MedicineId;
            const name = m.medicineName ?? m.MedicineName;
            const price = m.medicinePrice ?? m.MedicinePrice ?? m.price ?? 0;
            return `<option value="${id}" data-price="${price}">${name} (${Number(price).toFixed(2)} OMR)</option>`;
          })
          .join("");
    }
  } catch {
    const medSelect = document.getElementById("itemMedicine");
    if (medSelect) medSelect.innerHTML = `<option value="">(couldn't load)</option>`;
  }
}

// Auto-fill price field when medicine selection changes
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

// 3. ADD LINE ITEMS
document.getElementById("addItemBtn")?.addEventListener("click", () => {
  const select = document.getElementById("itemMedicine");
  const medId = parseInt(select.value);
  const qty = parseInt(document.getElementById("itemQty").value);
  const selectedOption = select.options[select.selectedIndex];
  const price = parseFloat(selectedOption?.getAttribute("data-price") || 0);

  if (!medId) return alert("Please select a medicine.");
  if (!qty || qty <= 0) return alert("Quantity must be greater than 0.");
  if (isNaN(price)) return alert("Invalid price.");

  const medName = selectedOption.text.split(" ($")[0];

  const existing = newItems.find((it) => it.medicineId === medId);
  if (existing) {
    existing.quantity += qty;
  } else {
    newItems.push({
      medicineId: medId,
      medicineName: medName,
      quantity: qty,
      unitPrice: price,
    });
  }

  renderNewItems();
  document.getElementById("itemQty").value = 1;
});

function renderNewItems() {
  const body = document.getElementById("newItemsBody");
  const totalCell = document.getElementById("newItemsTotal");
  if (!body) return;

  if (newItems.length === 0) {
    body.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-2">No items added yet.</td></tr>`;
    if (totalCell) totalCell.textContent = "$0.00";
    return;
  }

  let total = 0;
  body.innerHTML = newItems
    .map((it, i) => {
      const sub = it.quantity * it.unitPrice;
      total += sub;
      return `
      <tr>
        <td>${it.medicineName}</td>
        <td>${it.quantity}</td>
        <td>${it.unitPrice.toFixed(2)} OMR</td>
        <td>${sub.toFixed(2)} OMR</td>
        <td class="text-center"><button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="removeNewItem(${i})">×</button></td>
      </tr>`;
    })
    .join("");

  if (totalCell) totalCell.textContent = `${total.toFixed(2)} OMR`;
}

function removeNewItem(index) {
  newItems.splice(index, 1);
  renderNewItems();
}

// 4. CREATE ORDER
document.getElementById("createOrderBtn")?.addEventListener("click", async () => {
  const branchId = parseInt(document.getElementById("orderBranch").value);

  if (!branchId) return alert("Select a branch.");
  if (newItems.length === 0) return alert("Add at least one order item.");

  const totalAmount = newItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  const payload = {
    BranchId: branchId,
    OrderDate: new Date().toISOString(),
    TotalAmount: totalAmount,
    Status: "Pending",
    OrderItems: newItems.map((it) => ({
      MedicineId: it.medicineId,
      Quantity: it.quantity,
      UnitPrice: it.unitPrice,
    })),
  };

  try {
    await createOrder(payload);
    alert("Order created successfully!");
    newItems = [];
    renderNewItems();
    document.getElementById("orderBranch").value = "";
    loadOrders();
    loadSales();
  } catch (err) {
    alert(`Could not place order: ${err.message}`);
  }
});

// 5. UPDATE ORDER STATUS (PATCH)
async function handleStatusChange(id, status) {
  try {
    await updateOrderStatus(id, status);
    loadSales();
  } catch (err) {
    alert(`Status change failed: ${err.message}`);
    loadOrders();
  }
}

// 6. OPEN & SAVE EDIT ORDER MODAL
function openEditOrderModal(id, userId, branchId, totalAmount, status) {
  document.getElementById("editOrderId").value = id;
  document.getElementById("editUserId").value = isNaN(userId) ? "" : userId;
  document.getElementById("editBranchId").value = isNaN(branchId) ? "" : branchId;
  document.getElementById("editTotalAmount").value = totalAmount;
  document.getElementById("editStatusSelect").value = status || "Pending";

  const modal = new bootstrap.Modal(document.getElementById("editOrderModal"));
  modal.show();
}

document.getElementById("saveEditBtn")?.addEventListener("click", async () => {
  const id = parseInt(document.getElementById("editOrderId").value);
  const updatedOrder = {
    orderId: id,
    userId: parseInt(document.getElementById("editUserId").value),
    branchId: parseInt(document.getElementById("editBranchId").value),
    totalAmount: parseFloat(document.getElementById("editTotalAmount").value),
    status: document.getElementById("editStatusSelect").value,
  };

  try {
    await updateOrder(id, updatedOrder);
    alert("Order updated successfully!");

    const modalEl = document.getElementById("editOrderModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    loadOrders();
    loadSales();
  } catch (err) {
    alert(`Update failed: ${err.message}`);
  }
});

// 7. DELETE ORDER
async function handleDeleteOrder(id) {
  if (!confirm(`Are you sure you want to delete order #${id}?`)) return;
  try {
    await deleteOrder(id);
    loadOrders();
    loadSales();
  } catch (err) {
    alert(`Delete failed: ${err.message}`);
  }
}

// 8. SALES SUMMARY
async function loadSales() {
  try {
    const s = await getSalesSummary();
    const summaryContainer = document.getElementById("salesSummary");
    if (!summaryContainer) return;

    summaryContainer.innerHTML = `
      <div class="row text-center g-3">
        <div class="col-6 col-md-3">
          <div class="h3 fw-bold text-primary mb-0">${s.totalOrders ?? 0}</div>
          <div class="text-muted small">Total Orders</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="h3 fw-bold text-success mb-0">${Number(s.totalSales ?? 0).toFixed(2)} OMR</div>
          <div class="text-muted small">Total Sales</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="h3 fw-bold text-info mb-0">${Number(s.averageOrderValue ?? 0).toFixed(2)} OMR</div>
          <div class="text-muted small">Average Order</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="h3 fw-bold text-warning mb-0">${Number(s.highestOrderValue ?? 0).toFixed(2)} OMR</div>
          <div class="text-muted small">Highest Value</div>
        </div>
      </div>`;
  } catch (err) {
    console.error("Failed to load sales summary:", err);
  }
}

// 9. FILTER LOGIC
document.getElementById("applyFilterBtn")?.addEventListener("click", async () => {
  const status = document.getElementById("filterStatus").value;
  const fromDate = document.getElementById("filterFrom").value;
  const toDate = document.getElementById("filterTo").value;

  try {
    const filtered = await filterOrders({ status, fromDate, toDate });
    renderOrders(filtered);
  } catch (err) {
    // Client side fallback
    let results = allOrders;
    if (status) results = results.filter((o) => (o.status || o.Status) === status);
    if (fromDate) results = results.filter((o) => new Date(o.orderDate || o.OrderDate) >= new Date(fromDate));
    if (toDate) results = results.filter((o) => new Date(o.orderDate || o.OrderDate) <= new Date(toDate));
    renderOrders(results);
  }
});

document.getElementById("clearFilterBtn")?.addEventListener("click", () => {
  document.getElementById("filterStatus").value = "";
  document.getElementById("filterFrom").value = "";
  document.getElementById("filterTo").value = "";
  renderOrders(allOrders);
});

// INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshBtn")?.addEventListener("click", loadOrders);
  loadDropdowns();
  loadOrders();
  loadSales();
});
