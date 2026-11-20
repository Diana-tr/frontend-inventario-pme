import ApiClient from "../core/apiClient.js";

/**
 * ============================================================
 * Inventario PME
 * SaaS Team Service
 * ============================================================
 *
 * Servicio responsable de la comunicación con los endpoints
 * de administración del personal y equipo interno del SaaS.
 *
 * Responsabilidades:
 * - Listar y consultar integrantes del equipo interno.
 * - Crear nuevos integrantes con roles de sistema.
 * - Modificar datos y perfiles funcionales.
 * - Activar / desactivar integrantes (revocación de acceso).
 * - Obtener el catálogo de perfiles funcionales disponibles.
 * ============================================================
 */

const SaaSTeamService = (() => {
  const ENDPOINT = "/api/v1/saas-admin/team/";

  async function listarMiembros(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.profile) query.set("profile", params.profile);
      if (params.is_active !== undefined && params.is_active !== null && params.is_active !== "") {
        query.set("is_active", params.is_active);
      }

      const qs = query.toString();
      const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[SAAS TEAM SERVICE] Error al listar miembros:", error);
      throw error;
    }
  }

  async function obtenerMiembro(id) {
    try {
      return await ApiClient.get(`${ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[SAAS TEAM SERVICE] Error al obtener miembro ${id}:`, error);
      throw error;
    }
  }

  async function crearMiembro(data) {
    try {
      return await ApiClient.post(ENDPOINT, data);
    } catch (error) {
      console.error("[SAAS TEAM SERVICE] Error al crear miembro:", error);
      throw error;
    }
  }

  async function actualizarMiembro(id, data) {
    try {
      return await ApiClient.patch(`${ENDPOINT}${id}/`, data);
    } catch (error) {
      console.error(`[SAAS TEAM SERVICE] Error al actualizar miembro ${id}:`, error);
      throw error;
    }
  }

  async function toggleEstado(id, isActive) {
    try {
      return await ApiClient.post(`${ENDPOINT}${id}/toggle-status/`, {
        is_active: isActive,
      });
    } catch (error) {
      console.error(`[SAAS TEAM SERVICE] Error al cambiar estado del miembro ${id}:`, error);
      throw error;
    }
  }

  async function obtenerRoles() {
    try {
      return await ApiClient.get(`${ENDPOINT}roles/`);
    } catch (error) {
      console.error("[SAAS TEAM SERVICE] Error al obtener catálogo de roles:", error);
      throw error;
    }
  }

  return Object.freeze({
    listarMiembros,
    obtenerMiembro,
    crearMiembro,
    actualizarMiembro,
    toggleEstado,
    obtenerRoles,
  });
})();

export default SaaSTeamService;
