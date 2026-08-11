const API = "http://localhost:5009/Payment";

const PAYMENT_METHOD_LABELS = ["Cash", "CreditCard", "DebitCard", "Insurance"];
const PAYMENT_STATUS_LABELS = ["Pending", "Completed", "Failed", "Refunded"];
const PAYMENT_METHOD_MAP = { Cash: 0, CreditCard: 1, DebitCard: 2, Insurance: 3 };
const PAYMENT_STATUS_MAP = { Pending: 0, Completed: 1, Failed: 2, Refunded: 3 };

// 1. GET ALL
function loadPayments() {
  fetch(`${API}/GetAllPayments`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return res.json();
    })
    .then(payments => {
      const tbody = document.getElementById("paymentTableBody");
      if (!payments || payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No records found.</td></tr>`;
        return;
      }
      tbody.innerHTML = payments.map(p => {
        const methodLabel = PAYMENT_METHOD_LABELS[p.paymentMethod];
        const statusLabel = PAYMENT_STATUS_LABELS[p.paymentStatus];
        return `
        <tr>
          <td>${p.paymentId}</td>
          <td>$${p.amount.toFixed(2)}</td>
          <td>${p.paymentDate.split('T')[0]}</td>
          <td>${methodLabel}</td>
          <td>${statusBadge(statusLabel)}</td>
          <td>${p.orderId}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-warning me-1" onclick="editPayment(${p.paymentId}, ${p.amount}, '${p.paymentDate.split('T')[0]}', '${methodLabel}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deletePayment(${p.paymentId})">Delete</button>
          </td>
        </tr>`;
      }).join("");
    })
    .catch(err => console.error("Load failed:", err));
}

function statusBadge(status) {
  const colors = { Completed: 'success', Pending: 'warning text-dark', Failed: 'danger', Refunded: 'secondary' };
  return `<span class="badge bg-${colors[status] || 'secondary'}">${status}</span>`;
}

// 2. CREATE
document.getElementById("paymentForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const newPayment = {
    amount: parseFloat(document.getElementById("paymentAmount").value),
    paymentDate: document.getElementById("paymentDate").value,
    paymentMethod: PAYMENT_METHOD_MAP[document.getElementById("paymentMethod").value],
    paymentStatus: PAYMENT_STATUS_MAP[document.getElementById("paymentStatus").value],
    orderId: parseInt(document.getElementById("orderId").value)
  };
  fetch(`${API}/CreatePayment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPayment)
  })
  .then(res => {
    if (res.ok) {
      document.getElementById("paymentForm").reset();
      loadPayments();
    } else {
      return res.text().then(msg => alert(`Could not add payment: ${msg}`));
    }
  });
});

// 3. EDIT POPULATE
function editPayment(id, amount, date, method) {
  document.getElementById("editPaymentId").value = id;
  document.getElementById("editPaymentAmount").value = amount;
  document.getElementById("editPaymentDate").value = date;
  document.getElementById("editPaymentMethod").value = method;
  const modal = new bootstrap.Modal(document.getElementById("editPaymentModal"));
  modal.show();
}

// 4. UPDATE
document.getElementById("editPaymentForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("editPaymentId").value;
  const updatedData = {
    paymentId: parseInt(id),
    amount: parseFloat(document.getElementById("editPaymentAmount").value),
    paymentDate: document.getElementById("editPaymentDate").value,
    paymentMethod: PAYMENT_METHOD_MAP[document.getElementById("editPaymentMethod").value]
  };
  fetch(`${API}/UpdatePayment?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
  })
  .then(res => {
    if (res.ok) {
      const modal = bootstrap.Modal.getInstance(document.getElementById("editPaymentModal"));
      if (modal) modal.hide();
      loadPayments();
    }
  });
});

// 5. DELETE
function deletePayment(id) {
  if (confirm("Are you sure?")) {
    fetch(`${API}/DeletePayment?id=${id}`, { method: "DELETE" })
      .then(res => { if (res.ok) loadPayments(); });
  }
}

loadPayments();