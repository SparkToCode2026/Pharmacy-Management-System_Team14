// ============================================================
// user-prescriptions.js
// Logic for User Prescriptions View using api.js
// ============================================================

function checkAccess() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "auth.html";
    return false;
  }
  return true;
}

// Get current logged in user ID
function getCurrentUserId() {
  const userJson = localStorage.getItem("currentUser");
  if (!userJson) return null;
  try {
    const user = JSON.parse(userJson);
    return user.userId || user.UserId || null;
  } catch {
    return null;
  }
}

let userPrescriptions = [];

// Load user's prescriptions
async function loadUserPrescriptions() {
  try {
    const tbody = document.getElementById("prescriptionsTableBody");
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Loading prescriptions...</td></tr>';
    }

    const currentUserId = getCurrentUserId();
    const role = getUserRole();

    const data = await apiGetPrescriptions();
    let all = data || [];

    // If regular customer, filter by user ID
    if (role === "user" && currentUserId) {
      all = all.filter((p) => (p.userId ?? p.UserId) === currentUserId);
    }

    userPrescriptions = all;

    if (!userPrescriptions || userPrescriptions.length === 0) {
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No prescriptions on record.</td></tr>';
      }
      return;
    }

    tbody.innerHTML = "";
    userPrescriptions.forEach((p) => {
      const id = p.prescriptionId ?? p.PrescriptionId;
      const doctor = p.prescriptionDoctorName ?? p.PrescriptionDoctorName ?? "—";
      const dosage = p.prescriptionDosage ?? p.PrescriptionDosage ?? "—";
      const duration = p.prescriptionDuration ?? p.PrescriptionDuration ?? "—";
      const status = p.prescriptionStatus ?? p.PrescriptionStatus ?? "Pending";
      const rawDate = p.prescriptionDate ?? p.PrescriptionDate;
      const dateIssued = rawDate ? new Date(rawDate).toLocaleDateString() : "—";

      const badgeColor =
        status === "Approved"
          ? "bg-success"
          : status === "Pending"
            ? "bg-warning text-dark"
            : "bg-secondary";

      tbody.innerHTML += `
        <tr>
          <td class="fw-bold">#${id}</td>
          <td class="fw-semibold">${doctor}</td>
          <td>${dosage}</td>
          <td>${duration}</td>
          <td><span class="badge ${badgeColor}">${status}</span></td>
          <td>${dateIssued}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-primary" onclick="viewPrescriptionDetails(${id})">
              Details
            </button>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error loading prescriptions:", error);
    const tbody = document.getElementById("prescriptionsTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Error loading prescriptions: ${error.message}</td></tr>`;
    }
  }
}

// View prescription details modal
function viewPrescriptionDetails(prescriptionId) {
  const p = userPrescriptions.find(
    (item) => (item.prescriptionId ?? item.PrescriptionId) === prescriptionId,
  );
  if (!p) {
    alert("Prescription details not found.");
    return;
  }

  const id = p.prescriptionId ?? p.PrescriptionId;
  const doctor = p.prescriptionDoctorName ?? p.PrescriptionDoctorName ?? "—";
  const dosage = p.prescriptionDosage ?? p.PrescriptionDosage ?? "—";
  const duration = p.prescriptionDuration ?? p.PrescriptionDuration ?? "—";
  const status = p.prescriptionStatus ?? p.PrescriptionStatus ?? "Pending";
  const rawDate = p.prescriptionDate ?? p.PrescriptionDate;
  const dateIssued = rawDate ? new Date(rawDate).toLocaleString() : "—";

  const content = `
    <div class="mb-3">
      <h5 class="text-primary fw-bold">Prescription #${id}</h5>
      <p class="mb-1"><strong>Doctor:</strong> ${doctor}</p>
      <p class="mb-1"><strong>Dosage Instructions:</strong> ${dosage}</p>
      <p class="mb-1"><strong>Course Duration:</strong> ${duration}</p>
      <p class="mb-1"><strong>Status:</strong> <span class="badge bg-secondary">${status}</span></p>
      <p class="mb-1"><strong>Date Issued:</strong> ${dateIssued}</p>
    </div>
  `;

  document.getElementById("prescriptionDetailsBody").innerHTML = content;
  new bootstrap.Modal(document.getElementById("prescriptionDetailsModal")).show();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (checkAccess()) {
    loadUserPrescriptions();
  }
});
