import CajaService from "../../services/caja_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";

const CajaHistorialController = (() => {
  let table = null;

  function formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  }

  function formatDate(isoString) {
    if (!isoString) return "---";
    const d = new Date(isoString);
    return d.toLocaleString("es-CO");
  }

  function initTable() {
    if (table) {
      table.destroy();
      table = null;
    }

    table = $(`#tbl_Cajas`).DataTable({
      responsive: true,
      lengthChange: true,
      autoWidth: false,
      pageLength: 10,
      processing: true,
      serverSide: false, // Usando client-side temporalmente a menos que se implemente server-side en el backend
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
          exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7] },
        },
        {
          extend: "pdf",
          className: "btn btn-danger btn-sm",
          text: '<i class="fas fa-file-pdf mr-1"></i>PDF',
          exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7] },
        },
        {
          extend: "print",
          className: "btn btn-info btn-sm",
          text: '<i class="fas fa-print mr-1"></i>Imprimir',
          exportOptions: { columns: [0, 1, 2, 3, 4, 5, 6, 7] },
        },
      ],
      language: {
        url: "/frontend-inventario-pme/public/assets/vendor/AdminLTE-3.2.0/plugins/datatables/i18n/es-ES.json",
      },
      ajax: async function (data, callback, settings) {
        try {
          const resp = await CajaService.listarSesiones();
          if (resp && resp.success && resp.data) {
            const results = resp.data.results || resp.data;
            callback({ data: results });
          } else {
            callback({ data: [] });
          }
        } catch (e) {
          console.error("Error cargando historial de cajas", e);
          NotificationService.toastError("Error al cargar historial de cajas");
          callback({ data: [] });
        }
      },
      columns: [
        { data: "cash_register_name", defaultContent: "Principal" },
        { data: "user_name", defaultContent: "---" },
        { 
          data: "start_time", 
          render: (data) => formatDate(data) 
        },
        { 
          data: "end_time", 
          render: (data) => formatDate(data) 
        },
        { 
          data: "expected_balance", 
          render: (data) => formatCurrency(data)
        },
        { 
          data: "counted_balance", 
          render: (data) => formatCurrency(data)
        },
        { 
          data: "difference", 
          render: (data) => {
            const diff = parseFloat(data || 0);
            let cls = "text-dark";
            if (diff < 0) cls = "text-danger";
            if (diff > 0) cls = "text-success";
            return `<span class="font-weight-bold ${cls}">${formatCurrency(diff)}</span>`;
          }
        },
        { 
          data: "status", 
          render: (data) => {
            if (data === "OPEN") {
              return `<span class="badge badge-success">Abierta</span>`;
            }
            return `<span class="badge badge-secondary">Cerrada</span>`;
          }
        },
        {
          data: null,
          className: "text-center",
          orderable: false,
          render: function (data, type, row) {
             return `<button class="btn btn-sm btn-info btn-view-notes" data-notes="${row.notes || ''}" data-diff="${row.difference || 0}" title="Ver Detalles"><i class="fas fa-eye"></i></button>`;
          }
        }
      ],
      order: [[2, "desc"]], // Ordenar por fecha de apertura desc
      drawCallback: function () {
        $(".dataTables_paginate > .pagination").addClass("pagination-sm");
      },
      initComplete: function () {
        $(".dt-buttons").addClass("ml-4");
      },
    });
  }

  function setupEvents() {
    $("#tbl_Cajas").on("click", ".btn-view-notes", function() {
       const notes = $(this).data("notes");
       const diff = parseFloat($(this).data("diff") || 0);
       
       let diffCls = "text-dark";
       if (diff < 0) diffCls = "text-danger";
       if (diff > 0) diffCls = "text-success";

       $("#detalle_caja_notas").text(notes || "Sin observaciones.");
       $("#detalle_caja_diff").html(`<span class="${diffCls}">${formatCurrency(diff)}</span>`);
       
       $("#modalDetalleCaja").modal("show");
    });
  }

  return {
    init: () => {
      if (!SecurityManager.hasPermission("cash.view")) {
        SecurityManager.redirectIfUnauthorized("cash.view");
        return;
      }
      initTable();
      setupEvents();
      SecurityManager.processDomPermissions();
    }
  };
})();

export default CajaHistorialController;
