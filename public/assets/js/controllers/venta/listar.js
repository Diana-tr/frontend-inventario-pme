/**
 * ============================================================
 * Inventario PME
 * Sale List Controller (Ventas)
 * ============================================================
 */

import VentaService from "../../services/venta_service.js";
import SecurityManager from "../../core/security.js";
import NotificationService from "../../core/notification.js";
import DocumentTemplateRenderer from "../../utils/DocumentTemplateRenderer.js";
import { formatCurrency, renderInvoiceItems } from "../../utils/invoice_utils.js";

const VentaListController = (() => {
  const TABLE_BODY_ID = "tablaVentasBody";
  const TABLE_ID = "tbl_Ventas";
  const DETAIL_MODAL_ID = "modalDetalleVenta";

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
      DRAFT:
        '<span class="badge badge-secondary px-3 py-2" style="border-radius:20px;font-size:0.75rem">Borrador</span>',
      PENDING:
        '<span class="badge badge-warning px-3 py-2" style="border-radius:20px;font-size:0.75rem">Pendiente</span>',
      COMPLETED:
        '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem">Completada</span>',
      CANCELLED:
        '<span class="badge badge-danger px-3 py-2" style="border-radius:20px;font-size:0.75rem">Cancelada</span>',
    };
    return (
      badges[status] ||
      `<span class="badge badge-dark px-3 py-2" style="border-radius:20px;font-size:0.75rem">${status}</span>`
    );
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Detalles
  // ───────────────────────────────────────────

  function setupViewDetailsListener() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-view-sale")
      .on("click", ".btn-view-sale", async function () {
        const ventaId = $(this).data("saleId");

        if (!ventaId) return;

        $("#sale_modal_loader").show();
        $("#sale_modal_content").hide();
        $("#sale_action_buttons").empty(); // Limpiar botones
        $(`#${DETAIL_MODAL_ID}`).modal("show");

        try {
          const response = await VentaService.obtenerVentaPorId(ventaId);

          if (response && response.success && response.data) {
            const venta = response.data;
            const customer = venta.customer_obj || venta.customer || {};

            $("#detail_sale_id").text(venta.id_sale);
            $("#detail_sale_number").text(venta.sale_number || "N/A");
            $("#detail_issue_date").text(
              formatDate(venta.sale_date || venta.created_at),
            );
            $("#detail_notes").text(venta.notes || "Sin observaciones");
            $("#detail_status_badge").html(getStatusBadge(venta.status));

            $("#detail_customer_name").text(
              venta.customer_name ||
                customer.business_name ||
                `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
                "N/A",
            );
            $("#detail_customer_document").text(
              `${customer.document_type || ""} ${venta.customer_document || customer.document_number || ""}`,
            );
            $("#detail_customer_email").text(customer.email || "N/A");
            $("#detail_customer_phone").text(
              customer.mobile || customer.phone || "N/A",
            );

            $("#detail_subtotal").text(formatCurrency(venta.subtotal));
            $("#detail_total").text(formatCurrency(venta.total));

            // Cargar productos
            const tbody = $("#detail_products_body");
            tbody.empty();
            if (venta.details && venta.details.length > 0) {
              venta.details.forEach((item) => {
                const tr = `
                  <tr>
                    <td>${item.product_code || item.code || ""}</td>
                    <td>${item.product_name || item.name || "Producto desconocido"}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.unit_price)}</td>
                    <td>${formatCurrency(item.subtotal)}</td>
                  </tr>
                `;
                tbody.append(tr);
              });
            } else {
              tbody.append(
                '<tr><td colspan="5" class="text-center text-muted">No hay productos en esta venta.</td></tr>',
              );
            }

            // Información de factura
            const invoiceSection = $("#detail_invoice_section");
            invoiceSection.empty();
            if (venta.invoices_summary && venta.invoices_summary.length > 0) {
              const invoice = venta.invoices_summary[0];
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
            injectActionButtons(venta);

            $("#sale_modal_loader").hide();
            $("#sale_modal_content").fadeIn();

            // Re-procesar permisos de los botones inyectados
            SecurityManager.processDomPermissions();
          } else {
            throw new Error("Respuesta inválida al consultar la venta.");
          }
        } catch (error) {
          console.error("[VENTAS] Error al obtener detalles:", error);
          $(`#${DETAIL_MODAL_ID}`).modal("hide");
          NotificationService.toastError(
            "No se pudo cargar la información de la venta.",
          );
        }
      });
  }

  function injectActionButtons(venta) {
    const container = $("#sale_action_buttons");
    container.empty();

    if (venta.status === "PENDING" || venta.status === "DRAFT") {
      container.append(`
        <button type="button" class="btn btn-success btn-sm btn-action-sale font-weight-bold" 
          data-action="complete" data-id="${venta.id_sale}" data-permission="sales.update">
          <i class="fas fa-check-circle mr-1"></i> Completar Venta
        </button>
        <button type="button" class="btn btn-danger btn-sm btn-action-sale font-weight-bold ml-2" 
          data-action="cancel" data-id="${venta.id_sale}" data-permission="sales.update">
          <i class="fas fa-times-circle mr-1"></i> Cancelar
        </button>
      `);
    }
  }

  function setupActionButtonsListener() {
    $(document)
      .off("click", ".btn-action-sale")
      .on("click", ".btn-action-sale", async function () {
        const action = $(this).data("action");
        const ventaId = $(this).data("id");

        const actionMap = {
          complete: {
            verb: "completar",
            method: VentaService.completarVenta,
            color: "success",
          },
          cancel: {
            verb: "cancelar",
            method: VentaService.cancelarVenta,
            color: "danger",
          },
        };

        const config = actionMap[action];
        if (!config) return;

        const result = await NotificationService.warning(
          `¿Deseas ${config.verb} la venta #${ventaId}?`,
          `Confirmar Acción`,
        );

        if (!result.isConfirmed) return;

        try {
          $(this)
            .prop("disabled", true)
            .html('<i class="fas fa-spinner fa-spin mr-1"></i>Procesando...');

          const response = await config.method(ventaId);
          if (response && response.success) {
            NotificationService.toastSuccess(
              `Venta #${ventaId} actualizada correctamente.`,
            );
            $(`#${DETAIL_MODAL_ID}`).modal("hide");
            loadVentas();
          } else {
            throw response;
          }
        } catch (error) {
          console.error(`[VENTAS] Error al ${config.verb}:`, error);
          const errorMsg = NotificationService.getApiErrorMessage(
            error,
            `Ocurrió un error al ${config.verb} la venta.`,
          );
          NotificationService.error(errorMsg);
        } finally {
          $(this).prop("disabled", false);
        }
      });

    $(document)
      .off("click", ".btn-view-invoice")
      .on("click", ".btn-view-invoice", async function (e) {
        e.preventDefault();
        const invoiceId = $(this).data("id");

        if (!invoiceId) return;

        // No ocultamos el modal de detalles de venta para que se superpongan
        $("#factura_modal_loader").show();
        $("#factura_modal_content").hide();
        $("#modalVisualizarFactura").modal("show");

        // Restaurar el scroll al modal principal cuando se cierre el de factura
        $("#modalVisualizarFactura").off('hidden.bs.modal').on('hidden.bs.modal', function () {
            if ($(`#${DETAIL_MODAL_ID}`).is(':visible')) {
                $('body').addClass('modal-open');
            }
        });

        try {
          const response = await VentaService.obtenerFacturaPorId(invoiceId);

          if (response && response.success && response.data) {
            const factura = response.data;

            $("#factura_modal_number").text(factura.invoice_number);
            $("#factura_modal_date").text(
              factura.issue_date ? formatDate(factura.issue_date) : "N/A",
            );
            
            // Format status for invoice
            let statusBadge = "";
            if (factura.status === "DRAFT") statusBadge = '<span class="badge badge-warning px-3 py-2" style="border-radius:20px;font-size:0.75rem">Borrador</span>';
            else if (factura.status === "ISSUED") statusBadge = '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem">Emitida</span>';
            else if (factura.status === "CANCELLED") statusBadge = '<span class="badge badge-danger px-3 py-2" style="border-radius:20px;font-size:0.75rem">Anulada</span>';
            else statusBadge = `<span class="badge badge-secondary px-3 py-2" style="border-radius:20px;font-size:0.75rem">${factura.status}</span>`;

            $("#factura_modal_status").html(statusBadge);
            $("#factura_modal_sale").text(
              factura.sale ? `Venta #${factura.sale}` : "N/A",
            );
            $("#factura_modal_notes").text(
              factura.notes || "Sin observaciones",
            );

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
                customer_name: factura.customer_name || "Consumidor Final",
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
                // Si la plantilla tiene body, usar renderer general. Si solo tiene header/footer, usar parcial
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

            $("#factura_modal_subtotal").text(formatCurrency(factura.subtotal));
            $("#factura_modal_total").text(formatCurrency(factura.total));

            $(".btn-print-invoice-modal").data("id", factura.id);

            $("#factura_modal_loader").hide();
            $("#factura_modal_content").fadeIn();
          } else {
            throw new Error(
              "Respuesta inválida al consultar la factura de venta.",
            );
          }
        } catch (error) {
          console.error("[VENTAS] Error al obtener detalle de factura:", error);
          $("#modalVisualizarFactura").modal("hide");
          NotificationService.toastError(
            "No se pudo cargar el detalle de la factura.",
          );
        }
      });

    $(document)
      .off("click", ".btn-print-invoice, .btn-print-invoice-modal")
      .on(
        "click",
        ".btn-print-invoice, .btn-print-invoice-modal",
        async function (e) {
          e.preventDefault();
          const invoiceId = $(this).data("id");
          if (!invoiceId) return;

          try {
            NotificationService.loading("Generando documento para impresión...");
            const response = await VentaService.obtenerFacturaPorId(invoiceId);
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
                customer_name: factura.customer_name || "Consumidor Final",
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
        },
      );
  }

  // ───────────────────────────────────────────
  // DataTable con paginación server-side
  // ───────────────────────────────────────────

  const COLUMN_ORDERING_MAP = {
    1: "id_sale",
    2: "customer__business_name",
    3: "sale_date",
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

          const response = await VentaService.listarVentasPaginadas({
            page,
            page_size: pageSize,
            search,
            ordering,
          });

          if (response?.success && response.data) {
            const ventas = response.data.results || response.data || [];
            const totalRecords = response.data.count || ventas.length || 0;

            const rows = ventas.map((venta, index) => {
              const customerName = venta.customer_name || "Desconocido";
              const actions = buildActionsHtml(venta);

              return [
                data.start + index + 1,
                `#${venta.id_sale}`,
                customerName,
                formatDate(venta.sale_date || venta.created_at),
                formatCurrency(venta.subtotal),
                formatCurrency(venta.total),
                getStatusBadge(venta.status),
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
            callback({
              draw: data.draw,
              recordsTotal: 0,
              recordsFiltered: 0,
              data: [],
            });
          }
        } catch (error) {
          console.error("[VENTAS] Error server-side:", error);
          callback({
            draw: data.draw,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          });
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

  function buildActionsHtml(venta) {
    const ventaId = venta.id_sale ?? "";

    let cancelBtn = "";
    if (venta.status === "PENDING" || venta.status === "DRAFT") {
      cancelBtn = `
        <button type="button" class="btn btn-outline-danger btn-sm btn-action-sale"
                title="Cancelar venta" data-action="cancel" data-id="${ventaId}" data-permission="sales.update">
          <i class="fas fa-ban"></i>
        </button>
      `;
    }

    return `
      <div class="btn-group">
        <button type="button" class="btn btn-outline-info btn-sm btn-view-sale"
                title="Ver detalles" data-sale-id="${ventaId}" data-permission="sales.view">
          <i class="fas fa-eye"></i>
        </button>
        ${cancelBtn}
      </div>
    `;
  }

  function loadVentas() {
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

export default VentaListController;
