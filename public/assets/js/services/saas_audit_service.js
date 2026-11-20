import ApiClient from "../core/apiClient.js";

/**
 * ============================================================
 * Inventario PME
 * SaaS Audit Service
 * ============================================================
 *
 * Servicio encargado de la consulta de logs de auditoría global
 * del ecosistema SaaS Admin.
 *
 * Responsabilidades:
 * - Listar logs con paginación server-side y filtros.
 * - Soporte para búsqueda por texto, método HTTP, código de estado y eventos.
 * ============================================================
 */

const SaaSAuditService = (() => {
  const AUDIT_ENDPOINT = "/api/v1/saas-admin/audit/";

  /**
   * Consulta registros de auditoría con filtros y paginación.
   * @param {Object} params - { page, page_size, search, method, status_code, security_event }
   * @returns {Promise<Object>}
   */
  async function listarAuditLogs(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.method) query.set("method", params.method);
      if (params.status_code) query.set("status_code", params.status_code);
      if (params.security_event) query.set("security_event", params.security_event);

      const queryString = query.toString();
      const url = queryString ? `${AUDIT_ENDPOINT}?${queryString}` : AUDIT_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error("[SAAS AUDIT SERVICE] Error al consultar auditoría:", error);
      throw error;
    }
  }

  return Object.freeze({
    listarAuditLogs,
  });
})();

export default SaaSAuditService;
