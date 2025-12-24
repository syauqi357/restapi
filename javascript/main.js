const API_URL = "http://localhost:3000";

function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active-tab", "bg-white", "text-purple-600");
    btn.classList.add("bg-white/80", "text-gray-700");
  });
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.add("hidden");
  });

  event.target.classList.add("active-tab", "bg-slate-50", "text-cyan-700");
  event.target.classList.remove("bg-white/80", "text-gray-700");
  document.getElementById(tab).classList.remove("hidden");

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
                <div class="${bgColor} flex items-center gap-2 border-2 px-6 py-4 rounded-xl font-semibold shadow-lg animate-pulse">
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
async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    const tbody = document.getElementById("productsTable");

    if (products.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No products found</td></tr>';
      return;
    }

    tbody.innerHTML = products
      .map(
        (p, i) => {
          const stockClass = p.stock < 5 ? 'text-red-600 font-bold' : p.stock < 20 ? 'text-yellow-600' : 'text-green-600';
          const stockBg = p.stock < 5 ? 'bg-red-50' : p.stock < 20 ? 'bg-yellow-50' : 'bg-green-50';
          return `
                    <tr class="hover:bg-blue-50 transition-all ${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }">
                        <td class="px-6 py-4 font-semibold text-xs md:text-base text-gray-700">${
                          p.id
                        }</td>
                        <td class="px-6 py-4 font-medium text-xs md:text-base text-gray-800 capitalize">
                            <div class="flex items-center gap-3">
                                ${p.image && typeof p.image === 'string' && p.image !== '[object Object]' ? `<img src="${API_URL}/upload/${p.image}" class="w-8 h-8 rounded object-cover border border-gray-200" alt="">` : ''}
                                ${p.name}
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sky-600 text-xs md:text-base font-bold">Rp ${parseFloat(
                          p.price
                        ).toLocaleString("id-ID")}</td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                                <span class="${stockClass} ${stockBg} px-3 py-1 rounded-full text-sm font-semibold">${p.stock}</span>
                                <button onclick="updateStock(${p.id}, 10)" class="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 font-bold" title="Add 10">+10</button>
                                <button onclick="updateStock(${p.id}, -10)" class="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 font-bold" title="Remove 10">-10</button>
                            </div>
                        </td>
                        <td class="px-6 py-4 flex ">
                            <button onclick="editProduct(${
                              p.id
                            })" class="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all mr-2 font-semibold">
                                <span><svg version="1.1" id="Edit--Streamline-Carbon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 16 16" xml:space="preserve" enable-background="new 0 0 32 32" height="16" width="16">
  <desc>
    Edit Streamline Icon: https://streamlinehq.com
  </desc>
  <title>edit</title>
  <path d="M1 13h14v1H1Z" fill="currentColor" stroke-width="0.5"></path>
  <path d="M12.7 4.5c0.4 -0.4 0.4 -1 0 -1.4l-1.8 -1.8c-0.4 -0.4 -1 -0.4 -1.4 0l-7.5 7.5V12h3.2l7.5 -7.5zm-2.5 -2.5L12 3.8l-1.5 1.5L8.7 3.5l1.5 -1.5zM3 11v-1.8l5 -5 1.8 1.8 -5 5H3z" fill="currentColor" stroke-width="0.5"></path>
  <path id="_Transparent_Rectangle_" d="M0 0h16v16H0Z" fill="none" stroke-width="0.5"></path>
</svg></span> 
<span class="text-xs md:text-base">

  Edit
</span>
                            </button>
                            <button onclick="deleteProduct(${
                              p.id
                            })" class=" flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-semibold">
                                <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" id="Trash-X--Streamline-Tabler-Filled" height="24" width="24">
  <desc>
    Trash X Streamline Icon: https://streamlinehq.com
  </desc>
  <path d="M20 6a1 1 0 0 1 0.117 1.993L20 8h-0.081L19 19a3 3 0 0 1 -2.824 2.995L16 22H8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-0.005 -0.167L4.08 8H4a1 1 0 0 1 -0.117 -1.993L4 6h16zm-9.489 5.14a1 1 0 0 0 -1.218 1.567L10.585 14l-1.292 1.293 -0.083 0.094a1 1 0 0 0 1.497 1.32L12 15.415l1.293 1.292 0.094 0.083a1 1 0 0 0 1.32 -1.497L13.415 14l1.292 -1.293 0.083 -0.094a1 1 0 0 0 -1.497 -1.32L12 12.585l-1.293 -1.292 -0.094 -0.083z" stroke-width="1"></path>
  <path d="M14 2a2 2 0 0 1 2 2 1 1 0 0 1 -1.993 0.117L14 4h-4l-0.007 0.117A1 1 0 0 1 8 4a2 2 0 0 1 1.85 -1.995L10 2h4z" stroke-width="1"></path>
</svg></span> <span class="text-xs md:text-base">

  Delete
</span> 
                            </button>
                        </td>
                    </tr>
                `;
        }
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

  const id = document.getElementById("productId").value;
  const name = document.getElementById("productName").value;
  const price = document.getElementById("productPrice").value;
  const stock = document.getElementById("productStock").value;
  const imageInput = document.getElementById("productImage");

  try {
    const url = id
      ? `${API_URL}/products/${id}`
      : `${API_URL}/products`;

    //  using post or put method as URL by ternary operator
    const method = id ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    if (imageInput && imageInput.files[0]) {
        formData.append("image", imageInput.files[0]);
    }

    const res = await fetch(url, {
      method: method,
      body: formData,
    });

    //  waiting response from method PHP to send what the data is send or not
    const data = await res.json();

    //  triggering the php file to send the response data json message using json
    showAlert(data.message);

    //  function for clearing the form
    resetProductForm();

    //  function to reload the product that have been added after execute
    loadProducts();
  } catch (err) {
    showAlert("Failed to save product", "error");
  }
}

