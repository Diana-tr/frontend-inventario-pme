import SaaSAdminService from "../../services/saas_admin_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";

const SaasDashboardController = (() => {
  let chartInstance = null;

  function formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(parseFloat(amount) || 0);
  }

  async function cargarMetricas() {
    $("#saas_dashboard_loader").show();
    $("#saas_dashboard_content").hide();

    try {
      const response = await SaaSAdminService.obtenerMetricasGlobales();

      if (response && response.success && response.data) {
        const data = response.data;

        // Renderizar KPIs
        $("#kpi_mrr").text(formatCurrency(data.mrr));
        $("#kpi_total_companies").text(data.total_companies || 0);
        $("#kpi_active_trials").text(data.active_trials || 0);
        $("#kpi_active_subscriptions").text(data.active_subscriptions || 0);

        // Renderizar Tabla de Últimos Pagos (si el backend los devuelve)
        if (data.recent_payments) {
          renderTablaPagos(data.recent_payments);
        }

        // Renderizar Gráfico de Distribución de Empresas
        renderGraficoDistribucion(data);

        $("#saas_dashboard_loader").hide();
        $("#saas_dashboard_content").fadeIn();
      } else {
        NotificationService.toastError(
          "No se pudieron cargar las métricas del SaaS.",
        );
        $("#saas_dashboard_loader").hide();
      }
    } catch (error) {
      console.error("[SAAS DASHBOARD] Error:", error);
      NotificationService.toastError(
        "Error de conexión al cargar las métricas.",
      );
      $("#saas_dashboard_loader").hide();
    }
  }

  function renderTablaPagos(pagos) {
    const tbody = $("#tbody_ultimos_pagos");
    tbody.empty();

    if (!pagos || pagos.length === 0) {
      tbody.html(
        '<tr><td colspan="3" class="text-center text-muted py-3">No hay pagos recientes.</td></tr>',
      );
      return;
    }

    pagos.forEach((p) => {
      tbody.append(`
        <tr>
          <td class="font-weight-bold text-dark">${p.subscription__company__business_name || "N/A"}</td>
          <td class="text-success font-weight-bold">${formatCurrency(p.amount)}</td>
          <td class="text-muted small">${new Date(p.payment_date).toLocaleDateString()}</td>
        </tr>
      `);
    });
  }

  function renderGraficoDistribucion(data) {
    const canvas = document.getElementById("chart_saas_distribution");
    if (!canvas || typeof Chart === "undefined") return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(canvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: [
          "Suscripciones Activas",
          "En Prueba (Trial)",
          "Empresas Totales",
        ],
        datasets: [
          {
            data: [
              data.active_subscriptions || 0,
              data.active_trials || 0,
              data.total_companies || 0,
            ],
            backgroundColor: ["#10B981", "#F59E0B", "#3B82F6"],
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  }

  return {
    init: () => {
      // En un panel de Superadmin, el permiso está a nivel de Backend (is_superuser).
      // En el frontend, solo validamos que el usuario tenga la sesión activa.
      cargarMetricas();
    },
  };
})();

export default SaasDashboardController;
