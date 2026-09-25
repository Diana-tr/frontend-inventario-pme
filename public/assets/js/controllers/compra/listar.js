/**
 * ============================================================
 * Inventario PME
 * Purchase List Controller (Compras)
 * ============================================================
 */

import CompraService from "../../services/compra_service.js";
import SecurityManager from "../../core/security.js";
import NotificationService from "../../core/notification.js";
import DocumentTemplateRenderer from "../../utils/DocumentTemplateRenderer.js";
import { formatCurrency, renderInvoiceItems } from "../../utils/invoice_utils.js";

const CompraListController = (() => {
  const TABLE_BODY_ID = "tablaComprasBody";
  const TABLE_ID = "tbl_Compras";
  const DETAIL_MODAL_ID = "modalDetalleCompra";

  function getTableBody() {
    const tbody = document.getElementById(TABLE_BODY_ID);
    if (!tbody) {
      throw new Error(`No se encontró #${TABLE_BODY_ID}.`);
    }
    return tbody;
  }

  function formatDate(isoStr) {
    if (!isoStr) return "N/A";
    const date = new Date(isoStr);
    return date.toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // formatCurrency se importa de invoice_utils.js

  function getStatusBadge(status) {
    const badges = {
      DRAFT: '<span class="badge badge-secondary px-3 py-2" style="border-radius:20px;font-size:0.75rem">Borrador</span>',
      PENDING: '<span class="badge badge-warning px-3 py-2" style="border-radius:20px;font-size:0.75rem">Pendiente</span>',
      RECEIVED: '<span class="badge badge-info px-3 py-2" style="border-radius:20px;font-size:0.75rem">Recibida</span>',
      COMPLETED: '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem">Completada</span>',
      CANCELLED: '<span class="badge badge-danger px-3 py-2" style="border-radius:20px;font-size:0.75rem">Cancelada</span>'
    };
    return badges[status] || `<span class="badge badge-dark px-3 py-2" style="border-radius:20px;font-size:0.75rem">${status}</span>`;
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Detalles
  // ───────────────────────────────────────────

  function setupViewDetailsListener() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-view-purchase")
      .on("click", ".btn-view-purchase", async function () {
        const compraId = $(this).data("purchaseId");

        if (!compraId) return;

        $("#purchase_modal_loader").show();
        $("#purchase_modal_content").hide();
        $("#purchase_action_buttons").empty(); // Limpiar botones
        $(`#${DETAIL_MODAL_ID}`).modal("show");

        try {
          const response = await CompraService.obtenerCompraPorId(compraId);

          if (response && response.success && response.data) {
            const compra = response.data;
            const supplier = compra.supplier || {};

            $("#detail_purchase_id").text(compra.id_purchase);
            $("#detail_issue_date").text(compra.issue_date || "N/A");
            $("#detail_notes").text(compra.notes || "Sin observaciones");
            $("#detail_status_badge").html(getStatusBadge(compra.status));

            $("#detail_supplier_name").text(supplier.business_name || `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim() || "N/A");
            $("#detail_supplier_document").text(`${supplier.document_type || ''} ${supplier.document_number || ''}`);
            $("#detail_supplier_email").text(supplier.email || "N/A");
            $("#detail_supplier_phone").text(supplier.mobile || supplier.phone || "N/A");

            $("#detail_subtotal").text(formatCurrency(compra.subtotal));
            $("#detail_total").text(formatCurrency(compra.total));

            // Cargar productos
            const tbody = $("#detail_products_body");
            tbody.empty();
            if (compra.details && compra.details.length > 0) {
              compra.details.forEach(item => {
                const tr = `
                  <tr>
                    <td>${item.product_code || ''}</td>
                    <td>${item.product_name || 'Producto desconocido'}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.unit_price)}</td>
                    <td>${formatCurrency(item.subtotal)}</td>
                  </tr>
                `;
                tbody.append(tr);
              });
            } else {
              tbody.append('<tr><td colspan="5" class="text-center text-muted">No hay productos en esta compra.</td></tr>');
            }

            // Información de factura
            const invoiceSection = $("#detail_invoice_section");
            invoiceSection.empty();
            if (compra.invoices_summary && compra.invoices_summary.length > 0) {
              const invoice = compra.invoices_summary[0];
              invoiceSection.html(`
                <div class="alert alert-info py-2 px-3 mb-0" style="font-size: 0.9rem;">
                  <i class="fas fa-file-invoice mr-2"></i> Factura <strong>${invoice.invoice_number}</strong> 
                  <span class="badge badge-light ml-2">${invoice.status}</span>
                  <div class="mt-2">
                    <button type="button" class="btn btn-sm btn-info btn-view-invoice" data-id="${invoice.id}">
                        <i class="fas fa-eye mr-1"></i> Ver factura
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-info btn-print-invoice ml-1" data-id="${invoice.id}">
                        <i class="fas fa-print mr-1"></i> Imprimir
                    </button>
                  </div>
                </div>
              `);
            } else {
              invoiceSection.html(`
                <p class="text-muted small mb-0"><i class="fas fa-exclamation-circle mr-1"></i> No hay factura asociada.</p>
              `);
            }

            // Inyectar botones de acción según el estado
            injectActionButtons(compra);

            $("#purchase_modal_loader").hide();
            $("#purchase_modal_content").fadeIn();
            
            // Re-procesar permisos de los botones inyectados
            SecurityManager.processDomPermissions();
          } else {
            throw new Error("Respuesta inválida al consultar la compra.");
          }
        } catch (error) {
          console.error("[COMPRAS] Error al obtener detalles:", error);
          $(`#${DETAIL_MODAL_ID}`).modal("hide");
          NotificationService.toastError("No se pudo cargar la información de la compra.");
        }
      });
  }

  function injectActionButtons(compra) {
    const container = $("#purchase_action_buttons");
    container.empty();

    if (compra.status === "DRAFT") {
      container.append(`
        <button type="button" class="btn btn-warning btn-sm btn-action-purchase font-weight-bold" 
          data-action="confirm" data-id="${compra.id_purchase}" data-permission="purchases.update">
          <i class="fas fa-check-circle mr-1"></i> Confirmar Compra
        </button>
        <button type="button" class="btn btn-danger btn-sm btn-action-purchase font-weight-bold ml-2" 
          data-action="cancel" data-id="${compra.id_purchase}" data-permission="purchases.update">
          <i class="fas fa-times-circle mr-1"></i> Cancelar
        </button>
      `);
    } else if (compra.status === "PENDING") {
      container.append(`
        <button type="button" class="btn btn-info btn-sm btn-action-purchase font-weight-bold" 
          data-action="receive" data-id="${compra.id_purchase}" data-permission="purchases.update">
          <i class="fas fa-box-open mr-1"></i> Recibir Mercancía (Actualizar Stock)
        </button>
        <button type="button" class="btn btn-danger btn-sm btn-action-purchase font-weight-bold ml-2" 
          data-action="cancel" data-id="${compra.id_purchase}" data-permission="purchases.update">
          <i class="fas fa-times-circle mr-1"></i> Cancelar
        </button>
      `);
    } else if (compra.status === "RECEIVED") {
      container.append(`
        <button type="button" class="btn btn-success btn-sm btn-action-purchase font-weight-bold" 
          data-action="complete" data-id="${compra.id_purchase}" data-permission="purchases.update">
          <i class="fas fa-flag-checkered mr-1"></i> Marcar Completada
        </button>
      `);
    }
  }

  function setupActionButtonsListener() {
    $(document).off("click", ".btn-action-purchase").on("click", ".btn-action-purchase", async function () {
      const action = $(this).data("action");
      const compraId = $(this).data("id");
      
      const actionMap = {
        "confirm": { verb: "confirmar", method: CompraService.confirmarCompra, color: "warning" },
        "receive": { verb: "recibir (ingresar a inventario)", method: CompraService.recibirCompra, color: "info" },
        "complete": { verb: "completar", method: CompraService.completarCompra, color: "success" },
        "cancel": { verb: "cancelar", method: CompraService.cancelarCompra, color: "danger" }
      };

      const config = actionMap[action];
      if (!config) return;

      const result = await NotificationService.warning(
        `¿Deseas ${config.verb} la compra #${compraId}?`,
        `Confirmar Acción`
      );

      if (!result.isConfirmed) return;

      try {
        $(this).prop("disabled", true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Procesando...');
        
        const response = await config.method(compraId);
        if (response && response.success) {
          NotificationService.toastSuccess(`Compra #${compraId} actualizada correctamente.`);
          $(`#${DETAIL_MODAL_ID}`).modal("hide");
          loadCompras();
        } else {
          throw response;
        }
      } catch (error) {
        console.error(`[COMPRAS] Error al ${config.verb}:`, error);
        const errorMsg = NotificationService.getApiErrorMessage(error, `Ocurrió un error al ${config.verb} la compra.`);
        NotificationService.error(errorMsg);
      } finally {
        $(this).prop("disabled", false);
      }
    });

    $(document).off("click", ".btn-print-invoice, .btn-print-invoice-modal").on("click", ".btn-print-invoice, .btn-print-invoice-modal", async function (e) {
      e.preventDefault();
      const invoiceId = $(this).data("id");
      if (!invoiceId) return;

      try {
        NotificationService.loading("Generando documento para impresión...");
        const response = await CompraService.obtenerFacturaPorId(invoiceId);
        NotificationService.close();

        if (response && response.success && response.data) {
          const factura = response.data;
          const template = factura.template;
          
          if (!template) {
            NotificationService.toastError("La factura no tiene una plantilla asociada.");
            return;
          }

          const normalizedCompanyData = {
            name: factura.company_name_snapshot,
            tax_id: factura.company_tax_id_snapshot,
            address: factura.company_address_snapshot,
            phone: factura.company_phone_snapshot,
            email: factura.company_email_snapshot,
            city: factura.company_city_snapshot,
            receipt_footer: factura.company_receipt_footer_snapshot
          };

          const normalizedDocumentData = {
            document_number: factura.invoice_number,
            document_date: factura.issue_date || factura.created_at,
            customer_name: factura.customer_name || "Proveedor",
            subtotal: factura.subtotal,
            discount: factura.discount,
            tax: factura.tax,
            total: factura.total,
            amount_received: factura.amount_received,
            change_amount: factura.change_amount,
            items: (factura.items || []).map(item => ({
              product_name: item.product_name || item.product,
              quantity: item.quantity,
              unit_price: item.unit_price,
              subtotal: item.subtotal
            }))
          };

          const renderer = new DocumentTemplateRenderer(template, normalizedDocumentData, normalizedCompanyData);
          const printHtml = renderer.renderForPrint("300px");

          const printWindow = window.open("", "_blank", "width=400,height=600");
          if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(printHtml);
            printWindow.document.close();
            printWindow.onload = function () {
              printWindow.focus();
              printWindow.print();
              printWindow.onafterprint = function () {
                printWindow.close();
              };
            };
          } else {
            NotificationService.toastError("El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes e intenta de nuevo.");
          }
        } else {
          NotificationService.toastError("No se pudo obtener la información de la factura.");
        }
      } catch (error) {
        NotificationService.close();
        console.error("Error al imprimir:", error);
        NotificationService.toastError("Error al generar la impresión.");
      }
    });

    $(document).off("click", ".btn-view-invoice").on("click", ".btn-view-invoice", async function (e) {
      e.preventDefault();
      const invoiceId = $(this).data("id");
      if (!invoiceId) return;

      $("#factura_modal_loader").show();
      $("#factura_modal_content").hide();
      $("#modalVisualizarFactura").modal("show");

      try {
        const response = await CompraService.obtenerFacturaPorId(invoiceId);
        if (response && response.success && response.data) {
          const factura = response.data;
          
          $("#factura_modal_number").text(factura.invoice_number);
          $("#factura_modal_date").text(factura.issue_date || "N/A");
          
          let badgeClass = "badge-secondary";
          let statusLabel = factura.status;
          if(statusLabel === "DRAFT") { badgeClass = "badge-warning"; statusLabel = "Borrador"; }
          else if(statusLabel === "ISSUED") { badgeClass = "badge-success"; statusLabel = "Emitida"; }
          else if(statusLabel === "CANCELLED") { badgeClass = "badge-danger"; statusLabel = "Anulada"; }
          
          $("#factura_modal_status").html(`<span class="badge ${badgeClass}">${statusLabel}</span>`);
          $("#factura_modal_purchase").text(factura.purchase || "N/A");
          $("#factura_modal_notes").text(factura.notes || "Sin observaciones");
          
          $("#factura_modal_subtotal").text(formatCurrency(factura.subtotal));
          $("#factura_modal_total").text(formatCurrency(factura.total));
          
          if (typeof DocumentTemplateRenderer !== 'undefined') {
            const normalizedCompanyData = {
              name: factura.company_name_snapshot,
              tax_id: factura.company_tax_id_snapshot,
              address: factura.company_address_snapshot,
              phone: factura.company_phone_snapshot,
              email: factura.company_email_snapshot,
              city: factura.company_city_snapshot,
              receipt_footer: factura.company_receipt_footer_snapshot
            };

            const normalizedDocumentData = {
              document_number: factura.invoice_number,
              document_date: factura.issue_date || factura.created_at,
              customer_name: factura.customer_name || "Proveedor",
              subtotal: factura.subtotal,
              discount: factura.discount,
              tax: factura.tax,
              total: factura.total,
              amount_received: factura.amount_received,
              change_amount: factura.change_amount,
              items: (factura.items || []).map(item => ({
                product_name: item.product_name || item.product,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal
              }))
            };

            const renderer = new DocumentTemplateRenderer(factura.template, normalizedDocumentData, normalizedCompanyData);
            
            if (factura.template) {
              if (factura.template.body_content) {
                 $("#factura_modal_header_template").empty();
                 $("#factura_modal_footer_template").empty();
                 $("#factura_modal_items").closest('table').parent().html(renderer.render());
              } else {
                 $("#factura_modal_header_template").html(renderer._parseTemplate(factura.template.header_content || ""));
                 $("#factura_modal_footer_template").html(renderer._parseTemplate(factura.template.footer_content || ""));
                 renderInvoiceItems(factura.items, "#factura_modal_items");
              }
            }
          }
          $(".btn-print-invoice-modal").data("id", factura.id);

          $("#factura_modal_loader").hide();
          $("#factura_modal_content").fadeIn();
        } else {
          throw new Error("No se pudo cargar la factura");
        }
      } catch (error) {
        console.error("Error cargando factura:", error);
        $("#modalVisualizarFactura").modal("hide");
        NotificationService.toastError("No se pudo cargar el detalle de la factura");
      }
    });
  }

  // ───────────────────────────────────────────
  // DataTable con paginación server-side
  // ───────────────────────────────────────────

  const COLUMN_ORDERING_MAP = {
    1: "id_purchase",
    2: "supplier__business_name",
    3: "issue_date",
    4: "subtotal",
    5: "total",
    6: "status",
  };

  let dataTableInstance = null;

  function initDataTable() {
    if (dataTableInstance) {
      dataTableInstance.destroy();
      dataTableInstance = null;
    }

    dataTableInstance = $(`#${TABLE_ID}`).DataTable({
      responsive: true,
      lengthChange: true,
      autoWidth: false,
      pageLength: 10,
      processing: true,
      serverSide: true,
      searchDelay: 500,
      dom:
        "<'row mb-2'" +
        "<'col-sm-12 col-md-6 d-flex align-items-center'lB>" +
        "<'col-sm-12 col-md-6 d-flex justify-content-end'f>" +
        ">" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row mt-2'" +
        "<'col-sm-12 col-md-5'i>" +
        "<'col-sm-12 col-md-7 d-flex justify-content-end'p>" +
        ">",
      buttons: [
        {
          extend: "excel",
          className: "btn btn-success btn-sm",
          text: '<i class="fas fa-file-excel mr-1"></i>Excel',
          exportOptions: { columns: [1, 2, 3, 4, 5, 6] },
        },
        {
          extend: "pdf",
          className: "btn btn-danger btn-sm",
          text: '<i class="fas fa-file-pdf mr-1"></i>PDF',
          exportOptions: { columns: [1, 2, 3, 4, 5, 6] },
        },
        {
          extend: "print",
          className: "btn btn-info btn-sm",
          text: '<i class="fas fa-print mr-1"></i>Imprimir',
          exportOptions: { columns: [1, 2, 3, 4, 5, 6] },
        },
      ],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
      },
      columnDefs: [
        { orderable: false, targets: [0, 7] },
        { className: "text-center", targets: [0, 6, 7] },
      ],
      ajax: async function (data, callback) {
        try {
          const page = Math.floor(data.start / data.length) + 1;
          const pageSize = data.length;
          const search = data.search?.value || "";

          let ordering = "";
          if (data.order && data.order.length > 0) {
            const orderCol = data.order[0].column;
            const orderDir = data.order[0].dir;
            const field = COLUMN_ORDERING_MAP[orderCol];
            if (field) {
              ordering = orderDir === "desc" ? `-${field}` : field;
            }
          }

          const response = await CompraService.listarComprasPaginadas({
            page,
            page_size: pageSize,
            search,
            ordering,
          });

          if (response?.success && response.data) {
            const compras = response.data.results || [];
            const totalRecords = response.data.count || 0;

            const rows = compras.map((compra, index) => {
              const supplierName = compra.supplier_name || compra.supplier_document || "Desconocido";
              const actions = buildActionsHtml(compra);

              return [
                data.start + index + 1,
                `#${compra.id_purchase}`,
                supplierName,
                compra.issue_date || "N/A",
                formatCurrency(compra.subtotal),
                formatCurrency(compra.total),
                getStatusBadge(compra.status),
                actions,
              ];
            });

            callback({
              draw: data.draw,
              recordsTotal: totalRecords,
              recordsFiltered: totalRecords,
              data: rows,
            });

            SecurityManager.processDomPermissions();
          } else {
            callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
          }
        } catch (error) {
          console.error("[COMPRAS] Error server-side:", error);
          callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
        }
      },
      drawCallback: function () {
        $(".dataTables_paginate > .pagination").addClass("pagination-sm");
      },
      initComplete: function () {
        $(".dt-buttons").addClass("ml-4");
      },
    });
  }

  function buildActionsHtml(compra) {
    const compraId = compra.id_purchase ?? "";
    
    // Si queremos un botón cancelar rápido desde la tabla:
    let cancelBtn = "";
    if (compra.status === "DRAFT" || compra.status === "PENDING") {
      cancelBtn = `
        <button type="button" class="btn btn-outline-danger btn-sm btn-action-purchase"
                title="Cancelar compra" data-action="cancel" data-id="${compraId}" data-permission="purchases.update">
          <i class="fas fa-ban"></i>
        </button>
      `;
    }

    return `
      <div class="btn-group">
        <button type="button" class="btn btn-outline-info btn-sm btn-view-purchase"
                title="Ver detalles" data-purchase-id="${compraId}" data-permission="purchases.view">
          <i class="fas fa-eye"></i>
        </button>
        ${cancelBtn}
      </div>
    `;
  }

  function loadCompras() {
    if (dataTableInstance) {
      dataTableInstance.ajax.reload(null, false);
    }
  }

  async function init() {
    const tbody = document.getElementById(TABLE_BODY_ID);
    if (!tbody) return;

    initDataTable();
    setupViewDetailsListener();
    setupActionButtonsListener();
  }

  return Object.freeze({
    init,
  });
})();

export default CompraListController;
