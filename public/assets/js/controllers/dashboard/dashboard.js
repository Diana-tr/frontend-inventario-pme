/**
 * ============================================================
 * Inventario PME
 * Dashboard Controller v2.0
 * ============================================================
 *
 * Controlador responsable de cargar las métricas del dashboard
 * consumiendo el endpoint /api/v1/security/dashboard/ y
 * renderizando dinámicamente todas las secciones:
 *
 *   1. KPI Cards      → Tarjetas numéricas (small-box AdminLTE)
 *   2. Charts         → Gráficos Chart.js (ventas / compras)
 *   3. List Widgets   → erp_activity, needs_attention, top_selling
 *   4. Table Widgets  → latest_sales
 *
 * Diseño:
 *   - 100 % data-driven: el HTML se genera a partir de la
 *     respuesta del backend, sin hardcodear valores.
 *   - Escalable: para agregar un nuevo widget solo se necesita
 *     registrar su configuración en WIDGET_CONFIG.
 *   - Modular: cada tipo de widget tiene su propio renderer.
 * ============================================================
 */

import ApiClient from "../../core/apiClient.js";

const DashboardController = (() => {
  const DASHBOARD_ENDPOINT = "/api/v1/security/dashboard/";

  // ─────────────────────────────────────────────────────────────
  // Configuración visual de cada widget.
  //
  // Para agregar un nuevo widget en el futuro, basta con
  // añadir una entrada aquí y registrarlo en el backend
  // (security_data.py + dashboard_metrics_service.py).
  // ─────────────────────────────────────────────────────────────

  const WIDGET_CONFIG = {
    // ── KPI numéricos ──────────────────────────────────────────
    users_total: {
      type: "kpi",
      label: "Usuarios Totales",
      icon: "fas fa-users",
      bg: "bg-primary",
    },
    users_active: {
      type: "kpi",
      label: "Usuarios Activos",
      icon: "fas fa-user-check",
      bg: "bg-success",
    },
    roles_distribution: {
      type: "kpi",
      label: "Distribución de Roles",
      icon: "fas fa-user-shield",
      bg: "bg-dark",
    },
    customers_total: {
      type: "kpi",
      label: "Total Clientes",
      icon: "fas fa-user-tie",
      bg: "bg-primary",
    },
    customers_recent: {
      type: "kpi",
      label: "Clientes Recientes",
      icon: "fas fa-user-plus",
      bg: "bg-info",
    },
    suppliers_active: {
      type: "kpi",
      label: "Proveedores Activos",
      icon: "fas fa-truck",
      bg: "bg-success",
    },
    products_total: {
      type: "kpi",
      label: "Productos",
      icon: "fas fa-box",
      bg: "bg-primary",
    },
    products_low_stock: {
      type: "kpi",
      label: "Productos Bajo Stock",
      icon: "fas fa-exclamation-triangle",
      bg: "bg-warning",
    },
    purchases_pending: {
      type: "kpi",
      label: "Compras Pendientes",
      icon: "fas fa-shopping-cart",
      bg: "bg-info",
    },
    purchases_summary: {
      type: "kpi",
      label: "Compras",
      icon: "fas fa-shopping-cart",
      bg: "bg-info",
    },
    sales_summary: {
      type: "kpi",
      label: "Ventas",
      icon: "fas fa-cash-register",
      bg: "bg-success",
    },
    inventory_alerts: {
      type: "kpi",
      label: "Alertas de Inventario",
      icon: "fas fa-exclamation-triangle",
      bg: "bg-warning",
    },

    // ── Gráficos ───────────────────────────────────────────────
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

    // ── Listas ─────────────────────────────────────────────────
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

    // ── Tablas ─────────────────────────────────────────────────
    latest_sales: {
      type: "table",
      containerId: "latest_sales_container",
    },
  };

  // ─────────────────────────────────────────────────────────────
  // Punto de entrada
  // ─────────────────────────────────────────────────────────────

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

      // Separar widgets por tipo
      const kpis = [];
      const charts = [];
      const lists = [];
      const tables = [];

      for (const widget of widgets) {
        const config = WIDGET_CONFIG[widget.code];
        if (!config) {
          console.warn(`[DASHBOARD] Widget desconocido: ${widget.code}`);
          continue;
        }

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

      // Renderizar cada sección
      renderKPIs(kpis);
      renderCharts(charts);
      renderLists(lists);
      renderTables(tables);
    } catch (error) {
      console.error("[DASHBOARD] Error al cargar métricas:", error);
      hideLoading();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Renderizado de KPI Cards
  // ─────────────────────────────────────────────────────────────

  function renderKPIs(kpis) {
    const row = document.getElementById("dashboard-kpi-row");
    if (!row) return;

    // Limpiar loading spinner
    row.innerHTML = "";

    if (kpis.length === 0) {
      row.innerHTML = `
        <div class="col-12 text-center py-4">
          <p class="text-muted mb-0">No hay indicadores disponibles para tu perfil.</p>
        </div>`;
      return;
    }

    // Generar una tarjeta por cada KPI
    for (const { config, value } of kpis) {
      const displayValue =
        typeof value === "number" ? value.toLocaleString("es-CO") : "0";

      const col = document.createElement("div");
      col.className = "col-lg-3 col-md-6 col-sm-12 mb-4";
      col.innerHTML = `
        <div class="small-box ${config.bg} shadow-sm">
          <div class="inner">
            <h3>${displayValue}</h3>
            <p>${config.label}</p>
          </div>
          <div class="icon">
            <i class="${config.icon}"></i>
          </div>
          <a href="#" class="small-box-footer">
            Ver más <i class="fas fa-arrow-circle-right"></i>
          </a>
        </div>`;
      row.appendChild(col);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Renderizado de Gráficos (Chart.js)
  // ─────────────────────────────────────────────────────────────

  function renderCharts(charts) {
    for (const { code, value, config } of charts) {
      const canvas = document.getElementById(config.canvasId);
      const emptyMsg = document.getElementById(config.emptyId);

      // Si no hay datos o el array está vacío → mostrar mensaje
      const hasData = Array.isArray(value) && value.length > 0;

      if (!hasData) {
        if (canvas) canvas.classList.add("d-none");
        if (emptyMsg) emptyMsg.classList.remove("d-none");
        continue;
      }

      // Si hay datos → renderizar con Chart.js
      if (emptyMsg) emptyMsg.classList.add("d-none");

      if (code === "purchases_monthly") {
        renderBarChart(canvas, value);
      } else if (code === "sales_monthly") {
        renderLineChart(canvas, value);
      }
    }

    // Si no se recibieron widgets de chart, mostrar mensaje vacío
    const chartCodes = charts.map((c) => c.code);

    if (!chartCodes.includes("purchases_monthly")) {
      const canvas = document.getElementById("chart-purchases-monthly");
      const emptyMsg = document.getElementById("chart-purchases-empty");
      if (canvas) canvas.classList.add("d-none");
      if (emptyMsg) emptyMsg.classList.remove("d-none");
    }

    if (!chartCodes.includes("sales_monthly")) {
      const canvas = document.getElementById("chart-sales-monthly");
      const emptyMsg = document.getElementById("chart-sales-empty");
      if (canvas) canvas.classList.add("d-none");
      if (emptyMsg) emptyMsg.classList.remove("d-none");
    }
  }

  /**
   * Gráfico de barras para Ventas vs Compras.
   * Espera data como: [{ label, ventas, compras }]
   */
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
            backgroundColor: "rgba(40, 167, 69, 0.7)",
            borderColor: "rgba(40, 167, 69, 1)",
            borderWidth: 1,
            data: ventas,
          },
          {
            label: "Compras",
            backgroundColor: "rgba(0, 123, 255, 0.7)",
            borderColor: "rgba(0, 123, 255, 1)",
            borderWidth: 1,
            data: compras,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: "top" },
        scales: {
          yAxes: [{ ticks: { beginAtZero: true } }],
        },
      },
    });
  }

  /**
   * Gráfico de líneas para ventas últimos 30 días.
   * Espera data como: [{ label, value }]
   */
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
            backgroundColor: "rgba(40, 167, 69, 0.15)",
            borderColor: "rgba(40, 167, 69, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(40, 167, 69, 1)",
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
        scales: {
          yAxes: [{ ticks: { beginAtZero: true } }],
        },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Renderizado de Listas
  // ─────────────────────────────────────────────────────────────

  function renderLists(lists) {
    for (const { code, value, config } of lists) {
      const container = document.getElementById(config.containerId);
      if (!container) continue;

      // erp_activity tiene estructura especial del backend
      if (code === "erp_activity" && Array.isArray(value) && value.length > 0) {
        container.innerHTML = "";
        for (const item of value) {
          const li = document.createElement("li");
          li.className =
            "d-flex justify-content-between align-items-center mb-3";
          li.innerHTML = `
            <div>
              <i class="${item.icon} text-${item.color} mr-2"></i>
              <span class="font-weight-600 text-dark">${item.label}</span>
            </div>
            <div>
              <span class="badge badge-${item.color} px-2 py-1" style="font-size: 0.9em;">${item.value}</span>
            </div>`;
          container.appendChild(li);
        }
        continue;
      }

      // Listas genéricas (needs_attention, top_selling_products)
      if (Array.isArray(value) && value.length > 0) {
        container.innerHTML = "";
        for (const item of value) {
          const li = document.createElement("li");
          li.className =
            "d-flex justify-content-between align-items-center mb-3";
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
        // Sin datos
        container.innerHTML = `
          <li class="text-center text-muted py-3">
            <i class="fas fa-inbox fa-2x mb-2 d-block text-light"></i>
            No hay datos disponibles
          </li>`;
      }
    }

    // Contenedores de lista que no recibieron widget → marcar sin datos
    const listCodes = lists.map((l) => l.code);
    const listContainers = {
      erp_activity: "erp_activity_container",
      needs_attention: "needs_attention_container",
      top_selling_products: "top_selling_container",
    };

    for (const [code, containerId] of Object.entries(listContainers)) {
      if (!listCodes.includes(code)) {
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = `
            <li class="text-center text-muted py-3">
              <i class="fas fa-inbox fa-2x mb-2 d-block text-light"></i>
              No hay datos disponibles
            </li>`;
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Renderizado de Tablas
  // ─────────────────────────────────────────────────────────────

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

    // Si no se recibió latest_sales → mostrar vacío
    const tableCodes = tables.map((t) => t.code);
    if (!tableCodes.includes("latest_sales")) {
      const tbody = document.getElementById("latest_sales_container");
      if (tbody) {
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

  // ─────────────────────────────────────────────────────────────
  // Utilidades
  // ─────────────────────────────────────────────────────────────

  function hideLoading() {
    const loader = document.getElementById("kpi-loading");
    if (loader) loader.remove();
  }

  // ─────────────────────────────────────────────────────────────
  // API pública
  // ─────────────────────────────────────────────────────────────

  return Object.freeze({
    init,
  });
})();

export default DashboardController;
