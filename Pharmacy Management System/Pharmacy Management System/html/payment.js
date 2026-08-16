// ============================================================
// payment.js
// Logic for Payment Management using api.js
// ============================================================

const PAYMENT_METHODS = ["Cash", "CreditCard", "DebitCard", "Insurance"];
const PAYMENT_STATUSES = ["Pending", "Completed", "Failed", "Refunded"];

let allPayments = [];

// Set Today's Date Default for Payment Input
function setDefaultDate() {
  const paymentDateInput = document.getElementById("paymentDate");
  if (paymentDateInput && !paymentDateInput.value) {
    paymentDateInput.value = new Date().toISOString().split("T")[0];
  }
}

// 1. GET ALL PAYMENTS
async function loadPayments() {
  try {
    const payments = await apiGetPayments();
    allPayments = payments || [];
    renderPayments(allPayments);
  } catch (err) {
    console.error("Load failed:", err);
    const tbody = document.getElementById("paymentTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Failed to load payments: ${err.message}</td></tr>`;
    }
  }
}

function renderPayments(payments) {
  const tbody = document.getElementById("paymentTableBody");
  if (!tbody) return;

  if (!payments || payments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No payment records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = payments
    .map((p) => {
      const id = p.paymentId ?? p.PaymentId;
      const amount = Number(p.amount ?? p.Amount ?? 0).toFixed(2);
      const rawDate = p.paymentDate ?? p.PaymentDate;
      const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString() : "—";
      const isoDate = rawDate ? rawDate.split("T")[0] : "";
      const method = formatPaymentEnum(p.paymentMethod ?? p.PaymentMethod, PAYMENT_METHODS);
      const status = formatPaymentEnum(p.paymentStatus ?? p.PaymentStatus, PAYMENT_STATUSES);
      const orderId = p.orderId ?? p.OrderId ?? "—";

      return `
        <tr>
            <td class="fw-bold">#${id}</td>
            <td class="fw-semibold text-success">$${amount}</td>
            <td>${formattedDate}</td>
            <td>${method}</td>
            <td>${statusBadge(status)}</td>
            <td>#${orderId}</td>
            <td class="text-center text-nowrap">
                <button class="btn btn-sm btn-warning me-1" onclick="editPayment(${id}, ${amount}, '${isoDate}', '${method}', '${status}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePaymentAction(${id})">Delete</button>
            </td>
        </tr>`;
    })
    .join("");
}

function formatPaymentEnum(val, list) {
  if (typeof val === "number") {
    return list[val] || list[0];
  }
  return val || list[0];
}

function statusBadge(status) {
  const colors = {
    Completed: "success",
    Pending: "warning text-dark",
    Failed: "danger",
    Refunded: "secondary",
  };
  return `<span class="badge bg-${colors[status] || "secondary"}">${status}</span>`;
}

// 2. CREATE PAYMENT
document.getElementById("paymentForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPayment = {
    amount: parseFloat(document.getElementById("paymentAmount").value),
    paymentDate: document.getElementById("paymentDate").value,
    paymentMethod: document.getElementById("paymentMethod").value,
    paymentStatus: document.getElementById("paymentStatus").value,
    orderId: parseInt(document.getElementById("orderId").value),
  };

  try {
    await apiCreatePayment(newPayment);
    alert("Payment recorded successfully!");
    document.getElementById("paymentForm").reset();
    setDefaultDate();
    loadPayments();
  } catch (err) {
    console.error("Create payment error:", err);
    alert(`Could not add payment: ${err.message}`);
  }
});

// 3. EDIT POPULATE
function editPayment(id, amount, date, method, status) {
  document.getElementById("editPaymentId").value = id;
  document.getElementById("editPaymentAmount").value = amount;
  document.getElementById("editPaymentDate").value = date;
  document.getElementById("editPaymentMethod").value = method;
  document.getElementById("editPaymentStatus").value = status;

  const modal = new bootstrap.Modal(document.getElementById("editPaymentModal"));
  modal.show();
}

// 4. UPDATE PAYMENT
document.getElementById("editPaymentForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editPaymentId").value;
  const updatedData = {
    paymentId: parseInt(id),
    amount: parseFloat(document.getElementById("editPaymentAmount").value),
    paymentDate: document.getElementById("editPaymentDate").value,
    paymentMethod: document.getElementById("editPaymentMethod").value,
    paymentStatus: document.getElementById("editPaymentStatus").value,
  };

  try {
    await apiUpdatePayment(id, updatedData);
    alert("Payment updated successfully!");
    const modalEl = document.getElementById("editPaymentModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
    loadPayments();
  } catch (err) {
    console.error("Update payment error:", err);
    alert(`Update failed: ${err.message}`);
  }
});

// 5. DELETE PAYMENT
async function deletePaymentAction(id) {
  if (!confirm("Are you sure you want to delete this payment record?")) return;

  try {
    await apiDeletePayment(id);
    alert("Payment deleted successfully!");
    loadPayments();
  } catch (err) {
    console.error("Delete payment error:", err);
    alert(`Delete failed: ${err.message}`);
  }
}

// 6. FILTER BY STATUS
document.getElementById("filterStatusSelect")?.addEventListener("change", async (e) => {
  const status = e.target.value;
  if (status) {
    try {
      const filtered = await apiFilterPaymentsByStatus(status);
      renderPayments(filtered);
    } catch {
      const results = allPayments.filter((p) => {
        const pStatus = formatPaymentEnum(p.paymentStatus ?? p.PaymentStatus, PAYMENT_STATUSES);
        return pStatus === status;
      });
      renderPayments(results);
    }
  } else {
    renderPayments(allPayments);
  }
});

// INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refreshPayments")?.addEventListener("click", loadPayments);
  setDefaultDate();
  loadPayments();
});