// edit products
async function editProduct(id) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`);
    const product = await res.json();

    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productStock").value = product.stock;

    const preview = document.getElementById('imagePreview');
    if (product.image && typeof product.image === 'string' && product.image !== '[object Object]') {
        preview.src = `${API_URL}/upload/${product.image}`;
        preview.classList.remove('hidden');
    } else {
        preview.classList.add('hidden');
        preview.src = '';
    }

    document.getElementById(
      "productSubmitBtn"
    ).innerHTML = `Update Product`;
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
    const res = await fetch(`${API_URL}/products/${id}`, {
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
  document.getElementById("productStock").value = "0";
  const preview = document.getElementById('imagePreview');
  preview.src = '';
  preview.classList.add('hidden');
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
                > Add Product`;
}

// Update stock function
async function updateStock(id, delta) {
  try {
    const res = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: delta })
    });
    
    const data = await res.json();
    if (res.ok) {
      showAlert(data.message);
      loadProducts();
      // Refresh transaction dropdown if on transactions tab
      if (!document.getElementById('transactions').classList.contains('hidden')) {
        loadProductsForSelect();
      }
    } else {
      showAlert(data.error || 'Failed to update stock', 'error');
    }
  } catch (err) {
    showAlert('Failed to update stock', 'error');
  }
}

// ========== TRANSACTIONS ==========
async function loadProductsForSelect() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    const select = document.getElementById("transactionProduct");

    // Filter products to only show those with stock > 0
    const availableProducts = products.filter(p => p.stock > 0);

    if (availableProducts.length === 0) {
      select.innerHTML = '<option value="">-- No products available --</option>';
      return;
    }

    select.innerHTML =
      '<option value="">-- Select Product --</option>' +
      availableProducts
        .map(
          (p) =>
            `<option value="${p.id}">${p.name} - Rp ${parseFloat(
              p.price
            ).toLocaleString("id-ID")} (Stock: ${p.stock})</option>`
        )
        .join("");
  } catch (err) {
    showAlert("Failed to load products", "error");
  }
}

