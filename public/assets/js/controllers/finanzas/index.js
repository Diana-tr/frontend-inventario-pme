/**
 * ============================================================
 * Inventario PME
 * Finance Dashboard & Treasury Controller
 * ============================================================
 */

import FinanzasService from "../../services/finanzas_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";

const FinanceDashboardController = (() => {
  let chartInstance = null;
  let cachedAccounts = [];
  let cachedCategories = [];
  let mostrarInactivas = false;

  function formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount) || 0);
  }

  function getAccountTypeBadge(type) {
    const map = {
      BANK: '<span class="badge badge-primary px-2 py-1"><i class="fas fa-university mr-1"></i>Banco</span>',
      CASH: '<span class="badge badge-success px-2 py-1"><i class="fas fa-money-bill-wave mr-1"></i>Efectivo</span>',
      DIGITAL_WALLET: '<span class="badge badge-info px-2 py-1"><i class="fas fa-mobile-alt mr-1"></i>Billetera</span>',
      CREDIT: '<span class="badge badge-warning px-2 py-1"><i class="fas fa-credit-card mr-1"></i>Crédito</span>',
      OTHER: '<span class="badge badge-secondary px-2 py-1">Otro</span>',
    };
    return map[type] || '<span class="badge badge-light px-2 py-1">Cuenta</span>';
  }

  // ───────────────────────────────────────────
  // CARGA DE DATOS PRINCIPALES
  // ───────────────────────────────────────────
  async function cargarDashboard(period = "month") {
    $("#finance_dashboard_loader").show();
    $("#finance_dashboard_content").hide();

    try {
      const [dashRes, accountsRes, catRes] = await Promise.all([
        FinanzasService.obtenerDashboard({ period }),
        FinanzasService.listarCuentas({ page_size: 100, include_deleted: mostrarInactivas }),
        FinanzasService.listarCategorias(),
      ]);

      if (dashRes && dashRes.success && dashRes.data) {
        renderKPIs(dashRes.data);
        renderGrafico(dashRes.data);
        renderERPStats(dashRes.data);
      }

      if (accountsRes && accountsRes.success && accountsRes.data) {
        cachedAccounts = Array.isArray(accountsRes.data)
          ? accountsRes.data
          : (accountsRes.data.results || []);
        renderCuentasGrid(cachedAccounts);
        poblarSelectsCuentas(cachedAccounts);
      }

      if (catRes && catRes.success && catRes.data) {
        cachedCategories = Array.isArray(catRes.data)
          ? catRes.data
          : (catRes.data.results || []);
        poblarSelectCategorias(cachedCategories);
      }

      $("#finance_dashboard_loader").hide();
      $("#finance_dashboard_content").fadeIn();
    } catch (error) {
      console.error("[FINANCE DASHBOARD] Error:", error);
      NotificationService.error("No fue posible cargar el estado financiero.");
      $("#finance_dashboard_loader").hide();
    }
  }

  function renderKPIs(data) {
    const summary = data.summary || {};
    const liquidity = data.liquidity || {};
    const cashFlow = data.cash_flow || {};

    const totalLiquidity = summary.total_liquid_balance ?? liquidity.total_available_money ?? 0;
    const totalInflow = summary.total_inflow ?? cashFlow.period_income ?? 0;
    const totalOutflow = summary.total_outflow ?? cashFlow.period_expense ?? 0;
    const netFlow = summary.net_flow ?? cashFlow.net_cash_flow ?? (parseFloat(totalInflow) - parseFloat(totalOutflow));

    $("#kpi_total_liquidity").text(formatCurrency(totalLiquidity));
    $("#kpi_total_inflow").text(formatCurrency(totalInflow));
    $("#kpi_total_outflow").text(formatCurrency(totalOutflow));

    const net = parseFloat(netFlow) || 0;
    const netEl = $("#kpi_net_cash_flow");
    netEl.text(formatCurrency(net));
    if (net >= 0) {
      netEl.removeClass("text-danger").addClass("text-success");
    } else {
      netEl.removeClass("text-success").addClass("text-danger");
    }
  }

  function renderERPStats(data) {
    const sales = data.sales_summary || {};
    const purchases = data.purchases_summary || {};
    const expenses = data.expenses_summary || {};
    const obligations = data.obligations || {};

    const salesTotal = sales.total_amount ?? obligations.accounts_receivable ?? 0;
    const purchasesTotal = purchases.total_amount ?? obligations.accounts_payable ?? 0;
    const expensesTotal = expenses.total_amount ?? (data.cash_flow ? data.cash_flow.period_expense : 0);

    $("#stat_sales_total").text(formatCurrency(salesTotal));
    $("#stat_sales_count").text(`${sales.total_count || 0} facturas emitidas`);

    $("#stat_purchases_total").text(formatCurrency(purchasesTotal));
    $("#stat_purchases_count").text(`${purchases.total_count || 0} compras recibidas`);

    $("#stat_expenses_total").text(formatCurrency(expensesTotal));
  }

  function renderCuentasGrid(accounts) {
    const container = $("#container_cuentas_grid");
    container.empty();

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      const msg = mostrarInactivas
        ? "No hay cuentas financieras registradas (ni activas ni inactivas)."
        : `No hay cuentas financieras activas registradas aún.<br><small class="text-muted">Si desactivaste una cuenta, activa el switch <b>"Mostrar cuentas inactivas"</b> para reactivarla.</small>`;
      container.html(`
        <div class="col-12 text-center py-4">
          <p class="text-muted mb-2 font-weight-bold">${msg}</p>
          <button type="button" class="btn btn-outline-primary btn-sm" onclick="$('#btn_modal_nueva_cuenta').click()">
            <i class="fas fa-plus mr-1"></i> Crear primera cuenta
          </button>
        </div>
      `);
      return;
    }

    accounts.forEach((acc) => {
      const isInactive = acc.is_active === false;
      const cardStyle = isInactive
        ? "border: 2px dashed #CBD5E1 !important; background-color: #F8FAFC !important;"
        : "border-color: #E2E8F0 !important; background-color: #FFFFFF;";
      const statusBadge = isInactive
        ? '<span class="badge badge-secondary px-2 py-1"><i class="fas fa-ban mr-1"></i>Inactiva</span>'
        : getAccountTypeBadge(acc.account_type);

      const actionsHtml = isInactive
        ? `
          <a class="dropdown-item btn-restore-account text-success font-weight-bold" href="#" data-id="${acc.id_financial_account}" data-name="${acc.name}">
            <i class="fas fa-trash-restore mr-2"></i>Reactivar cuenta
          </a>
        `
        : `
          <a class="dropdown-item btn-edit-account" href="#" data-id="${acc.id_financial_account}"><i class="fas fa-edit mr-2 text-primary"></i>Editar cuenta</a>
          <a class="dropdown-item btn-deactivate-account text-danger" href="#" data-id="${acc.id_financial_account}" data-name="${acc.name}"><i class="fas fa-trash-alt mr-2"></i>Desactivar</a>
        `;

      const card = `
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card border shadow-none h-100" style="border-radius: 12px; ${cardStyle}">
            <div class="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 class="font-weight-bold ${isInactive ? 'text-muted' : 'text-dark'} mb-1">${acc.name}</h6>
                    <small class="text-muted d-block">${acc.bank_name || "Caja / Fondo Interno"} ${acc.account_number ? `· ${acc.account_number}` : ""}</small>
                  </div>
                  <div>
                    ${statusBadge}
                  </div>
                </div>
              </div>
              <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-end">
                <div>
                  <small class="text-uppercase text-muted font-weight-bold" style="font-size: 0.7rem;">Saldo Disponible</small>
                  <h4 class="font-weight-bold ${isInactive ? 'text-muted' : 'text-dark'} mb-0">${formatCurrency(acc.current_balance)}</h4>
                </div>
                <div class="dropdown">
                  <button class="btn btn-sm btn-light border dropdown-toggle" type="button" data-toggle="dropdown" style="border-radius: 6px;">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <div class="dropdown-menu dropdown-menu-right shadow-sm border-0">
                    ${actionsHtml}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      container.append(card);
    });
  }

  function renderGrafico(data) {
    const canvas = document.getElementById("chart_finance_summary");
    if (!canvas || typeof Chart === "undefined") return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const summary = data.summary || {};
    const cashFlow = data.cash_flow || {};
    const inflow = parseFloat(summary.total_inflow ?? cashFlow.period_income) || 0;
    const outflow = parseFloat(summary.total_outflow ?? cashFlow.period_expense) || 0;
    const net = parseFloat(summary.net_flow ?? cashFlow.net_cash_flow) || (inflow - outflow);

    chartInstance = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Ingresos Totales", "Egresos / Gastos", "Flujo de Caja Neto"],
        datasets: [
          {
            label: "Monto COP",
            data: [inflow, outflow, net],
            backgroundColor: [
              "#10B981", // Verde Ingresos
              "#EF4444", // Rojo Egresos
              net >= 0 ? "#2563EB" : "#F59E0B", // Azul o Ambar Neto
            ],
            borderRadius: 6,
            barThickness: 45,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        scales: {
          xAxes: [
            {
              gridLines: { display: false },
            },
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                callback: (val) => "$" + Number(val).toLocaleString("es-CO"),
              },
            },
          ],
        },
      },
    });
  }

  function poblarSelectsCuentas(accounts) {
    const movSelect = $("#mov_cuenta");
    const transfOrigen = $("#transf_origen");
    const transfDestino = $("#transf_destino");

    movSelect.empty().append('<option value="" disabled selected>Seleccione una cuenta</option>');
    transfOrigen.empty().append('<option value="" disabled selected>Seleccione cuenta origen</option>');
    transfDestino.empty().append('<option value="" disabled selected>Seleccione cuenta destino</option>');

    const activeAccounts = (Array.isArray(accounts) ? accounts : []).filter(
      (acc) => acc.is_active !== false
    );

    activeAccounts.forEach((acc) => {
      const opt = `<option value="${acc.id_financial_account}">${acc.name} (Saldo: ${formatCurrency(acc.current_balance)})</option>`;
      movSelect.append(opt);
      transfOrigen.append(opt);
      transfDestino.append(opt);
    });

    transfOrigen.empty().append('<option value="" disabled selected>Seleccione cuenta origen</option>');
    transfDestino.empty().append('<option value="" disabled selected>Seleccione cuenta destino</option>');

    accounts.forEach((acc) => {
      const opt = `<option value="${acc.id_financial_account}">${acc.name} (Saldo: ${formatCurrency(acc.current_balance)})</option>`;
      movSelect.append(opt);
      transfOrigen.append(opt);
      transfDestino.append(opt);
    });
  }

  function poblarSelectCategorias(categories) {
    const catSelect = $("#mov_categoria");
    catSelect.empty().append('<option value="" selected>Sin categoría (Opcional)</option>');

    categories.forEach((cat) => {
      const tag = cat.category_type === "INFLOW" ? "[Ingreso]" : "[Egreso]";
      catSelect.append(`<option value="${cat.id_financial_category}">${tag} ${cat.name}</option>`);
    });
  }

  // ───────────────────────────────────────────
  // MANEJADORES DE MODALES Y FORMULARIOS
  // ───────────────────────────────────────────
  function setupEventListeners() {
    // Selector de periodo
    $("#select_filtro_periodo").on("change", function () {
      cargarDashboard($(this).val());
    });

    // Switch para mostrar/ocultar cuentas inactivas
    $("#switch_mostrar_inactivas").on("change", function () {
      mostrarInactivas = $(this).is(":checked");
      cargarDashboard($("#select_filtro_periodo").val() || "month");
    });

    // Abrir modal nueva cuenta
    $("#btn_modal_nueva_cuenta").on("click", () => {
      if (!SecurityManager.hasPermission("finance.create")) {
        NotificationService.warning("No tiene permisos para crear cuentas financieras.");
        return;
      }
      $("#formCuentaFinanciera")[0].reset();
      $("#cuenta_id").val("");
      $("#cuenta_saldo_inicial").prop("disabled", false);
      $("#modalCuentaTitulo").html('<i class="fas fa-university mr-2"></i>Registrar Cuenta Financiera');
      $("#modalCuentaFinanciera").modal("show");
    });

    // Abrir modal registrar movimiento
    $("#btn_modal_movimiento").on("click", () => {
      if (!SecurityManager.hasPermission("finance.create")) {
        NotificationService.warning("No tiene permisos para registrar movimientos financieros.");
        return;
      }
      $("#formMovimientoFinanciero")[0].reset();
      $("#mov_fecha").val(new Date().toISOString().split("T")[0]);
      $("#modalMovimientoFinanciero").modal("show");
    });

    // Abrir modal transferencia
    $("#btn_modal_transferencia").on("click", () => {
      if (!SecurityManager.hasPermission("finance.transfer")) {
        NotificationService.warning("No tiene permisos para realizar transferencias.");
        return;
      }
      $("#formTransferencia")[0].reset();
      $("#transf_fecha").val(new Date().toISOString().split("T")[0]);
      $("#modalTransferencia").modal("show");
    });

    // Guardar cuenta financiera (Crear / Editar)
    $("#formCuentaFinanciera").on("submit", async function (e) {
      e.preventDefault();
      const accountId = $("#cuenta_id").val();
      const payload = {
        name: $("#cuenta_nombre").val().trim(),
        account_type: $("#cuenta_tipo").val(),
        bank_name: $("#cuenta_banco").val().trim(),
        account_number: $("#cuenta_numero").val().trim(),
        description: $("#cuenta_descripcion").val().trim(),
      };

      if (!accountId) {
        payload.initial_balance = $("#cuenta_saldo_inicial").val();
      }

      $("#btn_guardar_cuenta").prop("disabled", true).text("Guardando...");

      try {
        if (accountId) {
          await FinanzasService.actualizarCuenta(accountId, payload);
          NotificationService.success("Cuenta financiera actualizada con éxito.");
        } else {
          await FinanzasService.crearCuenta(payload);
          NotificationService.success("Cuenta financiera registrada correctamente.");
        }
        $("#modalCuentaFinanciera").modal("hide");
        cargarDashboard($("#select_filtro_periodo").val());
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Error al procesar la cuenta financiera.";
        NotificationService.error(msg);
      } finally {
        $("#btn_guardar_cuenta").prop("disabled", false).text("Guardar Cuenta");
      }
    });

    // Editar cuenta
    $(document).on("click", ".btn-edit-account", async function (e) {
      e.preventDefault();
      const accountId = $(this).data("id");
      try {
        const res = await FinanzasService.obtenerCuentaPorId(accountId);
        if (res && res.success && res.data) {
          const acc = res.data;
          $("#cuenta_id").val(acc.id_financial_account);
          $("#cuenta_nombre").val(acc.name);
          $("#cuenta_tipo").val(acc.account_type);
          $("#cuenta_banco").val(acc.bank_name || "");
          $("#cuenta_numero").val(acc.account_number || "");
          $("#cuenta_saldo_inicial").val(acc.initial_balance).prop("disabled", true);
          $("#cuenta_descripcion").val(acc.description || "");

          $("#modalCuentaTitulo").html('<i class="fas fa-edit mr-2"></i>Editar Cuenta Financiera');
          $("#modalCuentaFinanciera").modal("show");
        }
      } catch (err) {
        NotificationService.error("No se pudo obtener información de la cuenta.");
      }
    });

    // Desactivar cuenta
    $(document).on("click", ".btn-deactivate-account", async function (e) {
      e.preventDefault();
      const accountId = $(this).data("id");
      const accountName = $(this).data("name");

      if (!SecurityManager.hasPermission("finance.delete")) {
        NotificationService.warning("No posee permisos para desactivar cuentas.");
        return;
      }

      const confirm = await NotificationService.confirm(
        `¿Está seguro de desactivar la cuenta '${accountName}'? No se borrarán los movimientos pasados.`,
        "Desactivar Cuenta Financiera"
      );

      if (confirm.isConfirmed) {
        try {
          await FinanzasService.desactivarCuenta(accountId);
          NotificationService.success("Cuenta desactivada correctamente.");
          cargarDashboard($("#select_filtro_periodo").val());
        } catch (err) {
          const msg = err.response?.data?.message || "No se pudo desactivar la cuenta.";
          NotificationService.error(msg);
        }
      }
    });

    // Reactivar / Restaurar cuenta
    $(document).on("click", ".btn-restore-account", async function (e) {
      e.preventDefault();
      const accountId = $(this).data("id");
      const accountName = $(this).data("name") || "esta cuenta";

      if (!SecurityManager.hasPermission("finance.update")) {
        NotificationService.warning("No posee permisos para reactivar cuentas financieras.");
        return;
      }

      const confirm = await NotificationService.confirm(
        `¿Desea reactivar la cuenta '${accountName}'? Volverá a estar activa para registrar movimientos y transferencias.`,
        "Reactivar Cuenta Financiera"
      );

      if (confirm.isConfirmed) {
        try {
          await FinanzasService.restaurarCuenta(accountId);
          NotificationService.success(`Cuenta '${accountName}' reactivada exitosamente.`);
          cargarDashboard($("#select_filtro_periodo").val() || "month");
        } catch (err) {
          console.error("[FINANCE DASHBOARD] Error al reactivar cuenta:", err);
          const msg = err.response?.data?.message || "No fue posible reactivar la cuenta financiera.";
          NotificationService.error(msg);
        }
      }
    });

    // Registrar movimiento de tesorería
    $("#formMovimientoFinanciero").on("submit", async function (e) {
      e.preventDefault();
      const payload = {
        account_id: parseInt($("#mov_cuenta").val()),
        category_id: $("#mov_categoria").val() ? parseInt($("#mov_categoria").val()) : null,
        movement_type: $("#mov_tipo").val(),
        amount: $("#mov_monto").val(),
        payment_method: $("#mov_metodo").val(),
        movement_date: $("#mov_fecha").val(),
        description: $("#mov_descripcion").val().trim(),
        reference: $("#mov_referencia").val().trim(),
      };

      $("#btn_guardar_movimiento").prop("disabled", true).text("Registrando...");

      try {
        await FinanzasService.registrarMovimiento(payload);
        NotificationService.success("Movimiento registrado satisfactoriamente.");
        $("#modalMovimientoFinanciero").modal("hide");
        cargarDashboard($("#select_filtro_periodo").val());
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Error al registrar movimiento.";
        NotificationService.error(msg);
      } finally {
        $("#btn_guardar_movimiento").prop("disabled", false).text("Registrar Movimiento");
      }
    });

    // Ejecutar transferencia entre cuentas
    $("#formTransferencia").on("submit", async function (e) {
      e.preventDefault();
      const sourceId = parseInt($("#transf_origen").val());
      const destId = parseInt($("#transf_destino").val());

      if (sourceId === destId) {
        NotificationService.warning("La cuenta origen y la cuenta destino deben ser diferentes.");
        return;
      }

      const payload = {
        source_account_id: sourceId,
        destination_account_id: destId,
        amount: $("#transf_monto").val(),
        transfer_date: $("#transf_fecha").val(),
        reference: $("#transf_referencia").val().trim(),
        notes: $("#transf_notas").val().trim(),
      };

      $("#btn_ejecutar_transferencia").prop("disabled", true).text("Transfiriendo...");

      try {
        await FinanzasService.ejecutarTransferencia(payload);
        NotificationService.success("Transferencia ejecutada exitosamente.");
        $("#modalTransferencia").modal("hide");
        cargarDashboard($("#select_filtro_periodo").val());
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Error al ejecutar transferencia.";
        NotificationService.error(msg);
      } finally {
        $("#btn_ejecutar_transferencia").prop("disabled", false).text("Ejecutar Transferencia");
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
      cargarDashboard("month");
    },
  };
})();

export default FinanceDashboardController;
