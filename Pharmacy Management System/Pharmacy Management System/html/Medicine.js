// ===============================
// API CONFIGURATION
// ===============================
const API_BASE = "https://localhost:7293";

const MEDICINE_API = `${API_BASE}/Medicine`;
const CATEGORY_API = `${API_BASE}/MedicineCategory`;
const MANUFACTURER_API = `${API_BASE}/Manufacturer`;
const SUPPLIER_API = `${API_BASE}/api/Supplier`;

// Cache maps for lookup IDs -> Names
let categoriesMap = {};
let manufacturersMap = {};
let suppliersMap = {};

let allMedicines = [];
let isAscending = true;

// Initialize Page
document.addEventListener("DOMContentLoaded", async () => {
    await loadAllDropdowns();
    await loadMedicines();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", filterMedicines);
    }
});

// ===============================
// DROPDOWN LOADERS
// ===============================
async function loadAllDropdowns() {
    await Promise.all([
        fetchAndPopulateDropdown(
            `${CATEGORY_API}/GetAllMedicineCategories`,
            ["categorySelect", "editCategorySelect"],
            "medicineCategoryId",
            "medicineCategoryName",
            categoriesMap,
            "Select category..."
        ),
        fetchAndPopulateDropdown(
            `${MANUFACTURER_API}/GetAllManufacturers`,
            ["manufacturerSelect", "editManufacturerSelect"],
            "manufacturerId",
            "manufacturerName",
            manufacturersMap,
            "Select manufacturer..."
        ),
        fetchAndPopulateDropdown(
            `${SUPPLIER_API}/GetSuppliers`,
            ["supplierSelect", "editSupplierSelect"],
            "supplierId",
            "supplierName",
            suppliersMap,
            "Select supplier..."
        )
    ]);
}

async function fetchAndPopulateDropdown(url, selectIds, idKey, nameKey, cacheMap, placeholder) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        data.forEach(item => {
            cacheMap[item[idKey]] = item[nameKey];
        });

        selectIds.forEach(selectId => {
            const selectEl = document.getElementById(selectId);
            if (!selectEl) return;

            selectEl.innerHTML = "";
            
            const placeholderOpt = document.createElement("option");
            placeholderOpt.value = "";
            placeholderOpt.textContent = placeholder;
            placeholderOpt.selected = true;
            placeholderOpt.disabled = true;
            selectEl.appendChild(placeholderOpt);

            data.forEach(item => {
                const opt = document.createElement("option");
                opt.value = item[idKey];
                opt.textContent = item[nameKey];
                selectEl.appendChild(opt);
            });
        });
    } catch (error) {
        console.error(`Error loading dropdown from ${url}:`, error);
    }
}

// ===============================
// MEDICINE VALIDATION
// ===============================
function validateMedicineDates(productionDate, expiryDate) {
    if (!productionDate || !expiryDate) return true;

    const production = new Date(productionDate);
    const expiry = new Date(expiryDate);

    if (isNaN(production.getTime()) || isNaN(expiry.getTime())) {
        alert("Please enter valid production and expiry dates.");
        return false;
    }

    if (production >= expiry) {
        alert("Expiry date must be after the production date.");
        return false;
    }

    return true;
}

function validateMedicinePrice(price) {
    if (isNaN(price) || price < 0) {
        alert("Medicine price cannot be negative.");
        return false;
    }

    return true;
}

// ===============================
// GET ALL MEDICINES
// ===============================
async function loadMedicines() {
    try {
        const response = await fetch(`${MEDICINE_API}/GetAllMedicines`);
        if (!response.ok) throw new Error("Failed to load medicines");

        allMedicines = await response.json();
        renderTable(allMedicines);
    } catch (error) {
        console.error("GET Error:", error);
    }
}

