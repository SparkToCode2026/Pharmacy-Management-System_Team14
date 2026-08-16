// ============================================================
// prescription.js
// Logic for Prescription Management using api.js
// ============================================================

let currentPrescriptions = [];

// Set Today's Date Default for Input
function setDefaultDate() {
  const dateInput = document.getElementById("prescriptionDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

// 1. GET ALL PRESCRIPTIONS
async function getAllPrescriptions() {
  try {
    const data = await apiGetPrescriptions();
    currentPrescriptions = data || [];
    displayPrescriptions(currentPrescriptions);
  } catch (error) {
    console.error("GET Error:", error);
    const table = document.getElementById("prescriptionsTableBody");
    if (table) {
      table.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">Failed to load prescriptions: ${error.message}</td></tr>`;
    }
  }
}

// 2. DISPLAY TABLE
function displayPrescriptions(data) {
  const table = document.getElementById("prescriptionsTableBody");
  if (!table) return;

  if (!data || data.length === 0) {
    table.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No prescriptions found.</td></tr>`;
    return;
  }

  table.innerHTML = data
    .map((p) => {
      const id = p.prescriptionId ?? p.PrescriptionId;
      const doctor = p.prescriptionDoctorName ?? p.PrescriptionDoctorName ?? "—";
      const rawDate = p.prescriptionDate ?? p.PrescriptionDate;
      const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString() : "—";
      const dosage = p.prescriptionDosage ?? p.PrescriptionDosage ?? "—";
      const duration = p.prescriptionDuration ?? p.PrescriptionDuration ?? "—";
      const status = p.prescriptionStatus ?? p.PrescriptionStatus ?? "Pending";
      const userId = p.userId ?? p.UserId ?? "—";

      const badgeColor = status === "Approved" ? "success" : status === "Pending" ? "warning text-dark" : "secondary";

      return `
        <tr>
            <td class="fw-bold">#${id}</td>
            <td class="fw-semibold">${doctor}</td>
            <td>${formattedDate}</td>
            <td>${dosage}</td>
            <td>${duration}</td>
            <td><span class="badge bg-${badgeColor}">${status}</span></td>
            <td>${userId}</td>
            <td class="text-center text-nowrap">
                <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePrescriptionAction(${id})">Delete</button>
            </td>
        </tr>`;
    })
    .join("");
}

// 3. ADD PRESCRIPTION
document.getElementById("addPrescriptionForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const prescription = {
    prescriptionDoctorName: document.getElementById("prescriptionDoctorName").value.trim(),
    prescriptionDate: document.getElementById("prescriptionDate").value,
    prescriptionDosage: document.getElementById("prescriptionDosage").value.trim(),
    prescriptionDuration: document.getElementById("prescriptionDuration").value.trim(),
    prescriptionStatus: document.getElementById("prescriptionStatus").value,
    userId: parseInt(document.getElementById("userId").value),
  };

  try {
    await apiCreatePrescription(prescription);
    alert("Prescription added successfully!");
    document.getElementById("addPrescriptionForm").reset();
    setDefaultDate();
    getAllPrescriptions();
  } catch (error) {
    console.error("Add Error:", error);
    alert(`Error adding prescription: ${error.message}`);
  }
});

// 4. OPEN EDIT MODAL
async function openEditModal(id) {
  try {
    const p = await apiGetPrescriptionById(id);

    document.getElementById("editPrescriptionId").value = p.prescriptionId ?? p.PrescriptionId;
    document.getElementById("editDoctorName").value = p.prescriptionDoctorName ?? p.PrescriptionDoctorName ?? "";

    const rawDate = p.prescriptionDate ?? p.PrescriptionDate;
    document.getElementById("editDate").value = rawDate ? rawDate.substring(0, 10) : "";
    document.getElementById("editDosage").value = p.prescriptionDosage ?? p.PrescriptionDosage ?? "";
    document.getElementById("editDuration").value = p.prescriptionDuration ?? p.PrescriptionDuration ?? "";
    document.getElementById("editStatus").value = p.prescriptionStatus ?? p.PrescriptionStatus ?? "Pending";
    document.getElementById("editUserId").value = p.userId ?? p.UserId ?? "";

    const modalEl = document.getElementById("editPrescriptionModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (error) {
    console.error("Fetch Single Error:", error);
    alert("Failed to fetch prescription details: " + error.message);
  }
}

// 5. UPDATE PRESCRIPTION
document.getElementById("editPrescriptionForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = parseInt(document.getElementById("editPrescriptionId").value);

  const prescription = {
    prescriptionId: id,
    prescriptionDoctorName: document.getElementById("editDoctorName").value.trim(),
    prescriptionDate: document.getElementById("editDate").value,
    prescriptionDosage: document.getElementById("editDosage").value.trim(),
    prescriptionDuration: document.getElementById("editDuration").value.trim(),
    prescriptionStatus: document.getElementById("editStatus").value,
    userId: parseInt(document.getElementById("editUserId").value),
  };

  try {
    await apiUpdatePrescription(id, prescription);
    alert("Prescription updated successfully!");
    const modalEl = document.getElementById("editPrescriptionModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();

    getAllPrescriptions();
  } catch (error) {
    console.error("Update Error:", error);
    alert(`Update failed: ${error.message}`);
  }
});

// 6. DELETE PRESCRIPTION
async function deletePrescriptionAction(id) {
  if (!confirm(`Are you sure you want to delete prescription #${id}?`)) return;

  try {
    await apiDeletePrescription(id);
    alert("Prescription deleted successfully!");
    getAllPrescriptions();
  } catch (error) {
    console.error("Delete Error:", error);
    alert(`Delete failed: ${error.message}`);
  }
}

// 7. SORT PRESCRIPTIONS
async function sortPrescriptionsAction() {
  try {
    const sorted = await apiSortPrescriptions();
    displayPrescriptions(sorted);
  } catch {
    currentPrescriptions.sort((a, b) => {
      const docA = (a.prescriptionDoctorName || "").toLowerCase();
      const docB = (b.prescriptionDoctorName || "").toLowerCase();
      return docA.localeCompare(docB);
    });
    displayPrescriptions(currentPrescriptions);
  }
}

// INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
  setDefaultDate();
  getAllPrescriptions();
});
