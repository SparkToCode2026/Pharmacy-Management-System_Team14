// ============================================================
// api.js
// Centralized API Client for Pharmacy Management System
// All backend communication is routed through these functions.
// ============================================================

const API_BASE = "http://localhost:7295";

const USER_API = `${API_BASE}/User`;
const BRANCH_API = `${API_BASE}/api/Branch`;
const CUSTOMER_PROFILE_API = `${API_BASE}/api/CustomerProfile`;
const MANUFACTURER_API = `${API_BASE}/api/Manufacturer`;
const MEDICINE_API = `${API_BASE}/api/Medicine`;
const CATEGORY_API = `${API_BASE}/api/MedicineCategory`;
const ORDER_API = `${API_BASE}/api/Order`;
const ORDER_ITEM_API = `${API_BASE}/api/OrderItem`;
const PAYMENT_API = `${API_BASE}/api/Payment`;
const PRESCRIPTION_API = `${API_BASE}/api/Prescription`;
const STOCK_LEVEL_API = `${API_BASE}/api/StockLevel`;
const SUPPLIER_API = `${API_BASE}/api/Supplier`;

/**
 * Build Authorization headers using JWT token from localStorage.
 */
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Standard fetch wrapper with automatic error handling and JSON parsing.
 */
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = "Request failed";
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.message || parsed.title || JSON.stringify(parsed);
    } catch {
      errorMessage = errorText || `HTTP error ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

// ============================================================
// 1. User Management APIs
// ============================================================
async function apiRegisterUser(user) {
  return apiRequest(`${USER_API}/register`, {
    method: "POST",
    body: JSON.stringify(user),
  });
}

async function apiLoginUser(loginData) {
  return apiRequest(`${USER_API}/login`, {
    method: "POST",
    body: JSON.stringify(loginData),
  });
}

async function apiGetUsers() {
  return apiRequest(`${USER_API}/GetAllUsers`);
}

async function apiGetUserById(id) {
  return apiRequest(`${USER_API}/GetUserById?id=${id}`);
}

async function apiSearchUsers(search) {
  return apiRequest(`${USER_API}/search?search=${encodeURIComponent(search || "")}`);
}

async function apiSortUsersById() {
  return apiRequest(`${USER_API}/SortByID`);
}

async function apiUpdateUser(id, user) {
  return apiRequest(`${USER_API}/UpdateUser?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
}

async function apiUpdatePassword(id, newPassword) {
  return apiRequest(`${USER_API}/UpdatePassword?id=${id}`, {
    method: "PATCH",
    body: JSON.stringify(newPassword),
  });
}

async function apiDeleteUser(id) {
  return apiRequest(`${USER_API}/DeleteUser?id=${id}`, {
    method: "DELETE",
  });
}

// Aliases
const getAllUsers = apiGetUsers;
const getUserById = apiGetUserById;
const addUser = apiRegisterUser;
const updateUser = apiUpdateUser;
const removeUser = apiDeleteUser;

// ============================================================
// 2. Branch APIs
// ============================================================
async function apiGetBranches() {
  return apiRequest(`${BRANCH_API}/GetAllBranch`);
}

async function apiGetBranchById(id) {
  return apiRequest(`${BRANCH_API}/GetBranch/${id}`);
}

async function apiGetBranchesByCity(city) {
  return apiRequest(`${BRANCH_API}/GetByBranchCity?city=${encodeURIComponent(city)}`);
}

async function apiGetTotalBranches() {
  return apiRequest(`${BRANCH_API}/GetTotalBranches`);
}

async function apiAddBranch(branch) {
  return apiRequest(`${BRANCH_API}/AddBranch`, {
    method: "POST",
    body: JSON.stringify(branch),
  });
}

async function apiUpdateBranch(id, branch) {
  return apiRequest(`${BRANCH_API}/UpdateAllBranch/${id}`, {
    method: "PUT",
    body: JSON.stringify(branch),
  });
}

