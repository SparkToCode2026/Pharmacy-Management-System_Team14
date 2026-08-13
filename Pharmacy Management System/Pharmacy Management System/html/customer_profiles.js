const API = "https://localhost:7293/CustomerProfile";

let currentprofiles = [];

// Fetch all profiles from the backend and show them in the table
function getAllProfiles() {
	fetch(`${API}/GetAllCustomerProfiles`)
		.then((res) => {
			if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
			return res.json();
		})
		.then((profiles) => {
			currentprofiles = profiles || [];
			renderprofilesTable(currentprofiles);
		})
		.catch((err) => {
			console.error("Failed to load profiles:", err);
			document.getElementById("ProfileTable").innerHTML = `
				<tr>
					<td colspan="5" class="text-center text-danger">Error connecting to server.</td>
				</tr>`;
		});
}

// Render profiles array into the table body
function renderprofilesTable(profiles) {
	const tbody = document.getElementById("ProfileTable");

	if (!profiles || profiles.length === 0) {
		tbody.innerHTML = `<tr><td colspan="5" class="text-center">No profiles found.</td></tr>`;
		return;
	}

	tbody.innerHTML = profiles
		.map(
			(p) => `
		<tr>
			<td>${p.CustomerId}</td>
			<td>${p.CustomerPhone}</td>
			<td>${p.CustomerAddress}</td>
			<td>${p.DateOfBirth}</td>
		</tr>`,
		)
		.join("");
}

// Handle form submission to add a new Profile
document.getElementById("ProfileForm")?.addEventListener("submit", (e) => {
	e.preventDefault();

  // collects the values to send to the backend
	const newProfile = {
		phone: document.getElementById("CustomerPhone").value,
		address: document.getElementById("CustomerAddress").value,
		Bdate: document.getElementById("DateOfBirth").value,
	};

	fetch(`${API}/AddCustomerProfile`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(newProfile),
	})
		.then(async (res) => {
			if (res.ok) {
				document.getElementById("ProfileForm").reset();
				getAllProfiles();
			} else {
				const txt = await res.text();
				alert("Failed to add a new Profile: " + txt);
			}
		})
		.catch((err) => console.error("Error adding Profile:", err));
});

// Load profiles function when the script runs
getAllProfiles();
