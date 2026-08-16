// ============================================================
// product-form.js — powers product-form.html
// Same page, same form, does double duty:
//   - no "?id=" in the URL  -> Create mode (POST)
//   - "?id=123" in the URL  -> Edit mode (GET to pre-fill, then PUT)
// ============================================================

document.addEventListener("DOMContentLoaded", initForm);

function getIdFromQueryString() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function initForm() {
  const id = getIdFromQueryString();
  const form = document.getElementById("productForm");
  const heading = document.getElementById("formHeading");

  if (id) {
    // Edit mode: load the existing product and fill the form with its values
    heading.textContent = "Edit Product";

    const product = await getProduct(id);
    document.getElementById("name").value = product.name;
    document.getElementById("description").value = product.description || "";
    document.getElementById("price").value = product.price;
    document.getElementById("stock").value = product.stock;
    document.getElementById("imageUrl").value = product.imageUrl || "";
  } else {
    // Create mode: nothing to pre-fill
    heading.textContent = "Add New Product";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // stop the browser's default full-page form submit

    const product = {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      price: parseFloat(document.getElementById("price").value),
      stock: parseInt(document.getElementById("stock").value, 10),
      imageUrl: document.getElementById("imageUrl").value
    };

    try {
      if (id) {
        await updateProduct(id, product);
        window.location.href = `product-details.html?id=${id}`;
      } else {
        const created = await createProduct(product);
        window.location.href = `product-details.html?id=${created.id}`;
      }
    } catch (err) {
      alert("Something went wrong: " + err.message);
    }
  });
}
