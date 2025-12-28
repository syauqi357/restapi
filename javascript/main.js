const API_URL = "http://localhost:3000";

// switch tab function
function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("bg-blue-600", "text-white");
    btn.classList.add("text-slate-700", "hover:bg-slate-50");
  });
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.add("hidden");
  });

  event.target.classList.add("bg-blue-600", "text-white");
  event.target.classList.remove("text-slate-700", "hover:bg-slate-50");
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
  const backgroundColor = type === "success" ? "bg-emerald-300" : "bg-red-400";
  const borderColor =
    type === "success" ? "border-emerald-500" : "border-red-500";
  alertDiv.innerHTML = `
    <div class="${backgroundColor} ${borderColor} border animate-pulse text-white px-6 py-4 rounded-md font-semibold">
      ${message}
    </div>
  `;
  setTimeout(() => (alertDiv.innerHTML = ""), 3000);
}



// Dropzone functionality
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("productImage");
const preview = document.getElementById("imagePreview");

// Prevent default drag behaviors
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight dropzone when item is dragged over it
["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, highlight, false);
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  dropzone.classList.add("border-blue-600", "bg-blue-100");
}

function unhighlight(e) {
  dropzone.classList.remove("border-blue-600", "bg-blue-100");
}

// Handle dropped files
dropzone.addEventListener("drop", handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;

  if (files.length > 0) {
    fileInput.files = files;
    handleFiles(files);
  }
}

// Handle file selection (both drag-drop and click)
fileInput.addEventListener("change", function (e) {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  if (files.length > 0) {
    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showAlert("Please select an image file", "error");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showAlert("File size must be less than 10MB", "error");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
}

// Load initial data
