/**
 * ============================================================
 * Inventario PME
 * Finance Reconciliations Controller
 * ============================================================
 */

import FinanzasService from "../../services/finanzas_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";
import DataTableHelper from "../../utils/DataTableHelper.js";

const ConciliacionesController = (() => {
  const TABLE_ID = "tbl_conciliaciones";
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
    if (status === "RECONCILED") {
      return '<span class="badge badge-success px-2 py-1"><i class="fas fa-check-circle mr-1"></i>Conciliada</span>';
    }
    return '<span class="badge badge-warning px-2 py-1"><i class="fas fa-clock mr-1"></i>En Proceso</span>';
  }

  async function cargarCuentasParaModal() {
    try {
      const res = await FinanzasService.listarCuentas();
      if (res && res.success && res.data) {
        const select = $("#modal_recon_cuenta");
        select.empty().append('<option value="" disabled selected>Seleccione cuenta</option>');

        const accounts = Array.isArray(res.data) ? res.data : (res.data.results || []);
        accounts.forEach((acc) => {
          select.append(`<option value="${acc.id_financial_account}">${acc.name} (${acc.bank_name || "Caja"}) - Saldo actual: ${formatCurrency(acc.current_balance)}</option>`);
        });
      }
    } catch (err) {
      console.error("[CONCILIACIONES] Error al cargar cuentas:", err);
    }
  }

  async function cargarConciliaciones() {
    try {
      const res = await FinanzasService.listarConciliaciones();
      const conciliaciones = res && res.data ? (Array.isArray(res.data) ? res.data : res.data.results || []) : [];
      renderTabla(conciliaciones);
    } catch (err) {
      console.error("[CONCILIACIONES] Error:", err);
      NotificationService.error("No se pudieron cargar las conciliaciones.");
    }
  }

  function renderTabla(data) {
    if (dataTable) {
      dataTable.destroy();
    }

    const tbody = $("#tbody_conciliaciones");
    tbody.empty();

    data.forEach((rec) => {
      const isDraft = rec.status === "DRAFT";
      const canClose = SecurityManager.hasPermission("finance.reconcile") && isDraft;

      const diff = parseFloat(rec.difference) || 0;
      let diffHtml = "";
      if (Math.abs(diff) < 0.01) {
        diffHtml = '<span class="badge badge-light text-success font-weight-bold"><i class="fas fa-check mr-1"></i>Exacto</span>';
      } else if (diff > 0) {
        diffHtml = `<span class="text-success font-weight-bold">+${formatCurrency(diff)}</span>`;
      } else {
        diffHtml = `<span class="text-danger font-weight-bold">${formatCurrency(diff)}</span>`;
      }

      const actionBtn = canClose
        ? `<button type="button" class="btn btn-outline-success btn-xs font-weight-bold btn-cerrar-recon" data-id="${rec.id_reconciliation}" title="Aprobar y Cerrar Conciliación">
            <i class="fas fa-check mr-1"></i> Aprobar Cierre
           </button>`
        : '<span class="text-muted small">Cerrada</span>';

      tbody.append(`
        <tr>
          <td class="font-weight-bold text-dark">${rec.account_name || "Cuenta #" + rec.account}</td>
          <td>${formatDate(rec.start_date)}</td>
          <td>${formatDate(rec.end_date)}</td>
          <td class="text-right text-muted">${formatCurrency(rec.book_balance)}</td>
          <td class="text-right font-weight-bold text-primary">${formatCurrency(rec.statement_balance)}</td>
          <td class="text-right">${diffHtml}</td>
          <td>${getStatusBadge(rec.status)}</td>
          <td><small class="text-muted">${rec.reconciled_at ? formatDate(rec.reconciled_at.split("T")[0]) : "Pendiente"}</small></td>
          <td class="text-center">${actionBtn}</td>
        </tr>
      `);
    });

    dataTable = $(`#${TABLE_ID}`).DataTable({
      dom: DataTableHelper.DEFAULT_DOM,
      language: DataTableHelper.LANGUAGE_ES,
      pageLength: 15,
      order: [[2, "desc"]],
      buttons: DataTableHelper.getExportButtons("finance", [0, 1, 2, 3, 4, 5, 6, 7]),
    });
  }

  function setupEventListeners() {
    $("#btn_abrir_modal_conciliacion").on("click", () => {
      if (!SecurityManager.hasPermission("finance.reconcile")) {
        NotificationService.warning("No tiene permisos para iniciar conciliaciones.");
        return;
      }
      $("#formNuevaConciliacion")[0].reset();

      // Fechas por defecto: primer día del mes actual y fecha actual
      const now = new Date();
      const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      $("#modal_recon_inicio").val(primerDiaMes);
      $("#modal_recon_fin").val(now.toISOString().split("T")[0]);

      cargarCuentasParaModal();
      $("#modalNuevaConciliacion").modal("show");
    });

    // Enviar conciliación
    $("#formNuevaConciliacion").on("submit", async function (e) {
      e.preventDefault();
      const payload = {
        account_id: parseInt($("#modal_recon_cuenta").val()),
        start_date: $("#modal_recon_inicio").val(),
        end_date: $("#modal_recon_fin").val(),
        statement_balance: $("#modal_recon_extracto").val(),
        notes: $("#modal_recon_notas").val().trim(),
      };

      if (payload.start_date > payload.end_date) {
        NotificationService.warning("La fecha de inicio no puede ser posterior a la fecha de corte.");
        return;
      }

      $("#btn_submit_conciliacion").prop("disabled", true).text("Registrando...");

      try {
        await FinanzasService.iniciarConciliacion(payload);
        NotificationService.success("Proceso de conciliación registrado con éxito.");
        $("#modalNuevaConciliacion").modal("hide");
        cargarConciliaciones();
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Error al iniciar conciliación.";
        NotificationService.error(msg);
      } finally {
        $("#btn_submit_conciliacion").prop("disabled", false).text("Registrar Conciliación");
      }
    });

    // Aprobar y Cerrar Conciliación
    $(document).on("click", ".btn-cerrar-recon", async function () {
      const reconId = $(this).data("id");

      const confirm = await NotificationService.confirm(
        "¿Está seguro de cerrar y aprobar esta conciliación? El saldo en libros se cotejará definitivamente con el extracto bancario.",
        "Aprobar Conciliación"
      );

      if (confirm.isConfirmed) {
        try {
          await FinanzasService.cerrarConciliacion(reconId);
          NotificationService.success("Conciliación aprobada y cerrada satisfactoriamente.");
          cargarConciliaciones();
        } catch (err) {
          console.error(err);
          const msg = err.response?.data?.message || "No se pudo cerrar la conciliación.";
          NotificationService.error(msg);
        }
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
      cargarConciliaciones();
    },
  };
})();

export default ConciliacionesController;

