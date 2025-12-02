// const API_URL = "http://localhost/restapi/api.php";
const API_URL = "http://192.168.1.7/restapi/api.php";

// Sorting state
let productSort = { field: null, order: "asc" };
let transactionSort = { field: null, order: "asc" };

function switchTab(tab, event) {
  // Reset all tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active-tab", "text-blue-600", "border-blue-600");
    btn.classList.add("text-slate-500", "border-transparent");
  });

  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.add("hidden");
  });

  // Activate clicked tab button
  const btn = event.currentTarget;
  btn.classList.add("active-tab", "text-blue-600", "border-blue-600");
  btn.classList.remove("text-slate-500", "border-transparent");

  // Show selected section
  document.getElementById(tab).classList.remove("hidden");

  // Load data
  if (tab === "products") {
    loadProducts();
  } else {
    loadTransactions();
    loadProductsForSelect();
  }
}

// Show alert message
function showAlert(message, type = "success") {
  const alertDiv = document.getElementById("alert");
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";
  alertDiv.innerHTML = `
                <div class="${bgColor} flex items-center gap-2 border px-6 py-4 rounded-lg font-semibold">
                    ${
                      type === "success"
                        ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" id="Check--Streamline-Core" height="14" width="14">
  <desc>
    Check Streamline Icon: https://streamlinehq.com
  </desc>
  <g id="check--check-form-validation-checkmark-success-add-addition-tick">
    <path id="Vector (Stroke)" fill="currentColor" fill-rule="evenodd" d="M13.637 1.198a1 1 0 0 1 0.134 1.408l-8.04 9.73 -0.003 0.002a1.922 1.922 0 0 1 -1.5 0.693 1.923 1.923 0 0 1 -1.499 -0.748l-0.001 -0.002L0.21 9.045a1 1 0 1 1 1.578 -1.228l2.464 3.167 7.976 -9.652a1 1 0 0 1 1.408 -0.134Z" clip-rule="evenodd" stroke-width="1"></path>
  </g>
</svg>`
                        : "❌"
                    } ${message}
                </div>
            `;
  setTimeout(() => (alertDiv.innerHTML = ""), 3000);
}

// ========== PRODUCTS ==========
/**
 * SORT PRODUCTS FUNCTION
 * Handles sorting of products table by clicking column headers
 *
 * HOW IT WORKS:
 * 1. If user clicks the SAME column header twice:
 *    - First click: sort ASCENDING (asc)
 *    - Second click: sort DESCENDING (desc)
 *    - This is called a "toggle"
 *
 * 2. If user clicks a DIFFERENT column header:
 *    - Reset to ASCENDING (asc) order
 *    - Start sorting by the new column
 *
 * EXAMPLE:
 * - Click "Name" header → sorts A-Z (asc)
 * - Click "Name" header again → sorts Z-A (desc)
 * - Click "Price" header → sorts by price lowest to highest (asc)
 */
function sortProducts(field) {
  // Check if user clicked the same column header
  if (productSort.field === field) {
    // Toggle between ascending and descending
    productSort.order = productSort.order === "asc" ? "desc" : "asc";
  } else {
    // User clicked a different column, so set new field and reset to ascending
    productSort.field = field; // Which column to sort by (id, name, price)
    productSort.order = "asc"; // Always start with ascending for new column
  }
  // Reload and re-render the products table with new sort applied
  loadProducts();
}

async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}?endpoint=products`);
    let products = await res.json();
    const tbody = document.getElementById("productsTable");

    if (products.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="px-4 py-4 text-center text-slate-500 text-sm">No products found</td></tr>';
      return;
    }

    // ===== APPLY SORTING =====
    // Only sort if a sorting field has been selected (productSort.field is not null)
    if (productSort.field) {
      products.sort((a, b) => {
        // Get the values from both products for the column being sorted
        // Example: if sorting by "price", aVal = product1.price, bVal = product2.price
        let aVal = a[productSort.field];
        let bVal = b[productSort.field];

        // STEP 1: Determine data type (number or text)
        // isNaN() checks if value is NOT a number
        // If both values are numbers, convert them to floats for proper numeric comparison
        // (otherwise "10" < "2" alphabetically, which is wrong)
        if (!isNaN(aVal) && !isNaN(bVal)) {
          // NUMERIC COMPARISON: Convert to numbers
          // Example: "10" becomes 10, "2" becomes 2, so 10 > 2 correctly
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        } else {
          // STRING COMPARISON: Convert to lowercase for case-insensitive sorting
          // Example: "Apple" and "banana" both become lowercase for fair comparison
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
        }

        // STEP 2: Compare values and return sort order
        // JavaScript sort() expects:
        //   - Return 1 if a should come AFTER b
        //   - Return -1 if a should come BEFORE b
        //   - Return 0 if they're equal
        if (productSort.order === "asc") {
          // ASCENDING (asc): A-Z, 1-100
          // If aVal > bVal, put it after (return 1)
          // If aVal < bVal, put it before (return -1)
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          // DESCENDING (desc): Z-A, 100-1
          // Reverse the logic: if aVal < bVal, put it after (return 1)
          // If aVal > bVal, put it before (return -1)
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }

    tbody.innerHTML = products
      .map(
        (p, i) => `
                    <tr class="border-b border-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 hover:bg-slate-50 transition-colors duration-100">
                        <td class="px-4 py-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-200 font-medium">${
                          p.id
                        }</td>
                        <td class="px-4 py-2.5 text-xs md:text-sm text-slate-800 dark:text-slate-200 font-medium capitalize">${
                          p.name
                        }</td>
                        <td class="px-4 py-2.5 text-xs md:text-sm text-blue-600 dark:text-blue-300 font-semibold">Rp ${parseFloat(
                          p.price
                        ).toLocaleString("id-ID")}</td>
                        <td class="px-4 py-2.5 flex gap-1">
                            <button onclick="editProduct(${
                              p.id
                            })" class="flex items-center justify-center gap-1 border-amber-600 border hover:bg-amber-500 bg-amber-400 hover:border-amber-700 text-white px-3 py-1.5 rounded-md font-medium text-xs transition-colors duration-100">
                                <span><svg version="1.1" id="Edit--Streamline-Carbon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 16 16" xml:space="preserve" enable-background="new 0 0 32 32" height="14" width="14">
                                    <desc>
                                      Edit Streamline Icon: https://streamlinehq.com
                                    </desc>
                                    <title>edit</title>
                                    <path d="M1 13h14v1H1Z" fill="currentColor" stroke-width="0.5"></path>
                                    <path d="M12.7 4.5c0.4 -0.4 0.4 -1 0 -1.4l-1.8 -1.8c-0.4 -0.4 -1 -0.4 -1.4 0l-7.5 7.5V12h3.2l7.5 -7.5zm-2.5 -2.5L12 3.8l-1.5 1.5L8.7 3.5l1.5 -1.5zM3 11v-1.8l5 -5 1.8 1.8 -5 5H3z" fill="currentColor" stroke-width="0.5"></path>
                                    <path id="_Transparent_Rectangle_" d="M0 0h16v16H0Z" fill="none" stroke-width="0.5"></path>
                                  </svg></span> 
                                  <span class="hidden md:inline">Edit</span>
                            </button>
                            <button onclick="deleteProduct(${
                              p.id
                            })" class="flex items-center justify-center gap-1 border-red-500 border bg-red-400 hover:bg-red-500 hover:border-red-600 text-white px-3 py-1.5 rounded-md font-medium text-xs transition-colors duration-100">
                                <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" id="Trash-X--Streamline-Tabler-Filled" height="14" width="14">
  <desc>
    Trash X Streamline Icon: https://streamlinehq.com
  </desc>
  <path d="M20 6a1 1 0 0 1 0.117 1.993L20 8h-0.081L19 19a3 3 0 0 1 -2.824 2.995L16 22H8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-0.005 -0.167L4.08 8H4a1 1 0 0 1 -0.117 -1.993L4 6h16zm-9.489 5.14a1 1 0 0 0 -1.218 1.567L10.585 14l-1.292 1.293 -0.083 0.094a1 1 0 0 0 1.497 1.32L12 15.415l1.293 1.292 0.094 0.083a1 1 0 0 0 1.32 -1.497L13.415 14l1.292 -1.293 0.083 -0.094a1 1 0 0 0 -1.497 -1.32L12 12.585l-1.293 -1.292 -0.094 -0.083z" stroke-width="1"></path>
  <path d="M14 2a2 2 0 0 1 2 2 1 1 0 0 1 -1.993 0.117L14 4h-4l-0.007 0.117A1 1 0 0 1 8 4a2 2 0 0 1 1.85 -1.995L10 2h4z" stroke-width="1"></path>
</svg></span> <span class="hidden md:inline">Delete</span> 
                            </button>
                        </td>
                    </tr>
                `
      )
      .join("");
  } catch (err) {
    console.log(err);
    showAlert("failed to load products", "error");
  }
}

// add products function to send
async function saveProduct(e) {
  e.preventDefault();

  const nameInput = document.getElementById("productName");
  const priceInput = document.getElementById("productPrice");
  const nameError = document.getElementById("productNameError");
  const priceError = document.getElementById("productPriceError");

  // Reset errors
  nameError.style.display = "none";
  priceError.style.display = "none";

  const name = nameInput.value.trim();
  const price = priceInput.value;

  // Validation
  let hasError = false;
  if (!name) {
    nameError.textContent = "nama barang harus di isi";
    nameError.style.display = "block";
    nameInput.classList.add("border-red-500");
    hasError = true;
  } else {
    nameInput.classList.remove("border-red-500");
  }

  if (!price || price <= 0) {
    priceError.textContent = "harga wajib ada";
    priceError.style.display = "block";
    priceInput.classList.add("border-red-500");
    hasError = true;
  } else {
    priceInput.classList.remove("border-red-500");
  }

  if (hasError) return;

  const id = document.getElementById("productId").value;

  try {
    const url = id
      ? `${API_URL}?endpoint=products&id=${id}`
      : `${API_URL}?endpoint=products`;

    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert(data.error || data.message, "error");
    } else {
      showAlert(data.message);
      resetProductForm();
      loadProducts();
    }
  } catch (err) {
    showAlert("Failed to save product", "error");
  }
}

