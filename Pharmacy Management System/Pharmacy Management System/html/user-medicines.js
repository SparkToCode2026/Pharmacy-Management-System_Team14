// ============================================================
// user-medicines.js
// Logic for Customer Browsing & Placing Orders
// ============================================================

let allMedicines = [];
let allCategories = [];
let cart = []; // Array of { medicineId, medicineName, unitPrice, quantity }

// Load Cart from localStorage
function loadCart() {
  try {
    const saved = localStorage.getItem("pharmacy_cart");
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch {
    cart = [];
  }
  updateCartBadge();
  renderCart();
}

function saveCart() {
  localStorage.setItem("pharmacy_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const badge = document.getElementById("cartCountBadge");
  if (!badge) return;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = count;
}

// Add Item to Cart
function addToCart(medicineId, qty = 1) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please sign in or create an account to place an order.");
    window.location.href = "auth.html";
    return;
  }

  const med = allMedicines.find(
    (m) => (m.medicineId ?? m.MedicineId) === medicineId,
  );
  if (!med) return alert("Medicine not found.");

  const name = med.medicineName ?? med.MedicineName;
  const price = Number(med.medicinePrice ?? med.MedicinePrice ?? med.price ?? 0);

  const existing = cart.find((item) => item.medicineId === medicineId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      medicineId: medicineId,
      medicineName: name,
      unitPrice: price,
      quantity: qty,
    });
  }

  saveCart();

  // Visual feedback
  const toastMsg = `Added "${name}" to your cart!`;
  alert(toastMsg);
}

// Adjust Cart Quantity
function changeCartQty(medicineId, delta) {
  const item = cart.find((it) => it.medicineId === medicineId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((it) => it.medicineId !== medicineId);
  }
  saveCart();
}

// Remove Item from Cart
function removeCartItem(medicineId) {
  cart = cart.filter((it) => it.medicineId !== medicineId);
  saveCart();
}

// Render Cart in Checkout Modal
function renderCart() {
  const tbody = document.getElementById("cartTableBody");
  const totalEl = document.getElementById("cartTotalPrice");
  if (!tbody || !totalEl) return;

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">Your cart is currently empty.</td></tr>`;
    totalEl.textContent = "$0.00";
    return;
  }

  let total = 0;
  tbody.innerHTML = cart
    .map((item) => {
      const subtotal = item.quantity * item.unitPrice;
      total += subtotal;

      return `
      <tr>
        <td class="fw-semibold">${item.medicineName}</td>
        <td>
          <div class="input-group input-group-sm" style="max-width: 120px;">
            <button class="btn btn-outline-secondary" type="button" onclick="changeCartQty(${item.medicineId}, -1)">-</button>
            <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
            <button class="btn btn-outline-secondary" type="button" onclick="changeCartQty(${item.medicineId}, 1)">+</button>
          </div>
        </td>
        <td>$${item.unitPrice.toFixed(2)}</td>
        <td class="fw-bold">$${subtotal.toFixed(2)}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="removeCartItem(${item.medicineId})">×</button>
        </td>
      </tr>
    `;
    })
    .join("");

  totalEl.textContent = `$${total.toFixed(2)}`;
}

// Load branches into checkout modal dropdown
async function loadBranchesForCart() {
  try {
    const branches = await getBranches();
    const branchSelect = document.getElementById("cartBranchSelect");
    if (!branchSelect) return;

    branchSelect.innerHTML =
      '<option value="">— Select pickup / fulfillment branch —</option>' +
      (branches || [])
        .map((b) => {
          const id = b.branchId ?? b.BranchId;
          const name = b.branchName ?? b.BranchName ?? `Branch #${id}`;
          const city = b.branchCity ?? b.BranchCity ?? "";
          return `<option value="${id}">${name} ${city ? `(${city})` : ""}</option>`;
        })
        .join("");
  } catch (error) {
    console.error("Error loading branches for checkout:", error);
  }
}

