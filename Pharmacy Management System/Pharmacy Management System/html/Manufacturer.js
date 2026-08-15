const API_URL = "https://localhost:7293/api/Manufacturer";
let manufacturersList = [];
let isAscending = true;

function getAuthToken() {
  return localStorage.getItem("token");
}

function checkAuth() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "login.html";
    return false;
  }
  return token;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) return;

  loadManufacturers();

  document
    .getElementById("sortBtn")
    ?.addEventListener("click", sortManufacturersById);

  document
    .getElementById("refreshBtn")
    ?.addEventListener("click", loadManufacturers);

  document.getElementById("searchBtn")?.addEventListener("click", handleSearch);

  document.getElementById("searchInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  document
    .getElementById("searchInput")
    ?.addEventListener("input", handleSearch);

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
        await sendRequest(`${API_URL}/UpdateManufacturer/${id}`, "PUT", payload)
      ) {
        const modalEl = document.getElementById("editManufacturerModal");
        const modalInstance =
          bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
        loadManufacturers();
      }
    });
});

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

  handleSearch();
}

async function sendRequest(url, method, body = null) {
  const token = checkAuth();
  if (!token) return false;

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);

    if (res.status === 401 || res.status === 403) {
      alert("Session expired or unauthorized. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return false;
    }

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

async function loadManufacturers() {
  const token = checkAuth();
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/GetAllManufacturers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      alert("Session expired or unauthorized. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    if (!res.ok) throw new Error("Failed to load manufacturers");
    manufacturersList = await res.json();
    renderTable(manufacturersList);
  } catch (err) {
    alert("Error loading manufacturers: " + err.message);
  }
}

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

async function deleteManufacturer(id) {
  if (confirm("Are you sure you want to delete this manufacturer?")) {
    if (await sendRequest(`${API_URL}/DeleteManufacturer/${id}`, "DELETE")) {
      loadManufacturers();
    }
  }
}

window.openDetailsModal = openDetailsModal;
window.openEditModal = openEditModal;
window.deleteManufacturer = deleteManufacturer;
window.sortManufacturersById = sortManufacturersById;
window.loadManufacturers = loadManufacturers;
