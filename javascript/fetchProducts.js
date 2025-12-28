// const API_URL = "http://localhost:3000";

// ========== PRODUCTS ==========
async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    const tbody = document.getElementById("productsTable");

    if (products.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No products found</td></tr>';
      return;
    }

    tbody.innerHTML = products
      .map((parameter, i) => {
        const stockClass =
          parameter.stock < 5
            ? "text-red-600 bg-red-400 border rounded-md border-red-500"
            : parameter.stock < 20
            ? "text-amber-900 bg-amber-200 border border-amber-500 rounded-md"
            : "text-emerald-800 bg-emerald-400 border border-emerald-500 rounded-md";
        return `
            <tr class="${i % 2 === 0 ? "bg-white" : "bg-slate-50"}">
              <td class="px-4 py-3 font-semibold text-slate-700">${
                parameter.id
              }</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3 ">
                  ${
                    parameter.image &&
                    typeof parameter.image === "string" &&
                    parameter.image !== "[object Object]"
                      ? `<img src="${API_URL}/uploads/${parameter.image}" class="w-12 h-12 border border-slate-300 object-contain rounded-md" alt="">`
                      : ""
                  }
                  <span class="font-medium text-slate-900">${
                    parameter.name
                  }</span>
                </div>
              </td>
              <td class="px-4 py-3 text-blue-600 font-bold">Rp ${parseFloat(
                parameter.price
              ).toLocaleString("id-ID")}</td>
              <td class="px-4 py-3">
                <span class="${stockClass} px-3 py-1 text-sm font-bold">${
          parameter.stock
        }</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button onclick="editProduct(${
                    parameter.id
                  })" class="bg-amber-500 rounded-md capitalize text-amber-100 px-4 py-2 hover:bg-yellow-600 font-semibold">Edit</button>
                  <button onclick="deleteProduct(${
                    parameter.id
                  })" class="bg-red-600 rounded-md text-white px-4 py-2 hover:bg-red-700 font-semibold capitalize">hapus</button>
                </div>
              </td>
            </tr>
          `;
      })
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
    const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;

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

    const preview = document.getElementById("imagePreview");
    if (
      product.image &&
      typeof product.image === "string" &&
      product.image !== "[object Object]"
    ) {
      preview.src = `${API_URL}/uploads/${product.image}`;
      preview.classList.remove("hidden");
    } else {
      preview.classList.add("hidden");
      preview.src = "";
    }

    document.getElementById("productSubmitBtn").innerHTML = `Update Product`;
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
  const preview = document.getElementById("imagePreview");
  preview.src = "";
  preview.classList.add("hidden");
  document.getElementById("productSubmitBtn").innerHTML = "Add Product";
}

// Update stock function
async function updateStock(id, delta) {
  try {
    const res = await fetch(`${API_URL}/products/${id}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta: delta }),
    });

    const data = await res.json();
    if (res.ok) {
      showAlert(data.message);
      loadProducts();
      // Refresh transaction dropdown if on transactions tab
      if (
        !document.getElementById("transactions").classList.contains("hidden")
      ) {
        loadProductsForSelect();
      }
    } else {
      showAlert(data.error || "Failed to update stock", "error");
    }
  } catch (err) {
    showAlert("Failed to update stock", "error");
  }
}

loadProducts();