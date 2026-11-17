import { escapeHtml } from "../core/utils.js";

export function formatCurrency(amount) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

export function renderInvoiceItems(items, tbodyElement) {
  const tbody = $(tbodyElement);
  tbody.empty();
  if (items && items.length > 0) {
    items.forEach((item) => {
      const pName = escapeHtml(item.product_name || `Producto #${item.product || item.product_id}`);
      const qty = escapeHtml(String(item.quantity !== undefined ? item.quantity : 0));
      const tr = `
        <tr>
          <td>${pName}</td>
          <td class="text-center">${qty}</td>
          <td class="text-right">${formatCurrency(item.unit_price)}</td>
          <td class="text-right">${formatCurrency(item.subtotal)}</td>
        </tr>
      `;
      tbody.append(tr);
    });
  } else {
    tbody.append(
      '<tr><td colspan="4" class="text-center text-muted">No hay ítems en esta factura.</td></tr>'
    );
  }
}