async function apiUpdateBranchName(id, newName) {
  return apiRequest(`${BRANCH_API}/UpdateBranchName/${id}`, {
    method: "PATCH",
    body: JSON.stringify(newName),
  });
}

async function apiRemoveBranch(id) {
  return apiRequest(`${BRANCH_API}/RemoveBranch/${id}`, {
    method: "DELETE",
  });
}

// Aliases
const getBranches = apiGetBranches;
const getBranchById = apiGetBranchById;
const getBranchesByCity = apiGetBranchesByCity;
const fetchTotalBranches = apiGetTotalBranches;
const getTotalBranches = apiGetTotalBranches;
const addBranch = apiAddBranch;
const updateBranch = apiUpdateBranch;
const updateBranchName = apiUpdateBranchName;
const removeBranch = apiRemoveBranch;

// ============================================================
// 3. Customer Profile APIs
// ============================================================
async function apiAddCustomerProfile(profile) {
  return apiRequest(`${CUSTOMER_PROFILE_API}/AddCustomerProfile`, {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

async function apiGetMyProfile() {
  return apiRequest(`${CUSTOMER_PROFILE_API}/GetMyProfile`);
}

async function apiUpdateCustomerProfile(id, profile) {
  return apiRequest(`${CUSTOMER_PROFILE_API}/UpdateCustomerProfile/${id}`, {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

async function apiUpdateCustomerPhone(id, newPhone) {
  return apiRequest(`${CUSTOMER_PROFILE_API}/UpdateCustomerPhone/${id}`, {
    method: "PATCH",
    body: JSON.stringify(newPhone),
  });
}

async function apiDeleteCustomerProfile(id) {
  return apiRequest(`${CUSTOMER_PROFILE_API}/DeleteCustomerProfile/${id}`, {
    method: "DELETE",
  });
}

async function apiGetAllCustomerProfiles() {
  return apiRequest(`${CUSTOMER_PROFILE_API}/GetAllCustomerProfiles`);
}

async function apiGetCustomerProfileById(id) {
  return apiRequest(`${CUSTOMER_PROFILE_API}/GetCustomerProfile/${id}`);
}

async function apiGetCustomerProfileByUserId(userId) {
  return apiRequest(`${CUSTOMER_PROFILE_API}/GetCustomerProfileByUserId/${userId}`);
}

async function apiGetCustomerProfilesByAddress(address) {
  return apiRequest(`${CUSTOMER_PROFILE_API}/GetByAddress?address=${encodeURIComponent(address)}`);
}

async function apiGetTotalCustomerProfiles() {
  return apiRequest(`${CUSTOMER_PROFILE_API}/GetTotalProfiles`);
}

// Aliases
const getMyProfile = apiGetMyProfile;
const getAllCustomerProfiles = apiGetAllCustomerProfiles;
const getCustomerProfiles = apiGetAllCustomerProfiles;
const getCustomerProfileById = apiGetCustomerProfileById;

// ============================================================
// 4. Medicine APIs
// ============================================================
async function apiGetMedicines() {
  return apiRequest(`${MEDICINE_API}/GetAllMedicines`);
}

async function apiGetMedicineById(id) {
  return apiRequest(`${MEDICINE_API}/GetMedicineById/${id}`);
}

async function apiGetMedicinesByName(name) {
  return apiRequest(`${MEDICINE_API}/GetMedicinesByName?name=${encodeURIComponent(name)}`);
}

async function apiGetMedicinesByCategory(categoryId) {
  return apiRequest(`${MEDICINE_API}/GetMedicinesByCategory/${categoryId}`);
}

async function apiAddMedicine(medicine) {
  return apiRequest(`${MEDICINE_API}/AddMedicine`, {
    method: "POST",
    body: JSON.stringify(medicine),
  });
}

async function apiUpdateMedicine(id, medicine) {
  return apiRequest(`${MEDICINE_API}/UpdateMedicine/${id}`, {
    method: "PUT",
    body: JSON.stringify(medicine),
  });
}

async function apiUpdateMedicinePrice(id, price) {
  return apiRequest(`${MEDICINE_API}/UpdateMedicinePrice/${id}`, {
    method: "PATCH",
    body: JSON.stringify(price),
  });
}

async function apiUpdateMedicineDescription(id, description) {
  return apiRequest(`${MEDICINE_API}/UpdateMedicineDescription/${id}`, {
    method: "PATCH",
    body: JSON.stringify(description),
  });
}

async function apiUpdateMedicineExpiryDate(id, expiryDate) {
  return apiRequest(`${MEDICINE_API}/UpdateMedicineExpiryDate/${id}`, {
    method: "PATCH",
    body: JSON.stringify(expiryDate),
  });
}

async function apiUpdateMedicineProductionDate(id, productionDate) {
  return apiRequest(`${MEDICINE_API}/UpdateMedicineProductionDate/${id}`, {
    method: "PATCH",
    body: JSON.stringify(productionDate),
  });
}

async function apiUpdateMedicineCategory(id, categoryId) {
  return apiRequest(`${MEDICINE_API}/UpdateMedicineCategory/${id}`, {
    method: "PATCH",
    body: JSON.stringify(categoryId),
  });
}

async function apiDeleteMedicine(id) {
  return apiRequest(`${MEDICINE_API}/RemoveMedicine/${id}`, {
    method: "DELETE",
  });
}

// Aliases
const getMedicines = apiGetMedicines;
const getMedicineById = apiGetMedicineById;
const addMedicine = apiAddMedicine;
const updateMedicine = apiUpdateMedicine;
const deleteMedicine = apiDeleteMedicine;

// ============================================================
// 5. Medicine Category APIs
// ============================================================
async function apiGetMedicineCategories() {
  return apiRequest(`${CATEGORY_API}/GetAllMedicineCategories`);
}

async function apiGetMedicineCategoryById(id) {
  return apiRequest(`${CATEGORY_API}/GetMedicineCategoryById/${id}`);
}

async function apiGetMedicineCategoriesByName(name) {
  return apiRequest(`${CATEGORY_API}/GetMedicineCategoriesByName?name=${encodeURIComponent(name)}`);
}

async function apiGetMedicineCategoriesByDescription(description) {
  return apiRequest(`${CATEGORY_API}/GetMedicineCategoriesByDescription?description=${encodeURIComponent(description)}`);
}

async function apiAddMedicineCategory(category) {
  return apiRequest(`${CATEGORY_API}/AddMedicineCategory`, {
    method: "POST",
    body: JSON.stringify(category),
  });
}

async function apiUpdateMedicineCategory(id, category) {
  return apiRequest(`${CATEGORY_API}/UpdateMedicineCategory/${id}`, {
    method: "PUT",
    body: JSON.stringify(category),
  });
}

async function apiUpdateMedicineCategoryName(id, name) {
  return apiRequest(`${CATEGORY_API}/UpdateMedicineCategoryName/${id}`, {
    method: "PATCH",
    body: JSON.stringify(name),
  });
}

async function apiUpdateMedicineCategoryDescription(id, description) {
  return apiRequest(`${CATEGORY_API}/UpdateMedicineCategoryDescription/${id}`, {
    method: "PATCH",
    body: JSON.stringify(description),
  });
}

async function apiDeleteMedicineCategory(id) {
  return apiRequest(`${CATEGORY_API}/RemoveMedicineCategory/${id}`, {
    method: "DELETE",
  });
}

// Aliases
const getMedicineCategories = apiGetMedicineCategories;
const getMedicineCategoryById = apiGetMedicineCategoryById;

// ============================================================
// 6. Manufacturer APIs
// ============================================================
async function apiGetManufacturers() {
  return apiRequest(`${MANUFACTURER_API}/GetAllManufacturers`);
}

async function apiGetManufacturerById(id) {
  return apiRequest(`${MANUFACTURER_API}/GetManufacturerById/${id}`);
}

async function apiSearchManufacturers(name) {
  return apiRequest(`${MANUFACTURER_API}/SearchManufacturer?name=${encodeURIComponent(name || "")}`);
}

async function apiGetManufacturerCount() {
  return apiRequest(`${MANUFACTURER_API}/count`);
}

async function apiCreateManufacturer(manufacturer) {
  return apiRequest(`${MANUFACTURER_API}/CreateManufacturer`, {
    method: "POST",
    body: JSON.stringify(manufacturer),
  });
}

async function apiUpdateManufacturer(id, manufacturer) {
  return apiRequest(`${MANUFACTURER_API}/UpdateManufacturer/${id}`, {
    method: "PUT",
    body: JSON.stringify(manufacturer),
  });
}

async function apiUpdateManufacturerContact(id, contactInfo) {
  return apiRequest(`${MANUFACTURER_API}/UpdateManufacturerContact/${id}`, {
    method: "PATCH",
    body: JSON.stringify(contactInfo),
  });
}

async function apiDeleteManufacturer(id) {
  return apiRequest(`${MANUFACTURER_API}/DeleteManufacturer/${id}`, {
    method: "DELETE",
  });
}

// Aliases
const getManufacturers = apiGetManufacturers;
const getManufacturerById = apiGetManufacturerById;

// ============================================================
// 7. Supplier APIs
// ============================================================
async function apiGetSuppliers() {
  return apiRequest(`${SUPPLIER_API}/GetSuppliers`);
}

async function apiGetSupplierById(id) {
  return apiRequest(`${SUPPLIER_API}/GetSupplierById/${id}`);
}

async function apiSearchSuppliers(name) {
  return apiRequest(`${SUPPLIER_API}/search/${encodeURIComponent(name)}`);
}

async function apiCreateSupplier(supplier) {
  return apiRequest(`${SUPPLIER_API}/CreateSupplier`, {
    method: "POST",
    body: JSON.stringify(supplier),
  });
}

async function apiUpdateSupplier(id, supplier) {
  return apiRequest(`${SUPPLIER_API}/UpdateSupplier/${id}`, {
    method: "PUT",
    body: JSON.stringify(supplier),
  });
}

async function apiDeleteSupplier(id) {
  return apiRequest(`${SUPPLIER_API}/DeleteSupplier/${id}`, {
    method: "DELETE",
  });
}

// Aliases
const getSuppliers = apiGetSuppliers;
const getSupplierById = apiGetSupplierById;

// ============================================================
// 8. Order APIs
// ============================================================
async function apiCreateOrder(order) {
  return apiRequest(`${ORDER_API}/CreateOrder`, {
    method: "POST",
    body: JSON.stringify(order),
  });
}

async function apiGetAllOrders() {
  return apiRequest(`${ORDER_API}/GetAllOrders`);
}

async function apiGetMyOrders() {
  return apiRequest(`${ORDER_API}/MyOrders`);
}

async function apiGetOrderById(id) {
  return apiRequest(`${ORDER_API}/GetOrderById?id=${id}`);
}

async function apiUpdateOrder(id, order) {
  return apiRequest(`${ORDER_API}/UpdateOrder?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(order),
  });
}

async function apiUpdateOrderStatus(id, status) {
  return apiRequest(
    `${ORDER_API}/UpdateOrderStatus?id=${id}&status=${encodeURIComponent(status)}`,
    { method: "PATCH" },
  );
}

async function apiDeleteOrder(id) {
  return apiRequest(`${ORDER_API}/DeleteOrder?id=${id}`, {
    method: "DELETE",
  });
}

async function apiFilterOrders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.userId) params.append("userId", filters.userId);
  if (filters.fromDate) params.append("fromDate", filters.fromDate);
  if (filters.toDate) params.append("toDate", filters.toDate);
  if (filters.username) params.append("username", filters.username);
  return apiRequest(`${ORDER_API}/FilterOrders?${params.toString()}`);
}

async function apiGetSalesSummary() {
  return apiRequest(`${ORDER_API}/sales-summary`);
}

// Aliases
const createOrder = apiCreateOrder;
const getOrders = apiGetAllOrders;
const getAllOrders = apiGetAllOrders;
const getMyOrders = apiGetMyOrders;
const getOrder = apiGetOrderById;
const getOrderById = apiGetOrderById;
const updateOrder = apiUpdateOrder;
const updateOrderStatus = apiUpdateOrderStatus;
const deleteOrder = apiDeleteOrder;
const filterOrders = apiFilterOrders;
const getSalesSummary = apiGetSalesSummary;

// ============================================================
// 9. Order Item APIs
// ============================================================
async function apiGetOrderItems(url) {
  return apiRequest(url || `${ORDER_ITEM_API}/GetAllOrderItems`);
}

async function apiGetOrderItemById(id) {
  return apiRequest(`${ORDER_ITEM_API}/GetOrderItemById?id=${id}`);
}

async function apiCreateOrderItem(item) {
  return apiRequest(`${ORDER_ITEM_API}/CreateOrderItem`, {
    method: "POST",
    body: JSON.stringify(item),
  });
}

async function apiUpdateOrderItem(id, item) {
  return apiRequest(`${ORDER_ITEM_API}/UpdateOrderItem?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(item),
  });
}

async function apiUpdateOrderItemQuantity(id, quantity) {
  return apiRequest(`${ORDER_ITEM_API}/UpdateQuantity?id=${id}&quantity=${quantity}`, {
    method: "PATCH",
  });
}

async function apiDeleteOrderItem(id) {
  return apiRequest(`${ORDER_ITEM_API}/DeleteOrderItem?id=${id}`, {
    method: "DELETE",
  });
}

async function apiFilterOrderItems(params = {}) {
  if (typeof params === "number" || typeof params === "string") {
    return apiRequest(`${ORDER_ITEM_API}/FilterOrderItems?orderId=${params}`);
  }
  const searchParams = new URLSearchParams();
  if (params.orderId) searchParams.append("orderId", params.orderId);
  if (params.medicineId) searchParams.append("medicineId", params.medicineId);
  if (params.minSubtotal) searchParams.append("minSubtotal", params.minSubtotal);
  if (params.maxSubtotal) searchParams.append("maxSubtotal", params.maxSubtotal);
  return apiRequest(`${ORDER_ITEM_API}/FilterOrderItems?${searchParams.toString()}`);
}

async function apiGetOrderItemSummary() {
  return apiRequest(`${ORDER_ITEM_API}/item-summary`);
}

// Aliases
const getOrderItems = apiGetOrderItems;
const createOrderItem = apiCreateOrderItem;
const updateOrderItem = apiUpdateOrderItem;
const deleteOrderItem = apiDeleteOrderItem;

// ============================================================
// 10. Payment APIs
// ============================================================
async function apiGetPayments() {
  return apiRequest(`${PAYMENT_API}/GetAllPayments`);
}

async function apiGetPaymentById(id) {
  return apiRequest(`${PAYMENT_API}/GetPayment/${id}`);
}

async function apiCreatePayment(payment) {
  return apiRequest(`${PAYMENT_API}/CreatePayment`, {
    method: "POST",
    body: JSON.stringify(payment),
  });
}

async function apiUpdatePayment(id, payment) {
  return apiRequest(`${PAYMENT_API}/UpdatePayment/${id}`, {
    method: "PUT",
    body: JSON.stringify(payment),
  });
}

async function apiUpdatePaymentStatus(id, newStatus) {
  return apiRequest(`${PAYMENT_API}/UpdatePaymentStatus/${id}`, {
    method: "PATCH",
    body: JSON.stringify(newStatus),
  });
}

async function apiDeletePayment(id) {
  return apiRequest(`${PAYMENT_API}/DeletePayment/${id}`, {
    method: "DELETE",
  });
}

async function apiFilterPaymentsByStatus(status) {
  return apiRequest(`${PAYMENT_API}/FilterByStatus?status=${status}`);
}

async function apiGetRevenue() {
  return apiRequest(`${PAYMENT_API}/GetRevenue`);
}

async function apiGetPaymentByOrderId(orderId) {
  return apiRequest(`${PAYMENT_API}/GetPaymentByOrderId?orderId=${orderId}`);
}

// Aliases
const getPayments = apiGetPayments;
const getPaymentById = apiGetPaymentById;
const createPayment = apiCreatePayment;
const updatePayment = apiUpdatePayment;
const deletePayment = apiDeletePayment;
const getPaymentByOrderId = apiGetPaymentByOrderId;

// ============================================================
// 11. Prescription APIs
// ============================================================
async function apiGetPrescriptions() {
  return apiRequest(`${PRESCRIPTION_API}/GetAllPrescriptions`);
}

async function apiGetMyPrescriptions() {
  return apiRequest(`${PRESCRIPTION_API}/GetMyPrescriptions`);
}

async function apiGetPrescriptionById(id) {
  return apiRequest(`${PRESCRIPTION_API}/GetPrescriptionById/${id}`);
}

async function apiCreatePrescription(prescription) {
  return apiRequest(`${PRESCRIPTION_API}/CreatePrescription`, {
    method: "POST",
    body: JSON.stringify(prescription),
  });
}

async function apiUpdatePrescription(id, prescription) {
  return apiRequest(`${PRESCRIPTION_API}/UpdatePrescription/${id}`, {
    method: "PUT",
    body: JSON.stringify(prescription),
  });
}

async function apiUpdatePrescriptionStatus(id, status) {
  return apiRequest(`${PRESCRIPTION_API}/UpdatePrescriptionStatus/${id}`, {
    method: "PATCH",
    body: JSON.stringify(status),
  });
}

async function apiDeletePrescription(id) {
  return apiRequest(`${PRESCRIPTION_API}/DeletePrescription/${id}`, {
    method: "DELETE",
  });
}

async function apiFilterPrescriptions(status) {
  return apiRequest(`${PRESCRIPTION_API}/FilterPrescription?status=${encodeURIComponent(status)}`);
}

async function apiSortPrescriptions() {
  return apiRequest(`${PRESCRIPTION_API}/sort`);
}

// Aliases
const getPrescriptions = apiGetPrescriptions;
const getMyPrescriptions = apiGetMyPrescriptions;
const getPrescriptionById = apiGetPrescriptionById;
const createPrescription = apiCreatePrescription;
const updatePrescription = apiUpdatePrescription;
const deletePrescription = apiDeletePrescription;

// ============================================================
// 12. Stock Level APIs
// ============================================================
async function apiGetStockLevels() {
  return apiRequest(`${STOCK_LEVEL_API}/GetAllStockLevels`);
}

async function apiGetStockLevelById(id) {
  return apiRequest(`${STOCK_LEVEL_API}/GetStockLevel/${id}`);
}

async function apiCreateStockLevel(stockLevel) {
  return apiRequest(`${STOCK_LEVEL_API}/CreateStockLevel`, {
    method: "POST",
    body: JSON.stringify(stockLevel),
  });
}

async function apiUpdateStockLevel(id, stockLevel) {
  return apiRequest(`${STOCK_LEVEL_API}/UpdateStockLevel/${id}`, {
    method: "PUT",
    body: JSON.stringify(stockLevel),
  });
}

async function apiRestockStockLevel(id, quantity) {
  return apiRequest(`${STOCK_LEVEL_API}/restock/${id}`, {
    method: "PATCH",
    body: JSON.stringify(quantity),
  });
}

async function apiDeleteStockLevel(id) {
  return apiRequest(`${STOCK_LEVEL_API}/DeleteStockLevel/${id}`, {
    method: "DELETE",
  });
}

async function apiGetLowStock() {
  return apiRequest(`${STOCK_LEVEL_API}/low-stock`);
}

async function apiGetStockSummary() {
  return apiRequest(`${STOCK_LEVEL_API}/summary`);
}

// Aliases
const getStockLevels = apiGetStockLevels;
const getStockLevelById = apiGetStockLevelById;
const createStockLevel = apiCreateStockLevel;
const updateStockLevel = apiUpdateStockLevel;
const deleteStockLevel = apiDeleteStockLevel;
