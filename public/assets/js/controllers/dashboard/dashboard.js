/**
 * ============================================================
 * Inventario PME
 * Dashboard Controller v2
 * ============================================================
 */

import ApiClient from "../../core/apiClient.js";

const DashboardController = (() => {
  const DASHBOARD_ENDPOINT = "/api/v1/security/dashboard/";

  const WIDGET_CONFIG = {
    purchases_monthly: { type: "chart", canvasId: "chart-purchases-monthly", emptyId: "chart-purchases-empty" },
    sales_monthly: { type: "chart", canvasId: "chart-sales-monthly", emptyId: "chart-sales-empty" },
    payment_methods: { type: "chart", canvasId: "chart-payment-methods", emptyId: "chart-payment-empty" },
    erp_activity: { type: "list", containerId: "erp_activity_container" },
    needs_attention: { type: "list", containerId: "needs_attention_container" },
    top_selling_products: { type: "list", containerId: "top_selling_container" },
    latest_sales: { type: "table", containerId: "latest_sales_container" },
  };

  async function init() {
    console.log("[DASHBOARD] Cargando datos del sistema...");

    try {
      const response = await ApiClient.get(DASHBOARD_ENDPOINT);

      if (!response || (!response.data && !Array.isArray(response))) {
        console.warn("[DASHBOARD] La API no devolvió una estructura válida.");
        return;
      }

      const rawData = response.data || response;
      const widgets = rawData.widgets || (Array.isArray(rawData) ? rawData : []);

      const charts = [];
      const lists = [];
      const tables = [];

      // Procesar widgets configurados
      if (Array.isArray(widgets)) {
        for (const widget of widgets) {
          const config = WIDGET_CONFIG[widget.code];
          if (!config) continue;

          switch (config.type) {
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
      }

      // Verificación directa para Métodos de Pago
      if (!charts.some(c => c.code === "payment_methods") && rawData.payment_methods) {
        charts.push({
          code: "payment_methods",
          value: rawData.payment_methods,
          config: WIDGET_CONFIG.payment_methods
        });
      }

      // Renderizar 6 KPIs consolidados
      renderConsolidatedKPIs(rawData, widgets);
      
      // Renderizar Gráficos, Listas y Tablas
      renderCharts(charts, rawData);
      renderLists(lists);
      renderTables(tables);

    } catch (error) {
      console.error("[DASHBOARD] Error en la inicialización:", error);
    } finally {
      hideLoading();
    }
  }

  // 🎯 RENDERIZADO DE LAS 6 TARJETAS CONSOLIDADAS
  function renderConsolidatedKPIs(rawData, widgets) {
    const row = document.getElementById("dashboard-kpi-row");
    if (!row) return;

    row.innerHTML = "";

    const getValue = (code, fallbackProp) => {
      if (Array.isArray(widgets)) {
        const found = widgets.find(w => w.code === code);
        if (found !== undefined && found.value !== undefined) return found.value;
      }
      return rawData[fallbackProp] ?? 0;
    };

    const usersTotal = getValue("users_total", "users_total");
    const usersActive = getValue("users_active", "users_active");

    const customersTotal = getValue("customers_total", "customers_total");
    const customersRecent = getValue("customers_recent", "customers_recent");

    const productsTotal = getValue("products_total", "products_total");
    const lowStock = getValue("products_low_stock", "products_low_stock");

    const purchasesSummary = getValue("purchases_summary", "purchases_summary");
    const purchasesPending = getValue("purchases_pending", "purchases_pending");

    const salesSummary = getValue("sales_summary", "sales_summary");

    const suppliersActive = getValue("suppliers_active", "suppliers_active");

    const kpiCards = [
      {
        title: "USUARIOS",
        value: usersTotal,
        subtext: `${usersActive} activos`,
        icon: "fas fa-users",
        color: "#2563EB",
        bgIcon: "#EFF6FF",
        textColor: "text-success",
        url: "usuarios"
      },
      {
        title: "CLIENTES",
        value: customersTotal,
        subtext: `${customersRecent} recientes`,
        icon: "fas fa-user-tie",
        color: "#0891B2",
        bgIcon: "#ECFEFF",
        textColor: "text-info",
        url: "clientes"
      },
      {
        title: "PRODUCTOS",
        value: productsTotal,
        subtext: `${lowStock} bajo stock`,
        icon: "fas fa-box",
        color: "#F59E0B",
        bgIcon: "#FFFBEB",
        textColor: Number(lowStock) > 0 ? "text-warning" : "text-muted",
        url: "productos?filter=alerts" // 👈 Redirige aplicando el filtro de alertas
      },
      {
        title: "COMPRAS",
        value: purchasesSummary,
        subtext: `${purchasesPending} pendientes`,
        icon: "fas fa-shopping-cart",
        color: "#6366F1",
        bgIcon: "#EEF2FF",
        textColor: Number(purchasesPending) > 0 ? "text-danger" : "text-muted",
        url: "compras"
      },
      {
        title: "VENTAS",
        value: typeof salesSummary === "number" ? `$${salesSummary.toLocaleString("es-CO")}` : salesSummary,
        subtext: "Últimos 30 días",
        icon: "fas fa-cash-register",
        color: "#16A34A",
        bgIcon: "#F0FDF4",
        textColor: "text-success",
        url: "ventas"
      },
      {
        title: "PROVEEDORES",
        value: suppliersActive,
        subtext: `${suppliersActive} activos`,
        icon: "fas fa-truck",
        color: "#0D9488",
        bgIcon: "#F0FDFA",
        textColor: "text-success",
        url: "proveedores"
      }
    ];

    const styleId = "kpi-hover-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .kpi-card-hover { transition: all 0.25s ease-in-out; }
        .kpi-card-hover:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.08) !important; }
      `;
      document.head.appendChild(style);
    }

    for (const card of kpiCards) {
      const displayValue = typeof card.value === "number" ? card.value.toLocaleString("es-CO") : (card.value ?? "0");

      const col = document.createElement("div");
      col.className = "col-xl-2 col-lg-4 col-md-6 mb-3";
      col.innerHTML = `
        <div class="card kpi-card-hover shadow-sm border-0 h-100" style="border-radius: 0.75rem; background-color: #FFFFFF; border-left: 4px solid ${card.color} !important; ${card.url !== "#" ? "cursor: pointer;" : ""}">
          <div class="card-body p-3 d-flex flex-column justify-content-between">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="text-uppercase text-muted font-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px;">${card.title}</span>
                <h4 class="font-weight-bold mb-0 mt-1" style="color: #0F172A; font-size: 1.4rem;">${displayValue}</h4>
              </div>
              <div class="rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: ${card.bgIcon}; flex-shrink: 0;">
                <i class="${card.icon}" style="color: ${card.color}; font-size: 0.95rem;"></i>
              </div>
            </div>
            <div class="mt-2 pt-2 border-top" style="border-color: #F1F5F9 !important;">
              <small class="${card.textColor} font-weight-bold" style="font-size: 0.75rem;">
                ${card.subtext}
              </small>
            </div>
          </div>
        </div>`;

      const cardDiv = col.querySelector(".card");
      if (cardDiv && card.url && card.url !== "#") {
        cardDiv.addEventListener("click", () => {
          window.location.href = card.url;
        });
      }

      row.appendChild(col);
    }
  }

  // 🎯 RENDERIZADO DE GRÁFICOS
  function renderCharts(charts, fullResponseData) {
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
      if (canvas) canvas.classList.remove("d-none");

      if (code === "purchases_monthly") {
        renderBarChart(canvas, value);
      } else if (code === "sales_monthly") {
        renderLineChart(canvas, value);
      } else if (code === "payment_methods") {
        renderPaymentMethodsChart(canvas, value);
      }
    }

    // 🎯 Gráfico Doughnut (Stock de Inventario - SIEMPRE CON LAS 3 OPCIONES)
    const pieCanvas = document.getElementById("chart-sales-pie");
    const pieEmpty = document.getElementById("chart-pie-empty");

    const extractWidgetVal = (code, fallbackKey) => {
      if (Array.isArray(fullResponseData.widgets)) {
        const found = fullResponseData.widgets.find(w => w.code === code);
        if (found && found.value !== undefined) return Number(found.value) || 0;
      }
      return Number(fullResponseData[fallbackKey]) || 0;
    };

    const totalProd = extractWidgetVal("products_total", "products_total");
    const lowStockProd = extractWidgetVal("products_low_stock", "products_low_stock");
    const criticalStockProd = extractWidgetVal("inventory_alerts", "products_critical");
    const normalStock = Math.max(0, totalProd - lowStockProd - criticalStockProd);

    // Siempre estructuramos los 3 estados
    const stockData = [
      { label: "Stock Normal", value: normalStock },
      { label: "Bajo Stock", value: lowStockProd },
      { label: "Stock Crítico", value: criticalStockProd }
    ];

    if (pieCanvas) {
      if (totalProd > 0) {
        if (pieEmpty) pieEmpty.classList.add("d-none");
        pieCanvas.classList.remove("d-none");
        renderPieChart(pieCanvas, stockData);
      } else {
        pieCanvas.classList.add("d-none");
        if (pieEmpty) pieEmpty.classList.remove("d-none");
      }
    }
  }

  function renderBarChart(canvas, data) {
    if (!canvas || typeof Chart === "undefined") return;
    if (window.myBarChartInstance) window.myBarChartInstance.destroy();

    const labels = data.map((d) => d.label || d.month || d.mes || "");
    const ventas = data.map((d) => d.ventas ?? d.sales ?? 0);
    const compras = data.map((d) => d.compras ?? d.purchases ?? 0);

    window.myBarChartInstance = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Ventas", backgroundColor: "#16A34A", borderRadius: 4, data: ventas },
          { label: "Compras", backgroundColor: "#2563EB", borderRadius: 4, data: compras },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { usePointStyle: true, font: { size: 10 } } }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: (val) => "$" + Number(val).toLocaleString("es-CO") } }
        }
      },
    });
  }

  function renderLineChart(canvas, data) {
    if (!canvas || typeof Chart === "undefined") return;
    if (window.myLineChartInstance) window.myLineChartInstance.destroy();

    const labels = data.map((d) => d.label || d.date || d.fecha || d.dia || "");
    const values = data.map((d) => d.value ?? d.total ?? d.monto ?? d.total_ventas ?? 0);

    window.myLineChartInstance = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Ventas ($)",
          backgroundColor: "rgba(22, 163, 74, 0.1)",
          borderColor: "#16A34A",
          borderWidth: 2,
          pointRadius: 3,
          fill: true,
          tension: 0.3,
          data: values,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: (val) => "$" + Number(val).toLocaleString("es-CO") } }
        }
      },
    });
  }

  function renderPieChart(canvas, data) {
    if (!canvas || typeof Chart === "undefined") return;
    if (window.myPieChartInstance) window.myPieChartInstance.destroy();

    const labels = data.map((d) => d.label);
    const values = data.map((d) => Number(d.value) || 0);

    // Mapeo fijo de los 3 colores para los 3 estados obligatorios
    const colorMap = {
      "Stock Normal": "#16A34A",  // Verde
      "Bajo Stock": "#F59E0B",    // Amarillo/Naranja
      "Stock Crítico": "#DC2626"  // Rojo
    };

    const backgroundColors = labels.map(label => colorMap[label] || "#2563EB");

    window.myPieChartInstance = new Chart(canvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: "#FFFFFF"
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { boxWidth: 10, font: { size: 10 } } }
        }
      },
    });
  }

  function renderPaymentMethodsChart(canvas, data) {
    if (!canvas || typeof Chart === "undefined") return;
    if (window.myPaymentChartInstance) window.myPaymentChartInstance.destroy();

    const labels = data.map((d) => d.metodo || d.forma_pago || d.label || d.nombre || "");
    const values = data.map((d) => d.monto || d.total || d.value || d.cantidad || 0);

    window.myPaymentChartInstance = new Chart(canvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ["#2563EB", "#0891B2", "#8B5CF6", "#EC4899", "#10B981"],
          borderWidth: 2,
          borderColor: "#FFFFFF"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { boxWidth: 10, font: { size: 10 } } }
        }
      }
    });
  }

  function renderLists(lists) {
    for (const { code, value, config, count } of lists) {
      const container = document.getElementById(config.containerId);
      if (!container) continue;

      if (count !== undefined && code === "needs_attention") {
        const cardTitle = container.closest('.card')?.querySelector('.card-title');
        if (cardTitle) {
          cardTitle.innerHTML = `<i class="${config.icon || 'fas fa-exclamation-circle'} mr-2 text-danger"></i>${config.label || 'Requiere atención'} (${count})`;
        }
      }

      if (Array.isArray(value) && value.length > 0) {
        container.innerHTML = "";
        for (const item of value) {
          const title = item.title || item.label || item.name || "";
          const subtitle = item.subtitle || item.date || "";
          const badgeVal = item.value ?? item.badge ?? "";
          const badgeColor = item.color || item.badgeClass || "secondary";

          const li = document.createElement("li");
          li.className = "d-flex justify-content-between align-items-center py-2 px-1 mb-1 border-bottom";
          li.innerHTML = `
            <div class="d-flex align-items-center">
              <i class="${item.icon || "fas fa-circle"} text-${badgeColor} mr-2" style="font-size: 0.75rem;"></i>
              <div>
                <span class="font-weight-bold text-dark d-block" style="font-size: 0.88rem;">${title}</span>
                ${subtitle ? `<small class="text-muted d-block" style="font-size: 0.75rem;">${subtitle}</small>` : ''}
              </div>
            </div>
            ${badgeVal !== "" ? `<div><span class="badge badge-${badgeColor} px-2 py-1">${badgeVal}</span></div>` : ''}`;
          container.appendChild(li);
        }
      } else {
        container.innerHTML = `<li class="text-center text-muted py-3 list-unstyled">Sin datos registrados</li>`;
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
          const id = row.id ?? "#";
          const client = row.cliente ?? row.customer ?? row.client_name ?? "Cliente Ocasional";
          const amount = row.monto ?? row.amount ?? row.total ?? 0;
          const date = row.fecha ?? row.date ?? row.created_at ?? "";

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td class="font-weight-bold">${id}</td>
            <td>${client}</td>
            <td class="text-success font-weight-bold">$${Number(amount).toLocaleString("es-CO")}</td>
            <td><small class="text-muted">${date}</small></td>`;
          tbody.appendChild(tr);
        }
      } else {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No hay datos disponibles</td></tr>`;
      }
    }
  }

  function hideLoading() {
    const loader = document.getElementById("kpi-loading");
    if (loader) loader.remove();
  }

  return Object.freeze({ init });
})();

export default DashboardController;