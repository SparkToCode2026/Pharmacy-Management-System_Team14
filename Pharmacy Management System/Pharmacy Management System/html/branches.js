const API = "https://localhost:7293/Branch";

let currentBranches = [];

// Fetch all branches from the backend and show them in the table
function getAllBranches() {
	fetch(`${API}/GetAllBranch`)
		.then((res) => {
			if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
			return res.json();
		})
		.then((branches) => {
			currentBranches = branches || [];
			renderBranchesTable(currentBranches);
		})
		.catch((err) => {
			console.error("Failed to load branches:", err);
			document.getElementById("branchesTable").innerHTML = `
				<tr>
					<td colspan="5" class="text-center text-danger">Error connecting to server.</td>
				</tr>`;
		});
}

// Render branches array into the table body
function renderBranchesTable(branches) {
	const tbody = document.getElementById("branchesTable");

	if (!branches || branches.length === 0) {
		tbody.innerHTML = `<tr><td colspan="5" class="text-center">No branches found.</td></tr>`;
		return;
	}

	tbody.innerHTML = branches
		.map(
			(b) => `
		<tr>
			<td>${b.branchId}</td>
			<td>${b.branchName}</td>
			<td>${b.branchAddress}</td>
			<td>${b.branchCity}</td>
			<td>${b.branchPhone}</td>
		</tr>`,
		)
		.join("");
}

// Handle form submission to add a new branch
document.getElementById("branchForm")?.addEventListener("submit", (e) => {
	e.preventDefault();

  // collects the values to send to the backend
	const newBranch = {
		name: document.getElementById("BranchName").value,
		address: document.getElementById("BranchAddress").value,
		city: document.getElementById("BranchCity").value,
		phone: document.getElementById("BranchPhone").value,
	};

	fetch(`${API}/AddBranch`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(newBranch),
	})
		.then(async (res) => {
			if (res.ok) {
				document.getElementById("branchForm").reset();
				getAllBranches();
			} else {
				const txt = await res.text();
				alert("Failed to add branch: " + txt);
			}
		})
		.catch((err) => console.error("Error adding branch:", err));
});

// Load branches function when the script runs
getAllBranches();
