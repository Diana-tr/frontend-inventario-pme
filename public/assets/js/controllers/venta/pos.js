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
import DocumentTemplateRenderer from "../../utils/DocumentTemplateRenderer.js";

const POSController = (() => {
  const FORM_ID = "form_pos_sale";
  const TABLE_BODY = "#pos_cart_table tbody";
  const INPUT_SEARCH = "#pos_search_product";
  const SELECT_CUSTOMER = "#pos_customer_id";

  let cart = [];
  let currentCompanyInfo = null;
  let lastSaleData = null; // Guardar data de la última venta para imprimir
  let isSubmitting = false;

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
            const name =
              cli.business_name ||
              `${cli.first_name || ""} ${cli.last_name || ""}`.trim();
            select.append(new Option(`${name}${doc}`, cli.id_customer));
          }
        });
      }

      select.select2({
        theme: "bootstrap4",
        placeholder: "Cliente (opcional)",
        allowClear: true,
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
        const allProducts = (response.data.results || response.data).filter(
          (p) => p.is_active,
        );

        // Evitar replaceWith si ya es un select para no destruir referencias
        let $input = $(INPUT_SEARCH);
        if ($input.is("input")) {
          $input.replaceWith(
            '<select id="pos_search_product" class="form-control"><option></option></select>',
          );
        }

        const select = $("#pos_search_product");
        if (select.hasClass("select2-hidden-accessible")) {
          select.select2("destroy");
        }
        select.empty().append('<option></option>');

        allProducts.forEach((p) => {
          select.append(
            $("<option></option>")
              .val(p.id_product || p.id)
              .text(`[${p.code}] ${p.name} - $${p.sale_price}`)
              .data("product", p),
          );
        });

        select
          .select2({
            theme: "bootstrap4",
            placeholder: "Buscar producto por código o nombre...",
            allowClear: true,
          })
          .on("select2:select", function (e) {
            const product = $(this).find(":selected").data("product");
            if (product) {
              addProductToCart(product);
              $(this).val(null).trigger("change");
              // Autofocus: reabrir el dropdown de búsqueda inmediatamente
              setTimeout(() => {
                $(this).select2("open");
              }, 80);
            }
          })
          .on("select2:close", function () {
            // Cuando se cierra por Escape, devolver foco al contenedor
            $(this).next(".select2-container").find(".select2-search__field").focus();
          });
      }
    } catch (e) {
      console.error("[POS] Error al inicializar búsqueda de productos", e);
    }
  }

  function addProductToCart(product) {
    const isStockTracked = product.stock !== undefined && product.stock !== null && product.stock !== "";
    const stockAvailable = isStockTracked ? parseFloat(product.stock) : Infinity;

    const existing = cart.find(
      (item) => item.id === (product.id_product || product.id),
    );

    if (existing) {
      if (isStockTracked && existing.quantity >= stockAvailable) {
        // Si hay control de stock
        NotificationService.toastWarning(
          `Stock máximo alcanzado para ${product.name}`,
        );
        return;
      }
      existing.quantity += 1;
      existing.subtotal = existing.quantity * existing.price;
    } else {
      if (isStockTracked && stockAvailable <= 0) {
        NotificationService.toastWarning(
          `No hay stock disponible para ${product.name}`,
        );
        return;
      }

      cart.push({
        id: product.id_product || product.id,
        code: product.code || "S/N",
        name: product.name,
        price: parseFloat(product.sale_price || product.price || 0),
        quantity: 1,
        discount: 0,
        subtotal: parseFloat(product.sale_price || product.price || 0),
        stock: stockAvailable, // Guardar stock para futuras validaciones
        isStockTracked: isStockTracked
      });
    }
    renderCart();
  }

  function updateItemQuantity(id, newQty) {
    const item = cart.find((i) => i.id === id);
    if (item && newQty > 0) {
      if (item.isStockTracked && newQty > item.stock) {
        NotificationService.toastWarning(
          `Stock máximo alcanzado para ${item.name}`,
        );
        // Opcional: revertir el input a la cantidad anterior, pero como esto se re-renderiza, bastará con no actualizar
        return;
      }
      item.quantity = newQty;
      item.subtotal = item.price * item.quantity - item.discount;
      renderCart();
    }
  }

  function removeItem(id) {
    cart = cart.filter((i) => i.id !== id);
    renderCart();
    // Autofocus de vuelta al buscador después de eliminar
    setTimeout(() => $("#pos_search_product").select2("open"), 80);
  }

  function renderCart() {
    const tbody = $(TABLE_BODY);
    tbody.empty();

    if (cart.length === 0) {
      tbody.append(`
            <tr id="empty_cart_row">
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fas fa-shopping-cart fa-3x mb-3 opacity-50"></i>
                    <h5>Carrito vacío</h5>
                    <p>Busque productos para agregarlos a la venta</p>
                </td>
            </tr>
        `);
      updateCartCounter();
      updateTotals();
      return;
    }

    cart.forEach((item) => {
      const row = `
            <tr>
                <td></td>
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

    // Listeners de filas dinámicas
    $(".item-qty").off("change").on("change", function () {
      updateItemQuantity($(this).data("id"), parseInt($(this).val()));
    });
    $(".btn-remove").off("click").on("click", function () {
      removeItem($(this).data("id"));
    });

    updateTotals();
    updateCartCounter();
  }

  // Contador de ítems y unidades en el encabezado del carrito
  function updateCartCounter() {
    const totalItems = cart.length;
    const totalUnits = cart.reduce((sum, i) => sum + i.quantity, 0);
    const $counter = $("#pos_cart_counter_th");
    if (totalItems > 0) {
      $counter.html(
        `<span class="badge badge-success">${totalItems} prod.</span><br><span class="badge badge-secondary">${totalUnits} uds.</span>`
      );
    } else {
      $counter.html("");
    }
  }

  // Genera botones de denominación dinámicamente según el total de la venta
  function renderDenominationButtons(total) {
    const $container = $("#quick_cash_buttons");
    $container.empty();

    // Botón fijo: monto exacto
    $container.append(
      `<button type="button" class="btn btn-outline-secondary mb-1 flex-fill mx-1 btn-quick-cash" data-amount="exact">Exacto</button>`
    );

    if (total <= 0) return;

    // Denominaciones COP disponibles (de menor a mayor)
    const denominations = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000];

    // Calcular los 3 denominaciones más cercanas superiores al total
    const suggestions = [];
    for (const d of denominations) {
      // Cuántos billetes del valor d necesitamos? El primer múltiplo de d >= total
      const multiple = Math.ceil(total / d) * d;
      if (multiple >= total && !suggestions.includes(multiple)) {
        suggestions.push(multiple);
        if (suggestions.length === 3) break;
      }
    }

    // Si no conseguimos 3 sugerencias (total muy alto), completar con redondeos
    if (suggestions.length < 3 && total > 0) {
      const rounded = [100000, 200000, 500000].filter(v => v >= total && !suggestions.includes(v));
      suggestions.push(...rounded.slice(0, 3 - suggestions.length));
    }

    suggestions.forEach(amount => {
      const label = amount >= 1000
        ? `$ ${new Intl.NumberFormat("es-CO").format(amount)}`
        : `$ ${amount}`;
      $container.append(
        `<button type="button" class="btn btn-outline-info mb-1 flex-fill mx-1 btn-quick-cash" data-amount="${amount}">${label}</button>`
      );
    });

    // Re-vincular el listener para los nuevos botones
    $(".btn-quick-cash").off("click").on("click", function () {
      const raw = $(this).data("amount");
      const val = raw === "exact" ? Math.max(0, total) : parseFloat(raw);
      $("#pos_amount_received").val(val);
      updateTotals();
      $("#pos_amount_received").focus();
    });
  }

  function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const rawDiscount = parseFloat($("#pos_global_discount").val()) || 0;

    // Validar que el descuento no supere el subtotal
    const globalDiscount = Math.min(rawDiscount, subtotal);
    if (rawDiscount > subtotal && subtotal > 0) {
      $("#pos_global_discount").val(subtotal.toFixed(2));
    }

    const total = Math.max(0, subtotal - globalDiscount);

    $("#pos_subtotal").text(formatCurrency(subtotal));
    $("#pos_total_display").text(formatCurrency(total));

    // Regenerar denominaciones basadas en el total actual
    renderDenominationButtons(total);

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

    if (isSubmitting) return; // Si ya está enviando, no hacer nada

    if (cart.length === 0) {
      NotificationService.toastWarning("El carrito está vacío.");
      return;
    }

    const pm = $("#pos_payment_method").val();
    const total =
      cart.reduce((sum, item) => sum + item.subtotal, 0) -
      (parseFloat($("#pos_global_discount").val()) || 0);
    const received = parseFloat($("#pos_amount_received").val());

    if (pm === "CASH") {
      if (!received || received < total) {
        NotificationService.toastError(
          "El monto recibido es menor al total de la venta.",
        );
        return;
      }
    }

    const customerId = $(SELECT_CUSTOMER).val();

    const saleData = {
      customer_id: customerId ? parseInt(customerId) : null,
      payment_method: pm,
      discount: parseFloat($("#pos_global_discount").val()) || 0,
      tax: 0,
      amount_received: pm === "CASH" ? received : null,
      generate_invoice: $("#pos_generate_invoice").is(":checked"),
      details: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        discount: item.discount,
      })),
    };

    try {
      isSubmitting = true; // Activar el bloqueo
      NotificationService.loading("Procesando venta...");

      const response = await VentaService.quickSale(saleData);
      NotificationService.close();

      if (response && response.success) {
        const saleResult = response.data;
        let changeAmount = 0;
        if (pm === "CASH") {
          changeAmount = Math.max(0, received - saleResult.total);
          saleResult.amount_received = received;
          saleResult.change_amount = changeAmount;
        }

        lastSaleData = saleResult;

        // Llenar desglose del modal de cobro
        const saleSubtotal = parseFloat(saleResult.subtotal || 0);
        const saleDiscount = parseFloat(saleResult.discount || saleData.discount || 0);
        const saleTotal = parseFloat(saleResult.total || 0);
        const saleReceived = pm === "CASH" ? received : null;
        const saleChange = pm === "CASH" ? Math.max(0, received - saleTotal) : 0;

        $("#modal_breakdown_subtotal").text(formatCurrency(saleSubtotal));
        $("#modal_breakdown_discount").text(formatCurrency(saleDiscount));
        $("#modal_breakdown_discount_row").toggle(saleDiscount > 0);
        $("#modal_breakdown_total").text(formatCurrency(saleTotal));
        $("#modal_breakdown_received").text(saleReceived != null ? formatCurrency(saleReceived) : "N/A");
        $("#modal_breakdown_received_row").toggle(pm === "CASH");
        $("#modal_change_amount").text(formatCurrency(saleChange));

        // Reset UI
        cart = [];
        renderCart();
        $("#pos_global_discount").val("0.00");
        $("#pos_amount_received").val("");
        $(SELECT_CUSTOMER).val("").trigger("change");

        $("#modal_print_ticket").modal("show");
        NotificationService.toastSuccess("Venta completada.");
      }
    } catch (error) {
      NotificationService.close();
      console.error(error);
      if (error.response && error.response.data && error.response.data.errors) {
        NotificationService.toastError(
          error.response.data.errors[0].message ||
          "Error al completar la venta",
        );
      } else {
        NotificationService.toastError(
          "Ocurrió un error inesperado al procesar la venta.",
        );
      }
    } finally {
      isSubmitting = false; // Liberar siempre al terminar, falle o tenga éxito
    }
  }

  // Guard para evitar doble ejecución de impresión
  let isPrinting = false;

  // Generar HTML del ticket para imprimir
  async function printTicket() {
    if (!lastSaleData) return;

    // Guard: si ya se está imprimiendo, ignorar el clic extra
    if (isPrinting) return;
    isPrinting = true;

    const $btn = $("#btn_print_ticket");
    const originalHtml = $btn.html();
    $btn.prop("disabled", true).html('<i class="fas fa-spinner fa-spin mr-1"></i> Generando...');

    try {
      let template = null;

      if (typeof InvoiceTemplateService !== "undefined") {
        template = await InvoiceTemplateService.getActiveTemplate("POS_TICKET");
        if (template) {
          console.log("[POS] Plantilla POS obtenida correctamente:", template);
        } else {
          console.warn("[POS] No existe una plantilla POS_TICKET activa.");
        }
      }

      if (!template) {
        console.error("[POS] No se puede imprimir el ticket: no existe una plantilla POS_TICKET activa.");
        if (typeof NotificationService !== "undefined") {
          NotificationService.error("No existe una plantilla de ticket POS activa.");
        }
        return;
      }

      if (typeof DocumentTemplateRenderer === "undefined") {
        console.warn("[POS] Falta DocumentTemplateRenderer.");
        NotificationService.toastError("Plantilla POS no configurada o motor inactivo.");
        return;
      }

      const normalizedCompanyData = {
        name:
          currentCompanyInfo?.business_name ||
          currentCompanyInfo?.trade_name ||
          "Inventario P.M.E",
        tax_id: currentCompanyInfo?.tax_id,
        address: currentCompanyInfo?.address,
        phone: currentCompanyInfo?.phone || currentCompanyInfo?.mobile,
        email: currentCompanyInfo?.email,
        city: currentCompanyInfo?.city,
        receipt_footer: currentCompanyInfo?.receipt_footer,
      };

      const normalizedDocumentData = {
        document_number:
          lastSaleData.sale_number || "POS-" + (lastSaleData.id_sale || "S/N"),
        document_date: lastSaleData.sale_date || lastSaleData.created_at,
        customer_name: lastSaleData.customer_name || "Consumidor Final",
        subtotal: lastSaleData.subtotal,
        discount: lastSaleData.discount,
        tax: lastSaleData.tax,
        total: lastSaleData.total,
        amount_received: lastSaleData.amount_received,
        change_amount: lastSaleData.change_amount,
        items: (lastSaleData.details || []).map((item) => ({
          product_name: item.product_name || item.product,
          quantity: item.quantity,
          unit_price: item.unit_price || item.price,
          subtotal: item.subtotal,
        })),
      };

      const renderer = new DocumentTemplateRenderer(
        template,
        normalizedDocumentData,
        normalizedCompanyData,
      );

      const ticketHtml = renderer.renderForPrint("300px");

      // Reutilizar el iframe oculto, limpiar su contenido antes de escribir
      let printIframe = document.getElementById("hidden-print-iframe");
      if (!printIframe) {
        printIframe = document.createElement("iframe");
        printIframe.id = "hidden-print-iframe";
        printIframe.style.position = "fixed";
        printIframe.style.right = "0";
        printIframe.style.bottom = "0";
        printIframe.style.width = "0";
        printIframe.style.height = "0";
        printIframe.style.border = "0";
        document.body.appendChild(printIframe);
      }

      const doc = printIframe.contentWindow.document;
      doc.open();
      doc.write(ticketHtml);
      doc.close();

      // Llamar print y restaurar botón DESPUÉS (no en un finally que corre antes del setTimeout)
      setTimeout(() => {
        try {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
        } finally {
          // Restaurar botón solo cuando el diálogo de impresión ya se mostró
          $btn.prop("disabled", false).html(originalHtml);
          isPrinting = false;
        }
      }, 300);

      // No se restaura el botón aquí — lo hace el setTimeout de arriba
      return;
    } catch (rendererError) {
      console.error("[POS] Error en DocumentTemplateRenderer:", rendererError);
      NotificationService.toastError("El motor de plantillas rechazó la estructura de la plantilla.");
    } finally {
      // Este finally solo restaura en caso de errores tempranos (antes del setTimeout)
      // Si llegamos al setTimeout, ya retornamos arriba y este finally no hace nada extra
      if (isPrinting) {
        $btn.prop("disabled", false).html(originalHtml);
        isPrinting = false;
      }
    }
  }

  function setupEvents() {
    $("#pos_payment_method").off("change").on("change", function () {
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

    $("#pos_global_discount, #pos_amount_received").off("input").on("input", updateTotals);

    // Botones de denominación: se vinculan dinámicamente desde renderDenominationButtons()
    // El listener estático del botón "exact" lo configura esa función también.

    $(`#${FORM_ID}`).off("submit").on("submit", handleSubmit);

    // .off() CRÍTICO: evita acumulación de listeners que causaban doble impresión
    $("#btn_print_ticket").off("click").on("click", printTicket);

    $("#btn_cancel_pos").off("click").on("click", function () {
      cart = [];
      renderCart();
      $("#pos_global_discount").val("0.00");
      $("#pos_amount_received").val("");
      $(SELECT_CUSTOMER).val("").trigger("change");
      // Autofocus al buscador al limpiar
      setTimeout(() => $("#pos_search_product").select2("open"), 80);
    });

    // Autofocus al monto recibido cuando se abre el modal de éxito
    $("#modal_print_ticket").off("shown.bs.modal").on("shown.bs.modal", function () {
      // Foco al botón de imprimir para poder activarlo con Enter
      $("#btn_print_ticket").focus();
    });

    // Al cerrar el modal, volver a buscar productos
    $("#modal_print_ticket").off("hidden.bs.modal").on("hidden.bs.modal", function () {
      setTimeout(() => $("#pos_search_product").select2("open"), 100);
    });

    // Keyboard shortcuts
    $(document).off("keydown.pos").on("keydown.pos", function (e) {
      if (e.key === "F2") {
        e.preventDefault();
        $(`#${FORM_ID}`).submit();
      }
      if (e.key === "Escape") {
        if ($("#modal_print_ticket").hasClass("show")) return; // No cancelar si el modal está abierto
        $("#btn_cancel_pos").click();
      }
    });

    // Validar permisos de descuento global
    if (!SecurityManager.hasPermission("sales.update")) {
      $("#pos_global_discount").prop("disabled", true);
      $("#discount_lock_icon").show();
    }

    // Disparar denominaciones iniciales (carrito vacío = total 0)
    renderDenominationButtons(0);
  }

  return {
    init: async () => {
      // Verificar permiso y redirigir si no lo tiene
      if (!SecurityManager.hasPermission("sales.create")) {
        SecurityManager.redirectIfUnauthorized("sales.create");
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

export default POSController;
