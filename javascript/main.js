const API_URL = "http://localhost:3000";

function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("bg-blue-600", "text-white");
    btn.classList.add("text-gray-700", "hover:bg-gray-50");
  });
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.add("hidden");
  });

  event.target.classList.add("bg-blue-600", "text-white");
  event.target.classList.remove("text-gray-700", "hover:bg-gray-50");
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
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  alertDiv.innerHTML = `
    <div class="${bgColor} text-white px-6 py-4 border-2 border-gray-900 font-semibold">
      ${message}
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
          const stockClass = p.stock < 5 ? 'text-white bg-red-600' : p.stock < 20 ? 'text-gray-900 bg-yellow-400' : 'text-white bg-green-600';
          return `
            <tr class="${i % 2 === 0 ? "bg-white" : "bg-gray-50"}">
              <td class="px-4 py-3 font-semibold text-gray-700">${p.id}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  ${p.image && typeof p.image === 'string' && p.image !== '[object Object]' ? `<img src="${API_URL}/upload/${p.image}" class="w-12 h-12 border-2 border-gray-300 object-cover" alt="">` : ''}
                  <span class="font-medium text-gray-900">${p.name}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-blue-600 font-bold">Rp ${parseFloat(p.price).toLocaleString("id-ID")}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="${stockClass} px-3 py-1 text-sm font-bold">${p.stock}</span>
                  <button onclick="updateStock(${p.id}, 10)" class="bg-green-600 text-white px-3 py-2 hover:bg-green-700 font-bold">+10</button>
                  <button onclick="updateStock(${p.id}, -10)" class="bg-red-600 text-white px-3 py-2 hover:bg-red-700 font-bold">-10</button>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button onclick="editProduct(${p.id})" class="bg-yellow-500 text-white px-4 py-2 hover:bg-yellow-600 font-semibold">Edit</button>
                  <button onclick="deleteProduct(${p.id})" class="bg-red-600 text-white px-4 py-2 hover:bg-red-700 font-semibold">Delete</button>
                </div>
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
  document.getElementById("productSubmitBtn").innerHTML = "Add Product";
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
        '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No transactions found</td></tr>';
      document.getElementById("totalRevenue").textContent = "Rp 0";
      return;
    }

    let totalRevenue = 0;
    tbody.innerHTML = transactions
      .map((t, i) => {
        const total = t.quantity * parseFloat(t.product_price || 0);
        totalRevenue += total;
        return `
          <tr class="${i % 2 === 0 ? "bg-white" : "bg-gray-50"}">
            <td class="px-4 py-3 font-semibold text-gray-900">${t.id}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                ${t.product_image && typeof t.product_image === 'string' && t.product_image !== '[object Object]' ? `<img src="${API_URL}/upload/${t.product_image}" class="w-12 h-12 border-2 border-gray-300 object-contain" alt="">` : ''}
                <span class="font-medium text-gray-900">${t.product_name || "N/A"}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-900 font-bold">${t.quantity}x</td>
            <td class="px-4 py-3 text-gray-900">Rp ${parseFloat(t.product_price || 0).toLocaleString("id-ID")}</td>
            <td class="px-4 py-3 text-gray-900 font-bold">Rp ${total.toLocaleString("id-ID")}</td>
            <td class="px-4 py-3">
              <div class="flex gap-2">
                <button onclick="editTransaction(${t.id})" class="bg-yellow-500 text-white px-4 py-2 hover:bg-yellow-600 font-semibold">Edit</button>
                <button onclick="deleteTransaction(${t.id})" class="bg-red-600 text-white px-4 py-2 hover:bg-red-700 font-semibold">Delete</button>
              </div>
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
