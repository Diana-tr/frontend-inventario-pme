import CajaService from "../../services/caja_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";
import { escapeHtml } from "../../core/utils.js";

const CajaIndexController = (() => {
  let currentSessionId = null;
  let currentExpectedBalance = 0;
  let movimientosSesionCache = [];

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
    if (Number.isNaN(d.getTime())) return String(isoString);
    return d.toLocaleString("es-CO");
  }

  // Función para actualizar el Navbar globalmente con el estado de la caja
  function actualizarNavbarCaja(isOpen, registerName = "") {
    const navbarNombre = document.querySelector("#navbar_caja_nombre");
    const badgeEstado = document.querySelector("#navbar_caja_estado_badge");

    if (!navbarNombre || !badgeEstado) return;

    if (isOpen) {
      navbarNombre.innerHTML = `Caja: <span class="text-dark font-weight-bold">${escapeHtml(registerName)}</span>`;
      badgeEstado.textContent = "Abierta";
      badgeEstado.style.backgroundColor = "#DCFCE7"; // Verde suave
      badgeEstado.style.color = "#16A34A";         // Texto verde
    } else {
      navbarNombre.innerHTML = `Caja: <span class="text-muted">Sin sesión activa</span>`;
      badgeEstado.textContent = "Cerrada";
      badgeEstado.style.backgroundColor = "#FEE2E2"; // Rojo suave
      badgeEstado.style.color = "#DC2626";         // Texto rojo
    }
  }

  async function cargarCuentasFiltro() {
    const select = $("#filtro_cuenta");
    if (!select.length) return;

    try {
      const mod = await import("../../services/finanzas_service.js");
      const FinanzasService = mod.default;
      if (!FinanzasService || typeof FinanzasService.listarCuentas !== "function") return;

      const resp = await FinanzasService.listarCuentas();
      if (resp && resp.success && resp.data) {
        const currentVal = select.val();
        select.find("option:not(:first)").remove();
        const accounts = Array.isArray(resp.data) ? resp.data : (resp.data.results || []);
        accounts.forEach((acc) => {
          const id = acc.id_financial_account ?? acc.id ?? "";
          const name = acc.name || acc.account_name || "Cuenta";
          if (id !== "") {
            select.append(`<option value="${escapeHtml(String(id))}">${escapeHtml(name)}</option>`);
          }
        });
        if (currentVal) {
          select.val(currentVal);
        }
      }
    } catch (err) {
      console.warn("Cuentas filtro no disponibles:", err);
    }
  }

  function obtenerFechaLocalYYYYMMDD(rawDate) {
    if (!rawDate) return "";
    if (typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
      return rawDate.slice(0, 10);
    }
    const d = new Date(rawDate);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function extraerCuentaIdMovimiento(m) {
    if (!m || typeof m !== "object") return "";
    if (m.financial_account_id !== undefined && m.financial_account_id !== null && m.financial_account_id !== "") {
      return String(m.financial_account_id);
    }
    if (m.id_financial_account !== undefined && m.id_financial_account !== null && m.id_financial_account !== "") {
      return String(m.id_financial_account);
    }
    if (m.account_id !== undefined && m.account_id !== null && m.account_id !== "") {
      return String(m.account_id);
    }
    if (typeof m.account === "object" && m.account !== null) {
      const nestedId = m.account.id_financial_account ?? m.account.id ?? "";
      return nestedId !== "" ? String(nestedId) : "";
    }
    if (m.account !== undefined && m.account !== null && m.account !== "") {
      return String(m.account);
    }
    return "";
  }

  function esMovimientoRetiro(m) {
    const movType = String(m.movement_type || m.type || "").toUpperCase();
    const category = String(m.category || "").toUpperCase();
    const desc = String(m.description || "").toUpperCase();
    return (
      movType === "RETIRO" ||
      movType === "WITHDRAWAL" ||
      category.includes("RETIRO") ||
      desc.includes("RETIRO")
    );
  }

  function esMovimientoEgreso(m) {
    const movType = String(m.movement_type || m.type || "").toUpperCase();
    return movType === "OUT" || movType === "OUTFLOW" || movType === "EXPENSE" || esMovimientoRetiro(m);
  }

  function esMovimientoIngreso(m) {
    const movType = String(m.movement_type || m.type || "").toUpperCase();
    return movType === "IN" || movType === "INFLOW" || movType === "INCOME" || movType === "DEPOSIT";
  }

  function aplicarFiltrosMovimientos(movimientos) {
    const cuenta = String($("#filtro_cuenta").val() || "").trim();
    const tipo = String($("#filtro_tipo").val() || "").trim().toUpperCase();
    const fechaInicio = String($("#filtro_fecha_inicio").val() || "").trim();
    const fechaFin = String($("#filtro_fecha_fin").val() || "").trim();

    return (movimientos || []).filter((m) => {
      if (cuenta) {
        const accId = extraerCuentaIdMovimiento(m);
        if (!accId || accId !== cuenta) return false;
      }

      if (tipo) {
        if (tipo === "INFLOW" || tipo === "IN") {
          if (!esMovimientoIngreso(m)) return false;
        } else if (tipo === "OUTFLOW") {
          if (!esMovimientoEgreso(m)) return false;
        } else if (tipo === "OUT" || tipo === "RETIRO") {
          if (!esMovimientoRetiro(m)) return false;
        }
      }

      if (fechaInicio || fechaFin) {
        const movDateStr = obtenerFechaLocalYYYYMMDD(m.created_at || m.movement_date || m.date);
        if (!movDateStr) return false;
        if (fechaInicio && movDateStr < fechaInicio) return false;
        if (fechaFin && movDateStr > fechaFin) return false;
      }

      return true;
    });
  }

  function renderFilasMovimientos(movs, emptyMessage = "No hay movimientos en esta sesión.") {
    const tbody = $("#tabla_movimientos tbody");
    if (!tbody.length) return;
    tbody.empty();

    if (!movs || movs.length === 0) {
      tbody.html(`<tr><td colspan="6" class="text-center text-muted py-3">${escapeHtml(emptyMessage)}</td></tr>`);
      return;
    }

    movs.forEach((m) => {
      const isOut = esMovimientoEgreso(m);
      const colorClass = isOut ? "text-danger" : "text-success";
      const sign = isOut ? "-" : "+";
      const typeLabel = isOut ? (esMovimientoRetiro(m) ? "Retiro" : "Egreso") : "Ingreso";

      const isCash = m.is_cash !== false;
      const channelIcon = isCash
        ? '<i class="fas fa-money-bill-wave mr-1 text-success"></i>Efectivo'
        : '<i class="fas fa-credit-card mr-1 text-info"></i>Electrónico';
      const channelBadgeClass = isCash ? "badge-success" : "badge-info";
      const paymentLabel = m.payment_method || (isCash ? "Efectivo" : "Electrónico");

      tbody.append(`
        <tr>
          <td>${escapeHtml(formatDate(m.created_at || m.movement_date || m.date))}</td>
          <td><span class="badge ${isOut ? "badge-danger" : "badge-success"}">${escapeHtml(typeLabel)}</span></td>
          <td>${escapeHtml(m.description || m.reference || "---")}</td>
          <td>
            <span class="badge ${channelBadgeClass} px-2 py-1" style="font-size: 0.75rem;">
              ${channelIcon}
            </span>
          </td>
          <td class="small text-muted">${escapeHtml(paymentLabel)}</td>
          <td class="text-right font-weight-bold ${colorClass}">${sign}${formatCurrency(m.amount)}</td>
        </tr>
      `);
    });
  }

  function refrescarVistaFiltrada() {
    const filtrados = aplicarFiltrosMovimientos(movimientosSesionCache);
    renderFilasMovimientos(filtrados, "No hay movimientos que coincidan con los filtros.");
  }

  async function checkCurrentSession() {
    $("#caja_loader").show();
    $("#caja_cerrada_view").hide();
    $("#caja_abierta_view").hide();

    try {
      const response = await CajaService.obtenerSesionActual(true);
      if (response && response.success && response.data) {
        await renderAbierta(response.data);
      } else {
        if (response && response.status === 404) {
          renderCerrada();
        } else {
          NotificationService.toastError("Error al verificar estado de caja.");
        }
      }
    } catch (error) {
      console.error(error);
      // Si da error o 404 por excepción, asumimos caja cerrada y actualizamos navbar
      renderCerrada();
    } finally {
      $("#caja_loader").hide();
    }
  }

  function renderCerrada() {
    $("#caja_cerrada_view").show();
    actualizarNavbarCaja(false);
    cargarCajasRegistradoras();
  }

  async function renderAbierta(session) {
    currentSessionId = session.id_cash_session;
    currentExpectedBalance = parseFloat(session.expected_balance || 0);
    const registerName = session.cash_register_name || "Principal";

    $("#current_cash_register").text(registerName);
    $("#current_user").text(session.user_name || "Usuario Actual");
    $("#current_start_time").text(formatDate(session.start_time));
    $("#current_opening_balance").text(formatCurrency(session.opening_balance));
    $("#current_expected_balance").text(formatCurrency(session.expected_balance));

    // Actualizar Navbar con caja abierta
    actualizarNavbarCaja(true, registerName);

    // Preparar modal de cierre
    $("#close_expected_balance").text(formatCurrency(session.expected_balance));

    $("#caja_abierta_view").show();
    await cargarCuentasFiltro();
    await cargarMovimientos(currentSessionId);
  }

  async function cargarCajasRegistradoras() {
    try {
      const resp = await CajaService.listarCajasRegistradoras();
      const select = $("#cash_register_id");
      select.empty().append('<option value="">Seleccione una caja...</option>');

      if (resp && resp.success && resp.data) {
        const results = resp.data.results || resp.data;
        results.forEach((reg) => {
          if (reg.is_active) {
            select.append(new Option(reg.name, reg.id_cash_register));
          }
        });
      }
    } catch (e) {
      console.warn("No se pudieron cargar las cajas registradoras", e);
    }
  }

  // Manejo de la Calculadora de Denominaciones
  function recalcularDenominaciones() {
    let total = 0;
    const denominationsDict = {};

    $(".denom-input").each(function () {
      const input = $(this);
      const val = parseFloat(input.data("value")) || 0;
      const qty = parseInt(input.val(), 10) || 0;
      const subtotal = val * qty;

      if (qty > 0) {
        denominationsDict[val.toString()] = qty;
      }

      input.closest("tr").find(".denom-subtotal").text(formatCurrency(subtotal));
      total += subtotal;
    });

    $("#badge_denom_total").text(formatCurrency(total));
    if (total > 0) {
      $("#close_counted_balance").val(total.toFixed(2)).trigger("input");
    }

    return denominationsDict;
  }

  async function cargarMovimientos(sessionId) {
    const tbody = $("#tabla_movimientos tbody");
    tbody.html('<tr><td colspan="6" class="text-center py-3">Cargando movimientos...</td></tr>');

    try {
      const resp = await CajaService.listarMovimientos(sessionId);

      if (resp && resp.success && resp.data) {
        const movs = Array.isArray(resp.data)
          ? resp.data
          : (Array.isArray(resp.data.results) ? resp.data.results : (Array.isArray(resp.data.movements) ? resp.data.movements : []));
        movimientosSesionCache = movs;

        if (movs.length === 0) {
          renderFilasMovimientos([], "No hay movimientos en esta sesión.");
          return;
        }

        refrescarVistaFiltrada();
      } else {
        movimientosSesionCache = [];
        renderFilasMovimientos([], "No hay movimientos en esta sesión.");
      }
    } catch (e) {
      console.error(e);
      tbody.html('<tr><td colspan="6" class="text-center text-danger py-3">Error al cargar movimientos.</td></tr>');
    }
  }

  function setupEvents() {
    // Aplicar filtros de movimientos (clic o cambio directo en controles)
    $(document).off("click", "#btn_aplicar_filtros").on("click", "#btn_aplicar_filtros", function (e) {
      e.preventDefault();
      refrescarVistaFiltrada();
    });

    $(document)
      .off("change", "#filtro_cuenta, #filtro_tipo, #filtro_fecha_inicio, #filtro_fecha_fin")
      .on("change", "#filtro_cuenta, #filtro_tipo, #filtro_fecha_inicio, #filtro_fecha_fin", function () {
        refrescarVistaFiltrada();
      });

    // Limpiar filtros de movimientos
    $(document).off("click", "#btn_limpiar_filtros").on("click", "#btn_limpiar_filtros", function (e) {
      e.preventDefault();
      $("#filtro_cuenta").val("");
      $("#filtro_tipo").val("");
      $("#filtro_fecha_inicio").val("");
      $("#filtro_fecha_fin").val("");
      renderFilasMovimientos(movimientosSesionCache, "No hay movimientos en esta sesión.");
    });

    // Arrastre de saldo de cierre anterior (Carry-over) al cambiar de caja
    $("#cash_register_id").on("change", async function () {
      const regId = $(this).val();
      const container = $("#carry_over_container");

      if (!regId) {
        container.addClass("d-none");
        return;
      }

      try {
        const resp = await CajaService.obtenerUltimoSaldoCierre(regId);
        if (resp && resp.success && resp.data) {
          const lastBal = parseFloat(resp.data.last_closing_balance || 0);
          if (lastBal > 0) {
            $("#carry_over_amount").text(formatCurrency(lastBal));
            $("#btn_apply_carry_over").data("balance", lastBal);
            container.removeClass("d-none");
          } else {
            container.addClass("d-none");
          }
        } else {
          container.addClass("d-none");
        }
      } catch (err) {
        console.warn("No se pudo consultar el saldo anterior", err);
        container.addClass("d-none");
      }
    });

    $("#btn_apply_carry_over").on("click", function () {
      const bal = $(this).data("balance");
      if (bal !== undefined) {
        $("#opening_balance").val(bal);
        NotificationService.toastSuccess("Saldo anterior aplicado como base.");
      }
    });

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
          window.dispatchEvent(new CustomEvent("cash_session_updated"));
          await checkCurrentSession();
        }
      } catch (err) {
        NotificationService.close();
        NotificationService.toastError(err.response?.data?.errors?.[0]?.message || "Error al abrir la caja");
      }
    });

    // Resumen Financiero del Turno Actual
    $("#btn_modal_resumen_turno").on("click", async function () {
      if (!currentSessionId) return;

      $("#modalResumenTurno").modal("show");
      $("#resumen_turno_loader").show();
      $("#resumen_turno_content").hide();

      try {
        const resp = await CajaService.obtenerResumenAuditoria(currentSessionId);
        if (resp && resp.success && resp.data) {
          const d = resp.data;
          $("#res_opening_balance").text(formatCurrency(d.opening_balance));
          $("#res_sales_cash").text(formatCurrency(d.sales_cash));
          $("#res_sales_elec").text(formatCurrency(d.sales_electronic));
          $("#res_purchases_cash").text(formatCurrency(d.purchases_cash));
          $("#res_expenses_manual").text(formatCurrency(d.manual_expenses));
          $("#res_expected_cash").text(formatCurrency(d.recalculated_expected_balance));
          $("#res_total_movs").text(`${d.movements_count} movimientos`);

          $("#resumen_turno_loader").hide();
          $("#resumen_turno_content").show();
        }
      } catch (err) {
        $("#resumen_turno_loader").hide();
        NotificationService.toastError("Error al cargar la auditoría del turno.");
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

      const isCash = $("#mov_is_cash").val() === "true";
      const reference = $("#mov_reference").val() ? $("#mov_reference").val().trim() : "";
      const category = $("#mov_category").val() || "GASTO_OPERATIVO";
      const descInput = $("#mov_description").val().trim();
      const description = `[${category}] ${descInput}`;

      const data = {
        movement_type: $("#mov_type").val(),
        amount: $("#mov_amount").val(),
        description: description,
        reference: reference,
        is_cash: isCash
      };

      try {
        NotificationService.loading("Registrando movimiento...");
        const resp = await CajaService.agregarMovimiento(currentSessionId, data);
        NotificationService.close();
        if (resp && resp.success) {
          NotificationService.toastSuccess("Movimiento registrado.");
          $("#modalMovimientoCaja").modal("hide");
          await checkCurrentSession();
        }
      } catch (err) {
        NotificationService.close();
        NotificationService.toastError(err.response?.data?.errors?.[0]?.message || "Error al registrar movimiento");
      }
    });

    // Control de Arqueo Ciego vs Supervisado
    $("#switch_arqueo_ciego").on("change", function () {
      const isBlind = $(this).is(":checked");
      if (isBlind) {
        $("#close_expected_container").addClass("d-none");
        $("#close_diff_container").addClass("d-none");
        $("#lbl_arqueo_mode").text("Arqueo Ciego (Ocultar Esperado)");
      } else {
        $("#close_expected_container").removeClass("d-none");
        $("#close_diff_container").removeClass("d-none");
        $("#lbl_arqueo_mode").text("Arqueo Supervisado (Mostrar Esperado)");
      }
    });

    // Calculadora de Denominaciones: inputs
    $(document).on("input keyup", ".denom-input", function () {
      recalcularDenominaciones();
    });

    // Diferencia dinámica en cierre
    $("#close_counted_balance").on("input", function () {
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
      $(".denom-input").val("");
      $(".denom-subtotal").text("$0");
      $("#badge_denom_total").text("$ 0.00");

      // Por defecto arqueo ciego activado
      $("#switch_arqueo_ciego").prop("checked", true).trigger("change");

      $("#close_difference").text("$ 0.00").removeClass("text-danger text-success").addClass("text-dark");
      $("#modalCerrarCaja").modal("show");
    });

    $("#form_cerrar_caja").on("submit", async function (e) {
      e.preventDefault();
      if (!currentSessionId) return;

      const denominations = recalcularDenominaciones();

      const data = {
        counted_balance: $("#close_counted_balance").val(),
        notes: $("#close_notes").val(),
        denominations: Object.keys(denominations).length > 0 ? denominations : null,
      };

      try {
        NotificationService.loading("Cerrando caja...");
        const resp = await CajaService.cerrarCaja(currentSessionId, data);
        NotificationService.close();
        if (resp && resp.success) {
          NotificationService.toastSuccess("Caja cerrada correctamente.");
          $("#modalCerrarCaja").modal("hide");

          const difference = parseFloat(resp.data.difference || 0);
          let diffMsg = `Diferencia auditada: ${formatCurrency(difference)}`;
          if (difference === 0) {
            diffMsg += " (Cuadre Exacto)";
          } else if (difference > 0) {
            diffMsg += " (Sobrante)";
          } else {
            diffMsg += " (Faltante)";
          }
          NotificationService.info(diffMsg, "Resultado del Arqueo y Cierre");

          window.dispatchEvent(new CustomEvent("cash_session_updated"));
          await checkCurrentSession();
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