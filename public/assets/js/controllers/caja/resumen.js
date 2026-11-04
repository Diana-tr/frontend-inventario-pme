import CajaService from "../../services/caja_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";

const CajaResumenController = (() => {
  let chartInstance = null;

  function formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount) || 0);
  }

  async function cargarResumenCajas() {
    $("#caja_resumen_loader").show();
    $("#caja_resumen_content").hide();

    try {
      const response = await CajaService.obtenerResumenFinanciero();

      if (response && response.success && response.data) {
        renderKPIs(response.data);
        renderTablaSesiones(response.data.active_sessions || []);
        renderGrafico(response.data.today || {});

        $("#caja_resumen_loader").hide();
        $("#caja_resumen_content").fadeIn();
      } else {
        NotificationService.toastError("No se pudo cargar el resumen de cajas.");
        $("#caja_resumen_loader").hide();
      }
    } catch (error) {
      console.error("[CAJA RESUMEN] Error:", error);
      NotificationService.toastError("Error de conexión al cargar resumen de cajas.");
      $("#caja_resumen_loader").hide();
    }
  }

  function renderKPIs(data) {
    $("#kpi_drawers").text(formatCurrency(data.total_cash_in_drawers));

    const today = data.today || {};
    $("#kpi_sales_cash").text(formatCurrency(today.cash_in));
    $("#kpi_cash_out").text(formatCurrency(today.cash_out));
    $("#kpi_sales_elec").text(formatCurrency(today.electronic_in));
    $("#kpi_discrepancy").text(formatCurrency(today.total_discrepancy));
  }

  function renderTablaSesiones(sessions) {
    const tbody = $("#tbody_open_sessions");
    tbody.empty();
    $("#badge_open_count").text(sessions.length);

    if (sessions.length === 0) {
      tbody.html('<tr><td colspan="3" class="text-center text-muted py-3">No hay turnos de caja abiertos</td></tr>');
      return;
    }

    sessions.forEach((s) => {
      tbody.append(`
        <tr>
          <td class="font-weight-bold text-dark">${s.register_name}</td>
          <td>${s.user_name}</td>
          <td class="text-right text-success font-weight-bold">${formatCurrency(s.expected_balance)}</td>
        </tr>
      `);
    });
  }

  function renderGrafico(todayData) {
    const canvas = document.getElementById("chart_caja_flow");
    if (!canvas || typeof Chart === "undefined") return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Efectivo Entrante", "Pagos Electrónicos", "Salidas de Efectivo"],
        datasets: [
          {
            label: "Monto (COP)",
            data: [
              parseFloat(todayData.cash_in || 0),
              parseFloat(todayData.electronic_in || 0),
              parseFloat(todayData.cash_out || 0),
            ],
            backgroundColor: ["#10B981", "#3B82F6", "#EF4444"],
            borderRadius: 6,
            barThickness: 45,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => "$" + Number(val).toLocaleString("es-CO"),
            },
          },
        },
      },
    });
  }

  return {
    init: () => {
      if (!SecurityManager.hasPermission("cash.view")) {
        SecurityManager.redirectIfUnauthorized("cash.view");
        return;
      }
      cargarResumenCajas();
    },
  };
})();

export default CajaResumenController;

