const API_BASE = 'http://localhost:8080/api/products';
const SALES_API = 'http://localhost:8080/api/sales';

let selectedProductId = null;
let selectedProduct = null;

// Show product section
document.getElementById('showProductSection').addEventListener('click', () => {
  document.getElementById('productSection').style.display = 'block';
  document.getElementById('showProductSection').style.display = 'none';
  document.getElementById('openSalesSection').style.display='none';
  document.getElementById('mainSection').style.display = 'none';
  loadProducts();
});

// Back from product section
document.getElementById('back').addEventListener('click', () => {
  document.getElementById('productSection').style.display = 'none';
  document.getElementById('showProductSection').style.display = 'inline-block';
  document.getElementById('openSalesSection').style.display='block';
  document.getElementById('mainSection').style.display = 'block';

});

// Load all products
async function loadProducts() {
  const res = await fetch(`${API_BASE}/`);
  const data = await res.json();

  const tbody = document.getElementById('productTableBody');
  tbody.innerHTML = '';

  data.forEach(product => {
    const row = `<tr>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.expire}</td>
      <td>${product.quantity}</td>
      <td>${product.price}</td>
      <td><button onclick="deleteProduct(${product.id})">Delete</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

// Add product
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const product = {
    name: document.getElementById('name').value,
    expire: document.getElementById('expire').value,
    quantity: parseInt(document.getElementById('quantity').value),
    price: parseFloat(document.getElementById('price').value)
  };

  await fetch(`${API_BASE}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  loadProducts();
  e.target.reset();
});

//  Delete product with error handling
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const text = await res.text();

    if (!res.ok) {
      console.error(" Failed to delete product:", text);
      alert("Failed to delete product: " + text);
      return;
    }

    alert(" Product deleted successfully");
    loadProducts();
  } catch (err) {
    console.error(" Error deleting product:", err);
    alert("Unexpected error occurred while deleting product.");
  }
}


// 👉 Open Sales Section
document.getElementById('openSalesSection').addEventListener('click', () => {
  document.getElementById('salesSection').style.display = 'block';
  document.getElementById('mainSection').style.display = 'none';
  loadSales(); //  Now it will run
});

// 👉 Back from sales
document.getElementById('backToHomeFromSales').addEventListener('click', () => {
  document.getElementById('salesSection').style.display = 'none';
  document.getElementById('mainSection').style.display = 'block';
});

// Product search with suggestions
document.getElementById('productSearch').addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  const suggestionBox = document.getElementById('suggestions');
  suggestionBox.innerHTML = '';

  if (query === '') {
    selectedProductId = null;
    return;
  }

  const res = await fetch(`${API_BASE}/`);
  const products = await res.json();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  filtered.forEach(product => {
    const div = document.createElement('div');
    div.textContent = product.name;
    div.addEventListener('click', () => {
      document.getElementById('productSearch').value = product.name;
      selectedProductId = product.id;
      selectedProduct = product;
      suggestionBox.innerHTML = '';
    });
    suggestionBox.appendChild(div);
  });
});

// 👉 Sale form submit
document.getElementById('salesForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const quantity = parseInt(document.getElementById('saleQuantity').value);

  if (!selectedProduct || !selectedProduct.id || !quantity) {
    alert("Please select a valid product and quantity.");
    return;
  }

  const sale = {
    items: [
      {
        productId: selectedProduct.id,
        quantity: quantity,
        price: selectedProduct.price
      }
    ]
  };

  console.log(" Final sale payload:", JSON.stringify(sale, null, 2));

  try {
    const res = await fetch(SALES_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Sale submission failed:", err);
      alert("Sale failed: " + err);
      return;
    }

    // ✅ Refresh sales table
    loadSales();

    e.target.reset();
    selectedProductId = null;
    selectedProduct = null;
    document.getElementById('suggestions').innerHTML = '';
  } catch (error) {
    console.error("Error during sale submission:", error);
    alert("Something went wrong while creating sale.");
  }
});

// ✅ Load all sales
async function loadSales() {
  try {
    const res = await fetch(`${SALES_API}/`);
    const sales = await res.json();

    const tableBody = document.getElementById('salesTableBody');
    tableBody.innerHTML = '';

    if (sales.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4; // Now 4 columns including invoice button
      cell.textContent = 'No sales available.';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      tableBody.appendChild(row);
      return;
    }

    sales.forEach(sale => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.textContent = sale.id;

      const dateCell = document.createElement('td');
      dateCell.textContent = new Date(sale.date).toLocaleDateString();

      const totalCell = document.createElement('td');
      totalCell.textContent = `₹${sale.totalAmount.toFixed(2)}`;

      const actionCell = document.createElement('td');
      const button = document.createElement('button');
      button.textContent = "Invoice";
      button.onclick = () => viewInvoice(sale.id);
      actionCell.appendChild(button);

      row.appendChild(idCell);
      row.appendChild(dateCell);
      row.appendChild(totalCell);
      row.appendChild(actionCell); // 👈 Add the button column

      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("❌ Failed to load sales:", error);
  }
}
// Redirect to invoice page
function viewInvoice(saleId) {
  window.location.href = `invoice.html?saleId=${saleId}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('themeToggle');
  const body = document.body;

  // Load theme from localStorage
  if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-theme');
    toggle.checked = true;
  }

  toggle.addEventListener('change', () => {
    body.classList.toggle('light-theme');
    // Store preference
    localStorage.setItem('theme', body.classList.contains('light-theme') ? 'light' : 'dark');
  });
});
