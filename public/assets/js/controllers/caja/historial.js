/**
 * ============================================================
 * Inventario PME
 * Cash History Controller (Historial de Cajas)
 * ============================================================
 *
 * Controlador de historial de sesiones de caja con paginación
 * server-side, siguiendo el patrón estándar de DataTables
 * del proyecto (VentaListController, CompraListController).
 */

import CajaService from "../../services/caja_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";
import DataTableHelper from "../../utils/DataTableHelper.js";

const CajaHistorialController = (() => {
  const TABLE_ID = "tbl_Cajas";
  const TABLE_BODY_ID = "tablaCajasBody";

  let dataTableInstance = null;

  // ───────────────────────────────────────────
  // Utilidades de formato
  // ───────────────────────────────────────────

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

  function getStatusBadge(status) {
    if (status === "OPEN") {
      return '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem"><i class="fas fa-door-open mr-1"></i>Abierta</span>';
    }
    return '<span class="badge badge-secondary px-3 py-2" style="border-radius:20px;font-size:0.75rem"><i class="fas fa-door-closed mr-1"></i>Cerrada</span>';
  }

  function getDifferenceBadge(diff) {
    const value = parseFloat(diff || 0);
    if (value < 0) {
      return `<span class="font-weight-bold text-danger">${formatCurrency(value)}</span>`;
    }
    if (value > 0) {
      return `<span class="font-weight-bold text-success">+${formatCurrency(value)}</span>`;
    }
    return `<span class="font-weight-bold text-dark">${formatCurrency(0)}</span>`;
  }

  // ───────────────────────────────────────────
  // Mapa de columnas para ordenamiento server-side
  // ───────────────────────────────────────────

  const COLUMN_ORDERING_MAP = {
    1: "cash_register__name",
    2: "user__username",
    3: "start_time",
    4: "end_time",
    5: "expected_balance",
    6: "counted_balance",
    7: "difference",
    8: "status",
  };

  // ───────────────────────────────────────────
  // DataTable con paginación server-side
  // ───────────────────────────────────────────

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
      dom: DataTableHelper.DEFAULT_DOM,
      buttons: DataTableHelper.getExportButtons("cash", [1, 2, 3, 4, 5, 6, 7, 8]),
      language: DataTableHelper.LANGUAGE_ES,
      columnDefs: [
        { orderable: false, targets: [0, 9] },
        { className: "text-center", targets: [0, 8, 9] },
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

          const response = await CajaService.listarSesiones({
            page,
            page_size: pageSize,
            search,
            ordering,
          });

          if (response?.success && response.data) {
            const sesiones = response.data.results || response.data || [];
            const totalRecords = response.data.count || sesiones.length || 0;

            const rows = sesiones.map((sesion, index) => {
              const actions = buildActionsHtml(sesion);

              return [
                data.start + index + 1,
                sesion.cash_register_name || "Principal",
                sesion.user_name || "---",
                formatDate(sesion.start_time),
                formatDate(sesion.end_time),
                formatCurrency(sesion.expected_balance),
                formatCurrency(sesion.counted_balance),
                getDifferenceBadge(sesion.difference),
                getStatusBadge(sesion.status),
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
          console.error("[CAJA HISTORIAL] Error server-side:", error);
          NotificationService.toastError("Error al cargar historial de cajas");
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
    });
  }

  function buildActionsHtml(sesion) {
    return `
      <div class="btn-group">
        <button type="button" class="btn btn-outline-info btn-sm btn-view-notes"
                title="Ver Auditoría Completa de la Sesión" data-session-id="${sesion.id_cash_session}" data-permission="cash.view">
          <i class="fas fa-eye mr-1"></i>Detalle
        </button>
      </div>
    `;
  }

  function reloadTable() {
    if (dataTableInstance) {
      dataTableInstance.ajax.reload(null, false);
    }
  }

  // ───────────────────────────────────────────
  // Modal de Detalle de Sesión
  // ───────────────────────────────────────────

  function setupEvents() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-view-notes")
      .on("click", ".btn-view-notes", async function() {
        const sessionId = $(this).data("sessionId");
        if (!sessionId) return;

        // Obtener datos de la sesión desde el backend
        try {
          NotificationService.loading("Cargando detalles de la sesión...");

          const resp = await CajaService.listarSesiones({ page: 1, page_size: 100 });
          NotificationService.close();

          let rowData = null;
          if (resp?.success && resp.data) {
            const results = resp.data.results || resp.data || [];
            rowData = results.find(s => s.id_cash_session === sessionId || s.id_cash_session == sessionId);
          }

          if (!rowData) {
            NotificationService.toastError("No se encontró la información de la sesión.");
            return;
          }

          populateDetailModal(rowData);
        } catch (err) {
          NotificationService.close();
          console.error("[CAJA HISTORIAL] Error cargando detalle:", err);
          NotificationService.toastError("Error al cargar los detalles de la sesión.");
        }
      });
  }

  async function populateDetailModal(rowData) {
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

    // Cargar resumen de auditoría detallado (ventas, compras, gastos, denominaciones)
    try {
      const auditResp = await CajaService.obtenerResumenAuditoria(rowData.id_cash_session);
      if (auditResp && auditResp.success && auditResp.data) {
        const ad = auditResp.data;
        $("#det_sales_cash").text(formatCurrency(ad.sales_cash));
        $("#det_sales_elec").text(formatCurrency(ad.sales_electronic));
        $("#det_purchases_paid").text(formatCurrency(ad.total_purchases_paid));
        $("#det_expenses_manual").text(formatCurrency(ad.manual_expenses));

        const denomBox = $("#det_denominations_box");
        const denomBadges = $("#det_denominations_badges");
        denomBadges.empty();

        if (ad.denominations && Object.keys(ad.denominations).length > 0) {
          denomBox.removeClass("d-none");
          Object.entries(ad.denominations).forEach(([val, qty]) => {
            const sub = parseFloat(val) * qty;
            denomBadges.append(`
              <span class="badge badge-light border p-2 mr-2 mb-1" style="font-size: 0.8rem;">
                <strong>$` + parseInt(val).toLocaleString("es-CO") + `</strong> &times; ` + qty + ` = <span class="text-primary font-weight-bold">` + formatCurrency(sub) + `</span>
              </span>
            `);
          });
        } else {
          denomBox.addClass("d-none");
        }
      }
    } catch (auditErr) {
      console.warn("No se pudo cargar el resumen de auditoría extendido:", auditErr);
      $("#det_denominations_box").addClass("d-none");
    }

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
  }

  // ───────────────────────────────────────────
  // Inicialización
  // ───────────────────────────────────────────

  return {
    init: () => {
      if (!SecurityManager.hasPermission("cash.view")) {
        SecurityManager.redirectIfUnauthorized("cash.view");
        return;
      }
      initDataTable();
      setupEvents();
      SecurityManager.processDomPermissions();
    }
  };
})();

export default CajaHistorialController;
