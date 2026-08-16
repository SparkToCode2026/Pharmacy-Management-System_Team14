// ============================================================
// product-details.js — powers product-details.html
// ============================================================

document.addEventListener("DOMContentLoaded", loadProductDetails);

// Reads ?id=... from the current page's URL
function getIdFromQueryString() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadProductDetails() {
  const id = getIdFromQueryString();
  const container = document.getElementById("productDetails");

  if (!id) {
    container.innerHTML = '<div class="alert alert-danger">No product id provided in the URL.</div>';
    return;
  }

  try {
    const product = await getProduct(id);
    const image = product.imageUrl || "https://placehold.co/400x300?text=No+Image";

    container.innerHTML = `
      <div class="row">
        <div class="col-12 col-md-5 mb-3">
          <img src="${image}" class="img-fluid rounded" alt="${product.name}">
        </div>
        <div class="col-12 col-md-7">
          <h1>${product.name}</h1>
          <p class="text-muted">${product.description || ""}</p>
          <h3 class="text-primary">$${product.price.toFixed(2)}</h3>
          <p>In stock: ${product.stock}</p>
          <a href="product-form.html?id=${product.id}" class="btn btn-outline-primary me-2">Edit</a>
          <button type="button" class="btn btn-outline-danger" id="deleteBtn">Delete</button>
        </div>
      </div>
    `;

    // Wire the delete button AFTER it exists in the DOM (it was just created above)
    document.getElementById("deleteBtn").addEventListener("click", async () => {
      const confirmed = confirm(`Delete "${product.name}"? This can't be undone.`);
      if (!confirmed) return;

      await deleteProduct(product.id);
      window.location.href = "index.html";
    });
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}
