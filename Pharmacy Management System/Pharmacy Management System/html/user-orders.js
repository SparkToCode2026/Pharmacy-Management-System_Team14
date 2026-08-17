// ============================================================
// user-orders.js
// Logic for User Orders View & Placing New Orders
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
let modalOrderItems = []; // Array of { medicineId, medicineName, quantity, unitPrice }

// 1. Load user's orders history
async function loadUserOrders() {
  try {
    const tbody = document.getElementById("ordersTableBody");
    if (tbody) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center text-muted py-4">Loading your orders...</td></tr>';
    }

    // Cache branches & medicines for names lookup
    try {
      branchesCache = (await getBranches()) || [];
      medicinesCache = (await getMedicines()) || [];
    } catch (e) {
      console.warn("Error caching branches/medicines:", e);
    }

    populateModalDropdowns();

    // Fetch user's orders
    let orders = [];
    try {
      orders = await getMyOrders();
    } catch {
      orders = await getAllOrders();
    }

    userOrders = orders || [];
    if (!userOrders || userOrders.length === 0) {
      if (tbody) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="text-center text-muted py-4">You have not placed any orders yet.</td></tr>';
      }
      return;
    }

    // Check which orders already have a completed payment (parallel fetch)
    const paidOrderIds = new Set();
    await Promise.all(
      userOrders.map(async (order) => {
        const oid = order.orderId ?? order.OrderId;
        try {
          const payment = await getPaymentByOrderId(oid);
          const pStatus = payment
            ? (payment.paymentStatus ?? payment.PaymentStatus)
            : null;
          // 1 = Completed enum integer
          if (pStatus === 1 || pStatus === "Completed") {
            paidOrderIds.add(oid);
          }
        } catch {
          // 404 = no payment yet, ignore
        }
      }),
    );

    tbody.innerHTML = "";
    userOrders.forEach((order) => {
      const orderId = order.orderId ?? order.OrderId;
      const rawDate = order.orderDate ?? order.OrderDate;
      const orderDate = rawDate ? new Date(rawDate).toLocaleString() : "—";
      const totalAmount = Number(
        order.totalAmount ?? order.TotalAmount ?? 0,
      ).toFixed(2);
      const status = order.status ?? order.Status ?? "Pending";
      const branchId = order.branchId ?? order.BranchId;

      const branch = branchesCache.find(
        (b) => (b.branchId ?? b.BranchId) === branchId,
      );
      const branchName = branch
        ? branch.branchName ?? branch.BranchName
        : `Branch #${branchId}`;

      const statusBadge =
        status === "Completed"
          ? "bg-success"
          : status === "Pending"
            ? "bg-warning text-dark"
            : status === "Cancelled"
              ? "bg-danger"
              : "bg-info";

      const alreadyPaid = paidOrderIds.has(orderId);
      const isCancelled = status === "Cancelled";

      // Show Paid badge if payment exists, Pay button if not yet paid and not cancelled
      const paySection = alreadyPaid
        ? `<span class="badge bg-success ms-1 px-2 py-1">✓ Paid</span>`
        : !isCancelled && status !== "Completed"
          ? `<a href="payment.html?orderId=${orderId}&amount=${totalAmount}" class="btn btn-sm btn-success ms-1">💳 Pay</a>`
          : ``;

      tbody.innerHTML += `
        <tr>
          <td class="fw-bold">#${orderId}</td>
          <td>${orderDate}</td>
          <td>${branchName}</td>
          <td class="fw-bold text-success fs-6">${totalAmount} OMR</td>
          <td><span class="badge ${statusBadge}">${status}</span></td>
          <td class="text-center text-nowrap">
            <button class="btn btn-sm btn-primary" onclick="viewOrderDetails(${orderId})">
              View Items
            </button>${paySection}
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

// 2. Populate Dropdowns in Place Order Modal
function populateModalDropdowns() {
  const branchSelect = document.getElementById("modalOrderBranch");
  const medSelect = document.getElementById("modalItemMedicine");

  if (branchSelect) {
    branchSelect.innerHTML =
      '<option value="">— Select branch —</option>' +
      branchesCache
        .map((b) => {
          const id = b.branchId ?? b.BranchId;
          const name = b.branchName ?? b.BranchName ?? `Branch #${id}`;
          const city = b.branchCity ?? b.BranchCity ?? "";
          return `<option value="${id}">${name} ${city ? `(${city})` : ""}</option>`;
        })
        .join("");
  }

  if (medSelect) {
    medSelect.innerHTML =
      '<option value="">— Select medicine —</option>' +
      medicinesCache
        .map((m) => {
          const id = m.medicineId ?? m.MedicineId;
          const name = m.medicineName ?? m.MedicineName;
          const price = Number(
            m.medicinePrice ?? m.MedicinePrice ?? m.price ?? 0,
          ).toFixed(2);
          return `<option value="${id}" data-price="${price}">${name} (${price} OMR)</option>`;
        })
        .join("");
  }
}

