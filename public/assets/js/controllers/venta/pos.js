/**
 * ============================================================
 * Inventario PME
 * Venta POS Controller (Punto de Venta)
 * ============================================================
 */

import VentaService from "../../services/venta_service.js";
import ClienteService from "../../services/cliente_service.js";
import ProductoService from "../../services/producto_service.js";
import CompanyInfoService from "../../services/company_info_service.js";
import InvoiceTemplateService from "../../services/invoice_template_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";

const POSController = (() => {
  const FORM_ID = "form_pos_sale";
  const TABLE_BODY = "#pos_cart_table tbody";
  const INPUT_SEARCH = "#pos_search_product";
  const SELECT_CUSTOMER = "#pos_customer_id";

  let cart = [];
  let currentCompanyInfo = null;
  let lastSaleData = null; // Guardar data de la última venta para imprimir

  // Formato Moneda COP
  function formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Inicializar reloj
  function initClock() {
    setInterval(() => {
      const now = new Date();
      $("#clock_display").text(now.toLocaleTimeString());
    }, 1000);
  }

  // Cargar info de empresa para tickets
  async function loadCompanyInfo() {
    try {
      const response = await CompanyInfoService.obtenerEmpresaActual();
      if (response && response.success) {
        currentCompanyInfo = response.data;
      }
    } catch (e) {
      console.warn("[POS] No se pudo cargar info de empresa para el ticket", e);
    }
  }

  // Cargar clientes
  async function initCustomerSelect() {
    try {
      const response = await ClienteService.listarClientes();
      const select = $(SELECT_CUSTOMER);
      select.empty().append('<option value="">Consumidor Final</option>');

      if (response && response.success && response.data) {
        const clientes = response.data.results || response.data;
        clientes.forEach((cli) => {
          if (cli.is_active) {
            const doc = cli.document_number ? ` - ${cli.document_number}` : "";
            const name = cli.business_name || `${cli.first_name || ""} ${cli.last_name || ""}`.trim();
            select.append(new Option(`${name}${doc}`, cli.id_customer));
          }
        });
      }

      select.select2({ 
        theme: "bootstrap4", 
        placeholder: "Cliente (opcional)",
        allowClear: true 
      });
    } catch (error) {
      console.error("[POS] Error al cargar clientes:", error);
    }
  }

  // Autocomplete y búsqueda con Typeahead / Input listener
  async function initProductSearch() {
    // Para el POS, una simple búsqueda en el frontend sobre la lista cargada o peticiones al backend
    // Como no tenemos un endpoint específico de búsqueda rápida, traeremos todos los activos y filtraremos en memoria
    try {
      const response = await ProductoService.listarProductos();
      if (response && response.success) {
        const allProducts = (response.data.results || response.data).filter(p => p.is_active);
        
        // Simular un autocompletado básico con Select2
        $(INPUT_SEARCH).replaceWith('<select id="pos_search_product" class="form-control"><option></option></select>');
        const select = $("#pos_search_product");
        
        allProducts.forEach(p => {
            select.append($("<option></option>")
                .val(p.id_product || p.id)
                .text(`[${p.code}] ${p.name} - $${p.sale_price}`)
                .data('product', p));
        });

        select.select2({
            theme: "bootstrap4",
            placeholder: "Buscar producto por código o nombre...",
            allowClear: true
        }).on('select2:select', function (e) {
            const product = $(this).find(':selected').data('product');
            if (product) {
                addProductToCart(product);
                $(this).val(null).trigger('change');
                setTimeout(() => $(this).select2('open'), 100);
            }
        });
      }
    } catch (e) {
      console.error("[POS] Error al inicializar búsqueda de productos", e);
    }
  }

  function addProductToCart(product) {
    const existing = cart.find(item => item.id === (product.id_product || product.id));
    if (existing) {
        if (existing.quantity >= product.stock && product.stock > 0) { // Si hay control de stock
            NotificationService.toastWarning(`Stock máximo alcanzado para ${product.name}`);
            return;
        }
        existing.quantity += 1;
        existing.subtotal = existing.quantity * existing.price;
    } else {
        cart.push({
            id: product.id_product || product.id,
            code: product.code || 'S/N',
            name: product.name,
            price: parseFloat(product.sale_price || product.price || 0),
            quantity: 1,
            discount: 0,
            subtotal: parseFloat(product.sale_price || product.price || 0)
        });
    }
    renderCart();
  }

  function updateItemQuantity(id, newQty) {
    const item = cart.find(i => i.id === id);
    if (item && newQty > 0) {
        item.quantity = newQty;
        item.subtotal = (item.price * item.quantity) - item.discount;
        renderCart();
    }
  }

  function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
  }

  function renderCart() {
    const tbody = $(TABLE_BODY);
    tbody.empty();

    if (cart.length === 0) {
        tbody.append(`
            <tr id="empty_cart_row">
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-shopping-cart fa-3x mb-3 opacity-50"></i>
                    <h5>Carrito vacío</h5>
                    <p>Busque productos para agregarlos a la venta</p>
                </td>
            </tr>
        `);
        updateTotals();
        return;
    }

    cart.forEach(item => {
        const row = `
            <tr>
                <td><span class="badge badge-secondary">${item.code}</span></td>
                <td class="font-weight-bold">${item.name}</td>
                <td class="text-right">${formatCurrency(item.price)}</td>
                <td class="text-center">
                    <input type="number" class="form-control form-control-sm item-qty mx-auto" data-id="${item.id}" value="${item.quantity}" min="1" style="width: 70px;">
                </td>
                <td class="font-weight-bold text-success text-right">${formatCurrency(item.subtotal)}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-remove" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });

    // Listeners
    $(".item-qty").on("change", function() {
        updateItemQuantity($(this).data("id"), parseInt($(this).val()));
    });
    $(".btn-remove").on("click", function() {
        removeItem($(this).data("id"));
    });

    updateTotals();
  }

  function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const globalDiscount = parseFloat($("#pos_global_discount").val()) || 0;

    // No manejamos tax localmente en POS para simplificar, o asumimos 0 si no hay lógica
    const total = Math.max(0, subtotal - globalDiscount);

    $("#pos_subtotal").text(formatCurrency(subtotal));
    $("#pos_total_display").text(formatCurrency(total));

    // Calcular cambio si es efectivo
    calculateChange(total);
  }

  function calculateChange(total) {
    const pm = $("#pos_payment_method").val();
    const received = parseFloat($("#pos_amount_received").val()) || 0;
    const changeSpan = $("#pos_change_display");

    if (pm === "CASH" && received > 0) {
        const change = Math.max(0, received - total);
        changeSpan.text(formatCurrency(change));
        changeSpan.removeClass("text-danger").addClass("text-info");
        if (received < total) {
             changeSpan.text("Insuficiente");
             changeSpan.removeClass("text-info").addClass("text-danger");
        }
    } else {
        changeSpan.text(formatCurrency(0));
        changeSpan.removeClass("text-danger").addClass("text-info");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (cart.length === 0) {
        NotificationService.toastWarning("El carrito está vacío.");
        return;
    }

    const pm = $("#pos_payment_method").val();
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0) - (parseFloat($("#pos_global_discount").val()) || 0);
    const received = parseFloat($("#pos_amount_received").val());

    if (pm === "CASH") {
        if (!received || received < total) {
            NotificationService.toastError("El monto recibido es menor al total de la venta.");
            return;
        }
    }

    const customerId = $(SELECT_CUSTOMER).val();

    const saleData = {
        customer_id: customerId ? parseInt(customerId) : null,
        payment_method: pm,
        discount: parseFloat($("#pos_global_discount").val()) || 0,
        tax: 0, // simplificado
        amount_received: (pm === "CASH") ? received : null,
        generate_invoice: $("#pos_generate_invoice").is(":checked"),
        details: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            discount: item.discount
        }))
    };

    try {
        NotificationService.loading("Procesando venta...");

        const response = await VentaService.quickSale(saleData);

        NotificationService.close();


        if (response && response.success) {
            const saleResult = response.data;

            // Inyectar valores locales para el ticket
            let changeAmount = 0;
            if (pm === "CASH") {
                changeAmount = Math.max(0, received - saleResult.total);
                saleResult.amount_received = received;
                saleResult.change_amount = changeAmount;
            }

            lastSaleData = saleResult; // para imprimir ticket

            // Reset UI
            cart = [];
            renderCart();
            $("#pos_global_discount").val("0.00");
            $("#pos_amount_received").val("");
            $(SELECT_CUSTOMER).val("").trigger("change");

            // Mostrar modal de éxito
            $("#modal_change_amount").text(formatCurrency(changeAmount));
            $("#modal_print_ticket").modal("show");

            NotificationService.toastSuccess("Venta completada.");
        }
    } catch (error) {
        NotificationService.close();
        console.error(error);
        if (error.response && error.response.data && error.response.data.errors) {
            NotificationService.toastError(error.response.data.errors[0].message || "Error al completar la venta");
        } else {
            NotificationService.toastError("Ocurrió un error inesperado al procesar la venta.");
        }
    }
  }

  // Generar HTML del ticket para imprimir
  async function printTicket() {
      if (!lastSaleData) return;
      const sale = lastSaleData;

      const compName = currentCompanyInfo ? currentCompanyInfo.business_name : "Inventario P.M.E";
      const compTax = currentCompanyInfo ? `NIT: ${currentCompanyInfo.tax_id}` : "";

      // Obtener template dinámico (POS_TICKET)
      let template = null;
      if (typeof InvoiceTemplateService !== 'undefined') {
          template = await InvoiceTemplateService.getActiveTemplate('POS_TICKET');
      }

      let headerContent = template && template.header_content ? template.header_content : `
        <h2 style="margin: 5px 0;">{{company_name}}</h2>
        <div>{{company_tax_id}}</div>
      `;

      let footerContent = template && template.footer_content ? template.footer_content : `
        ${currentCompanyInfo ? currentCompanyInfo.receipt_footer : "Gracias por su compra"}
      `;

      // Reemplazar variables dinámicas
      headerContent = headerContent.replace(/{{company_name}}/g, compName)
                                   .replace(/{{company_tax_id}}/g, compTax);
      footerContent = footerContent.replace(/{{company_name}}/g, compName)
                                   .replace(/{{company_tax_id}}/g, compTax);

      let itemsHtml = "";
      sale.details.forEach(d => {
          itemsHtml += `
            <tr>
              <td>${d.quantity}x</td>
              <td>${d.product_name}</td>
              <td class="text-right">${formatCurrency(d.subtotal)}</td>
            </tr>
          `;
      });

      const customerName = sale.customer_name || "Consumidor Final";

      const ticketHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; font-size: 12px; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
          th, td { padding: 3px 0; }
          .border-top { border-top: 1px dashed #000; }
          .border-bottom { border-bottom: 1px dashed #000; }
        </style>
      </head>
      <body>
        <div class="text-center">
            ${headerContent}
            <div style="margin-top: 10px;" class="border-bottom pb-2">
                <b>TICKET: ${sale.sale_number}</b><br>
                Fecha: ${new Date(sale.sale_date).toLocaleString()}<br>
                Cajero: ${sale.user_name || 'Admin'}
            </div>
            <div style="text-align: left; margin-top: 5px;" class="border-bottom pb-2">
                Cliente: ${customerName}
            </div>
        </div>
        
        <table>
          <tbody class="border-bottom">
            ${itemsHtml}
          </tbody>
        </table>
        
        <table style="margin-top: 5px;">
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">${formatCurrency(sale.subtotal)}</td>
            </tr>
            <tr>
                <td>Descuento:</td>
                <td class="text-right">${formatCurrency(sale.discount)}</td>
            </tr>
            <tr class="font-bold" style="font-size: 14px;">
                <td>TOTAL:</td>
                <td class="text-right">${formatCurrency(sale.total)}</td>
            </tr>
            <tr><td colspan="2">&nbsp;</td></tr>
            <tr>
                <td>Recibido (${sale.payment_method}):</td>
                <td class="text-right">${formatCurrency(sale.amount_received || sale.total)}</td>
            </tr>
            <tr>
                <td>Cambio:</td>
                <td class="text-right">${formatCurrency(sale.change_amount || 0)}</td>
            </tr>
        </table>
        
        <div class="text-center" style="margin-top: 20px;">
            ${footerContent}
        </div>
        
        <script>
            window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
      `;

      const iframe = document.getElementById('print_frame');
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(ticketHtml);
      doc.close();
  }

  function setupEvents() {
    $("#pos_payment_method").on("change", function() {
        if ($(this).val() === "CASH") {
            $("#cash_payment_section").slideDown();
            $("#change_section").slideDown();
        } else {
            $("#cash_payment_section").slideUp();
            $("#change_section").slideUp();
            $("#pos_amount_received").val("");
        }
        updateTotals();
    });

    $("#pos_global_discount, #pos_amount_received").on("input", updateTotals);

    // Botones de Dinero Rápido
    $(".btn-quick-cash").on("click", function() {
        const total = cart.reduce((sum, item) => sum + item.subtotal, 0) - (parseFloat($("#pos_global_discount").val()) || 0);
        const amount = $(this).data("amount");
        
        if (amount === "exact") {
            $("#pos_amount_received").val(Math.max(0, total));
        } else {
            $("#pos_amount_received").val(parseFloat(amount));
        }
        
        updateTotals();
        $("#pos_amount_received").focus();
    });

    $(`#${FORM_ID}`).on("submit", handleSubmit);
    
    $("#btn_print_ticket").on("click", printTicket);

    $("#btn_cancel_pos").on("click", function() {
        cart = [];
        renderCart();
        $("#pos_global_discount").val("0.00");
        $("#pos_amount_received").val("");
        $(SELECT_CUSTOMER).val("").trigger("change");
    });

    // Keyboard shortcuts
    $(document).keydown(function(e) {
        if (e.key === "F2") {
            e.preventDefault();
            $(`#${FORM_ID}`).submit();
        }
        if (e.key === "Escape") {
            $("#btn_cancel_pos").click();
        }
    });

    // Validar permisos de descuento global
    if (!SecurityManager.hasPermission("sales.update")) {
        $("#pos_global_discount").prop("disabled", true);
        $("#discount_lock_icon").show();
    }
  }

  return {
    init: async () => {
      if (!SecurityManager.hasPermission("sales.create")) {
        SecurityManager.redirectIfUnauthorized();
        return;
      }
      initClock();
      await loadCompanyInfo();
      await initCustomerSelect();
      await initProductSearch();
      setupEvents();
    },
  };
})();

$(document).ready(() => {
  POSController.init();
});
