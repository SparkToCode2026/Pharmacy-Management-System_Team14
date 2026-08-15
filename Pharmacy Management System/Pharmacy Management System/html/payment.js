// Payment.js — Logic for Payment Management

const API = "https://localhost:7293/api/Payment";

const PAYMENT_METHOD_LABELS = ["Cash", "CreditCard", "DebitCard", "Insurance"];
const PAYMENT_STATUS_LABELS = ["Pending", "Completed", "Failed", "Refunded"];
const PAYMENT_METHOD_MAP = {
  Cash: 0,
  CreditCard: 1,
  DebitCard: 2,
  Insurance: 3,
};
const PAYMENT_STATUS_MAP = { Pending: 0, Completed: 1, Failed: 2, Refunded: 3 };

// Auth Helper
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Set Today's Date Default for Payment Input
function setDefaultDate() {
  const paymentDateInput = document.getElementById("paymentDate");
  if (paymentDateInput && !paymentDateInput.value) {
    paymentDateInput.value = new Date().toISOString().split("T")[0];
  }
}

// 1. GET ALL PAYMENTS
function loadPayments() {
  fetch(`${API}/GetAllPayments`, {
    headers: getAuthHeaders(),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return res.json();
    })
    .then((payments) => {
      const tbody = document.getElementById("paymentTableBody");
      if (!payments || payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No records found.</td></tr>`;
        return;
      }
      tbody.innerHTML = payments
        .map((p) => {
          const methodLabel =
            PAYMENT_METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod;
          const statusLabel =
            PAYMENT_STATUS_LABELS[p.paymentStatus] ?? p.paymentStatus;
          const formattedDate = p.paymentDate
            ? p.paymentDate.split("T")[0]
            : "";

          return `
            <tr>
                <td>${p.paymentId}</td>
                <td>$${Number(p.amount).toFixed(2)}</td>
                <td>${formattedDate}</td>
                <td>${methodLabel}</td>
                <td>${statusBadge(statusLabel)}</td>
                <td>${p.orderId}</td>
                <td class="text-center text-nowrap">
                    <button class="btn btn-sm btn-warning me-1" onclick="editPayment(${p.paymentId}, ${p.amount}, '${formattedDate}', '${methodLabel}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deletePayment(${p.paymentId})">Delete</button>
                </td>
            </tr>`;
        })
        .join("");
    })
    .catch((err) => {
      console.error("Load failed:", err);
      const tbody = document.getElementById("paymentTableBody");
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load payments from server.</td></tr>`;
    });
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
document.getElementById("paymentForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const newPayment = {
    amount: parseFloat(document.getElementById("paymentAmount").value),
    paymentDate: document.getElementById("paymentDate").value,
    paymentMethod:
      PAYMENT_METHOD_MAP[document.getElementById("paymentMethod").value],
    paymentStatus:
      PAYMENT_STATUS_MAP[document.getElementById("paymentStatus").value],
    orderId: parseInt(document.getElementById("orderId").value),
  };

  fetch(`${API}/CreatePayment`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(newPayment),
  })
    .then(async (res) => {
      if (res.ok) {
        document.getElementById("paymentForm").reset();
        setDefaultDate();
        loadPayments();
      } else {
        const msg = await res.text();
        alert(`Could not add payment: ${msg}`);
      }
    })
    .catch((err) => console.error("Create payment error:", err));
});

// 3. EDIT POPULATE
function editPayment(id, amount, date, method) {
  document.getElementById("editPaymentId").value = id;
  document.getElementById("editPaymentAmount").value = amount;
  document.getElementById("editPaymentDate").value = date;
  document.getElementById("editPaymentMethod").value = method;

  const modal = new bootstrap.Modal(
    document.getElementById("editPaymentModal"),
  );
  modal.show();
}

// 4. UPDATE PAYMENT
document.getElementById("editPaymentForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("editPaymentId").value;
  const updatedData = {
    paymentId: parseInt(id),
    amount: parseFloat(document.getElementById("editPaymentAmount").value),
    paymentDate: document.getElementById("editPaymentDate").value,
    paymentMethod:
      PAYMENT_METHOD_MAP[document.getElementById("editPaymentMethod").value],
  };

  fetch(`${API}/UpdatePayment/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedData),
  })
    .then(async (res) => {
      if (res.ok) {
        const modalEl = document.getElementById("editPaymentModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        loadPayments();
      } else {
        const msg = await res.text();
        alert(`Update failed: ${msg}`);
      }
    })
    .catch((err) => console.error("Update payment error:", err));
});

// 5. DELETE PAYMENT
function deletePayment(id) {
  if (confirm("Are you sure you want to delete this payment record?")) {
    fetch(`${API}/DeletePayment/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
      .then(async (res) => {
        if (res.ok) {
          loadPayments();
        } else {
          const msg = await res.text();
          alert(`Delete failed: ${msg}`);
        }
      })
      .catch((err) => console.error("Delete payment error:", err));
  }
}

// EVENT LISTENERS & INIT
document
  .getElementById("refreshPayments")
  ?.addEventListener("click", loadPayments);

setDefaultDate();
loadPayments();
