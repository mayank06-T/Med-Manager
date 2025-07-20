const urlParams = new URLSearchParams(window.location.search);
const saleId = urlParams.get('saleId');

if (!saleId) {
  alert("Sale ID is missing in the URL!");
  throw new Error("Missing saleId");
}

fetch(`http://localhost:8080/api/billing/invoice/${saleId}`)
  .then(res => {
    if (!res.ok) throw new Error("Failed to fetch invoice");
    return res.json();
  })
  .then(invoice => {
    document.getElementById('invoiceId').textContent = invoice.saleId;
    document.getElementById('invoiceDate').textContent = invoice.date;
    document.getElementById('totalAmount').textContent = invoice.totalAmount.toFixed(2);

    const tbody = document.getElementById('itemsTableBody');
    tbody.innerHTML = '';
    invoice.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toFixed(2)}</td>
        <td>${(item.quantity * item.price).toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(err => {
    alert("Error fetching invoice.");
    console.error(err);
  });
function downloadInvoicePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const invoiceId = document.getElementById('invoiceId').textContent;
  const invoiceDate = document.getElementById('invoiceDate').textContent;
  const totalAmount = document.getElementById('totalAmount').textContent;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("🧾 Invoice", 80, 20);

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Invoice ID: ${invoiceId}`, 14, 35);
  doc.text(`Date: ${invoiceDate}`, 14, 45);

  // Table headers
  const startY = 60;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("Product", 14, startY);
  doc.text("Qty", 74, startY);
  doc.text("Price", 104, startY);
  doc.text("Total", 144, startY);

  doc.setFont(undefined, 'normal');

  const rows = document.querySelectorAll("#itemsTableBody tr");
  let y = startY + 10;

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    doc.text(cells[0].textContent, 14, y);
    doc.text(cells[1].textContent, 74, y);
    doc.text(cells[2].textContent, 104, y);
    doc.text(cells[3].textContent, 144, y);
    y += 10;
  });

  // Total amount
  doc.setFont(undefined, 'bold');
  doc.text(`Total: ₹${totalAmount}`, 144, y + 10);

  doc.save(`Invoice_${invoiceId}.pdf`);
}


