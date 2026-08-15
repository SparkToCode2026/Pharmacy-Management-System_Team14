const API = "https://localhost:7293/api/OrderItem";
const ORDERS_API = "https://localhost:7293/api/Order/GetAllOrders";
const MEDICINES_API = "https://localhost:7293/Medicine/GetAllMedicines";

let medicineCache = [];

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

function loadItems(url) {
  fetch(url || `${API}/GetAllOrderItems`, { headers: getAuthHeaders() })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(renderItems)
    .catch((err) => {
      console.error("GET Error:", err);
      document.getElementById("itemsTableBody").innerHTML =
        `<tr><td colspan="7" class="text-center text-danger">Error connecting to server.</td></tr>`;
    });
}

function renderItems(items) {
  const tbody = document.getElementById("itemsTableBody");
  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">No order items found.</td></tr>`;
    return;
  }

  tbody.innerHTML = items
    .map((it) => {
      const med = medicineCache.find((m) => m.medicineId === it.medicineId);
      const medName = med
        ? med.medicineName
        : it.medicine
          ? it.medicine.medicineName
          : `#${it.medicineId}`;
      const unitPrice = it.unitPrice || 0;
      const subtotal = it.subtotal || unitPrice * it.quantity;

      return `
        <tr>
            <td>${it.orderItemId}</td>
            <td>${it.orderId}</td>
            <td>${medName}</td>
            <td>${it.quantity}</td>
            <td>${Number(unitPrice).toFixed(2)}</td>
            <td>${Number(subtotal).toFixed(2)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning me-1"
                    onclick="openEditModal(${it.orderItemId}, ${it.medicineId}, ${it.quantity}, ${unitPrice})">Edit</button>
                <button class="btn btn-sm btn-danger"
                    onclick="deleteItem(${it.orderItemId})">Delete</button>
            </td>
        </tr>`;
    })
    .join("");
}

document.getElementById("addItemBtn")?.addEventListener("click", () => {
  const orderId = parseInt(document.getElementById("itemOrder").value);
  const medicineId = parseInt(document.getElementById("itemMedicine").value);
  const quantity = parseInt(document.getElementById("itemQty").value);
  const unitPrice = parseFloat(document.getElementById("itemPrice").value);

  if (!orderId) {
    alert("Select an order.");
    return;
  }
  if (!medicineId) {
    alert("Select a medicine.");
    return;
  }
  if (!quantity || quantity <= 0) {
    alert("Quantity must be greater than 0.");
    return;
  }
  if (isNaN(unitPrice) || unitPrice < 0) {
    alert("Enter a valid unit price.");
    return;
  }

  fetch(`${API}/CreateOrderItem`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ orderId, medicineId, quantity, unitPrice }),
  })
    .then(async (res) => {
      if (res.ok) {
        document.getElementById("itemQty").value = 1;
        document.getElementById("itemPrice").value = "";
        loadItems();
      } else {
        alert(`Could not add item: ${await res.text()}`);
      }
    })
    .catch((err) => console.error("POST Error:", err));
});

function openEditModal(id, medicineId, qty, price) {
  document.getElementById("editItemId").value = id;
  document.getElementById("editMedicine").value = medicineId;
  document.getElementById("editQty").value = qty;
  document.getElementById("editPrice").value = price;

  let modal = new bootstrap.Modal(document.getElementById("editItemModal"));
  modal.show();
}

document.getElementById("saveEditBtn")?.addEventListener("click", () => {
  const id = parseInt(document.getElementById("editItemId").value);
  const body = {
    orderItemId: id,
    medicineId: parseInt(document.getElementById("editMedicine").value),
    quantity: parseInt(document.getElementById("editQty").value),
    unitPrice: parseFloat(document.getElementById("editPrice").value),
  };

  fetch(`${API}/UpdateOrderItem/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
    .then(async (res) => {
      if (res.ok) {
        const modalEl = document.getElementById("editItemModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        loadItems();
      } else {
        alert(`Update failed: ${await res.text()}`);
      }
    })
    .catch((err) => console.error("PUT Error:", err));
});

function deleteItem(id) {
  if (!confirm(`Delete order item #${id}?`)) return;

  fetch(`${API}/DeleteOrderItem/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
    .then(async (res) => {
      if (res.ok || res.status === 204) {
        loadItems();
      } else {
        alert(`Delete failed: ${await res.text()}`);
      }
    })
    .catch((err) => console.error("DELETE Error:", err));
}

document.getElementById("applyFilterBtn")?.addEventListener("click", () => {
  const orderId = document.getElementById("filterOrder").value;
  if (orderId) loadItems(`${API}/FilterOrderItems?orderId=${orderId}`);
  else loadItems();
});

document.getElementById("clearFilterBtn")?.addEventListener("click", () => {
  document.getElementById("filterOrder").value = "";
  loadItems();
});

document
  .getElementById("refreshBtn")
  ?.addEventListener("click", () => loadItems());

function loadDropdowns() {
  fetch(ORDERS_API, { headers: getAuthHeaders() })
    .then((r) => r.json())
    .then((orders) => {
      const opts =
        `<option value="">— select —</option>` +
        orders
          .map(
            (o) => `<option value="${o.orderId}">Order #${o.orderId}</option>`,
          )
          .join("");
      document.getElementById("itemOrder").innerHTML = opts;
      document.getElementById("filterOrder").innerHTML =
        `<option value="">All orders</option>` +
        orders
          .map(
            (o) => `<option value="${o.orderId}">Order #${o.orderId}</option>`,
          )
          .join("");
    })
    .catch((err) => console.error("Fetch Orders Error:", err));

  fetch(MEDICINES_API, { headers: getAuthHeaders() })
    .then((r) => r.json())
    .then((meds) => {
      medicineCache = meds;
      const opts =
        `<option value="">— select —</option>` +
        meds
          .map(
            (m) => `<option value="${m.medicineId}">${m.medicineName}</option>`,
          )
          .join("");
      document.getElementById("itemMedicine").innerHTML = opts;
      document.getElementById("editMedicine").innerHTML = opts;
    })
    .catch((err) => console.error("Fetch Medicines Error:", err));
}

loadDropdowns();
loadItems();
