const API = "https://localhost:7293/api/Prescription";

let currentEditId = 0;


// ===============================
// GET ALL PRESCRIPTIONS
// ===============================

async function getAllPrescriptions() {

    try {

        const response = await fetch(
            `${API}/GetAllPrescriptions`
        );

        const data = await response.json();

        displayPrescriptions(data);

    } catch (error) {

        console.error("GET Error:", error);

    }

}



// ===============================
// DISPLAY TABLE
// ===============================

function displayPrescriptions(data) {


    const table =
    document.getElementById("prescriptionsTableBody");


    table.innerHTML = "";



    data.forEach(p => {


        table.innerHTML += `

        <tr>

            <td>${p.prescriptionId}</td>

            <td>${p.prescriptionDoctorName}</td>

            <td>${p.prescriptionDate}</td>

            <td>${p.prescriptionDosage}</td>

            <td>${p.prescriptionDuration}</td>

            <td>${p.prescriptionStatus}</td>

            <td>${p.userId}</td>


            <td class="text-center">


                <button 
                class="btn btn-sm btn-warning me-1"
                onclick="openEditModal(${p.prescriptionId})">

                Edit

                </button>



                <button
                class="btn btn-sm btn-danger"
                onclick="deletePrescription(${p.prescriptionId})">

                Delete

                </button>


            </td>


        </tr>

        `;


    });


}






// ===============================
// ADD PRESCRIPTION
// ===============================


document
.getElementById("addPrescriptionForm")
.addEventListener("submit", async function(e){


    e.preventDefault();



    const prescription = {


        prescriptionDoctorName:
        document.getElementById("prescriptionDoctorName").value,


        prescriptionDate:
        document.getElementById("prescriptionDate").value,


        prescriptionDosage:
        document.getElementById("prescriptionDosage").value,


        prescriptionDuration:
        document.getElementById("prescriptionDuration").value,


        prescriptionStatus:
        document.getElementById("prescriptionStatus").value,


        userId:
        parseInt(
        document.getElementById("userId").value
        )


    };



    await fetch(
        `${API}/CreatePrescription`,
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },


            body:JSON.stringify(prescription)

        }
    );



    alert("Prescription Added");


    document
    .getElementById("addPrescriptionForm")
    .reset();



    getAllPrescriptions();



});







// ===============================
// DELETE PRESCRIPTION
// ===============================


async function deletePrescription(id){


    if(!confirm("Delete Prescription?"))
    return;



    await fetch(

        `${API}/DeletePrescription?id=${id}`,

        {

            method:"DELETE"

        }

    );



    alert("Deleted");


    getAllPrescriptions();


}







// ===============================
// OPEN EDIT MODAL
// ===============================


async function openEditModal(id){


    currentEditId = id;



    const response = await fetch(

        `${API}/GetPrescriptionById?id=${id}`

    );


    const p = await response.json();




    document.getElementById("editPrescriptionId").value =
    p.prescriptionId;



    document.getElementById("editDoctorName").value =
    p.prescriptionDoctorName;



    document.getElementById("editDate").value =
    p.prescriptionDate.substring(0,10);



    document.getElementById("editDosage").value =
    p.prescriptionDosage;



    document.getElementById("editDuration").value =
    p.prescriptionDuration;



    document.getElementById("editStatus").value =
    p.prescriptionStatus;



    document.getElementById("editUserId").value =
    p.userId;





    let modal =
    new bootstrap.Modal(
    document.getElementById("editPrescriptionModal")
    );


    modal.show();



}








// ===============================
// UPDATE PRESCRIPTION
// ===============================


document
.getElementById("editPrescriptionForm")
.addEventListener("submit", async function(e){


    e.preventDefault();



    const id =
    parseInt(
    document.getElementById("editPrescriptionId").value
    );




    const prescription = {


        prescriptionId:id,


        prescriptionDoctorName:
        document.getElementById("editDoctorName").value,


        prescriptionDate:
        document.getElementById("editDate").value,


        prescriptionDosage:
        document.getElementById("editDosage").value,


        prescriptionDuration:
        document.getElementById("editDuration").value,


        prescriptionStatus:
        document.getElementById("editStatus").value,


        userId:
        parseInt(
        document.getElementById("editUserId").value
        )


    };




    await fetch(

        `${API}/UpdatePrescription?id=${id}`,

        {

            method:"PUT",

            headers:{

                "Content-Type":"application/json"

            },


            body:JSON.stringify(prescription)

        }

    );



    alert("Updated Successfully");


    getAllPrescriptions();


});






// ===============================
// LOAD PAGE
// ===============================


getAllPrescriptions();