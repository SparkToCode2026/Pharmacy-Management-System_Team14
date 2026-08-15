const API = "https://localhost:7293/api/Supplier";

// Helper for Auth Headers
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// ===============================
// GET ALL SUPPLIERS
// ===============================
async function getAllSuppliers() {
  try {
    const response = await fetch(`${API}/GetSuppliers`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    displaySuppliers(data);
  } catch (error) {
    console.error("GET Error:", error);
  }
}

// ===============================
// DISPLAY SUPPLIERS TABLE
// ===============================
function displaySuppliers(data) {
  const table = document.getElementById("suppliersTableBody");
  table.innerHTML = "";

  if (!data || data.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="text-center">No suppliers found.</td></tr>`;
    return;
  }

  data.forEach((s) => {
    table.innerHTML += `
        <tr>
            <td>${s.supplierId}</td>
            <td>${s.supplierName}</td>
            <td>${s.supplierPhone}</td>
            <td>${s.supplierEmail}</td>
            <td>${s.supplierAddress}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning me-1" onclick="openEditSupplier(${s.supplierId})">
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSupplier(${s.supplierId})">
                    Delete
                </button>
            </td>
        </tr>
        `;
  });
}

// ===============================
// SEARCH SUPPLIER BY NAME
// ===============================
async function searchSuppliers() {
  const name = document.getElementById("searchSupplierInput")?.value.trim();
  if (!name) {
    getAllSuppliers();
    return;
  }

  try {
    const response = await fetch(`${API}/search/${encodeURIComponent(name)}`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      displaySuppliers(data);
    } else {
      console.error("Search failed");
    }
  } catch (error) {
    console.error("Search Error:", error);
  }
}

// ===============================
// ADD SUPPLIER
// ===============================
document
  .getElementById("addSupplierForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const supplier = {
      supplierName: document.getElementById("supplierName").value,
      supplierPhone: document.getElementById("supplierPhone").value,
      supplierEmail: document.getElementById("supplierEmail").value,
      supplierAddress: document.getElementById("supplierAddress").value,
    };

    try {
      const response = await fetch(`${API}/CreateSupplier`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(supplier),
      });

      if (response.ok) {
        alert("Supplier Added Successfully");
        document.getElementById("addSupplierForm").reset();
        getAllSuppliers();
      } else {
        const err = await response.text();
        alert(`Failed to add supplier: ${err}`);
      }
    } catch (error) {
      console.error("POST Error:", error);
    }
  });

// ===============================
// DELETE SUPPLIER
// ===============================
async function deleteSupplier(id) {
  if (!confirm("Delete Supplier?")) return;

  try {
    const response = await fetch(`${API}/DeleteSupplier/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      alert("Supplier Deleted");
      getAllSuppliers();
    } else {
      alert("Failed to delete supplier.");
    }
  } catch (error) {
    console.error("DELETE Error:", error);
  }
}

// ===============================
// OPEN EDIT MODAL
// ===============================
async function openEditSupplier(id) {
  try {
    const response = await fetch(`${API}/GetSupplierById/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Could not fetch supplier details.");

    const s = await response.json();

    document.getElementById("editSupplierId").value = s.supplierId;
    document.getElementById("editSupplierName").value = s.supplierName;
    document.getElementById("editSupplierPhone").value = s.supplierPhone;
    document.getElementById("editSupplierEmail").value = s.supplierEmail;
    document.getElementById("editSupplierAddress").value = s.supplierAddress;

    let modal = new bootstrap.Modal(
      document.getElementById("editSupplierModal"),
    );
    modal.show();
  } catch (error) {
    console.error("Fetch Supplier Error:", error);
  }
}

// ===============================
// UPDATE SUPPLIER
// ===============================
document
  .getElementById("editSupplierForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = parseInt(document.getElementById("editSupplierId").value);

    const supplier = {
      supplierId: id,
      supplierName: document.getElementById("editSupplierName").value,
      supplierPhone: document.getElementById("editSupplierPhone").value,
      supplierEmail: document.getElementById("editSupplierEmail").value,
      supplierAddress: document.getElementById("editSupplierAddress").value,
    };

    try {
      const response = await fetch(`${API}/UpdateSupplier/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(supplier),
      });

      if (response.ok) {
        alert("Supplier Updated");
        const modalEl = document.getElementById("editSupplierModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        getAllSuppliers();
      } else {
        const err = await response.text();
        alert(`Update failed: ${err}`);
      }
    } catch (error) {
      console.error("PUT Error:", error);
    }
  });

// ===============================
// LOAD DATA
// ===============================
getAllSuppliers();
