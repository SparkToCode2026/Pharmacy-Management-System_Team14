// ============================================================
// Manufacturer.js
// Logic for Manufacturer Management using api.js
// ============================================================

let currentManufacturers = [];

// Check Access
function checkAccess() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "auth.html";
    return false;
  }
  return true;
}

// 1. GET ALL MANUFACTURERS
async function fetchManufacturers() {
  try {
    const data = await apiGetManufacturers();
    currentManufacturers = data || [];
    renderTable(currentManufacturers);
  } catch (error) {
    console.error("Error loading manufacturers:", error);
    const tbody = document.getElementById("manufacturersTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load manufacturers: ${error.message}</td></tr>`;
    }
  }
}

// Render data to table
function renderTable(data) {
  const tbody = document.getElementById("manufacturersTableBody");
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No manufacturers found.</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map((item) => {
      const id = item.manufacturerId ?? item.ManufacturerId;
      const name = item.manufacturerName ?? item.ManufacturerName ?? "";
      const license = item.licenseNumber ?? item.LicenseNumber ?? "";
      const contactNum = item.contactNumber ?? item.ContactNumber ?? "";
      const contactMail = item.contactEmail ?? item.ContactEmail ?? "";

      return `
        <tr>
          <td class="fw-bold">#${id}</td>
          <td class="fw-semibold">${name}</td>
          <td>${license || "—"}</td>
          <td>${contactNum || "—"}</td>
          <td>${contactMail || "—"}</td>
          <td class="text-center text-nowrap">
            <button class="btn btn-info btn-sm text-white me-1" onclick="openDetailsModal(${id})">Details</button>
            <button class="btn btn-warning btn-sm me-1" onclick="openEditModal(${id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteManufacturer(${id})">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

// 2. CREATE MANUFACTURER
document.getElementById("createForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newManufacturer = {
    manufacturerName: document.getElementById("createName").value.trim(),
    licenseNumber: document.getElementById("createLicense").value.trim(),
    contactNumber: document.getElementById("createContactNumber").value.trim(),
    contactEmail: document.getElementById("createContactEmail").value.trim(),
  };

  try {
    await apiCreateManufacturer(newManufacturer);
    alert("Manufacturer created successfully!");

    document.getElementById("createForm").reset();
    const modalEl = document.getElementById("createModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    fetchManufacturers();
  } catch (error) {
    console.error("Error creating manufacturer:", error);
    alert(`Failed to create manufacturer: ${error.message}`);
  }
});

// 3. EDIT FULL MANUFACTURER (PUT)
document.getElementById("editForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editId").value;
  const updatedManufacturer = {
    manufacturerId: parseInt(id),
    manufacturerName: document.getElementById("editName").value.trim(),
    licenseNumber: document.getElementById("editLicense").value.trim(),
    contactNumber: document.getElementById("editContactNumber").value.trim(),
    contactEmail: document.getElementById("editContactEmail").value.trim(),
  };

  try {
    await apiUpdateManufacturer(id, updatedManufacturer);
    alert("Manufacturer updated successfully!");

    const modalEl = document.getElementById("editModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    fetchManufacturers();
  } catch (error) {
    console.error("Error updating manufacturer:", error);
    alert(`Failed to update manufacturer: ${error.message}`);
  }
});

// 4. PATCH CONTACT INFO
async function patchContactInfo() {
  const id = document.getElementById("editId").value;
  const contact = document.getElementById("editContactNumber").value.trim();

  if (!contact) {
    alert("Please enter a contact number.");
    return;
  }

  try {
    await apiUpdateManufacturerContact(id, contact);
    alert("Contact number updated successfully!");
    fetchManufacturers();
  } catch (error) {
    console.error("Error updating contact number:", error);
    alert(`Update failed: ${error.message}`);
  }
}

// 5. DELETE MANUFACTURER
async function deleteManufacturer(id) {
  if (!confirm(`Are you sure you want to delete Manufacturer ID: #${id}?`)) return;

  try {
    await apiDeleteManufacturer(id);
    alert("Manufacturer deleted successfully!");
    fetchManufacturers();
  } catch (error) {
    console.error("Error deleting manufacturer:", error);
    alert(`Failed to delete manufacturer: ${error.message}`);
  }
}

// 6. OPEN DETAILS MODAL
async function openDetailsModal(id) {
  try {
    const data = await apiGetManufacturerById(id);
    const idVal = data.manufacturerId ?? data.ManufacturerId;
    const nameVal = data.manufacturerName ?? data.ManufacturerName ?? "";
    const licenseVal = data.licenseNumber ?? data.LicenseNumber ?? "";
    const contactNumVal = data.contactNumber ?? data.ContactNumber ?? "";
    const contactMailVal = data.contactEmail ?? data.ContactEmail ?? "";

    document.getElementById("detailId").innerText = `#${idVal}`;
    document.getElementById("detailName").innerText = nameVal;
    document.getElementById("detailLicense").innerText = licenseVal || "—";
    document.getElementById("detailContactNumber").innerText = contactNumVal || "—";
    document.getElementById("detailContactEmail").innerText = contactMailVal || "—";

    const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
    modal.show();
  } catch (error) {
    console.error("Error loading manufacturer details:", error);
    alert(`Failed to fetch details: ${error.message}`);
  }
}

// 7. OPEN EDIT MODAL
async function openEditModal(id) {
  try {
    const data = await apiGetManufacturerById(id);
    const idVal = data.manufacturerId ?? data.ManufacturerId;
    const nameVal = data.manufacturerName ?? data.ManufacturerName ?? "";
    const licenseVal = data.licenseNumber ?? data.LicenseNumber ?? "";
    const contactNumVal = data.contactNumber ?? data.ContactNumber ?? "";
    const contactMailVal = data.contactEmail ?? data.ContactEmail ?? "";

    document.getElementById("editId").value = idVal;
    document.getElementById("editName").value = nameVal;
    document.getElementById("editLicense").value = licenseVal;
    document.getElementById("editContactNumber").value = contactNumVal;
    document.getElementById("editContactEmail").value = contactMailVal;

    const modal = new bootstrap.Modal(document.getElementById("editModal"));
    modal.show();
  } catch (error) {
    console.error("Error loading manufacturer for edit:", error);
    alert(`Failed to load manufacturer data: ${error.message}`);
  }
}

// 8. SEARCH MANUFACTURERS
async function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();

  if (!query) {
    renderTable(currentManufacturers);
    return;
  }

  try {
    const results = await apiSearchManufacturers(query);
    renderTable(Array.isArray(results) ? results : [results]);
  } catch {
    // Client-side fallback
    const filtered = currentManufacturers.filter((m) => {
      const name = (m.manufacturerName ?? m.ManufacturerName ?? "").toLowerCase();
      const lic = (m.licenseNumber ?? m.LicenseNumber ?? "").toLowerCase();
      const phone = (m.contactNumber ?? m.ContactNumber ?? "").toLowerCase();
      const email = (m.contactEmail ?? m.ContactEmail ?? "").toLowerCase();
      return (
        name.includes(query.toLowerCase()) ||
        lic.includes(query.toLowerCase()) ||
        phone.includes(query.toLowerCase()) ||
        email.includes(query.toLowerCase())
      );
    });
    renderTable(filtered);
  }
}

function clearManufacturerSearch() {
  document.getElementById("searchInput").value = "";
  renderTable(currentManufacturers);
}

// 9. SORT BY NAME
let sortAsc = true;
function sortManufacturers() {
  currentManufacturers.sort((a, b) => {
    const nameA = (a.manufacturerName ?? a.ManufacturerName ?? "").toLowerCase();
    const nameB = (b.manufacturerName ?? b.SupplierName ?? "").toLowerCase();
    return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });
  sortAsc = !sortAsc;
  renderTable(currentManufacturers);
}

// Event Listeners & Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (checkAccess()) {
    fetchManufacturers();

    document.getElementById("searchBtn")?.addEventListener("click", handleSearch);
    document.getElementById("searchInput")?.addEventListener("keyup", (e) => {
      if (e.key === "Enter") handleSearch();
      if (e.target.value === "") renderTable(currentManufacturers);
    });
  }
});