// Submit / Place Order Handler
async function handlePlaceOrder() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please sign in to complete your order.");
    window.location.href = "auth.html";
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty. Please add items before checking out.");
    return;
  }

  const branchSelect = document.getElementById("cartBranchSelect");
  const branchId = parseInt(branchSelect?.value);
  if (!branchId) {
    alert("Please select a pharmacy branch for your order.");
    branchSelect?.focus();
    return;
  }

  const totalAmount = cart.reduce(
    (sum, it) => sum + it.quantity * it.unitPrice,
    0,
  );

  const orderPayload = {
    BranchId: branchId,
    OrderDate: new Date().toISOString(),
    TotalAmount: totalAmount,
    Status: "Pending",
    OrderItems: cart.map((item) => ({
      MedicineId: item.medicineId,
      Quantity: item.quantity,
      UnitPrice: item.unitPrice,
    })),
  };

  const placeBtn = document.getElementById("placeOrderBtn");
  if (placeBtn) {
    placeBtn.disabled = true;
    placeBtn.textContent = "Placing Order...";
  }

  try {
    const created = await createOrder(orderPayload);
    const orderId = created.orderId ?? created.OrderId;
    const finalAmount = created.totalAmount ?? created.TotalAmount ?? totalAmount;

    alert(`🎉 Order #${orderId} placed successfully! Redirecting to payment checkout...`);

    // Clear cart
    cart = [];
    saveCart();

    const modalEl = document.getElementById("cartModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    // Redirect to payment checkout with autofilled order data
    window.location.href = `payment.html?orderId=${orderId}&amount=${finalAmount}`;
  } catch (error) {
    console.error("Order placement failed:", error);
    alert(`Failed to place order: ${error.message}`);
  } finally {
    if (placeBtn) {
      placeBtn.disabled = false;
      placeBtn.textContent = "✓ Place Order";
    }
  }
}

// Load all medicines
async function loadMedicines() {
  try {
    const grid = document.getElementById("medicinesGrid");
    if (!grid) return;
    grid.innerHTML =
      '<div class="text-center text-muted py-4">Loading medicines...</div>';

    allMedicines = (await getMedicines()) || [];
    if (!allMedicines || allMedicines.length === 0) {
      grid.innerHTML =
        '<div class="text-center text-muted py-4">No medicines found</div>';
      return;
    }

    renderMedicines(allMedicines);
  } catch (error) {
    console.error("Error loading medicines:", error);
    const grid = document.getElementById("medicinesGrid");
    if (grid) {
      grid.innerHTML =
        '<div class="text-center text-danger py-4">Error loading medicines from catalog</div>';
    }
  }
}

