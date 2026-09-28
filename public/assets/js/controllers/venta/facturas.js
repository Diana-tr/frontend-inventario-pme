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
import { viewInvoice, printInvoice } from "../../utils/InvoiceActions.js";

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

        await viewInvoice(invoiceId, {
          fetchFn: VentaService.obtenerFacturaPorId,
          modalId: DETAIL_MODAL_ID
        });
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

          await printInvoice(invoiceId, {
            fetchFn: VentaService.obtenerFacturaPorId,
            $btn: $(this)
          });
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
