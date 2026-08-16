// ============================================================
// payment.js
// Logic for Payment Management & Autofill Checkout using api.js
// ============================================================

// Enum maps matching the C# backend
const PAYMENT_METHODS = ["Cash", "CreditCard", "DebitCard", "Insurance"];
const PAYMENT_STATUSES = ["Pending", "Completed", "Failed", "Refunded"];

// Map string → integer for the API
const PAYMENT_METHOD_INT = { Cash: 0, CreditCard: 1, DebitCard: 2, Insurance: 3 };
const PAYMENT_STATUS_INT = { Pending: 0, Completed: 1, Failed: 2, Refunded: 3 };

let allPayments = [];

// Set Today's Date Default for Payment Input
function setDefaultDate() {
  const paymentDateInput = document.getElementById("paymentDate");
  if (paymentDateInput && !paymentDateInput.value) {
    paymentDateInput.value = new Date().toISOString().split("T")[0];
  }
}

// 1. Autofill From URL Query Parameters (when arriving from an Order)
async function checkUrlParamsAndAutofill() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderIdParam = urlParams.get("orderId");
  const amountParam = urlParams.get("amount");

  if (orderIdParam) {
    const orderIdInput = document.getElementById("orderId");
    const amountInput = document.getElementById("paymentAmount");
    const banner = document.getElementById("orderAutofillBanner");
    const bannerOrderId = document.getElementById("bannerOrderId");
    const bannerOrderAmount = document.getElementById("bannerOrderAmount");

    if (orderIdInput) orderIdInput.value = orderIdParam;
    if (bannerOrderId) bannerOrderId.textContent = orderIdParam;

    let finalAmount = amountParam ? parseFloat(amountParam) : null;

    // If amount wasn't in URL, fetch order to get total amount
    if (!finalAmount || isNaN(finalAmount)) {
      try {
        const order = await getOrderById(orderIdParam);
        if (order) {
          finalAmount = Number(order.totalAmount ?? order.TotalAmount ?? 0);
        }
      } catch (err) {
        console.warn("Could not fetch order details for autofill:", err);
      }
    }

    if (finalAmount !== null && !isNaN(finalAmount)) {
      if (amountInput) amountInput.value = finalAmount.toFixed(2);
      if (bannerOrderAmount)
        bannerOrderAmount.textContent = `$${finalAmount.toFixed(2)}`;
    }

    if (banner) {
      banner.classList.remove("d-none");
      banner.classList.add("d-flex");
    }
  }
}

// 2. GET ALL PAYMENTS (admin/pharmacist only — graceful fallback for customers)
async function loadPayments() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const role = currentUser.role ?? "user";
  const isAdminOrPharmacist = role === "admin" || role === "pharmacist";

  const tbody = document.getElementById("paymentTableBody");

  if (!isAdminOrPharmacist) {
    // Regular users cannot list all payments — show friendly message
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">
        Payment history is managed by pharmacy staff. Your payments are recorded securely.
      </td></tr>`;
    }
    return;
  }

  try {
    const payments = await apiGetPayments();
    allPayments = payments || [];
    renderPayments(allPayments);
  } catch (err) {
    console.error("Load failed:", err);
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
            <td class="fw-semibold">#${orderId}</td>
            <td class="fw-bold text-success fs-6">$${amount}</td>
            <td>${formattedDate}</td>
            <td><span class="badge bg-light text-dark border">${method}</span></td>
            <td>${statusBadge(status)}</td>
            <td class="text-center text-nowrap">
                <button class="btn btn-sm btn-warning me-1" onclick="editPayment(${id}, ${amount}, '${isoDate}', '${method}', '${status}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePaymentAction(${id})">Delete</button>
            </td>
        </tr>`;
    })
    .join("");
}

function formatPaymentEnum(val, list) {
  if (typeof val === "number") return list[val] ?? list[0];
  return val ?? list[0];
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

// 3. CREATE / PROCESS PAYMENT
document.getElementById("paymentForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const orderId = parseInt(document.getElementById("orderId").value);
  const amount = parseFloat(document.getElementById("paymentAmount").value);
  const paymentDateRaw = document.getElementById("paymentDate").value;
  const paymentMethodStr = document.getElementById("paymentMethod").value;
  const paymentStatusStr = document.getElementById("paymentStatus").value;

  if (!orderId || isNaN(orderId)) return alert("Please enter a valid Order ID.");
  if (!amount || amount <= 0) return alert("Please enter a valid payment amount.");

  // Convert string enums → integers for the backend
  const paymentMethodInt = PAYMENT_METHOD_INT[paymentMethodStr] ?? 0;
  const paymentStatusInt = PAYMENT_STATUS_INT[paymentStatusStr] ?? 1;

  // Full ISO datetime required by ASP.NET Core
  const paymentDate = paymentDateRaw
    ? new Date(paymentDateRaw).toISOString()
    : new Date().toISOString();

  const newPayment = {
    orderId: orderId,
    amount: amount,
    paymentDate: paymentDate,
    paymentMethod: paymentMethodInt,
    paymentStatus: paymentStatusInt,
  };

  const submitBtn = document.getElementById("submitPaymentBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing Payment...";
  }

  try {
    await createPayment(newPayment);

    alert(`🎉 Payment of $${amount.toFixed(2)} for Order #${orderId} processed successfully!`);

    document.getElementById("paymentForm").reset();
    setDefaultDate();

    const banner = document.getElementById("orderAutofillBanner");
    if (banner) banner.classList.add("d-none");

    await loadPayments();

    // If arrived from order flow, redirect back to My Orders
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("orderId")) {
      setTimeout(() => {
        window.location.href = "user-orders.html";
      }, 1200);
    }
  } catch (err) {
    console.error("Create payment error:", err);
    alert(`Payment failed: ${err.message}`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "✓ Submit & Complete Payment";
    }
  }
});

// 4. EDIT POPULATE
function editPayment(id, amount, date, method, status) {
  document.getElementById("editPaymentId").value = id;
  document.getElementById("editPaymentAmount").value = amount;
  document.getElementById("editPaymentDate").value = date;
  document.getElementById("editPaymentMethod").value = method;
  document.getElementById("editPaymentStatus").value = status;

  const modal = new bootstrap.Modal(document.getElementById("editPaymentModal"));
  modal.show();
}

// 5. UPDATE PAYMENT
document.getElementById("editPaymentForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editPaymentId").value;
  const methodStr = document.getElementById("editPaymentMethod").value;
  const statusStr = document.getElementById("editPaymentStatus").value;
  const dateRaw = document.getElementById("editPaymentDate").value;

  const updatedData = {
    paymentId: parseInt(id),
    amount: parseFloat(document.getElementById("editPaymentAmount").value),
    paymentDate: dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString(),
    paymentMethod: PAYMENT_METHOD_INT[methodStr] ?? 0,
    paymentStatus: PAYMENT_STATUS_INT[statusStr] ?? 1,
  };

  try {
    await updatePayment(id, updatedData);
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

// 6. DELETE PAYMENT
async function deletePaymentAction(id) {
  if (!confirm("Are you sure you want to delete this payment record?")) return;

  try {
    await deletePayment(id);
    alert("Payment deleted successfully!");
    loadPayments();
  } catch (err) {
    console.error("Delete payment error:", err);
    alert(`Delete failed: ${err.message}`);
  }
}

// 7. FILTER BY STATUS
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
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("refreshPayments")?.addEventListener("click", loadPayments);
  setDefaultDate();
  await checkUrlParamsAndAutofill();
  await loadPayments();
});