// Load categories for filter dropdown
async function loadCategories() {
  try {
    allCategories = (await apiGetMedicineCategories()) || [];
    const categorySelect = document.getElementById("categoryFilter");
    if (!categorySelect) return;

    allCategories.forEach((category) => {
      const categoryId =
        category.medicineCategoryId ?? category.MedicineCategoryId;
      const categoryName =
        category.medicineCategoryName ??
        category.MedicineCategoryName ??
        category.categoryName ??
        "General";
      const option = document.createElement("option");
      option.value = categoryId;
      option.textContent = categoryName;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// Render medicines in responsive cards grid
function renderMedicines(medicines) {
  const grid = document.getElementById("medicinesGrid");
  if (!grid) return;

  if (!medicines || medicines.length === 0) {
    grid.innerHTML =
      '<div class="text-center text-muted py-4 col-12">No matching medicines found.</div>';
    return;
  }

  grid.innerHTML = medicines
    .map((medicine) => {
      const medicineId = medicine.medicineId ?? medicine.MedicineId;
      const medicineName = medicine.medicineName ?? medicine.MedicineName ?? "";
      const price = Number(
        medicine.medicinePrice ?? medicine.MedicinePrice ?? medicine.price ?? 0,
      ).toFixed(2);
      const description =
        medicine.medicineDescription ??
        medicine.MedicineDescription ??
        medicine.description ??
        "No description available.";
      const categoryId =
        medicine.medicineCategoryId ?? medicine.MedicineCategoryId;
      const category = allCategories.find(
        (c) => (c.medicineCategoryId ?? c.MedicineCategoryId) === categoryId,
      );
      const categoryName = category
        ? category.medicineCategoryName ??
          category.MedicineCategoryName ??
          "General"
        : "General";

      return `
      <div class="medicine-card shadow-sm">
        <div class="medicine-name">${medicineName}</div>
        <div class="medicine-info"><span class="badge bg-secondary">${categoryName}</span></div>
        <div class="medicine-info mt-2 text-muted">${description.substring(0, 85)}${description.length > 85 ? "..." : ""}</div>
        <div class="medicine-price text-success">$${price}</div>
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-sm btn-outline-primary flex-fill" onclick="viewMedicineDetails(${medicineId})">
            Details
          </button>
          <button class="btn btn-sm btn-success flex-fill" onclick="addToCart(${medicineId})">
            + Add to Cart
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

// View medicine details modal
async function viewMedicineDetails(medicineId) {
  try {
    const medicine = allMedicines.find(
      (m) => (m.medicineId ?? m.MedicineId) === medicineId,
    );
    if (!medicine) {
      alert("Medicine details not found.");
      return;
    }

    const medicineName = medicine.medicineName ?? medicine.MedicineName;
    const price = Number(
      medicine.medicinePrice ?? medicine.MedicinePrice ?? medicine.price ?? 0,
    ).toFixed(2);
    const description =
      medicine.medicineDescription ??
      medicine.MedicineDescription ??
      "No description available.";
    const categoryId =
      medicine.medicineCategoryId ?? medicine.MedicineCategoryId;
    const category = allCategories.find(
      (c) => (c.medicineCategoryId ?? c.MedicineCategoryId) === categoryId,
    );
    const categoryName = category
      ? category.medicineCategoryName ??
        category.MedicineCategoryName ??
        "General"
      : "General";

    const content = `
      <div class="mb-3">
        <h4 class="text-primary fw-bold">${medicineName}</h4>
        <p class="text-muted"><span class="badge bg-secondary">${categoryName}</span></p>
        <p class="fs-4 text-success fw-bold">Price: $${price}</p>
        <hr>
        <p class="fw-bold mb-1">Description & Indications:</p>
        <p class="text-secondary">${description}</p>
      </div>
    `;

    document.getElementById("medicineDetailsContent").innerHTML = content;
    document.getElementById("medicineDetailsFooter").innerHTML = `
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-success" onclick="addToCart(${medicineId}); bootstrap.Modal.getInstance(document.getElementById('medicineDetailsModal')).hide();">
        🛒 Add to Cart ($${price})
      </button>
    `;

    new bootstrap.Modal(document.getElementById("medicineDetailsModal")).show();
  } catch (error) {
    console.error("Error loading medicine details:", error);
    alert("Error loading medicine details");
  }
}

// Filter medicines
function filterMedicines() {
  const categoryId = document.getElementById("categoryFilter").value;
  const searchTerm = document
    .getElementById("medicineSearch")
    .value.toLowerCase()
    .trim();

  let filtered = allMedicines;

  if (categoryId) {
    filtered = filtered.filter((m) => {
      const mCategoryId = m.medicineCategoryId ?? m.MedicineCategoryId;
      return String(mCategoryId) === String(categoryId);
    });
  }

  if (searchTerm) {
    filtered = filtered.filter((m) => {
      const name = (m.medicineName ?? m.MedicineName ?? "").toLowerCase();
      const desc = (
        m.medicineDescription ??
        m.MedicineDescription ??
        ""
      ).toLowerCase();
      return name.includes(searchTerm) || desc.includes(searchTerm);
    });
  }

  renderMedicines(filtered);
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  loadCart();
  await loadCategories();
  await loadMedicines();
  await loadBranchesForCart();

  const categoryFilter = document.getElementById("categoryFilter");
  const medicineSearch = document.getElementById("medicineSearch");

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterMedicines);
  }

  if (medicineSearch) {
    medicineSearch.addEventListener("input", filterMedicines);
  }

  document
    .getElementById("placeOrderBtn")
    ?.addEventListener("click", handlePlaceOrder);
});
