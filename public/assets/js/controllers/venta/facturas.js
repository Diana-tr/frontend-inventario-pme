/**
 * ============================================================
 * Inventario PME
 * Sale Invoice List Controller (Facturas de Ventas)
 * ============================================================
 */

import VentaService from "../../services/venta_service.js";
import SecurityManager from "../../core/security.js";
import NotificationService from "../../core/notification.js";
import DocumentTemplateRenderer from "../../utils/DocumentTemplateRenderer.js";
import { formatCurrency, renderInvoiceItems } from "../../utils/invoice_utils.js";

const FacturaVentaController = (() => {
  const TABLE_BODY_ID = "tablaFacturasVentasBody";
  const TABLE_ID = "tbl_FacturasVentas";
  const DETAIL_MODAL_ID = "modalVisualizarFacturaVenta";

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
        '<span class="badge badge-warning px-3 py-2" style="border-radius:20px;font-size:0.75rem">Borrador</span>',
      ISSUED:
        '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem">Emitida</span>',
      CANCELLED:
        '<span class="badge badge-danger px-3 py-2" style="border-radius:20px;font-size:0.75rem">Anulada</span>',
    };
    return (
      badges[status] ||
      `<span class="badge badge-secondary px-3 py-2" style="border-radius:20px;font-size:0.75rem">${status}</span>`
    );
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Detalles de Factura
  // ───────────────────────────────────────────

  function setupViewDetailsListener() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-view-invoice")
      .on("click", ".btn-view-invoice", async function (e) {
        e.preventDefault();
        const invoiceId = $(this).data("id");

        if (!invoiceId) return;

        $("#factura_modal_loader").show();
        $("#factura_modal_content").hide();
        $(`#${DETAIL_MODAL_ID}`).modal("show");

        try {
          const response = await VentaService.obtenerFacturaPorId(invoiceId);

          if (response && response.success && response.data) {
            const factura = response.data;

            $("#factura_modal_number").text(factura.invoice_number);
            $("#factura_modal_date").text(
              factura.issue_date ? formatDate(factura.issue_date) : "N/A",
            );
            $("#factura_modal_status").html(getStatusBadge(factura.status));
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
                // Si la plantilla tiene body, usar renderer general. Si solo tiene header/footer, usar parcial para retrocompatibilidad
                if (factura.template.body_content) {
                   $("#factura_modal_header_template").empty();
                   $("#factura_modal_footer_template").empty();
                   // Inject rendering inside a container, overriding default table
                   $("#factura_modal_items").closest('table').parent().html(renderer.render());
                } else {
                   $("#factura_modal_header_template").html(renderer._parseTemplate(factura.template.header_content || ""));
                   $("#factura_modal_footer_template").html(renderer._parseTemplate(factura.template.footer_content || ""));
                   
                   // Cargar ítems legacy style usando la utilidad compartida
                   renderInvoiceItems(factura.items, "#factura_modal_items");
                }
              }
            } else {
               console.warn("DocumentTemplateRenderer not found. Plantilla no será renderizada.");
            }

            $(".btn-print-invoice-modal").data("id", factura.id);

            $("#factura_modal_loader").hide();
            $("#factura_modal_content").fadeIn();
          } else {
            throw new Error(
              "Respuesta inválida al consultar la factura de venta.",
            );
          }
        } catch (error) {
          console.error("[FACTURAS VENTAS] Error al obtener detalles:", error);
          $(`#${DETAIL_MODAL_ID}`).modal("hide");
          NotificationService.toastError(
            "No se pudo cargar el detalle de la factura.",
          );
        }
      });
  }

  function setupActionButtonsListener() {
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
    1: "sale",
    2: "issue_date",
    3: "subtotal",
    4: "total",
    5: "status",
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
          exportOptions: { columns: [0, 1, 2, 3, 4, 5] },
        },
        {
          extend: "pdf",
          className: "btn btn-danger btn-sm",
          text: '<i class="fas fa-file-pdf mr-1"></i>PDF',
          exportOptions: { columns: [0, 1, 2, 3, 4, 5] },
        },
        {
          extend: "print",
          className: "btn btn-info btn-sm",
          text: '<i class="fas fa-print mr-1"></i>Imprimir',
          exportOptions: { columns: [0, 1, 2, 3, 4, 5] },
        },
      ],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
      },
      columnDefs: [
        { orderable: false, targets: [6] },
        { className: "text-center", targets: [5, 6] },
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

          const response = await VentaService.listarFacturasPaginadas({
            page,
            page_size: pageSize,
            search,
            ordering,
            document_type: "SALE_INVOICE",
          });

          if (response?.success && response.data) {
            const facturas = response.data.results || [];
            const totalRecords = response.data.count || 0;

            const rows = facturas.map((factura) => {
              const actions = buildActionsHtml(factura);

              return [
                `<strong>${factura.invoice_number}</strong>`,
                factura.sale
                  ? `Venta #${factura.sale}`
                  : `<span class="text-muted">N/A</span>`,
                factura.issue_date ? formatDate(factura.issue_date) : "---",
                formatCurrency(factura.subtotal),
                `<strong>${formatCurrency(factura.total)}</strong>`,
                getStatusBadge(factura.status),
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
          console.error("[FACTURAS VENTAS] Error server-side:", error);
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

  function buildActionsHtml(factura) {
    const facturaId = factura.id ?? "";

    return `
      <div class="btn-group btn-group-sm">
        <button type="button" class="btn btn-info btn-view-invoice" data-id="${facturaId}" title="Ver Factura">
            <i class="fas fa-eye"></i>
        </button>
        <button type="button" class="btn btn-secondary btn-print-invoice" data-id="${facturaId}" title="Imprimir Factura">
            <i class="fas fa-print"></i>
        </button>
      </div>
    `;
  }

  function loadFacturas() {
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

export default FacturaVentaController;