async function loadTransactions() {
  try {
    const res = await fetch(`${API_URL}/transactions`);
    const transactions = await res.json();
    const tbody = document.getElementById("transactionsTable");

    if (transactions.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No transactions found</td></tr>';
      document.getElementById("totalRevenue").textContent = "Rp 0";
      return;
    }

    let totalRevenue = 0;
    tbody.innerHTML = transactions
      .map((t, i) => {
        const total = t.quantity * parseFloat(t.product_price || 0);
        totalRevenue += total;
        return `
                        <tr class="hover:bg-green-50 transition-all ${
                          i % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }">
                            <td class="px-6 py-4 font-semibold text-gray-700">${
                              t.id
                            }</td>
                            <td class="px-6 py-4 font-medium text-gray-800">
                                <div class="flex items-center gap-3">
                                    ${t.product_image && typeof t.product_image === 'string' && t.product_image !== '[object Object]' ? `<img src="${API_URL}/upload/${t.product_image}" class="w-10 h-10 rounded-lg object-cover border border-gray-200" alt="">` : ''}
                                    ${t.product_name || "N/A"}
                                </div>
                            </td>
                            <td class="px-6 py-4 text-blue-600 font-bold">${
                              t.quantity
                            }x</td>
                            <td class="px-6 py-4 text-gray-600">Rp ${parseFloat(
                              t.product_price || 0
                            ).toLocaleString("id-ID")}</td>
                            <td class="px-6 py-4 text-green-600 font-bold text-lg">Rp ${total.toLocaleString(
                              "id-ID"
                            )}</td>
                            <td class="px-6 py-4 flex items-center">
                                <button onclick="editTransaction(${
                                  t.id
                                })" class=" flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all mr-2 font-semibold">
                                    <span><svg version="1.1" id="Edit--Streamline-Carbon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 16 16" xml:space="preserve" enable-background="new 0 0 32 32" height="16" width="16">
  <desc>
    Edit Streamline Icon: https://streamlinehq.com
  </desc>
  <title>edit</title>
  <path d="M1 13h14v1H1Z" fill="currentColor" stroke-width="0.5"></path>
  <path d="M12.7 4.5c0.4 -0.4 0.4 -1 0 -1.4l-1.8 -1.8c-0.4 -0.4 -1 -0.4 -1.4 0l-7.5 7.5V12h3.2l7.5 -7.5zm-2.5 -2.5L12 3.8l-1.5 1.5L8.7 3.5l1.5 -1.5zM3 11v-1.8l5 -5 1.8 1.8 -5 5H3z" fill="currentColor" stroke-width="0.5"></path>
  <path id="_Transparent_Rectangle_" d="M0 0h16v16H0Z" fill="none" stroke-width="0.5"></path>
</svg></span> Edit
                                </button>
                                <button onclick="deleteTransaction(${
                                  t.id
                                })" class="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-semibold">
                                    <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" id="Trash-X--Streamline-Tabler-Filled" height="24" width="24">
  <desc>
    Trash X Streamline Icon: https://streamlinehq.com
  </desc>
  <path d="M20 6a1 1 0 0 1 0.117 1.993L20 8h-0.081L19 19a3 3 0 0 1 -2.824 2.995L16 22H8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-0.005 -0.167L4.08 8H4a1 1 0 0 1 -0.117 -1.993L4 6h16zm-9.489 5.14a1 1 0 0 0 -1.218 1.567L10.585 14l-1.292 1.293 -0.083 0.094a1 1 0 0 0 1.497 1.32L12 15.415l1.293 1.292 0.094 0.083a1 1 0 0 0 1.32 -1.497L13.415 14l1.292 -1.293 0.083 -0.094a1 1 0 0 0 -1.497 -1.32L12 12.585l-1.293 -1.292 -0.094 -0.083z" stroke-width="1"></path>
  <path d="M14 2a2 2 0 0 1 2 2 1 1 0 0 1 -1.993 0.117L14 4h-4l-0.007 0.117A1 1 0 0 1 8 4a2 2 0 0 1 1.85 -1.995L10 2h4z" stroke-width="1"></path>
</svg></span> Delete
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

async function saveTransaction(e) {
  e.preventDefault();
  const id = document.getElementById("transactionId").value;
  const product_id = document.getElementById("transactionProduct").value;
  const quantity = document.getElementById("transactionQuantity").value;

  try {
    const url = id
      ? `${API_URL}/transactions/${id}`
      : `${API_URL}/transactions`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        product_id: parseInt(product_id), 
        quantity: parseInt(quantity) 
      }),
    });

    const data = await res.json();
    showAlert(data.message);
    resetTransactionForm();
    loadTransactions();
  } catch (err) {
    showAlert("Failed to save transaction", "error");
  }
}

async function editTransaction(id) {
  try {
    const res = await fetch(`${API_URL}/transactions/${id}`);
    const transaction = await res.json();

    document.getElementById("transactionId").value = transaction.id;
    document.getElementById("transactionProduct").value =
      transaction.product_id;
    document.getElementById("transactionQuantity").value = transaction.quantity;
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
    const res = await fetch(`${API_URL}/transactions/${id}`, {
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

// Image Preview Listener
document.getElementById('productImage').addEventListener('change', function(e) {
    const preview = document.getElementById('imagePreview');
    const file = e.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    }
});

// Load initial data
loadProducts();
