// ===========================================================================
// OrderItem.js  —  frontend logic for orderitems.html
//
// IMPORTANT: your OrderItemController currently has NO order-item endpoints
// (it's a copy of OrderController). For this page to work, the controller
// must expose these routes:
//   GET    /api/OrderItem/GetAllOrderItems
//   GET    /api/OrderItem/GetOrderItemById?id=
//   POST   /api/OrderItem/CreateOrderItem        body:{orderId,medicineId,quantity,unitPrice}
//   PUT    /api/OrderItem/UpdateOrderItem?id=     body:{orderItemId,quantity,unitPrice}
//   DELETE /api/OrderItem/DeleteOrderItem?id=
//   GET    /api/OrderItem/FilterByOrder?orderId=
// Also remove [JsonIgnore] from OrderItemId in OrderItem.cs so ids serialize.
// ===========================================================================

// --- CONFIG (routes confirmed from your controllers) -----------------------
const API           = "https://localhost:7293/api/OrderItem";
const ORDERS_API    = "https://localhost:7293/api/Order/GetAllOrders"; // Order uses api/[controller]
const MEDICINES_API = "https://localhost:7293/Medicine/GetAllMedicines"; // Medicine route is just /Medicine

let medicineCache = [];

// --- LOAD LIST -------------------------------------------------------------
function loadItems(url) {
    fetch(url || `${API}/GetAllOrderItems`)
        .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
        .then(renderItems)
        .catch(err => {
            console.error(err);
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
    tbody.innerHTML = items.map(it => {
        const med = medicineCache.find(m => m.medicineId === it.medicineId);
        const medName = med ? med.medicineName : `#${it.medicineId}`;
        return `
        <tr>
            <td>${it.orderItemId}</td>
            <td>${it.orderId}</td>
            <td>${medName}</td>
            <td>${it.quantity}</td>
            <td>${Number(it.unitPrice).toFixed(2)}</td>
            <td>${Number(it.subtotal).toFixed(2)}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-warning me-1"
                    onclick="editItem(${it.orderItemId}, ${it.quantity}, ${it.unitPrice})">Edit</button>
                <button class="btn btn-sm btn-danger"
                    onclick="deleteItem(${it.orderItemId})">Delete</button>
            </td>
        </tr>`;
    }).join("");
}

// --- CREATE ----------------------------------------------------------------
document.getElementById("addItemBtn").addEventListener("click", () => {
    const orderId    = parseInt(document.getElementById("itemOrder").value);
    const medicineId = parseInt(document.getElementById("itemMedicine").value);
    const quantity   = parseInt(document.getElementById("itemQty").value);
    const unitPrice  = parseFloat(document.getElementById("itemPrice").value);

    if (!orderId)    { alert("Select an order."); return; }
    if (!medicineId) { alert("Select a medicine."); return; }
    if (!quantity || quantity <= 0) { alert("Quantity must be greater than 0."); return; }
    if (isNaN(unitPrice) || unitPrice < 0) { alert("Enter a valid unit price."); return; }

    fetch(`${API}/CreateOrderItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, medicineId, quantity, unitPrice })
    })
    .then(async res => {
        if (res.ok) { document.getElementById("itemQty").value = 1;
                      document.getElementById("itemPrice").value = ""; loadItems(); }
        else { alert(`Could not add item: ${await res.text()}`); }
    })
    .catch(err => console.error(err));
});

// --- EDIT ------------------------------------------------------------------
function editItem(id, qty, price) {
    document.getElementById("editItemId").value = id;
    document.getElementById("editQty").value = qty;
    document.getElementById("editPrice").value = price;
    new bootstrap.Modal(document.getElementById("editItemModal")).show();
}

document.getElementById("saveEditBtn").addEventListener("click", () => {
    const id = document.getElementById("editItemId").value;
    const body = {
        orderItemId: parseInt(id),
        quantity: parseInt(document.getElementById("editQty").value),
        unitPrice: parseFloat(document.getElementById("editPrice").value)
    };
    fetch(`${API}/UpdateOrderItem?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(async res => {
        if (res.ok) { bootstrap.Modal.getInstance(document.getElementById("editItemModal")).hide(); loadItems(); }
        else { alert(`Update failed: ${await res.text()}`); }
    })
    .catch(err => console.error(err));
});

// --- DELETE ----------------------------------------------------------------
function deleteItem(id) {
    if (!confirm(`Delete order item #${id}?`)) return;
    fetch(`${API}/DeleteOrderItem?id=${id}`, { method: "DELETE" })
        .then(async res => {
            if (res.ok || res.status === 204) loadItems();
            else alert(`Delete failed: ${await res.text()}`);
        })
        .catch(err => console.error(err));
}

// --- FILTER ----------------------------------------------------------------
document.getElementById("applyFilterBtn").addEventListener("click", () => {
    const orderId = document.getElementById("filterOrder").value;
    if (orderId) loadItems(`${API}/FilterByOrder?orderId=${orderId}`);
    else loadItems();
});
document.getElementById("clearFilterBtn").addEventListener("click", () => {
    document.getElementById("filterOrder").value = ""; loadItems();
});
document.getElementById("refreshBtn").addEventListener("click", () => loadItems());

// --- DROPDOWNS -------------------------------------------------------------
function loadDropdowns() {
    fetch(ORDERS_API).then(r => r.json()).then(orders => {
        const opts = `<option value="">— select —</option>` +
            orders.map(o => `<option value="${o.orderId}">Order #${o.orderId}</option>`).join("");
        document.getElementById("itemOrder").innerHTML = opts;
        document.getElementById("filterOrder").innerHTML =
            `<option value="">All orders</option>` +
            orders.map(o => `<option value="${o.orderId}">Order #${o.orderId}</option>`).join("");
    }).catch(() => {});

    fetch(MEDICINES_API).then(r => r.json()).then(meds => {
        medicineCache = meds;
        document.getElementById("itemMedicine").innerHTML =
            `<option value="">— select —</option>` +
            meds.map(m => `<option value="${m.medicineId}">${m.medicineName}</option>`).join("");
    }).catch(() => {});
}

// --- INIT ------------------------------------------------------------------
loadDropdowns();
loadItems();