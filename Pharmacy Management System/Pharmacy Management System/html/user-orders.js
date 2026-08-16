// ============================================================
// user-orders.js
// Logic for User Orders View using api.js
// ============================================================

function checkAccess() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "auth.html";
    return false;
  }
  return true;
}

let userOrders = [];
let branchesCache = [];
let medicinesCache = [];

// Load user's orders
async function loadUserOrders() {
  try {
    const tbody = document.getElementById("ordersTableBody");
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Loading your orders...</td></tr>';
    }

    // Attempt getMyOrders first; fallback to getAllOrders if admin
    let orders = [];
    try {
      orders = await getMyOrders();
    } catch {
      orders = await getAllOrders();
    }

    userOrders = orders || [];
    if (!userOrders || userOrders.length === 0) {
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">You have not placed any orders yet.</td></tr>';
      }
      return;
    }

    try {
      branchesCache = (await getBranches()) || [];
      medicinesCache = (await getMedicines()) || [];
    } catch (e) {
      console.warn("Error caching branches/medicines:", e);
    }

    tbody.innerHTML = "";
    userOrders.forEach((order) => {
      const orderId = order.orderId ?? order.OrderId;
      const rawDate = order.orderDate ?? order.OrderDate;
      const orderDate = rawDate ? new Date(rawDate).toLocaleDateString() : "—";
      const totalAmount = Number(order.totalAmount ?? order.TotalAmount ?? 0).toFixed(2);
      const status = order.status ?? order.Status ?? "Pending";
      const branchId = order.branchId ?? order.BranchId;

      const branch = branchesCache.find((b) => (b.branchId ?? b.BranchId) === branchId);
      const branchName = branch ? (branch.branchName ?? branch.BranchName) : `Branch #${branchId}`;

      const statusBadge =
        status === "Completed"
          ? "bg-success"
          : status === "Pending"
            ? "bg-warning text-dark"
            : status === "Cancelled"
              ? "bg-danger"
              : "bg-info";

      tbody.innerHTML += `
        <tr>
          <td class="fw-bold">#${orderId}</td>
          <td>${orderDate}</td>
          <td>${branchName}</td>
          <td class="fw-semibold text-success">$${totalAmount}</td>
          <td><span class="badge ${statusBadge}">${status}</span></td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="viewOrderDetails(${orderId})">
              View Items
            </button>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error loading orders:", error);
    const tbody = document.getElementById("ordersTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Error loading orders: ${error.message}</td></tr>`;
    }
  }
}

// View order details modal
async function viewOrderDetails(orderId) {
  try {
    const order = userOrders.find((o) => (o.orderId ?? o.OrderId) === orderId);
    if (!order) {
      alert("Order details not found.");
      return;
    }

    let items = order.orderItems || order.OrderItems || [];

    if (!items || items.length === 0) {
      try {
        items = await apiFilterOrderItems(orderId);
      } catch {
        items = [];
      }
    }

    let itemsHtml = "";
    if (items && items.length > 0) {
      items.forEach((item) => {
        const medId = item.medicineId ?? item.MedicineId;
        const med = medicinesCache.find((m) => (m.medicineId ?? m.MedicineId) === medId);
        const medName = med
          ? (med.medicineName ?? med.MedicineName)
          : item.medicine
            ? (item.medicine.medicineName ?? item.medicine.MedicineName)
            : `Medicine #${medId}`;

        const qty = item.quantity ?? item.Quantity ?? 0;
        const price = Number(item.unitPrice ?? item.UnitPrice ?? 0).toFixed(2);
        const subtotal = Number(item.subtotal ?? item.Subtotal ?? price * qty).toFixed(2);

        itemsHtml += `
          <tr>
            <td class="fw-semibold">${medName}</td>
            <td>${qty}</td>
            <td>$${price}</td>
            <td class="fw-bold">$${subtotal}</td>
          </tr>
        `;
      });
    } else {
      itemsHtml = `<tr><td colspan="4" class="text-center text-muted">No line item details found.</td></tr>`;
    }

    const rawDate = order.orderDate ?? order.OrderDate;
    const orderDate = rawDate ? new Date(rawDate).toLocaleString() : "—";
    const totalAmount = Number(order.totalAmount ?? order.TotalAmount ?? 0).toFixed(2);
    const status = order.status ?? order.Status ?? "Pending";

    const content = `
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <p class="mb-1"><strong>Order ID:</strong> #${orderId}</p>
          <p class="mb-1"><strong>Date Placed:</strong> ${orderDate}</p>
        </div>
        <div class="col-md-6">
          <p class="mb-1"><strong>Status:</strong> <span class="badge bg-secondary">${status}</span></p>
          <p class="mb-1"><strong>Total Amount:</strong> <span class="fw-bold text-success fs-5">$${totalAmount}</span></p>
        </div>
      </div>

      <h6 class="fw-bold text-primary mt-3 mb-2">Order Line Items</h6>
      <div class="table-responsive">
        <table class="table table-bordered table-sm align-middle">
          <thead class="table-light">
            <tr>
              <th>Medicine</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById("orderDetailsContent").innerHTML = content;
    new bootstrap.Modal(document.getElementById("orderDetailsModal")).show();
  } catch (error) {
    console.error("Error loading order details:", error);
    alert("Error loading order details: " + error.message);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (checkAccess()) {
    loadUserOrders();
  }
});