// edit products
async function editProduct(id) {
  try {
    const res = await fetch(`${API_URL}?endpoint=products&id=${id}`);
    const product = await res.json();

    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;

    // Clear errors
    document.getElementById("productNameError").style.display = "none";
    document.getElementById("productPriceError").style.display = "none";
    document.getElementById("productName").classList.remove("border-red-500");
    document.getElementById("productPrice").classList.remove("border-red-500");

    document.getElementById(
      "productSubmitBtn"
    ).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Save--Streamline-Rounded-Material" height="24" width="24">
  <desc>
    Save Streamline Icon: https://streamlinehq.com
  </desc>
  <path fill="currentColor" d="M4.5 21c-0.4 0 -0.75 -0.15 -1.05 -0.45 -0.3 -0.3 -0.45 -0.65 -0.45 -1.05V4.5c0 -0.4 0.15 -0.75 0.45 -1.05C3.75 3.15 4.1 3 4.5 3h11.95c0.20735 0 0.405 0.041665 0.593 0.125 0.188 0.083335 0.34865 0.191665 0.482 0.325l3.025 3.025c0.13335 0.13335 0.24165 0.294 0.325 0.482 0.08335 0.188 0.125 0.38565 0.125 0.593V19.5c0 0.4 -0.15 0.75 -0.45 1.05 -0.3 0.3 -0.65 0.45 -1.05 0.45H4.5Zm15 -13.4L16.4 4.5H4.5v15h15V7.6ZM11.994 17.875c0.72065 0 1.33515 -0.25215 1.8435 -0.7565 0.50835 -0.5045 0.7625 -1.117 0.7625 -1.8375 0 -0.72065 -0.25215 -1.33515 -0.7565 -1.8435 -0.5045 -0.50835 -1.117 -0.7625 -1.8375 -0.7625 -0.72065 0 -1.33515 0.25215 -1.8435 0.7565 -0.50835 0.5045 -0.7625 1.117 -0.7625 1.8375 0 0.72065 0.25215 1.33515 0.7565 1.8435 0.5045 0.50835 1.117 0.7625 1.8375 0.7625ZM6.575 9.4h7.45c0.2125 0 0.39065 -0.0719 0.5345 -0.21575 0.14365 -0.14365 0.2155 -0.32175 0.2155 -0.53425v-2.075c0 -0.2125 -0.07185 -0.39065 -0.2155 -0.5345 -0.14385 -0.14365 -0.322 -0.2155 -0.5345 -0.2155h-7.45c-0.2125 0 -0.3906 0.07185 -0.53425 0.2155 -0.14385 0.14385 -0.21575 0.322 -0.21575 0.5345v2.075c0 0.2125 0.0719 0.3906 0.21575 0.53425 0.14365 0.14385 0.32175 0.21575 0.53425 0.21575ZM4.5 7.6V19.5v3.1Z" stroke-width="0.5"></path>
</svg> Update Product`;
    window.scrollTo(0, 0);
  } catch (err) {
    showAlert("Failed to load product", "error");
  }
}

// delete products
async function deleteProduct(id) {
  // loop for asking the data will deleted, while cancel while returning the data
  if (!confirm("Are you sure you want to delete this product?")) return;

  // the logic for deleting the data using the ID to sent it to PHP method
  try {
    const res = await fetch(`${API_URL}?endpoint=products&id=${id}`, {
      // method in php will trigger this
      method: "DELETE",
    });
    //  same function like before
    const data = await res.json();
    showAlert(data.message);
    loadProducts();
  } catch (err) {
    // this allert will appear if the data unable to delete due error or something wrong
    showAlert("Failed to delete product", "error");
  }
}

// reset products form
function resetProductForm() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("productSubmitBtn").innerHTML = `<svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    id="Plus-Circle--Streamline-Iconoir"
                    height="24"
                    width="24"
                  >
                    <desc>
                      Plus Circle Streamline Icon: https://streamlinehq.com
                    </desc>
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12c0 5.9371 4.81294 10.75 10.75 10.75 5.9371 0 10.75 -4.8129 10.75 -10.75 0 -5.93706 -4.8129 -10.75 -10.75 -10.75ZM12.75 8c0 -0.41421 -0.3358 -0.75 -0.75 -0.75s-0.75 0.33579 -0.75 0.75v3.25H8c-0.41421 0 -0.75 0.3358 -0.75 0.75s0.33579 0.75 0.75 0.75h3.25V16c0 0.4142 0.3358 0.75 0.75 0.75s0.75 -0.3358 0.75 -0.75v-3.25H16c0.4142 0 0.75 -0.3358 0.75 -0.75s-0.3358 -0.75 -0.75 -0.75h-3.25V8Z"
                      fill="currentColor"
                      stroke-width="1"
                    ></path></svg
                > tambah produk`;
}

// ========== TRANSACTIONS ==========
async function loadProductsForSelect() {
  try {
    const res = await fetch(`${API_URL}?endpoint=products`);
    const products = await res.json();
    const select = document.getElementById("transactionProduct");

    select.innerHTML =
      '<option value="">-- Select Product --</option>' +
      products
        .map(
          (p) =>
            `<option value="${p.id}">${p.name} - Rp ${parseFloat(
              p.price
            ).toLocaleString("id-ID")}</option>`
        )
        .join("");
  } catch (err) {
    showAlert("Failed to load products", "error");
  }
}

// ========== TRANSACTIONS ==========
/**
 * SORT TRANSACTIONS FUNCTION
 * Same logic as sortProducts, but for the transactions table
 *
 * HOW IT WORKS:
 * 1. If user clicks the SAME column header twice:
 *    - First click: sort ASCENDING (asc)
 *    - Second click: sort DESCENDING (desc)
 *
 * 2. If user clicks a DIFFERENT column header:
 *    - Reset to ASCENDING (asc) order
 *    - Start sorting by the new column
 *
 * EXAMPLE:
 * - Click "Quantity" header → sorts from smallest to largest quantity (asc)
 * - Click "Quantity" header again → sorts from largest to smallest quantity (desc)
 * - Click "Total" header → sorts by total revenue (asc)
 */
function sortTransactions(field) {
  // Check if user clicked the same column header
  if (transactionSort.field === field) {
    // Toggle between ascending and descending
    transactionSort.order = transactionSort.order === "asc" ? "desc" : "asc";
  } else {
    // User clicked a different column, so set new field and reset to ascending
    transactionSort.field = field; // Which column to sort by (id, product_name, quantity, etc)
    transactionSort.order = "asc"; // Always start with ascending for new column
  }
  // Reload and re-render the transactions table with new sort applied
  loadTransactions();
}

// Add this variable at the top with your other variables (near transactionSort)
let searchQuery = "";

// Add this search function
function searchTransactions() {
  const searchBar = document.getElementById("searchBar");
  searchQuery = searchBar.value.toLowerCase().trim();
  loadTransactions(); // Reload transactions with filter applied
}

// Updated loadTransactions function with search functionality
async function loadTransactions() {
  try {
    const res = await fetch(`${API_URL}?endpoint=transactions`);
    let transactions = await res.json();
    const tbody = document.getElementById("transactionsTable");

    // ===== APPLY SEARCH FILTER =====
    if (searchQuery) {
      transactions = transactions.filter((t) => {
        // Search across multiple fields: product name, ID, quantity, price
        const searchFields = [
          String(t.id),
          String(t.product_name || "").toLowerCase(),
          String(t.quantity),
          String(t.product_price || ""),
        ].join(" ");

        return searchFields.includes(searchQuery);
      });
    }

    if (transactions.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="px-4 py-4 text-center text-slate-500 text-sm">No transactions found</td></tr>';
      document.getElementById("totalRevenue").textContent = "Rp 0";
      return;
    }

    // ===== APPLY SORTING =====
    if (transactionSort.field) {
      transactions.sort((a, b) => {
        let aVal = a[transactionSort.field];
        let bVal = b[transactionSort.field];

        if (!isNaN(aVal) && !isNaN(bVal)) {
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        } else {
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
        }

        if (transactionSort.order === "asc") {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }

    let totalRevenue = 0;
    tbody.innerHTML = transactions
      .map((t, i) => {
        const total = t.quantity * parseFloat(t.product_price || 0);
        totalRevenue += total;
        return `
          <tr class="border-b border-slate-100 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-100">
            <td class="px-4 py-2.5 font-semibold text-xs md:text-sm text-slate-700 dark:text-slate-200">${
              t.id
            }</td>
            <td class="px-4 py-2.5 font-medium text-xs md:text-sm text-slate-800 dark:text-slate-200">${
              t.product_name || "N/A"
            }</td>
            <td class="px-4 py-2.5 text-blue-600 dark:text-blue-300 font-semibold text-xs md:text-sm">${
              t.quantity
            }x</td>
            <td class="px-4 py-2.5 text-slate-600 dark:text-slate-200 text-xs md:text-sm">Rp ${parseFloat(
              t.product_price || 0
            ).toLocaleString("id-ID")}</td>
            <td class="px-5 py-2.5 text-blue-600 dark:text-blue-200 font-semibold text-xs md:text-sm">Rp ${total.toLocaleString(
              "id-ID"
            )}</td>
            <td class="px-4 py-2.5 flex gap-1">
              <button onclick="editTransaction(${
                t.id
              })" class="flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md font-medium text-xs transition-colors duration-100">
                <span><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="14" width="14">
                  <path d="M1 13h14v1H1Z" fill="currentColor" stroke-width="0.5"></path>
                  <path d="M12.7 4.5c0.4 -0.4 0.4 -1 0 -1.4l-1.8 -1.8c-0.4 -0.4 -1 -0.4 -1.4 0l-7.5 7.5V12h3.2l7.5 -7.5zm-2.5 -2.5L12 3.8l-1.5 1.5L8.7 3.5l1.5 -1.5zM3 11v-1.8l5 -5 1.8 1.8 -5 5H3z" fill="currentColor" stroke-width="0.5"></path>
                </svg></span> <span class="hidden md:inline">Edit</span>
              </button>
              <button onclick="deleteTransaction(${
                t.id
              })" class="flex items-center justify-center gap-1 border-red-500 border bg-red-400 hover:bg-red-500 hover:border-red-600 text-white px-3 py-1.5 rounded-md font-medium text-xs transition-colors duration-100">
                <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="14" width="14">
                  <path d="M20 6a1 1 0 0 1 0.117 1.993L20 8h-0.081L19 19a3 3 0 0 1 -2.824 2.995L16 22H8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-0.005 -0.167L4.08 8H4a1 1 0 0 1 -0.117 -1.993L4 6h16zm-9.489 5.14a1 1 0 0 0 -1.218 1.567L10.585 14l-1.292 1.293 -0.083 0.094a1 1 0 0 0 1.497 1.32L12 15.415l1.293 1.292 0.094 0.083a1 1 0 0 0 1.32 -1.497L13.415 14l1.292 -1.293 0.083 -0.094a1 1 0 0 0 -1.497 -1.32L12 12.585l-1.293 -1.292 -0.094 -0.083z" stroke-width="1"></path>
                  <path d="M14 2a2 2 0 0 1 2 2 1 1 0 0 1 -1.993 0.117L14 4h-4l-0.007 0.117A1 1 0 0 1 8 4a2 2 0 0 1 1.85 -1.995L10 2h4z" stroke-width="1"></path>
                </svg></span> <span class="hidden md:inline">Delete</span>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    document.getElementById(
      "totalRevenue"
    ).textContent = `Rp ${totalRevenue.toLocaleString("id-ID")}`;
  } catch (err) {
    showAlert("Failed to load transactions", "error");
  }
}

