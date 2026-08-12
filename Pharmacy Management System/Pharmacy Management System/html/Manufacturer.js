const API_URL = "https://localhost:7293/Manufacturer";
let manufacturersList = [];
let isAscending = true;

document.addEventListener("DOMContentLoaded", () => {
  loadManufacturers();

  // Sort Button Listener
  document
    .getElementById("sortBtn")
    ?.addEventListener("click", sortManufacturersById);

  // Refresh Button Listener
  document
    .getElementById("refreshBtn")
    ?.addEventListener("click", loadManufacturers);

  // Search Button Listener
  document.getElementById("searchBtn")?.addEventListener("click", handleSearch);

  // Allow pressing Enter in search box
  document.getElementById("searchInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  // Optional real-time filtering as you type
  document
    .getElementById("searchInput")
    ?.addEventListener("input", handleSearch);

  // Add Manufacturer Submit
  document
    .getElementById("addManufacturerForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        manufacturerName: document.getElementById("manufacturerName").value,
        licenseNumber:
          document.getElementById("manufacturerLicense")?.value ||
          "LIC-" + Date.now(),
        contactNumber: document.getElementById("manufacturerPhone").value,
        contactEmail: document.getElementById("manufacturerEmail").value,
      };

      if (await sendRequest(`${API_URL}/CreateManufacturer`, "POST", payload)) {
        e.target.reset();
        loadManufacturers();
      }
    });

  // Edit Manufacturer Submit
  document
    .getElementById("editManufacturerForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("editManufacturerId").value;

      const payload = {
        manufacturerId: parseInt(id),
        manufacturerName: document.getElementById("editManufacturerName").value,
        contactEmail: document.getElementById("editManufacturerEmail").value,
        contactNumber: document.getElementById("editManufacturerPhone").value,
        licenseNumber:
          document.getElementById("editManufacturerLicense")?.value || "",
      };

      if (
        await sendRequest(
          `${API_URL}/UpdateManufacturer?id=${id}`,
          "PUT",
          payload,
        )
      ) {
        const modalEl = document.getElementById("editManufacturerModal");
        const modalInstance =
          bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
        loadManufacturers();
      }
    });
});

// Search function
function handleSearch() {
  const query =
    document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
  const filtered = manufacturersList.filter(
    (m) =>
      (m.manufacturerName &&
        m.manufacturerName.toLowerCase().includes(query)) ||
      (m.contactEmail && m.contactEmail.toLowerCase().includes(query)),
  );
  renderTable(filtered);
}

// Sort Function
function sortManufacturersById() {
  manufacturersList.sort((a, b) => {
    return isAscending
      ? a.manufacturerId - b.manufacturerId
      : b.manufacturerId - a.manufacturerId;
  });

  isAscending = !isAscending;

  const sortBtn = document.getElementById("sortBtn");
  if (sortBtn) {
    sortBtn.textContent = isAscending
      ? "Sort by ID (Asc)"
      : "Sort by ID (Desc)";
  }

  handleSearch(); // Render sorted list while keeping current search filter active
}

// API Helper
async function sendRequest(url, method, body = null) {
  try {
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Action failed");
    }
    return true;
  } catch (err) {
    alert("Error: " + err.message);
    return false;
  }
}

// Load Manufacturers
async function loadManufacturers() {
  try {
    const res = await fetch(`${API_URL}/GetAllManufacturers`);
    if (!res.ok) throw new Error("Failed to load manufacturers");
    manufacturersList = await res.json();
    renderTable(manufacturersList);
  } catch (err) {
    alert("Error loading manufacturers: " + err.message);
  }
}

// Render Table - Guaranteed 6 Columns
function renderTable(data) {
  const tbody = document.getElementById("manufacturersTableBody");
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map(
      (item) => `
    <tr>
      <td>${item.manufacturerId}</td>
      <td>${item.manufacturerName || "N/A"}</td>
      <td>${item.contactEmail || "N/A"}</td>
      <td>${item.contactNumber || "N/A"}</td>
      <td>${item.licenseNumber || "N/A"}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-info text-white me-1" 
                data-bs-toggle="modal" 
                data-bs-target="#manufacturerDetailsModal" 
                onclick="openDetailsModal(${item.manufacturerId})">Details</button>
        <button class="btn btn-sm btn-warning me-1" 
                data-bs-toggle="modal" 
                data-bs-target="#editManufacturerModal" 
                onclick="openEditModal(${item.manufacturerId})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteManufacturer(${item.manufacturerId})">Delete</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

// Open Details Modal
function openDetailsModal(id) {
  const item = manufacturersList.find((m) => m.manufacturerId === id);
  if (!item) return;

  document.getElementById("detailId").textContent = item.manufacturerId;
  document.getElementById("detailName").textContent =
    item.manufacturerName || "N/A";
  document.getElementById("detailEmail").textContent =
    item.contactEmail || "N/A";
  document.getElementById("detailPhone").textContent =
    item.contactNumber || "N/A";
  document.getElementById("detailLicense").textContent =
    item.licenseNumber || "N/A";
}

// Open Edit Modal
function openEditModal(id) {
  const item = manufacturersList.find((m) => m.manufacturerId === id);
  if (!item) return;

  document.getElementById("editManufacturerId").value = item.manufacturerId;
  document.getElementById("editManufacturerName").value =
    item.manufacturerName || "";
  document.getElementById("editManufacturerEmail").value =
    item.contactEmail || "";
  document.getElementById("editManufacturerPhone").value =
    item.contactNumber || "";
  document.getElementById("editManufacturerLicense").value =
    item.licenseNumber || "";
}

// Delete Manufacturer
async function deleteManufacturer(id) {
  if (confirm("Are you sure you want to delete this manufacturer?")) {
    if (await sendRequest(`${API_URL}/DeleteManufacturer?id=${id}`, "DELETE")) {
      loadManufacturers();
    }
  }
}

// Attach functions globally so HTML inline calls don't trigger ReferenceErrors
window.openDetailsModal = openDetailsModal;
window.openEditModal = openEditModal;
window.deleteManufacturer = deleteManufacturer;
window.sortManufacturersById = sortManufacturersById;
window.loadManufacturers = loadManufacturers;