function renderTable(medicines) {
    const tbody = document.getElementById("medicinesTableBody");
    tbody.innerHTML = "";

    if (!medicines || medicines.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No medicines found.</td></tr>`;
        return;
    }

    medicines.forEach(m => {
        const categoryName = categoriesMap[m.medicineCategoryId] || m.medicineCategoryId || "N/A";
        const manufacturerName = manufacturersMap[m.manufacturerId] || m.manufacturerId || "N/A";
        const supplierName = suppliersMap[m.supplierId] || m.supplierId || "N/A";
        const formattedExpiry = formatDate(m.medicineExpiryDate);

        const row = document.createElement("tr");

        const tdId = document.createElement("td");
        tdId.textContent = m.medicineId;
        row.appendChild(tdId);

        const tdName = document.createElement("td");
        tdName.className = "fw-bold";
        tdName.textContent = m.medicineName;
        row.appendChild(tdName);

        const tdPrice = document.createElement("td");
        tdPrice.textContent = `$${parseFloat(m.medicinePrice || 0).toFixed(2)}`;
        row.appendChild(tdPrice);

        const tdCategory = document.createElement("td");
        const categoryBadge = document.createElement("span");
        categoryBadge.className = "badge bg-info text-dark";
        categoryBadge.textContent = categoryName;
        tdCategory.appendChild(categoryBadge);
        row.appendChild(tdCategory);

        const tdManufacturer = document.createElement("td");
        tdManufacturer.textContent = manufacturerName;
        row.appendChild(tdManufacturer);

        const tdSupplier = document.createElement("td");
        tdSupplier.textContent = supplierName;
        row.appendChild(tdSupplier);

        const tdExpiry = document.createElement("td");
        tdExpiry.textContent = formattedExpiry;
        row.appendChild(tdExpiry);

        const tdActions = document.createElement("td");
        tdActions.className = "text-center";
        tdActions.innerHTML = `
            <button class="btn btn-sm btn-info me-1 text-white" onclick="viewMedicineDetails(${m.medicineId})">Details</button>
            <button class="btn btn-sm btn-warning me-1" onclick="openEditMedicine(${m.medicineId})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteMedicine(${m.medicineId})">Delete</button>
        `;
        row.appendChild(tdActions);

        tbody.appendChild(row);
    });
}

// ===============================
// ADD MEDICINE
// ===============================
document.getElementById("addMedicineForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const newMedicine = {
        medicineName: document.getElementById("medicineName").value.trim(),
        medicinePrice: parseFloat(document.getElementById("medicinePrice").value),
        medicineCategoryId: parseInt(document.getElementById("categorySelect").value),
        manufacturerId: parseInt(document.getElementById("manufacturerSelect").value),
        supplierId: parseInt(document.getElementById("supplierSelect").value), // Fixed: Reading from supplierSelect
        medicineProductionDate: document.getElementById("medicineProductionDate").value,
        medicineExpiryDate: document.getElementById("medicineExpiryDate").value,
        medicineDescription: document.getElementById("medicineDescription").value.trim()
    };

    if (
        !validateMedicinePrice(newMedicine.medicinePrice) ||
        !validateMedicineDates(newMedicine.medicineProductionDate, newMedicine.medicineExpiryDate)
    ) {
        return;
    }

    try {
        const response = await fetch(`${MEDICINE_API}/AddMedicine`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newMedicine)
        });

        if (response.ok) {
            alert("Medicine Added Successfully");
            document.getElementById("addMedicineForm").reset();
            loadMedicines();
        } else {
            const errText = await response.text();
            alert("Failed to add medicine: " + errText);
        }
    } catch (error) {
        console.error("POST Error:", error);
    }
});

// ===============================
// VIEW MEDICINE DETAILS
// ===============================
async function viewMedicineDetails(id) {
    try {
        const response = await fetch(`${MEDICINE_API}/GetMedicineById?medicineId=${id}`);
        if (!response.ok) throw new Error("Failed to fetch medicine details");

        const m = await response.json();

        document.getElementById("detailId").innerText = m.medicineId;
        document.getElementById("detailName").innerText = m.medicineName;
        document.getElementById("detailPrice").innerText = parseFloat(m.medicinePrice || 0).toFixed(2);
        document.getElementById("detailCategory").innerText = categoriesMap[m.medicineCategoryId] || m.medicineCategoryId;
        document.getElementById("detailManufacturer").innerText = manufacturersMap[m.manufacturerId] || m.manufacturerId;
        document.getElementById("detailSupplier").innerText = suppliersMap[m.supplierId] || m.supplierId;
        document.getElementById("detailProductionDate").innerText = formatDate(m.medicineProductionDate);
        document.getElementById("detailExpiryDate").innerText = formatDate(m.medicineExpiryDate);
        document.getElementById("detailDescription").innerText = m.medicineDescription || "N/A";

        const modal = new bootstrap.Modal(document.getElementById("medicineDetailsModal"));
        modal.show();
    } catch (error) {
        console.error("Details Error:", error);
    }
}

// ===============================
// OPEN EDIT MODAL
// ===============================
async function openEditMedicine(id) {
    try {
        const response = await fetch(`${MEDICINE_API}/GetMedicineById?medicineId=${id}`);
        if (!response.ok) throw new Error("Failed to fetch medicine for edit");

        const m = await response.json();

        document.getElementById("editMedicineId").value = m.medicineId;
        document.getElementById("editMedicineName").value = m.medicineName;
        document.getElementById("editMedicinePrice").value = m.medicinePrice;
        document.getElementById("editCategorySelect").value = m.medicineCategoryId;
        document.getElementById("editManufacturerSelect").value = m.manufacturerId;
        document.getElementById("editSupplierSelect").value = m.supplierId;
        document.getElementById("editMedicineProductionDate").value = formatDateForInput(m.medicineProductionDate);
        document.getElementById("editMedicineExpiryDate").value = formatDateForInput(m.medicineExpiryDate);
        document.getElementById("editMedicineDescription").value = m.medicineDescription || "";

        const modal = new bootstrap.Modal(document.getElementById("editMedicineModal"));
        modal.show();
    } catch (error) {
        console.error("Edit Modal Error:", error);
    }
}

// ===============================
// UPDATE MEDICINE
// ===============================
document.getElementById("editMedicineForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = parseInt(document.getElementById("editMedicineId").value);
    const updatedMedicine = {
        medicineId: id,
        medicineName: document.getElementById("editMedicineName").value.trim(),
        medicinePrice: parseFloat(document.getElementById("editMedicinePrice").value),
        medicineCategoryId: parseInt(document.getElementById("editCategorySelect").value),
        manufacturerId: parseInt(document.getElementById("editManufacturerSelect").value),
        supplierId: parseInt(document.getElementById("editSupplierSelect").value), // Fixed: Reading from editSupplierSelect
        medicineProductionDate: document.getElementById("editMedicineProductionDate").value,
        medicineExpiryDate: document.getElementById("editMedicineExpiryDate").value,
        medicineDescription: document.getElementById("editMedicineDescription").value.trim()
    };

    if (
        !validateMedicinePrice(updatedMedicine.medicinePrice) ||
        !validateMedicineDates(updatedMedicine.medicineProductionDate, updatedMedicine.medicineExpiryDate)
    ) {
        return;
    }

    try {
        const response = await fetch(`${MEDICINE_API}/UpdateMedicine`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedMedicine)
        });

        if (response.ok) {
            alert("Medicine Updated Successfully");
            
            const modalEl = document.getElementById("editMedicineModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            loadMedicines();
        } else {
            const errText = await response.text();
            alert("Update Failed: " + errText);
        }
    } catch (error) {
        console.error("PUT Error:", error);
    }
});

// ===============================
// DELETE MEDICINE
// ===============================
async function deleteMedicine(id) {
    if (!confirm("Are you sure you want to delete this medicine?")) return;

    try {
        const response = await fetch(`${MEDICINE_API}/RemoveMedicine?medicineId=${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Medicine Deleted Successfully");
            loadMedicines();
        } else {
            const errText = await response.text();
            alert("Delete Failed: " + errText);
        }
    } catch (error) {
        console.error("DELETE Error:", error);
    }
}

// ===============================
// SEARCH & SORT UTILITIES
// ===============================
function filterMedicines() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    
    const filtered = allMedicines.filter(m => {
        const name = (m.medicineName || "").toLowerCase();
        const category = (categoriesMap[m.medicineCategoryId] || "").toLowerCase();
        const manufacturer = (manufacturersMap[m.manufacturerId] || "").toLowerCase();

        return name.includes(query) || category.includes(query) || manufacturer.includes(query);
    });

    renderTable(filtered);
}

function sortMedicinesById() {
    isAscending = !isAscending;
    allMedicines.sort((a, b) => isAscending ? a.medicineId - b.medicineId : b.medicineId - a.medicineId);
    
    const btn = document.getElementById("sortBtn");
    if (btn) btn.innerText = `Sort by ID (${isAscending ? "Asc" : "Desc"})`;

    filterMedicines();
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
}

function formatDateForInput(dateString) {
    if (!dateString) return "";
    return dateString.split("T")[0];
}