// Add event listener to search bar (add this at the bottom of your script)
document.addEventListener("DOMContentLoaded", function () {
  const searchBar = document.getElementById("searchBar");

  if (searchBar) {
    // Search as user types (with slight delay for performance)
    let searchTimeout;
    searchBar.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchTransactions();
      }, 300); // Wait 300ms after user stops typing
    });

    // Optional: Clear search functionality
    const clearSearchBtn = document.getElementById("clearSearch");
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", function () {
        searchBar.value = "";
        searchQuery = "";
        loadTransactions();
      });
    }
  }
});

async function saveTransaction(e) {
  e.preventDefault();

  const productSelect = document.getElementById("transactionProduct");
  const quantityInput = document.getElementById("transactionQuantity");
  const productError = document.getElementById("transactionProductError");
  const quantityError = document.getElementById("transactionQuantityError");

  // Reset errors
  productError.style.display = "none";
  quantityError.style.display = "none";
  productSelect.classList.remove("border-red-500");
  quantityInput.classList.remove("border-red-500");

  const product_id = productSelect.value;
  const quantity = quantityInput.value;

  // Validation
  let hasError = false;
  if (!product_id) {
    productError.textContent = "Please select a product";
    productError.style.display = "block";
    productSelect.classList.add("border-red-500");
    hasError = true;
  }

  if (!quantity || quantity <= 0) {
    quantityError.textContent = "Quantity must be greater than 0";
    quantityError.style.display = "block";
    quantityInput.classList.add("border-red-500");
    hasError = true;
  }

  if (hasError) return;

  const id = document.getElementById("transactionId").value;

  try {
    const url = id
      ? `${API_URL}?endpoint=transactions&id=${id}`
      : `${API_URL}?endpoint=transactions`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id, quantity }),
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert(data.error || data.message, "error");
    } else {
      showAlert(data.message);
      resetTransactionForm();
      loadTransactions();
    }
  } catch (err) {
    showAlert("Failed to save transaction", "error");
  }
}

