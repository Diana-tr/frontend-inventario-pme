/**
 * DocumentTemplateRenderer
 *
 * Servicio centralizado para el renderizado de documentos a partir de
 * InvoiceTemplates. Sustituye las variables en header_content, body_content,
 * y footer_content con datos reales de la empresa y del documento.
 */

class DocumentTemplateRenderer {
  /**
   * @param {Object} template - Objeto de InvoiceTemplate devuelto por la API.
   * @param {Object} normalizedDocumentData - Datos del documento mapeados al contrato estricto.
   * @param {Object} normalizedCompanyData - Datos de la empresa mapeados al contrato estricto.
   */
  constructor(template, normalizedDocumentData, normalizedCompanyData) {
    this.template = template || {};
    this.documentData = normalizedDocumentData || {};
    this.companyInfo = normalizedCompanyData || {};
  }

  /**
   * Renderiza el documento completo y retorna un HTML string listo para visualización/impresión.
   */
  render() {
    if (
      !this.template ||
      (!this.template.header_content &&
        !this.template.body_content &&
        !this.template.footer_content)
    ) {
      console.error(
        "[DocumentTemplateRenderer] Error: Plantilla no definida o vacía.",
      );
      return "<div style='text-align:center; color:red;'>Error: Plantilla no configurada.</div>";
    }

    const header = this._parseTemplate(this.template.header_content || "");
    const body = this._parseTemplate(this.template.body_content || "");
    const footer = this._parseTemplate(this.template.footer_content || "");

    return `
            <div class="document-render-container" style="font-family: 'Courier New', Courier, monospace; font-size: 12px; margin: 0 auto; width: 100%;">
                <div class="document-header" style="text-align: center;">${header}</div>
                <div class="document-body">${body}</div>
                <div class="document-footer" style="text-align: center;">${footer}</div>
            </div>
        `;
  }

  /**
   * Retorna un documento HTML completo listo para ventana de impresión autónoma.
   */
  renderForPrint(width = "300px") {
    const html = this.render();
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Impresión de Documento</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; width: ${width}; margin: 0 auto; font-size: 12px; color: #000; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .text-left { text-align: left; }
                    .font-bold { font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 5px; }
                    th, td { padding: 2px 0; }
                    .border-top { border-top: 1px dashed #000; }
                    .border-bottom { border-bottom: 1px dashed #000; }
                </style>
            </head>
            <body onload="window.print(); window.close();">
                ${html}
            </body>
            </html>
        `;
  }

  /**
   * Sustituye de forma segura las variables y renderiza tablas de ítems.
   */
  _parseTemplate(content) {
    if (!content) return "";

    let parsed = content;

    // 1. Variables de Empresa
    const compName = this.companyInfo.name || "Inventario P.M.E";
    const compTaxId = this.companyInfo.tax_id || "";
    const compPhone = this.companyInfo.phone || "";
    const compAddress = this.companyInfo.address || "";
    const compEmail = this.companyInfo.email || "";
    const compCity = this.companyInfo.city || "";
    const compFooter = this.companyInfo.receipt_footer || "";

    // 2. Variables del Documento
    const docNumber = this.documentData.document_number || "N/A";
    const docDate = this._formatDate(this.documentData.document_date);
    const customerName = this.documentData.customer_name || "Consumidor Final";

    const subtotal = this._formatCurrency(this.documentData.subtotal);
    const discount = this._formatCurrency(this.documentData.discount);
    const tax = this._formatCurrency(this.documentData.tax);
    const total = this._formatCurrency(this.documentData.total);
    const amountReceived = this._formatCurrency(
      this.documentData.amount_received,
    );
    const changeAmount = this._formatCurrency(this.documentData.change_amount);

    // Mapa de reemplazos directos
    const replacements = {
      company_name: this._escapeHtml(compName),
      company_tax_id: this._escapeHtml(compTaxId ? `NIT: ${compTaxId}` : ""),
      company_phone: this._escapeHtml(compPhone),
      company_address: this._escapeHtml(compAddress),
      company_email: this._escapeHtml(compEmail),
      company_city: this._escapeHtml(compCity),
      company_receipt_footer: this._escapeHtml(compFooter),

      document_number: this._escapeHtml(docNumber),
      document_date: this._escapeHtml(docDate),
      customer_name: this._escapeHtml(customerName),

      subtotal: subtotal,
      discount: discount,
      tax: tax,
      total: total,
      amount_received: amountReceived,
      change_amount: changeAmount,
    };

    // Reemplazo tolerante a espacios: Soporta {{ variable }} y {{variable}}
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      // Usamos una función callback () => value para evitar fallos si 'value' contiene '$'
      parsed = parsed.replace(regex, () => value);
    }

    // 3. Procesar Bucle de Ítems ({{#items}}...{{/items}})
    const loopRegex = /\{\{#items\}\}([\s\S]*?)\{\{\/items\}\}/g;

    parsed = parsed.replace(loopRegex, (match, itemTemplate) => {
      const items = this.documentData.items || [];

      if (items.length === 0) {
        return '<tr><td colspan="4" class="text-center">No hay ítems.</td></tr>';
      }

      let rowsHtml = "";
      items.forEach((item) => {
        const pName = item.product_name || item.name || "Producto";
        const qty = item.quantity !== undefined ? item.quantity : 0;
        const price = this._formatCurrency(item.unit_price || item.price);
        const itemSubtotal = this._formatCurrency(item.subtotal);

        let row = itemTemplate;
        // Soporta variantes de nombres de variables con o sin el prefijo item_
        row = row.replace(/\{\{\s*(item_name|product_name)\s*\}\}/g, () =>
          this._escapeHtml(pName),
        );
        row = row.replace(/\{\{\s*(item_quantity|quantity)\s*\}\}/g, () =>
          this._escapeHtml(String(qty)),
        );
        row = row.replace(
          /\{\{\s*(item_price|unit_price|price)\s*\}\}/g,
          () => price,
        );
        row = row.replace(
          /\{\{\s*(item_subtotal|subtotal)\s*\}\}/g,
          () => itemSubtotal,
        );

        rowsHtml += row;
      });

      return rowsHtml;
    });

    return parsed;
  }

  _escapeHtml(unsafe) {
    if (!unsafe) return "";
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  _formatCurrency(value) {
    if (value === undefined || value === null) return "$0.00";
    const val = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(val)) return "$0.00";
    return "$" + val.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  }

  _formatDate(dateString) {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }
}

export default DocumentTemplateRenderer;
