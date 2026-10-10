import CajaService from "../../services/caja_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";

const CajaIndexController = (() => {
  let currentSessionId = null;
  let currentExpectedBalance = 0;

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

  async function checkCurrentSession() {
    $("#caja_loader").show();
    $("#caja_cerrada_view").hide();
    $("#caja_abierta_view").hide();

    try {
      const response = await CajaService.obtenerSesionActual();
      if (response && response.success && response.data) {
        renderAbierta(response.data);
      } else {
        // If not successful, usually means 404 NO_OPEN_SESSION
        if (response && response.status === 404) {
          renderCerrada();
        } else {
          NotificationService.toastError("Error al verificar estado de caja.");
        }
      }
    } catch (error) {
      console.error(error);
      NotificationService.toastError("Error al verificar estado de caja.");
    } finally {
      $("#caja_loader").hide();
    }
  }

  function renderCerrada() {
    $("#caja_cerrada_view").show();
    cargarCajasRegistradoras();
  }

  function renderAbierta(session) {
    currentSessionId = session.id_cash_session;
    currentExpectedBalance = parseFloat(session.expected_balance || 0);

    $("#current_cash_register").text(session.cash_register_name || "Principal");
    $("#current_user").text(session.user_name || "Usuario Actual");
    $("#current_start_time").text(formatDate(session.start_time));
    $("#current_opening_balance").text(formatCurrency(session.opening_balance));
    $("#current_expected_balance").text(formatCurrency(session.expected_balance));
    
    // Preparar modal de cierre
    $("#close_expected_balance").text(formatCurrency(session.expected_balance));

    $("#caja_abierta_view").show();
    cargarMovimientos(currentSessionId);
  }

  async function cargarCajasRegistradoras() {
    try {
      const resp = await CajaService.listarCajasRegistradoras();
      const select = $("#cash_register_id");
      select.empty().append('<option value="">Seleccione una caja...</option>');
      
      if (resp && resp.success && resp.data) {
        const results = resp.data.results || resp.data;
        results.forEach(reg => {
          if (reg.is_active) {
            select.append(new Option(reg.name, reg.id_cash_register));
          }
        });
      }
    } catch (e) {
      console.warn("No se pudieron cargar las cajas registradoras", e);
    }
  }

  async function cargarMovimientos(sessionId) {
    const tbody = $("#tabla_movimientos tbody");
    tbody.html('<tr><td colspan="5" class="text-center">Cargando movimientos...</td></tr>');
    
    try {
      const resp = await CajaService.listarMovimientos(sessionId);
      tbody.empty();
      
      if (resp && resp.success && resp.data) {
        const movs = resp.data;
        if (movs.length === 0) {
          tbody.html('<tr><td colspan="5" class="text-center text-muted">No hay movimientos en esta sesión.</td></tr>');
          return;
        }

        movs.forEach(m => {
          const isOut = m.movement_type === "OUT";
          const colorClass = isOut ? "text-danger" : "text-success";
          const sign = isOut ? "-" : "+";
          const typeLabel = isOut ? "Retiro" : "Ingreso";
          
          tbody.append(`
            <tr>
              <td>${formatDate(m.created_at)}</td>
              <td><span class="badge ${isOut ? 'badge-danger' : 'badge-success'}">${typeLabel}</span></td>
              <td>${m.description || "---"}</td>
              <td>${m.payment_method || "Efectivo"}</td>
              <td class="text-right font-weight-bold ${colorClass}">${sign}${formatCurrency(m.amount)}</td>
            </tr>
          `);
        });
      }
    } catch (e) {
      console.error(e);
      tbody.html('<tr><td colspan="5" class="text-center text-danger">Error al cargar movimientos.</td></tr>');
    }
  }

  function setupEvents() {
    // Abrir Caja
    $("#form_abrir_caja").on("submit", async function (e) {
      e.preventDefault();
      const data = {
        cash_register_id: $("#cash_register_id").val(),
        opening_balance: $("#opening_balance").val(),
        notes: $("#opening_notes").val()
      };

      try {
        NotificationService.loading("Abriendo caja...");
        const resp = await CajaService.abrirCaja(data);
        NotificationService.close();
        if (resp && resp.success) {
          NotificationService.toastSuccess("Caja abierta correctamente.");
          checkCurrentSession();
        }
      } catch (err) {
        NotificationService.close();
        NotificationService.toastError(err.response?.data?.errors?.[0]?.message || "Error al abrir la caja");
      }
    });

    // Modal Movimiento
    $("#btn_modal_movimiento").on("click", function () {
      $("#form_movimiento_caja")[0].reset();
      $("#modalMovimientoCaja").modal("show");
    });

    $("#form_movimiento_caja").on("submit", async function (e) {
      e.preventDefault();
      if (!currentSessionId) return;

      const data = {
        movement_type: $("#mov_type").val(),
        amount: $("#mov_amount").val(),
        description: $("#mov_description").val(),
        is_cash: true
      };

      try {
        NotificationService.loading("Registrando movimiento...");
        const resp = await CajaService.agregarMovimiento(currentSessionId, data);
        NotificationService.close();
        if (resp && resp.success) {
          NotificationService.toastSuccess("Movimiento registrado.");
          $("#modalMovimientoCaja").modal("hide");
          // Refresh session to get updated expected balance
          checkCurrentSession(); 
        }
      } catch (err) {
        NotificationService.close();
        NotificationService.toastError(err.response?.data?.errors?.[0]?.message || "Error al registrar movimiento");
      }
    });

    // Diferencia dinámica en cierre
    $("#close_counted_balance").on("input", function() {
      const counted = parseFloat($(this).val()) || 0;
      const diff = counted - currentExpectedBalance;
      const diffSpan = $("#close_difference");
      
      diffSpan.text(formatCurrency(diff));
      if (diff < 0) {
        diffSpan.removeClass("text-dark text-success").addClass("text-danger");
      } else if (diff > 0) {
        diffSpan.removeClass("text-dark text-danger").addClass("text-success");
      } else {
        diffSpan.removeClass("text-danger text-success").addClass("text-dark");
      }
    });

    // Modal Cerrar
    $("#btn_modal_cerrar").on("click", function () {
      $("#form_cerrar_caja")[0].reset();
      $("#close_difference").text("$ 0.00").removeClass("text-danger text-success").addClass("text-dark");
      $("#modalCerrarCaja").modal("show");
    });

    $("#form_cerrar_caja").on("submit", async function (e) {
      e.preventDefault();
      if (!currentSessionId) return;

      const data = {
        counted_balance: $("#close_counted_balance").val(),
        notes: $("#close_notes").val()
      };

      try {
        NotificationService.loading("Cerrando caja...");
        const resp = await CajaService.cerrarCaja(currentSessionId, data);
        NotificationService.close();
        if (resp && resp.success) {
          NotificationService.toastSuccess("Caja cerrada correctamente.");
          $("#modalCerrarCaja").modal("hide");
          
          // Mostrar resultado real que viene del backend
          const difference = resp.data.difference;
          let diffMsg = `Diferencia reportada: ${formatCurrency(difference)}`;
          NotificationService.info(diffMsg, "Resultado del Cierre");

          checkCurrentSession();
        }
      } catch (err) {
        NotificationService.close();
        NotificationService.toastError(err.response?.data?.errors?.[0]?.message || "Error al cerrar la caja");
      }
    });
  }

  return {
    init: async () => {
      if (!SecurityManager.hasPermission("cash.view")) {
        SecurityManager.redirectIfUnauthorized("cash.view");
        return;
      }
      setupEvents();
      SecurityManager.processDomPermissions();
      await checkCurrentSession();
    }
  };
})();

export default CajaIndexController;