async function editTransaction(id) {
  try {
    const res = await fetch(`${API_URL}?endpoint=transactions&id=${id}`);
    const transaction = await res.json();

    document.getElementById("transactionId").value = transaction.id;
    document.getElementById("transactionProduct").value =
      transaction.product_id;
    document.getElementById("transactionQuantity").value = transaction.quantity;

    // Clear errors
    document.getElementById("transactionProductError").style.display = "none";
    document.getElementById("transactionQuantityError").style.display = "none";
    document
      .getElementById("transactionProduct")
      .classList.remove("border-red-500");
    document
      .getElementById("transactionQuantity")
      .classList.remove("border-red-500");

    document.getElementById(
      "transactionSubmitBtn"
    ).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Save--Streamline-Rounded-Material" height="24" width="24">
  <desc>
    Save Streamline Icon: https://streamlinehq.com
  </desc>
  <path fill="currentColor" d="M4.5 21c-0.4 0 -0.75 -0.15 -1.05 -0.45 -0.3 -0.3 -0.45 -0.65 -0.45 -1.05V4.5c0 -0.4 0.15 -0.75 0.45 -1.05C3.75 3.15 4.1 3 4.5 3h11.95c0.20735 0 0.405 0.041665 0.593 0.125 0.188 0.083335 0.34865 0.191665 0.482 0.325l3.025 3.025c0.13335 0.13335 0.24165 0.294 0.325 0.482 0.08335 0.188 0.125 0.38565 0.125 0.593V19.5c0 0.4 -0.15 0.75 -0.45 1.05 -0.3 0.3 -0.65 0.45 -1.05 0.45H4.5Zm15 -13.4L16.4 4.5H4.5v15h15V7.6ZM11.994 17.875c0.72065 0 1.33515 -0.25215 1.8435 -0.7565 0.50835 -0.5045 0.7625 -1.117 0.7625 -1.8375 0 -0.72065 -0.25215 -1.33515 -0.7565 -1.8435 -0.5045 -0.50835 -1.117 -0.7625 -1.8375 -0.7625 -0.72065 0 -1.33515 0.25215 -1.8435 0.7565 -0.50835 0.5045 -0.7625 1.117 -0.7625 1.8375 0 0.72065 0.25215 1.33515 0.7565 1.8435 0.5045 0.50835 1.117 0.7625 1.8375 0.7625ZM6.575 9.4h7.45c0.2125 0 0.39065 -0.0719 0.5345 -0.21575 0.14365 -0.14365 0.2155 -0.32175 0.2155 -0.53425v-2.075c0 -0.2125 -0.07185 -0.39065 -0.2155 -0.5345 -0.14385 -0.14365 -0.322 -0.2155 -0.5345 -0.2155h-7.45c-0.2125 0 -0.3906 0.07185 -0.53425 0.2155 -0.14385 0.14385 -0.21575 0.322 -0.21575 0.5345v2.075c0 0.2125 0.0719 0.3906 0.21575 0.53425 0.14365 0.14385 0.32175 0.21575 0.53425 0.21575ZM4.5 7.6V19.5v3.1Z" stroke-width="0.5"></path>
</svg> Update Transaction`;
    window.scrollTo(0, 0);
  } catch (err) {
    showAlert("Failed to load transaction", "error");
  }
}

async function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) return;

  try {
    const res = await fetch(`${API_URL}?endpoint=transactions&id=${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    showAlert(data.message);
    loadTransactions();
  } catch (err) {
    showAlert("Failed to delete transaction", "error");
  }
}

function resetTransactionForm() {
  document.getElementById("transactionForm").reset();
  document.getElementById("transactionId").value = "";
  document.getElementById("transactionSubmitBtn").innerHTML = `<svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    id="Plus-Circle--Streamline-Iconoir"
                    height="24"
                    width="24"
                  >
                    <desc>
                      Plus Circle Streamline Icon: https://streamlinehq.com
                    </desc>
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12c0 5.9371 4.81294 10.75 10.75 10.75 5.9371 0 10.75 -4.8129 10.75 -10.75 0 -5.93706 -4.8129 -10.75 -10.75 -10.75ZM12.75 8c0 -0.41421 -0.3358 -0.75 -0.75 -0.75s-0.75 0.33579 -0.75 0.75v3.25H8c-0.41421 0 -0.75 0.3358 -0.75 0.75s0.33579 0.75 0.75 0.75h3.25V16c0 0.4142 0.3358 0.75 0.75 0.75s0.75 -0.3358 0.75 -0.75v-3.25H16c0.4142 0 0.75 -0.3358 0.75 -0.75s-0.3358 -0.75 -0.75 -0.75h-3.25V8Z"
                      fill="currentColor"
                      stroke-width="1"
                    ></path></svg
                > Add Transaction`;
}

// Load initial data
loadProducts();
