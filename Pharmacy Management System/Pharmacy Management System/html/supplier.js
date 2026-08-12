const API = "https://localhost:7293/api/Supplier";


// ===============================
// GET ALL SUPPLIERS
// ===============================

async function getAllSuppliers() {


    try {


        const response = await fetch(
            `${API}/GetSuppliers`
        );


        const data = await response.json();


        displaySuppliers(data);



    } catch(error){


        console.error("GET Error:", error);


    }


}






// ===============================
// DISPLAY SUPPLIERS TABLE
// ===============================

function displaySuppliers(data){


    const table =
    document.getElementById("suppliersTableBody");


    table.innerHTML = "";



    data.forEach(s => {


        table.innerHTML += `


        <tr>


            <td>${s.supplierId}</td>


            <td>${s.supplierName}</td>


            <td>${s.supplierPhone}</td>


            <td>${s.supplierEmail}</td>


            <td>${s.supplierAddress}</td>




            <td class="text-center">


            <button
            class="btn btn-sm btn-warning me-1"
            onclick="openEditSupplier(${s.supplierId})">


            Edit


            </button>




            <button
            class="btn btn-sm btn-danger"
            onclick="deleteSupplier(${s.supplierId})">


            Delete


            </button>



            </td>



        </tr>


        `;



    });


}








// ===============================
// ADD SUPPLIER
// ===============================


document
.getElementById("addSupplierForm")
.addEventListener("submit", async function(e){



    e.preventDefault();



    const supplier = {



        supplierName:
        document.getElementById("supplierName").value,



        supplierPhone:
        document.getElementById("supplierPhone").value,



        supplierEmail:
        document.getElementById("supplierEmail").value,



        supplierAddress:
        document.getElementById("supplierAddress").value



    };





    await fetch(

        `${API}/CreateSupplier`,

        {


            method:"POST",


            headers:{


                "Content-Type":"application/json"


            },


            body:JSON.stringify(supplier)



        }


    );




    alert("Supplier Added Successfully");



    document
    .getElementById("addSupplierForm")
    .reset();




    getAllSuppliers();



});









// ===============================
// DELETE SUPPLIER
// ===============================


async function deleteSupplier(id){



    if(!confirm("Delete Supplier?"))
    return;




    await fetch(

        `${API}/DeleteSupplier?id=${id}`,

        {


            method:"DELETE"


        }


    );




    alert("Supplier Deleted");



    getAllSuppliers();



}









// ===============================
// OPEN EDIT MODAL
// ===============================


async function openEditSupplier(id){



    const response = await fetch(

        `${API}/GetSupplierById?id=${id}`

    );



    const s = await response.json();




    document.getElementById("editSupplierId").value =
    s.supplierId;



    document.getElementById("editSupplierName").value =
    s.supplierName;



    document.getElementById("editSupplierPhone").value =
    s.supplierPhone;



    document.getElementById("editSupplierEmail").value =
    s.supplierEmail;



    document.getElementById("editSupplierAddress").value =
    s.supplierAddress;





    let modal =
    new bootstrap.Modal(
    document.getElementById("editSupplierModal")
    );



    modal.show();



}









// ===============================
// UPDATE SUPPLIER
// ===============================


document
.getElementById("editSupplierForm")
.addEventListener("submit", async function(e){



    e.preventDefault();




    const id =
    parseInt(
    document.getElementById("editSupplierId").value
    );





    const supplier = {



        supplierId:id,



        supplierName:
        document.getElementById("editSupplierName").value,



        supplierPhone:
        document.getElementById("editSupplierPhone").value,



        supplierEmail:
        document.getElementById("editSupplierEmail").value,



        supplierAddress:
        document.getElementById("editSupplierAddress").value



    };






    await fetch(

        `${API}/UpdateSupplier?id=${id}`,

        {


            method:"PUT",


            headers:{


                "Content-Type":"application/json"


            },


            body:JSON.stringify(supplier)



        }


    );




    alert("Supplier Updated");



    getAllSuppliers();



});








// ===============================
// LOAD DATA
// ===============================


getAllSuppliers();