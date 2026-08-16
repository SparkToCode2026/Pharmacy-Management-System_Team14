// ============================================================
// api.js
// Every call to the backend lives in this one file. Every page
// (index, details, form) imports this file and calls these
// functions instead of writing fetch() calls of their own.
// ============================================================

// Change this if your backend runs on a different port.
const API_BASE_URL = "http://localhost:5100/api/products";

// GET all products
async function getProducts() {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error("Failed to load products");
  }
  return response.json();
}

// GET one product by id
async function getProduct(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error("Product not found");
  }
  return response.json();
}

// POST a new product
async function createProduct(product) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  });
  if (!response.ok) {
    throw new Error("Failed to create product");
  }
  return response.json();
}

// PUT (update) an existing product
async function updateProduct(id, product) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  });
  if (!response.ok) {
    throw new Error("Failed to update product");
  }
  // PUT returns 204 No Content on success — nothing to parse/return
}

// DELETE a product
async function deleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
}
