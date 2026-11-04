/**
 * ============================================================
 * Inventario PME
 * Finance Movements Controller
 * ============================================================
 */

import FinanzasService from "../../services/finanzas_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";
import DataTableHelper from "../../utils/DataTableHelper.js";

const MovimientosController = (() => {
  const TABLE_ID = "tbl_movimientos";
  let dataTable = null;

  function formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount) || 0);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return dateStr;
  }

  function getStatusBadge(status) {
    const map = {
      COMPLETED: '<span class="badge badge-success px-2 py-1">Completado</span>',
      REVERSED: '<span class="badge badge-secondary px-2 py-1">Reversado</span>',
      CANCELLED: '<span class="badge badge-danger px-2 py-1">Cancelado</span>',
    };
    return map[status] || `<span class="badge badge-light px-2 py-1">${status}</span>`;
  }

  function getTypeBadge(type) {
    if (type === "INFLOW") {
      return '<span class="badge badge-success px-2 py-1"><i class="fas fa-arrow-down mr-1"></i>Ingreso</span>';
    }
    return '<span class="badge badge-danger px-2 py-1"><i class="fas fa-arrow-up mr-1"></i>Egreso</span>';
  }

  async function cargarCuentasFiltro() {
    try {
      const res = await FinanzasService.listarCuentas();
      if (res && res.success && res.data) {
        const select = $("#filtro_cuenta");
        select.find("option:not(:first)").remove();
        const accounts = Array.isArray(res.data) ? res.data : (res.data.results || []);
        accounts.forEach((acc) => {
          select.append(`<option value="${acc.id_financial_account}">${acc.name}</option>`);
        });
      }
    } catch (err) {
      console.error("[MOVIMIENTOS] Error al cargar cuentas filtro:", err);
    }
  }

  async function cargarMovimientos() {
    const params = {};
    const cuenta = $("#filtro_cuenta").val();
    const tipo = $("#filtro_tipo").val();
    const inicio = $("#filtro_fecha_inicio").val();
    const fin = $("#filtro_fecha_fin").val();

    if (cuenta) params.account_id = cuenta;
    if (tipo) params.movement_type = tipo;
    if (inicio) params.start_date = inicio;
    if (fin) params.end_date = fin;

    try {
      const res = await FinanzasService.listarMovimientos(params);
      const movimientos = res && res.data ? (Array.isArray(res.data) ? res.data : res.data.results || []) : [];

      renderTabla(movimientos);
    } catch (err) {
      console.error("[MOVIMIENTOS] Error:", err);
      NotificationService.error("No se pudieron cargar los movimientos de tesorería.");
    }
  }

  function renderTabla(data) {
    if (dataTable) {
      dataTable.destroy();
    }

    const tbody = $("#tbody_movimientos");
    tbody.empty();

    data.forEach((mov) => {
      const isCompleted = mov.status === "COMPLETED";
      const canReverse = SecurityManager.hasPermission("finance.update") && isCompleted;

      const actionBtn = canReverse
        ? `<button type="button" class="btn btn-outline-danger btn-xs font-weight-bold btn-reversar" data-id="${mov.id_financial_movement}" title="Reversar Movimiento">
            <i class="fas fa-undo mr-1"></i> Reversar
           </button>`
        : '<span class="text-muted small">Sin acciones</span>';

      const amountFormatted =
        mov.movement_type === "INFLOW"
          ? `<span class="text-success font-weight-bold">+${formatCurrency(mov.amount)}</span>`
          : `<span class="text-danger font-weight-bold">-${formatCurrency(mov.amount)}</span>`;

      tbody.append(`
        <tr>
          <td>${formatDate(mov.movement_date)}</td>
          <td class="font-weight-bold">${mov.account_name || "Cuenta #" + mov.account}</td>
          <td>${getTypeBadge(mov.movement_type)}</td>
          <td><span class="badge badge-light border">${mov.category_name || "General"}</span></td>
          <td>
            <div class="font-weight-bold">${mov.description}</div>
            ${mov.reference ? `<small class="text-muted"><i class="fas fa-barcode mr-1"></i>${mov.reference}</small>` : ""}
          </td>
          <td><small class="text-uppercase">${mov.payment_method || "N/A"}</small></td>
          <td class="text-right">${amountFormatted}</td>
          <td>${getStatusBadge(mov.status)}</td>
          <td class="text-center">${actionBtn}</td>
        </tr>
      `);
    });

    dataTable = $(`#${TABLE_ID}`).DataTable({
      dom: DataTableHelper.DEFAULT_DOM,
      language: DataTableHelper.LANGUAGE_ES,
      pageLength: 15,
      order: [[0, "desc"]],
      buttons: DataTableHelper.getExportButtons("finance", [0, 1, 2, 3, 4, 5, 6, 7]),
    });
  }

  function setupEventListeners() {
    $("#btn_aplicar_filtros").on("click", () => cargarMovimientos());

    $("#btn_limpiar_filtros").on("click", () => {
      $("#filtro_cuenta").val("");
      $("#filtro_tipo").val("");
      $("#filtro_fecha_inicio").val("");
      $("#filtro_fecha_fin").val("");
      cargarMovimientos();
    });

    $("#btn_nuevo_movimiento").on("click", () => {
      window.location.href = `${window.location.origin}/frontend-inventario-pme/finanzas`;
    });

    // Abrir modal de reverso
    $(document).on("click", ".btn-reversar", function () {
      const movId = $(this).data("id");
      $("#rev_movimiento_id").val(movId);
      $("#rev_motivo").val("");
      $("#modalReversarMovimiento").modal("show");
    });

    // Confirmar reverso
    $("#formReversarMovimiento").on("submit", async function (e) {
      e.preventDefault();
      const movId = $("#rev_movimiento_id").val();
      const motivo = $("#rev_motivo").val().trim();

      if (!motivo) {
        NotificationService.warning("Por favor ingrese una justificación para el reverso.");
        return;
      }

      $("#btn_confirmar_reverso").prop("disabled", true).text("Reversando...");

      try {
        await FinanzasService.reversarMovimiento(movId, motivo);
        NotificationService.success("Movimiento reversado y contra-asiento generado correctamente.");
        $("#modalReversarMovimiento").modal("hide");
        cargarMovimientos();
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "No fue posible reversar el movimiento.";
        NotificationService.error(msg);
      } finally {
        $("#btn_confirmar_reverso").prop("disabled", false).text("Confirmar Reverso");
      }
    });
  }

  return {
    init: () => {
      if (!SecurityManager.hasPermission("finance.view")) {
        SecurityManager.redirectIfUnauthorized("finance.view");
        return;
      }
      setupEventListeners();
      cargarCuentasFiltro();
      cargarMovimientos();
    },
  };
})();

export default MovimientosController;

