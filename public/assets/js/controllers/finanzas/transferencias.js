/**
 * ============================================================
 * Inventario PME
 * Finance Transfers Controller
 * ============================================================
 */

import FinanzasService from "../../services/finanzas_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";
import DataTableHelper from "../../utils/DataTableHelper.js";

const TransferenciasController = (() => {
  const TABLE_ID = "tbl_transferencias";
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
    if (status === "COMPLETED") {
      return '<span class="badge badge-success px-2 py-1">Completada</span>';
    }
    return '<span class="badge badge-secondary px-2 py-1">Cancelada</span>';
  }

  async function cargarCuentasParaModal() {
    try {
      const res = await FinanzasService.listarCuentas();
      if (res && res.success && res.data) {
        const origen = $("#modal_transf_origen");
        const destino = $("#modal_transf_destino");
        origen.empty().append('<option value="" disabled selected>Seleccione cuenta origen</option>');
        destino.empty().append('<option value="" disabled selected>Seleccione cuenta destino</option>');

        const accounts = Array.isArray(res.data) ? res.data : (res.data.results || []);
        accounts.forEach((acc) => {
          const opt = `<option value="${acc.id_financial_account}">${acc.name} (Saldo: ${formatCurrency(acc.current_balance)})</option>`;
          origen.append(opt);
          destino.append(opt);
        });
      }
    } catch (err) {
      console.error("[TRANSFERENCIAS] Error al cargar cuentas:", err);
    }
  }

  async function cargarTransferencias() {
    try {
      const res = await FinanzasService.listarTransferencias();
      const transferencias = res && res.data ? (Array.isArray(res.data) ? res.data : res.data.results || []) : [];
      renderTabla(transferencias);
    } catch (err) {
      console.error("[TRANSFERENCIAS] Error:", err);
      NotificationService.error("No fue posible cargar las transferencias.");
    }
  }

  function renderTabla(data) {
    if (dataTable) {
      dataTable.destroy();
    }

    const tbody = $("#tbody_transferencias");
    tbody.empty();

    data.forEach((trf) => {
      const isCompleted = trf.status === "COMPLETED";
      const canCancel = SecurityManager.hasPermission("finance.transfer") && isCompleted;

      const actionBtn = canCancel
        ? `<button type="button" class="btn btn-outline-danger btn-xs font-weight-bold btn-cancelar-transf" data-id="${trf.id_financial_transfer}" title="Cancelar Transferencia">
            <i class="fas fa-ban mr-1"></i> Cancelar
           </button>`
        : '<span class="text-muted small">Sin acciones</span>';

      tbody.append(`
        <tr>
          <td>${formatDate(trf.transfer_date)}</td>
          <td class="font-weight-bold text-danger"><i class="fas fa-arrow-up mr-1"></i>${trf.source_account_name || "Cuenta #" + trf.source_account}</td>
          <td class="font-weight-bold text-success"><i class="fas fa-arrow-down mr-1"></i>${trf.destination_account_name || "Cuenta #" + trf.destination_account}</td>
          <td class="text-right font-weight-bold text-dark">${formatCurrency(trf.amount)}</td>
          <td><small class="text-muted">${trf.reference || "N/A"}</small></td>
          <td><small>${trf.user_name || "Sistema"}</small></td>
          <td>${getStatusBadge(trf.status)}</td>
          <td class="text-center">${actionBtn}</td>
        </tr>
      `);
    });

    dataTable = $(`#${TABLE_ID}`).DataTable({
      dom: DataTableHelper.DEFAULT_DOM,
      language: DataTableHelper.LANGUAGE_ES,
      pageLength: 15,
      order: [[0, "desc"]],
      buttons: DataTableHelper.getExportButtons("finance", [0, 1, 2, 3, 4, 5, 6]),
    });
  }

  function setupEventListeners() {
    $("#btn_abrir_modal_transferencia").on("click", () => {
      if (!SecurityManager.hasPermission("finance.transfer")) {
        NotificationService.warning("No tiene permisos para realizar transferencias.");
        return;
      }
      $("#formNuevaTransferencia")[0].reset();
      $("#modal_transf_fecha").val(new Date().toISOString().split("T")[0]);
      cargarCuentasParaModal();
      $("#modalNuevaTransferencia").modal("show");
    });

    // Enviar formulario de transferencia
    $("#formNuevaTransferencia").on("submit", async function (e) {
      e.preventDefault();
      const sourceId = parseInt($("#modal_transf_origen").val());
      const destId = parseInt($("#modal_transf_destino").val());

      if (sourceId === destId) {
        NotificationService.warning("La cuenta origen y la cuenta destino deben ser diferentes.");
        return;
      }

      const payload = {
        source_account_id: sourceId,
        destination_account_id: destId,
        amount: $("#modal_transf_monto").val(),
        transfer_date: $("#modal_transf_fecha").val(),
        reference: $("#modal_transf_referencia").val().trim(),
        notes: $("#modal_transf_notas").val().trim(),
      };

      $("#btn_submit_transferencia").prop("disabled", true).text("Transfiriendo...");

      try {
        await FinanzasService.ejecutarTransferencia(payload);
        NotificationService.success("Transferencia ejecutada exitosamente.");
        $("#modalNuevaTransferencia").modal("hide");
        cargarTransferencias();
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Error al procesar la transferencia.";
        NotificationService.error(msg);
      } finally {
        $("#btn_submit_transferencia").prop("disabled", false).text("Transferir Fondos");
      }
    });

    // Cancelar transferencia
    $(document).on("click", ".btn-cancelar-transf", async function () {
      const trfId = $(this).data("id");

      const { value: reason } = await Swal.fire({
        title: "Cancelar Transferencia",
        text: "Esta operación restaurará los fondos en la cuenta de origen. Ingrese el motivo de la cancelación:",
        input: "textarea",
        inputPlaceholder: "Motivo de la cancelación...",
        showCancelButton: true,
        confirmButtonColor: "#EF4444",
        confirmButtonText: "Confirmar Cancelación",
        cancelButtonText: "Regresar",
        inputValidator: (val) => {
          if (!val || !val.trim()) {
            return "Debe ingresar una justificación obligatoria.";
          }
        },
      });

      if (reason) {
        try {
          await FinanzasService.cancelarTransferencia(trfId, reason.trim());
          NotificationService.success("Transferencia cancelada y saldos restaurados satisfactoriamente.");
          cargarTransferencias();
        } catch (err) {
          console.error(err);
          const msg = err.response?.data?.message || "No se pudo cancelar la transferencia.";
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
      cargarTransferencias();
    },
  };
})();

export default TransferenciasController;

