import ApiClient from "../core/apiClient.js";

/**
 * ============================================================
 * Inventario PME
 * SaaS Admin Service
 * ============================================================
 *
 * Servicio responsable de la comunicacion con los endpoints
 * de administración global del SaaS.
 *
 * Responsabilidades:
 * - Obtener metricas globales (MRR, Empresas, Trials).
 * - Listar y detallar empresas (Tenants).
 * - Ejecutar acciones administrativas (Suspender, Reactivar).
 * - Iniciar sesion de soporte (Impersonation).
 *
 * NO contiene logica de DOM ni renderizado.
 * ============================================================
 */

const SaaSAdminService = (() => {
  // Endpoint base para el panel de administración
  const SAAS_ENDPOINT = "/api/v1/saas-admin/tenants/";

  /**
   * Obtiene las métricas globales del SaaS (MRR, Empresas activas, etc.).
   * @returns {Promise<Object>}
   */
  async function obtenerMetricasGlobales() {
    try {
      return await ApiClient.get(`${SAAS_ENDPOINT}metrics/`);
    } catch (error) {
      console.error(
        "[SAAS ADMIN SERVICE] Error al obtener métricas globales:",
        error,
      );
      throw error;
    }
  }

  /**
   * Lista las empresas (Tenants) con paginacion y filtros server-side.
   * @param {Object} params - { page, page_size, search, status, ordering }
   * @returns {Promise<Object>}
   */
  async function listarEmpresas(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.status) query.set("status", params.status);
      if (params.ordering) query.set("ordering", params.ordering);

      const queryString = query.toString();
      const url = queryString
        ? `${SAAS_ENDPOINT}?${queryString}`
        : SAAS_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error("[SAAS ADMIN SERVICE] Error al listar empresas:", error);
      throw error;
    }
  }

  /**
   * Obtiene el detalle completo de una empresa especifica.
   * @param {number|string} id - ID de la empresa (id_company)
   * @returns {Promise<Object>}
   */
  async function obtenerEmpresaPorId(id) {
    try {
      return await ApiClient.get(`${SAAS_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(
        `[SAAS ADMIN SERVICE] Error al obtener empresa ${id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Ejecuta una accion administrativa sobre una empresa.
   * @param {number|string} id - ID de la empresa
   * @param {Object} data - { action: 'suspend'|'reactivate'|'extend-trial', reason: string, extra_days: number }
   * @returns {Promise<Object>}
   */
  async function ejecutarAccionEmpresa(id, data) {
    try {
      return await ApiClient.post(`${SAAS_ENDPOINT}${id}/actions/`, data);
    } catch (error) {
      console.error(
        `[SAAS ADMIN SERVICE] Error al ejecutar accion en empresa ${id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Inicia una sesion de soporte técnico (Impersonation) para una empresa.
   * NOTA: Este endpoint devuelve tokens JWT temporales. El controlador
   * debe encargarse de guardarlos en Storage para simular la sesion.
   *
   * @param {number|string} id - ID de la empresa
   * @param {Object} data - { reason: string, target_user_id?: number }
   * @returns {Promise<Object>}
   */
  async function impersonarEmpresa(id, data) {
    try {
      return await ApiClient.post(`${SAAS_ENDPOINT}${id}/impersonate/`, data);
    } catch (error) {
      console.error(
        `[SAAS ADMIN SERVICE] Error al impersonar empresa ${id}:`,
        error,
      );
      throw error;
    }
  }

  return Object.freeze({
    obtenerMetricasGlobales,
    listarEmpresas,
    obtenerEmpresaPorId,
    ejecutarAccionEmpresa,
    impersonarEmpresa,
  });
})();

export default SaaSAdminService;
