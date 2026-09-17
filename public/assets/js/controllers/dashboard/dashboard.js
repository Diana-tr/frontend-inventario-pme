/**
 * ============================================================
 * Inventario PME
 * Dashboard Controller v2.0
 * ============================================================
 */

import ApiClient from "../../core/apiClient.js";

const DashboardController = (() => {
  const DASHBOARD_ENDPOINT = "/api/v1/security/dashboard/";

  const WIDGET_CONFIG = {
    users_total: {
      type: "kpi",
      label: "Usuarios Totales",
      icon: "fas fa-users",
      color: "#2563EB",
      url: "usuarios",
    },
    users_active: {
      type: "kpi",
      label: "Usuarios Activos",
      icon: "fas fa-user-check",
      color: "#16A34A",
      url: "usuarios",
    },
    roles_distribution: {
      type: "kpi",
      label: "Distribución de Roles",
      icon: "fas fa-user-shield",
      color: "#0F172A",
      url: "roles",
    },
    customers_total: {
      type: "kpi",
      label: "Total Clientes",
      icon: "fas fa-user-tie",
      color: "#2563EB",
      url: "clientes",
    },
    customers_recent: {
      type: "kpi",
      label: "Clientes Recientes",
      icon: "fas fa-user-plus",
      color: "#0891B2",
      url: "clientes",
    },
    suppliers_active: {
      type: "kpi",
      label: "Proveedores Activos",
      icon: "fas fa-truck",
      color: "#16A34A",
      url: "proveedores",
    },
    products_total: {
      type: "kpi",
      label: "Productos",
      icon: "fas fa-box",
      color: "#2563EB",
      url: "productos",
    },
    products_low_stock: {
      type: "kpi",
      label: "Productos Bajo Stock",
      icon: "fas fa-exclamation-triangle",
      color: "#F59E0B",
      url: "inventarios",
    },
    purchases_pending: {
      type: "kpi",
      label: "Compras Pendientes",
      icon: "fas fa-shopping-cart",
      color: "#0891B2",
      url: "compras",
    },
    purchases_summary: {
      type: "kpi",
      label: "Compras",
      icon: "fas fa-shopping-cart",
      color: "#0891B2",
      url: "compras",
    },
    sales_summary: {
      type: "kpi",
      label: "Ventas",
      icon: "fas fa-cash-register",
      color: "#16A34A",
      url: "ventas",
    },
    inventory_alerts: {
      type: "kpi",
      label: "Alertas de Inventario",
      icon: "fas fa-exclamation-triangle",
      color: "#DC2626",
      url: "inventario",
    },
    purchases_monthly: {
      type: "chart",
      canvasId: "chart-purchases-monthly",
      emptyId: "chart-purchases-empty",
    },
    sales_monthly: {
      type: "chart",
      canvasId: "chart-sales-monthly",
      emptyId: "chart-sales-empty",
    },
    erp_activity: {
      type: "list",
      containerId: "erp_activity_container",
    },
    needs_attention: {
      type: "list",
      containerId: "needs_attention_container",
    },
    top_selling_products: {
      type: "list",
      containerId: "top_selling_container",
    },
    latest_sales: {
      type: "table",
      containerId: "latest_sales_container",
    },
  };

  async function init() {
    console.log("[DASHBOARD] Inicializando controlador v2...");

    try {
      const response = await ApiClient.get(DASHBOARD_ENDPOINT);

      if (!response.ok || !response.success || !response.data) {
        console.warn("[DASHBOARD] No se pudo obtener las métricas.");
        hideLoading();
        return;
      }

      const widgets = response.data.widgets || [];
      const kpis = [];
      const charts = [];
      const lists = [];
      const tables = [];

      for (const widget of widgets) {
        const config = WIDGET_CONFIG[widget.code];
        if (!config) continue;

        switch (config.type) {
          case "kpi":
            kpis.push({ ...widget, config });
            break;
          case "chart":
            charts.push({ ...widget, config });
            break;
          case "list":
            lists.push({ ...widget, config });
            break;
          case "table":
            tables.push({ ...widget, config });
            break;
        }
      }

      renderKPIs(kpis);
      renderCharts(charts);
      renderLists(lists);
      renderTables(tables);
    } catch (error) {
      console.error("[DASHBOARD] Error al cargar métricas:", error);
      hideLoading();
    }
  }

  function renderKPIs(kpis) {
    const row = document.getElementById("dashboard-kpi-row");
    if (!row) return;

    row.innerHTML = "";

    if (kpis.length === 0) {
      row.innerHTML = `
        <div class="col-12 text-center py-4">
          <p class="text-muted mb-0">No hay indicadores disponibles para tu perfil.</p>
        </div>`;
      return;
    }

    // Estilo CSS dinámico con transición de hover mejorada
    const styleId = "kpi-hover-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .kpi-card-hover {
          transition: all 0.25s ease-in-out;
        }
        .kpi-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 .75rem 1.25rem rgba(0,0,0,.08) !important;
        }
      `;
      document.head.appendChild(style);
    }

    for (const { config, value } of kpis) {
      const displayValue =
        typeof value === "number" ? value.toLocaleString("es-CO") : "0";
      const accentColor = config.color || "#2563EB";
      const targetUrl = config.url || "#"; // CORREGIDO: Definido correctamente para evitar ReferenceError

      const col = document.createElement("div");
      col.className = "col-lg-3 col-md-6 col-sm-12 mb-4";
      col.innerHTML = `
        <div class="card kpi-card-hover shadow-sm border-0 h-100" style="border-radius: 0.75rem; background-color: #F8FAFC; border-top: 4px solid ${accentColor} !important; ${targetUrl !== "#" ? "cursor: pointer;" : ""}">
          <div class="card-body d-flex align-items-center justify-content-between p-4">
            <div>
              <span class="d-block text-muted font-weight-bold mb-1" style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">${config.label}</span>
              <h3 class="font-weight-bold mb-0" style="color: #0F172A; font-size: 2rem; font-weight: 800 !important;">${displayValue}</h3>
            </div>
            <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 55px; height: 55px; background-color: ${accentColor}15; color: ${accentColor}; flex-shrink: 0;">
              <i class="${config.icon} fa-lg"></i>
            </div>
          </div>
        </div>`;

      // CORREGIDO: Asignación limpia del evento directamente al nodo de la tarjeta recién creada
      const cardDiv = col.querySelector(".card");
      if (cardDiv && targetUrl && targetUrl !== "#") {
        cardDiv.addEventListener("click", () => {
          window.location.href = targetUrl;
        });
      }

      row.appendChild(col);
    }
  }

  function renderCharts(charts) {
    for (const { code, value, config } of charts) {
      const canvas = document.getElementById(config.canvasId);
      const emptyMsg = document.getElementById(config.emptyId);
      const hasData = Array.isArray(value) && value.length > 0;

      if (!hasData) {
        if (canvas) canvas.classList.add("d-none");
        if (emptyMsg) emptyMsg.classList.remove("d-none");
        continue;
      }

      if (emptyMsg) emptyMsg.classList.add("d-none");

      if (code === "purchases_monthly") {
        renderBarChart(canvas, value);
      } else if (code === "sales_monthly") {
        renderLineChart(canvas, value);
      }
    }
  }

  function renderBarChart(canvas, data) {
    if (!canvas || typeof Chart === "undefined") return;
    const labels = data.map((d) => d.label || d.month || "");
    const ventas = data.map((d) => d.ventas ?? d.sales ?? 0);
    const compras = data.map((d) => d.compras ?? d.purchases ?? 0);

    new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Ventas",
            backgroundColor: "rgba(22, 163, 74, 0.8)",
            borderColor: "rgba(22, 163, 74, 1)",
            borderWidth: 1,
            data: ventas,
          },
          {
            label: "Compras",
            backgroundColor: "rgba(37, 99, 235, 0.8)",
            borderColor: "rgba(37, 99, 235, 1)",
            borderWidth: 1,
            data: compras,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: "top" },
        scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
      },
    });
  }

  function renderLineChart(canvas, data) {
    if (!canvas || typeof Chart === "undefined") return;
    const labels = data.map((d) => d.label || d.date || "");
    const values = data.map((d) => d.value ?? d.total ?? 0);

    new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Ventas",
            backgroundColor: "rgba(22, 163, 74, 0.1)",
            borderColor: "rgba(22, 163, 74, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(22, 163, 74, 1)",
            pointRadius: 3,
            fill: true,
            data: values,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: "top" },
        scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
      },
    });
  }

  function renderLists(lists) {
    for (const { code, value, config } of lists) {
      const container = document.getElementById(config.containerId);
      if (!container) continue;

      if (Array.isArray(value) && value.length > 0) {
        container.innerHTML = "";
        for (const item of value) {
          const li = document.createElement("li");
          li.className = "d-flex justify-content-between align-items-center mb-3";
          li.innerHTML = `
            <div>
              <i class="${item.icon || "fas fa-circle"} text-${item.color || "muted"} mr-2"></i>
              <span class="font-weight-600 text-dark">${item.label || item.name || ""}</span>
            </div>
            <div>
              <span class="badge badge-${item.color || "secondary"} px-2 py-1" style="font-size: 0.9em;">${item.value ?? ""}</span>
            </div>`;
          container.appendChild(li);
        }
      } else {
        container.innerHTML = `
          <li class="text-center text-muted py-3">
            <i class="fas fa-inbox fa-2x mb-2 d-block text-light"></i>
            No hay datos disponibles
          </li>`;
      }
    }
  }

  function renderTables(tables) {
    for (const { value, config } of tables) {
      const tbody = document.getElementById(config.containerId);
      if (!tbody) continue;

      if (Array.isArray(value) && value.length > 0) {
        tbody.innerHTML = "";
        for (const row of value) {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${row.id ?? ""}</td>
            <td>${row.cliente ?? row.customer ?? ""}</td>
            <td>$${(row.monto ?? row.amount ?? 0).toLocaleString("es-CO")}</td>
            <td>${row.fecha ?? row.date ?? ""}</td>`;
          tbody.appendChild(tr);
        }
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-muted py-4">
              <i class="fas fa-inbox fa-2x mb-2 d-block text-light"></i>
              No hay datos disponibles
            </td>
          </tr>`;
      }
    }
  }

  function hideLoading() {
    const loader = document.getElementById("kpi-loading");
    if (loader) loader.remove();
  }

  return Object.freeze({
    init,
  });
})();

export default DashboardController;
