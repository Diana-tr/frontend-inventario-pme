import CajaService from "../../services/caja_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";
import DataTableHelper from "../../utils/DataTableHelper.js";

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
      dom: DataTableHelper.DEFAULT_DOM,
      buttons: DataTableHelper.getExportButtons("cash", [0, 1, 2, 3, 4, 5, 6, 7]),
      language: DataTableHelper.LANGUAGE_ES,
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
             return `<button class="btn btn-sm btn-info btn-view-notes" title="Ver Auditoría Completa de la Sesión"><i class="fas fa-eye mr-1"></i>Detalle</button>`;
          }
        }
      ],
      order: [[2, "desc"]], // Ordenar por fecha de apertura desc
      drawCallback: function () {
        $(".dataTables_paginate > .pagination").addClass("pagination-sm");
      },
    });
  }

  function setupEvents() {
    $("#tbl_Cajas").on("click", ".btn-view-notes", async function() {
       if (!table) return;
       const tr = $(this).closest("tr");
       const rowData = table.row(tr).data();
       if (!rowData) return;

       // Set basic info
       $("#detalle_caja_title").html(`<i class="fas fa-file-invoice-dollar mr-2 text-warning"></i>Detalle Sesión #${rowData.id_cash_session} (${rowData.status === "OPEN" ? "Abierta" : "Cerrada"})`);
       $("#det_caja_nombre").text(rowData.cash_register_name || `Caja #${rowData.cash_register}`);
       $("#det_caja_usuario").text(rowData.user_name || `Usuario #${rowData.user}`);
       $("#det_caja_apertura").text(formatDate(rowData.start_time));
       $("#det_caja_cierre").text(rowData.end_time ? formatDate(rowData.end_time) : "En curso");

       // Set financial metrics
       $("#det_caja_inicial").text(formatCurrency(rowData.opening_balance));
       $("#det_caja_esperado").text(formatCurrency(rowData.expected_balance));
       $("#det_caja_contado").text(rowData.counted_balance !== null && rowData.counted_balance !== undefined ? formatCurrency(rowData.counted_balance) : "Pendiente");

       const diff = parseFloat(rowData.difference || 0);
       const diffBox = $("#det_caja_diff_box");
       const diffSpan = $("#det_caja_diff");
       const diffLabel = $("#det_caja_diff_label");

       if (rowData.status === "OPEN") {
         diffSpan.text("N/A (Abierta)").removeClass("text-danger text-success").addClass("text-muted");
         diffLabel.text("Diferencia").removeClass("text-danger text-success").addClass("text-muted");
         diffBox.css("background-color", "#F8FAFC");
       } else if (diff < 0) {
         diffSpan.text(formatCurrency(diff)).removeClass("text-muted text-success").addClass("text-danger");
         diffLabel.text("Faltante").removeClass("text-muted text-success").addClass("text-danger");
         diffBox.css("background-color", "#FEF2F2");
       } else if (diff > 0) {
         diffSpan.text(`+${formatCurrency(diff)}`).removeClass("text-muted text-danger").addClass("text-success");
         diffLabel.text("Sobrante").removeClass("text-muted text-danger").addClass("text-success");
         diffBox.css("background-color", "#F0FDF4");
       } else {
         diffSpan.text(formatCurrency(0)).removeClass("text-danger text-success").addClass("text-dark");
         diffLabel.text("Cuadre Exacto").removeClass("text-danger text-success").addClass("text-muted");
         diffBox.css("background-color", "#F8FAFC");
       }

       $("#detalle_caja_notas").text(rowData.notes || "Sin observaciones registradas.");

       // Load movements
       const tbody = $("#tbody_det_movimientos");
       const movCount = $("#det_mov_count");
       tbody.html('<tr><td colspan="6" class="text-center text-muted py-3"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando movimientos...</td></tr>');
       movCount.text("Cargando...");

       $("#modalDetalleCaja").modal("show");

       try {
         const resp = await CajaService.listarMovimientos(rowData.id_cash_session);
         const movements = resp.data || [];
         movCount.text(`${movements.length} movimientos`);

         if (movements.length === 0) {
           tbody.html('<tr><td colspan="6" class="text-center text-muted py-3">No hay movimientos registrados en esta sesión.</td></tr>');
           return;
         }

         let html = "";
         movements.forEach((m) => {
           const timeStr = m.created_at ? new Date(m.created_at).toLocaleTimeString("es-CO", { hour: '2-digit', minute: '2-digit' }) : "---";
           const typeBadge = m.movement_type === "IN" 
             ? '<span class="badge badge-success px-2"><i class="fas fa-arrow-down mr-1"></i>Ingreso</span>'
             : '<span class="badge badge-danger px-2"><i class="fas fa-arrow-up mr-1"></i>Egreso</span>';
           const cashBadge = m.is_cash
             ? '<span class="badge badge-light border text-dark font-weight-normal"><i class="fas fa-money-bill-wave text-success mr-1"></i>Efectivo</span>'
             : '<span class="badge badge-light border text-dark font-weight-normal"><i class="fas fa-credit-card text-info mr-1"></i>Electrónico</span>';
           const methodStr = m.payment_method ? `<span class="badge badge-info">${m.payment_method}</span>` : '<span class="text-muted">Manual</span>';
           const amountSign = m.movement_type === "IN" ? "+" : "-";
           const amountColor = m.movement_type === "IN" ? "text-success" : "text-danger";

           html += `
             <tr>
               <td class="font-weight-bold text-muted">${timeStr}</td>
               <td>${typeBadge}</td>
               <td>${m.description || (m.reference ? `Ref: ${m.reference}` : 'Sin descripción')}</td>
               <td>${cashBadge}</td>
               <td>${methodStr}</td>
               <td class="text-right font-weight-bold ${amountColor}">${amountSign}${formatCurrency(m.amount)}</td>
             </tr>
           `;
         });
         tbody.html(html);
       } catch (err) {
         console.error("[CAJA HISTORIAL] Error al cargar movimientos:", err);
         tbody.html('<tr><td colspan="6" class="text-center text-danger py-3"><i class="fas fa-exclamation-triangle mr-2"></i>Error al cargar los movimientos de la sesión.</td></tr>');
         movCount.text("Error");
       }
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
