import ApiClient from "../core/apiClient.js";

/**
 * ============================================================
 * Inventario PME
 * SaaS Plan & Subscription Service
 * ============================================================
 * Servicio centralizado para la administración de planes comerciales,
 * suscripciones globales, cuotas de recursos, cambios de plan y renovaciones.
 * ============================================================
 */
const SaaSPlanService = (() => {
  const PLANS_ENDPOINT = "/api/v1/saas-admin/plans/";
  const SUBSCRIPTIONS_ENDPOINT = "/api/v1/saas-admin/subscriptions/";
  const TENANTS_ENDPOINT = "/api/v1/saas-admin/tenants/";

  // ─────────────────────────────────────────────
  // 1. Gestión de Planes Comerciales
  // ─────────────────────────────────────────────

  async function listarPlanes(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.search) query.set("search", params.search);
      if (params.is_active !== undefined && params.is_active !== "") {
        query.set("is_active", params.is_active);
      }
      const qs = query.toString();
      const url = qs ? `${PLANS_ENDPOINT}?${qs}` : PLANS_ENDPOINT;
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[SAAS PLAN SERVICE] Error al listar planes:", error);
      throw error;
    }
  }

  async function obtenerPlanPorId(id) {
    try {
      return await ApiClient.get(`${PLANS_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[SAAS PLAN SERVICE] Error al obtener plan ${id}:`, error);
      throw error;
    }
  }

  async function crearPlan(data) {
    try {
      return await ApiClient.post(PLANS_ENDPOINT, data);
    } catch (error) {
      console.error("[SAAS PLAN SERVICE] Error al crear plan:", error);
      throw error;
    }
  }

  async function actualizarPlan(id, data) {
    try {
      return await ApiClient.patch(`${PLANS_ENDPOINT}${id}/`, data);
    } catch (error) {
      console.error(`[SAAS PLAN SERVICE] Error al actualizar plan ${id}:`, error);
      throw error;
    }
  }

  async function alternarEstadoPlan(id) {
    try {
      return await ApiClient.patch(`${PLANS_ENDPOINT}${id}/toggle-status/`, {});
    } catch (error) {
      console.error(`[SAAS PLAN SERVICE] Error al alternar estado plan ${id}:`, error);
      throw error;
    }
  }

  async function obtenerCatalogoModulos() {
    try {
      return await ApiClient.get(`${PLANS_ENDPOINT}available-modules/`);
    } catch (error) {
      console.error("[SAAS PLAN SERVICE] Error al obtener catálogo dinámico de módulos:", error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────
  // 2. Gestión de Suscripciones Globales
  // ─────────────────────────────────────────────

  async function listarSuscripciones(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.status) query.set("status", params.status);
      if (params.plan_code) query.set("plan_code", params.plan_code);
      if (params.company_id) query.set("company_id", params.company_id);

      const qs = query.toString();
      const url = qs ? `${SUBSCRIPTIONS_ENDPOINT}?${qs}` : SUBSCRIPTIONS_ENDPOINT;
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[SAAS PLAN SERVICE] Error al listar suscripciones:", error);
      throw error;
    }
  }

  async function obtenerSuscripcionPorId(id) {
    try {
      return await ApiClient.get(`${SUBSCRIPTIONS_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[SAAS PLAN SERVICE] Error al obtener suscripción ${id}:`, error);
      throw error;
    }
  }

  async function obtenerKpisComerciales() {
    try {
      return await ApiClient.get(`${SUBSCRIPTIONS_ENDPOINT}kpis/`);
    } catch (error) {
      console.error("[SAAS PLAN SERVICE] Error al obtener KPIs comerciales:", error);
      throw error;
    }
  }

  async function obtenerCuotasEmpresa(companyId) {
    try {
      return await ApiClient.get(`${SUBSCRIPTIONS_ENDPOINT}company/${companyId}/quotas/`);
    } catch (error) {
      console.error(`[SAAS PLAN SERVICE] Error al obtener cuotas de empresa ${companyId}:`, error);
      throw error;
    }
  }

  async function asignarSuscripcion(data) {
    try {
      return await ApiClient.post(`${SUBSCRIPTIONS_ENDPOINT}assign/`, data);
    } catch (error) {
      console.error("[SAAS PLAN SERVICE] Error al asignar suscripción:", error);
      throw error;
    }
  }

  async function cambiarPlanSuscripcion(subscriptionId, data) {
    try {
      return await ApiClient.post(`${SUBSCRIPTIONS_ENDPOINT}${subscriptionId}/change-plan/`, data);
    } catch (error) {
      console.error(`[SAAS PLAN SERVICE] Error al cambiar plan de suscripción ${subscriptionId}:`, error);
      throw error;
    }
  }

  async function renovarSuscripcion(subscriptionId, data) {
    try {
      return await ApiClient.post(`${SUBSCRIPTIONS_ENDPOINT}${subscriptionId}/renew/`, data);
    } catch (error) {
      console.error(`[SAAS PLAN SERVICE] Error al renovar suscripción ${subscriptionId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────
  // 3. Empresas para selector
  // ─────────────────────────────────────────────

  async function listarEmpresasParaSelector() {
    try {
      return await ApiClient.get(`${TENANTS_ENDPOINT}?page_size=100`);
    } catch (error) {
      console.error("[SAAS PLAN SERVICE] Error al listar empresas para selector:", error);
      return { success: false, data: { results: [] } };
    }
  }

  return Object.freeze({
    listarPlanes,
    obtenerPlanPorId,
    crearPlan,
    actualizarPlan,
    alternarEstadoPlan,
    obtenerCatalogoModulos,
    listarSuscripciones,
    obtenerSuscripcionPorId,
    obtenerKpisComerciales,
    obtenerCuotasEmpresa,
    asignarSuscripcion,
    cambiarPlanSuscripcion,
    renovarSuscripcion,
    listarEmpresasParaSelector,
  });
})();

export default SaaSPlanService;
