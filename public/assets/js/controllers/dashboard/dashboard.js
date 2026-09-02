/**
 * ============================================================
 * Inventario PME
 * Dashboard Controller
 * ============================================================
 *
 * Controlador responsable de cargar las métricas del dashboard
 * consumiendo el endpoint optimizado del backend que ejecuta
 * consultas COUNT() directamente en PostgreSQL.
 *
 * Optimización aplicada:
 *   ANTES  → UsuarioService.listarUsuarios() descargaba TODOS los
 *            usuarios serializados (~KB) solo para extraer .count.
 *   AHORA  → Consume /api/v1/security/dashboard/ que devuelve solo
 *            los conteos numéricos (~bytes).
 * ============================================================
 */

import ApiClient from "../../core/apiClient.js";
import SecurityManager from "../../core/security.js";

const DashboardController = (() => {
  const DASHBOARD_ENDPOINT = "/api/v1/security/dashboard/";

  /**
   * Punto de entrada del controlador
   */
  async function init() {
    console.log("[DASHBOARD] Inicializando controlador...");

    try {
      const response = await ApiClient.get(DASHBOARD_ENDPOINT);

      if (!response.ok || !response.success || !response.data) {
        console.warn("[DASHBOARD] No se pudo obtener las métricas del dashboard.");
        return;
      }

      const widgets = response.data.widgets || [];

      // Mapear los widgets a los elementos del DOM
      for (const widget of widgets) {
        renderWidget(widget);
      }
    } catch (error) {
      console.error("[DASHBOARD] Error al cargar métricas:", error);
    }
  }

  /**
   * Renderiza un widget individual en el DOM.
   * Mapea el código del widget al ID del elemento HTML correspondiente.
   */
  function renderWidget(widget) {
    const WIDGET_ELEMENT_MAP = {
      users_total: "total_usuarios",
      users_active: "usuarios_activos",
      roles_distribution: "total_roles",
      customers_total: "total_clientes",
      customers_recent: "clientes_recientes",
      suppliers_active: "proveedores_activos",
    };

    const { code, value } = widget;

    // Widgets simples (valor numérico)
    const elementId = WIDGET_ELEMENT_MAP[code];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = typeof value === "number" ? value : "0";
      }
      return;
    }

    // Widget compuesto: erp_activity (lista de indicadores)
    if (code === "erp_activity" && Array.isArray(value)) {
      const container = document.getElementById("erp_activity_container");
      if (container) {
        container.innerHTML = "";
        for (const item of value) {
          const el = document.createElement("div");
          el.className = "d-flex justify-content-between align-items-center mb-2";
          el.innerHTML = `
            <span><i class="${item.icon} text-${item.color} mr-2"></i>${item.label}</span>
            <span class="badge badge-${item.color} px-2">${item.value}</span>
          `;
          container.appendChild(el);
        }
      }
    }
  }

  return Object.freeze({
    init,
  });
})();

export default DashboardController;
