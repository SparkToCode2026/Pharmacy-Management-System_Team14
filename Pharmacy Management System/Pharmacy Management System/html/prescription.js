const API = "https://localhost:7293/api/Prescription";

let currentEditId = 0;

// Auth Helper Function
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Set Today's Date Default for Input
function setDefaultDate() {
  const dateInput = document.getElementById("prescriptionDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

// ===============================
// GET ALL PRESCRIPTIONS
// ===============================
async function getAllPrescriptions() {
  try {
    const response = await fetch(`${API}/GetAllPrescriptions`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    displayPrescriptions(data);
  } catch (error) {
    console.error("GET Error:", error);
    const table = document.getElementById("prescriptionsTableBody");
    table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Failed to load prescriptions.</td></tr>`;
  }
}

// ===============================
// DISPLAY TABLE
// ===============================
function displayPrescriptions(data) {
  const table = document.getElementById("prescriptionsTableBody");
  table.innerHTML = "";

  if (!data || data.length === 0) {
    table.innerHTML = `<tr><td colspan="8" class="text-center">No prescriptions found.</td></tr>`;
    return;
  }

  data.forEach((p) => {
    const formattedDate = p.prescriptionDate
      ? p.prescriptionDate.split("T")[0]
      : "";
    table.innerHTML += `
        <tr>
            <td>${p.prescriptionId}</td>
            <td>${p.prescriptionDoctorName}</td>
            <td>${formattedDate}</td>
            <td>${p.prescriptionDosage}</td>
            <td>${p.prescriptionDuration}</td>
            <td><span class="badge bg-${p.prescriptionStatus === "Approved" ? "success" : p.prescriptionStatus === "Pending" ? "warning text-dark" : "secondary"}">${p.prescriptionStatus}</span></td>
            <td>${p.userId}</td>
            <td class="text-center text-nowrap">
                <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${p.prescriptionId})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePrescription(${p.prescriptionId})">Delete</button>
            </td>
        </tr>`;
  });
}

// ===============================
// ADD PRESCRIPTION
// ===============================
document
  .getElementById("addPrescriptionForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const prescription = {
      prescriptionDoctorName: document.getElementById("prescriptionDoctorName")
        .value,
      prescriptionDate: document.getElementById("prescriptionDate").value,
      prescriptionDosage: document.getElementById("prescriptionDosage").value,
      prescriptionDuration: document.getElementById("prescriptionDuration")
        .value,
      prescriptionStatus: document.getElementById("prescriptionStatus").value,
      userId: parseInt(document.getElementById("userId").value),
    };

    try {
      const response = await fetch(`${API}/CreatePrescription`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(prescription),
      });

      if (response.ok) {
        alert("Prescription Added Successfully");
        document.getElementById("addPrescriptionForm").reset();
        setDefaultDate();
        getAllPrescriptions();
      } else {
        const errText = await response.text();
        alert(`Error: ${errText}`);
      }
    } catch (error) {
      console.error("Add Error:", error);
    }
  });

// ===============================
// DELETE PRESCRIPTION
// ===============================
async function deletePrescription(id) {
  if (!confirm("Are you sure you want to delete this prescription?")) return;

  try {
    const response = await fetch(`${API}/DeletePrescription/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      alert("Deleted Successfully");
      getAllPrescriptions();
    } else {
      const errText = await response.text();
      alert(`Delete failed: ${errText}`);
    }
  } catch (error) {
    console.error("Delete Error:", error);
  }
}

// ===============================
// OPEN EDIT MODAL
// ===============================
async function openEditModal(id) {
  currentEditId = id;

  try {
    const response = await fetch(`${API}/GetPrescriptionById/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      alert("Failed to fetch prescription details.");
      return;
    }

    const p = await response.json();

    document.getElementById("editPrescriptionId").value = p.prescriptionId;
    document.getElementById("editDoctorName").value = p.prescriptionDoctorName;
    document.getElementById("editDate").value = p.prescriptionDate
      ? p.prescriptionDate.substring(0, 10)
      : "";
    document.getElementById("editDosage").value = p.prescriptionDosage;
    document.getElementById("editDuration").value = p.prescriptionDuration;
    document.getElementById("editStatus").value = p.prescriptionStatus;
    document.getElementById("editUserId").value = p.userId;

    const modalEl = document.getElementById("editPrescriptionModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (error) {
    console.error("Fetch Single Error:", error);
  }
}

// ===============================
// UPDATE PRESCRIPTION
// ===============================
document
  .getElementById("editPrescriptionForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = parseInt(document.getElementById("editPrescriptionId").value);

    const prescription = {
      prescriptionId: id,
      prescriptionDoctorName: document.getElementById("editDoctorName").value,
      prescriptionDate: document.getElementById("editDate").value,
      prescriptionDosage: document.getElementById("editDosage").value,
      prescriptionDuration: document.getElementById("editDuration").value,
      prescriptionStatus: document.getElementById("editStatus").value,
      userId: parseInt(document.getElementById("editUserId").value),
    };

    try {
      const response = await fetch(`${API}/UpdatePrescription/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(prescription),
      });

      if (response.ok) {
        alert("Updated Successfully");
        const modalEl = document.getElementById("editPrescriptionModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        getAllPrescriptions();
      } else {
        const errText = await response.text();
        alert(`Update failed: ${errText}`);
      }
    } catch (error) {
      console.error("Update Error:", error);
    }
  });

// ===============================
// INITIAL LOAD
// ===============================
setDefaultDate();
getAllPrescriptions();
