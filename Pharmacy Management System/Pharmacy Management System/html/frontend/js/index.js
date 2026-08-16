// ============================================================
// index.js — powers index.html (the product list page)
// ============================================================

document.addEventListener("DOMContentLoaded", loadProducts);

async function loadProducts() {
  const container = document.getElementById("productsContainer");

  try {
    const products = await getProducts();

    if (products.length === 0) {
      container.innerHTML = '<p class="text-muted">No products yet. Add your first one!</p>';
      return;
    }

    // Build one card per product, then join them into a single HTML string.
    container.innerHTML = products.map(renderProductCard).join("");
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Could not load products: ${err.message}</div>`;
  }
}

function renderProductCard(product) {
  const image = product.imageUrl || "https://placehold.co/300x200?text=No+Image";

  return `
    <div class="col-12 col-md-6 col-lg-4 mb-4">
      <div class="card h-100 shadow-sm">
        <img src="${image}" class="card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text text-muted mb-3">$${product.price.toFixed(2)}</p>
          <a href="product-details.html?id=${product.id}" class="btn btn-primary mt-auto">View Details</a>
        </div>
      </div>
    </div>
  `;
}