// 3. Line Items Builder in Modal
document.getElementById("modalAddItemBtn")?.addEventListener("click", () => {
  const select = document.getElementById("modalItemMedicine");
  const medId = parseInt(select.value);
  const qty = parseInt(document.getElementById("modalItemQty").value);
  const selectedOption = select.options[select.selectedIndex];
  const price = parseFloat(selectedOption?.getAttribute("data-price") || 0);

  if (!medId) return alert("Please select a medicine.");
  if (!qty || qty <= 0) return alert("Quantity must be at least 1.");

  const medName = selectedOption.text.split(" (")[0];

  const existing = modalOrderItems.find((it) => it.medicineId === medId);
  if (existing) {
    existing.quantity += qty;
  } else {
    modalOrderItems.push({
      medicineId: medId,
      medicineName: medName,
      quantity: qty,
      unitPrice: price,
    });
  }

  renderModalItems();
  document.getElementById("modalItemQty").value = 1;
});

function renderModalItems() {
  const body = document.getElementById("modalItemsBody");
  const totalCell = document.getElementById("modalItemsTotal");
  if (!body) return;

  if (modalOrderItems.length === 0) {
    body.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-2">No items added to this order yet.</td></tr>`;
    if (totalCell) totalCell.textContent = "0.00 OMR";
    return;
  }

  let total = 0;
  body.innerHTML = modalOrderItems
    .map((it, i) => {
      const sub = it.quantity * it.unitPrice;
      total += sub;
      return `
      <tr>
        <td class="fw-semibold">${it.medicineName}</td>
        <td>${it.quantity}</td>
        <td>${it.unitPrice.toFixed(2)} OMR</td>
        <td>${sub.toFixed(2)} OMR</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="removeModalItem(${i})">×</button>
        </td>
      </tr>`;
    })
    .join("");

  if (totalCell) totalCell.textContent = `${total.toFixed(2)} OMR`;
}

function removeModalItem(index) {
  modalOrderItems.splice(index, 1);
  renderModalItems();
}

// 4. Submit Order from Modal
document
  .getElementById("submitUserOrderBtn")
  ?.addEventListener("click", async () => {
    const branchId = parseInt(
      document.getElementById("modalOrderBranch").value,
    );

    if (!branchId) return alert("Please select a branch.");
    if (modalOrderItems.length === 0)
      return alert("Please add at least one medicine to the order.");

    const totalAmount = modalOrderItems.reduce(
      (sum, it) => sum + it.quantity * it.unitPrice,
      0,
    );

    const payload = {
      BranchId: branchId,
      OrderDate: new Date().toISOString(),
      TotalAmount: totalAmount,
      Status: "Pending",
      OrderItems: modalOrderItems.map((it) => ({
        MedicineId: it.medicineId,
        Quantity: it.quantity,
        UnitPrice: it.unitPrice,
      })),
    };

    const submitBtn = document.getElementById("submitUserOrderBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Placing Order...";
    }

    try {
      const created = await createOrder(payload);
      const orderId = created.orderId ?? created.OrderId;
      const finalAmount = created.totalAmount ?? created.TotalAmount ?? totalAmount;

      // Reset modal state
      modalOrderItems = [];
      renderModalItems();
      document.getElementById("modalOrderBranch").value = "";

      const modalEl = document.getElementById("placeOrderModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();

      alert(`🎉 Order #${orderId} placed! Redirecting to payment checkout...`);

      // Redirect to payment with autofilled order data
      window.location.href = `payment.html?orderId=${orderId}&amount=${finalAmount}`;
    } catch (err) {
      alert(`Could not place order: ${err.message}`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "✓ Submit Order";
      }
    }
  });

// 5. View Order Details Modal
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
        const med = medicinesCache.find(
          (m) => (m.medicineId ?? m.MedicineId) === medId,
        );
        const medName = med
          ? med.medicineName ?? med.MedicineName
          : item.medicine
            ? item.medicine.medicineName ?? item.medicine.MedicineName
            : `Medicine #${medId}`;

        const qty = item.quantity ?? item.Quantity ?? 0;
        const price = Number(item.unitPrice ?? item.UnitPrice ?? 0).toFixed(2);
        const subtotal = Number(
          item.subtotal ?? item.Subtotal ?? price * qty,
        ).toFixed(2);

        itemsHtml += `
          <tr>
            <td class="fw-semibold">${medName}</td>
            <td>${qty}</td>
            <td>${price} OMR</td>
            <td class="fw-bold text-success">${subtotal} OMR</td>
          </tr>
        `;
      });
    } else {
      itemsHtml = `<tr><td colspan="4" class="text-center text-muted">No line item details found.</td></tr>`;
    }

    const rawDate = order.orderDate ?? order.OrderDate;
    const orderDate = rawDate ? new Date(rawDate).toLocaleString() : "—";
    const totalAmount = Number(
      order.totalAmount ?? order.TotalAmount ?? 0,
    ).toFixed(2);
    const status = order.status ?? order.Status ?? "Pending";

    const content = `
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <p class="mb-1"><strong>Order ID:</strong> #${orderId}</p>
          <p class="mb-1"><strong>Date Placed:</strong> ${orderDate}</p>
        </div>
        <div class="col-md-6">
          <p class="mb-1"><strong>Status:</strong> <span class="badge bg-secondary">${status}</span></p>
          <p class="mb-1"><strong>Total Amount:</strong> <span class="fw-bold text-success fs-5">${totalAmount} OMR</span></p>
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
