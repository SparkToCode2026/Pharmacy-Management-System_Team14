// Order.js — logic for orders.html

// --- CONFIG ---
const API = "https://localhost:7293/api/Order";
const BRANCHES_API = "https://localhost:7293/api/Branch/GetAllBranch";
const MEDICINES_API = "https://localhost:7293/api/Medicine/GetAllMedicines";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
];

let newItems = [];
let medicineCache = [];

// --- AUTH HELPER ---
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// --- LOAD ORDERS ---
function loadOrders() {
  fetch(`${API}/GetAllOrders`, {
    headers: getAuthHeaders(),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(renderOrders)
    .catch((err) => {
      console.error("Failed to load orders:", err);
      document.getElementById("ordersTableBody").innerHTML =
        `<tr><td colspan="7" class="text-center text-danger">Error connecting to server.</td></tr>`;
    });
}

function renderOrders(orders) {
  const tbody = document.getElementById("ordersTableBody");
  if (!orders || orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">No orders found.</td></tr>`;
    return;
  }
  tbody.innerHTML = orders
    .map((o) => {
      const statusOptions = ORDER_STATUSES.map(
        (s) => `<option ${o.status === s ? "selected" : ""}>${s}</option>`,
      ).join("");
      return `
        <tr>
            <td>${o.orderId}</td>
            <td>${formatDate(o.orderDate)}</td>
            <td>${o.userId}</td>
            <td>${o.branchId ?? ""}</td>
            <td>${Number(o.totalAmount).toFixed(2)}</td>
            <td>
                <select class="form-select form-select-sm"
                        onchange="updateStatus(${o.orderId}, this.value)">
                    ${statusOptions}
                </select>
            </td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-warning me-1"
                        onclick="editOrder(${o.orderId}, ${o.userId}, '${o.orderDate}')">Edit</button>
                <button class="btn btn-sm btn-danger"
                        onclick="deleteOrder(${o.orderId})">Delete</button>
            </td>
        </tr>`;
    })
    .join("");
}

// --- ADD LINE ITEMS FOR NEW ORDER ---
document.getElementById("addItemBtn").addEventListener("click", () => {
  const medId = parseInt(document.getElementById("itemMedicine").value);
  const qty = parseInt(document.getElementById("itemQty").value);
  const price = parseFloat(document.getElementById("itemPrice").value);

  if (!medId) {
    alert("Pick a medicine.");
    return;
  }
  if (!qty || qty <= 0) {
    alert("Quantity must be greater than 0.");
    return;
  }
  if (isNaN(price) || price < 0) {
    alert("Enter a valid unit price.");
    return;
  }

  const med = medicineCache.find((m) => m.medicineId === medId);
  newItems.push({
    medicineId: medId,
    medicineName: med ? med.medicineName : `#${medId}`,
    quantity: qty,
    unitPrice: price,
  });

  renderNewItems();
});

function renderNewItems() {
  const body = document.getElementById("newItemsBody");
  const totalCell = document.getElementById("newItemsTotal");

  if (newItems.length === 0) {
    body.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No items added yet.</td></tr>`;
    totalCell.textContent = "0.00";
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
            <td>${it.unitPrice.toFixed(2)}</td>
            <td>${sub.toFixed(2)}</td>
            <td><button class="btn btn-sm btn-outline-danger" onclick="removeNewItem(${i})">×</button></td>
        </tr>`;
    })
    .join("");

  totalCell.textContent = total.toFixed(2);
}

function removeNewItem(index) {
  newItems.splice(index, 1);
  renderNewItems();
}

// --- CREATE ORDER ---
document.getElementById("createOrderBtn").addEventListener("click", () => {
  const branchId = parseInt(document.getElementById("orderBranch").value);

  if (!branchId) {
    alert("Select a branch.");
    return;
  }
  if (newItems.length === 0) {
    alert("Add at least one order item.");
    return;
  }

  const payload = {
    branchId: branchId,
    orderItems: newItems.map((it) => ({
      medicineId: it.medicineId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
  };

  fetch(`${API}/CreateOrder`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      if (res.ok) {
        newItems = [];
        renderNewItems();
        document.getElementById("orderBranch").value = "";
        loadOrders();
        loadSalesSummary();
      } else {
        alert(`Could not place order: ${await res.text()}`);
      }
    })
    .catch((err) => console.error("Error placing order:", err));
});

// --- EDIT ORDER ---
function editOrder(id, userId, orderDate) {
  document.getElementById("editOrderId").value = id;
  document.getElementById("editOrderUserId").value = userId;
  document.getElementById("editOrderDate").value = orderDate
    ? orderDate.slice(0, 16)
    : "";
  new bootstrap.Modal(document.getElementById("editOrderModal")).show();
}

document.getElementById("saveEditBtn").addEventListener("click", () => {
  const id = document.getElementById("editOrderId").value;
  const updated = {
    orderId: parseInt(id),
    userId: parseInt(document.getElementById("editOrderUserId").value),
    orderDate: document.getElementById("editOrderDate").value,
  };

  fetch(`${API}/UpdateOrder?id=${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updated),
  })
    .then(async (res) => {
      if (res.ok) {
        bootstrap.Modal.getInstance(
          document.getElementById("editOrderModal"),
        ).hide();
        loadOrders();
      } else {
        alert(`Update failed: ${await res.text()}`);
      }
    })
    .catch((err) => console.error("Error updating order:", err));
});

// --- CHANGE STATUS ---
function updateStatus(id, status) {
  fetch(
    `${API}/UpdateOrderStatus?id=${id}&status=${encodeURIComponent(status)}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    },
  )
    .then(async (res) => {
      if (!res.ok) {
        alert(`Status change failed: ${await res.text()}`);
        loadOrders();
      } else {
        loadSalesSummary();
      }
    })
    .catch((err) => console.error("Error changing status:", err));
}

// --- DELETE ORDER ---
function deleteOrder(id) {
  if (!confirm(`Delete order #${id}? This also removes its items.`)) return;

  fetch(`${API}/DeleteOrder?id=${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
    .then(async (res) => {
      if (res.ok || res.status === 204) {
        loadOrders();
        loadSalesSummary();
      } else {
        alert(`Delete failed: ${await res.text()}`);
      }
    })
    .catch((err) => console.error("Error deleting order:", err));
}

// --- FILTER ---
document.getElementById("applyFilterBtn").addEventListener("click", () => {
  const status = document.getElementById("filterStatus").value;
  const from = document.getElementById("filterFrom").value;
  const to = document.getElementById("filterTo").value;

  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (from) params.append("fromDate", from);
  if (to) params.append("toDate", to);

  fetch(`${API}/FilterOrders?${params.toString()}`, {
    headers: getAuthHeaders(),
  })
    .then((res) => res.json())
    .then(renderOrders)
    .catch((err) => console.error("Filter error:", err));
});

document.getElementById("clearFilterBtn").addEventListener("click", () => {
  document.getElementById("filterStatus").value = "";
  document.getElementById("filterFrom").value = "";
  document.getElementById("filterTo").value = "";
  loadOrders();
});

// --- SALES SUMMARY ---
function loadSalesSummary() {
  fetch(`${API}/sales-summary`, {
    headers: getAuthHeaders(),
  })
    .then((res) => res.json())
    .then((s) => {
      document.getElementById("salesSummary").innerHTML = `
            <div class="row text-center">
                <div class="col"><div class="h4">${s.totalOrders}</div><div class="text-muted">Orders</div></div>
                <div class="col"><div class="h4">${Number(s.totalSales).toFixed(2)}</div><div class="text-muted">Total sales</div></div>
                <div class="col"><div class="h4">${Number(s.averageOrderValue).toFixed(2)}</div><div class="text-muted">Avg order</div></div>
                <div class="col"><div class="h4">${Number(s.highestOrderValue).toFixed(2)}</div><div class="text-muted">Highest</div></div>
            </div>`;
    })
    .catch((err) => console.error("Summary error:", err));
}

// --- DROPDOWNS ---
function loadDropdowns() {
  fetch(BRANCHES_API, { headers: getAuthHeaders() })
    .then((r) => r.json())
    .then((branches) => {
      document.getElementById("orderBranch").innerHTML =
        `<option value="">— select —</option>` +
        branches
          .map(
            (b) =>
              `<option value="${b.branchId}">${b.branchName || "Branch " + b.branchId}</option>`,
          )
          .join("");
    })
    .catch(() => setDropdownError("orderBranch"));

  fetch(MEDICINES_API, { headers: getAuthHeaders() })
    .then((r) => r.json())
    .then((meds) => {
      medicineCache = meds;
      document.getElementById("itemMedicine").innerHTML =
        `<option value="">— select —</option>` +
        meds
          .map(
            (m) => `<option value="${m.medicineId}">${m.medicineName}</option>`,
          )
          .join("");
    })
    .catch(() => setDropdownError("itemMedicine"));
}

function setDropdownError(id) {
  document.getElementById(id).innerHTML =
    `<option value="">(couldn't load)</option>`;
}

// --- HELPERS ---
function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleString();
}

// --- INIT ---
document.getElementById("refreshBtn").addEventListener("click", loadOrders);
loadDropdowns();
loadOrders();
loadSalesSummary();
