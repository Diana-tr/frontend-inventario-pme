import ApiClient from "../core/apiClient.js";

/**
 * ============================================================
 * Inventario PME
 * SaaS Version Service
 * ============================================================
 *
 * Servicio responsable de la comunicación con los endpoints
 * de administración del ciclo de versiones del ERP.
 *
 * Responsabilidades:
 * - Listar y consultar versiones completas (borradores, publicadas, retiradas).
 * - Crear y actualizar borradores de versión.
 * - Administrar entradas de changelog (novedades, mejoras, fixes).
 * - Publicar y retirar versiones.
 * - Eliminar borradores.
 *
 * Confinado al entorno administrativo SaaS.
 * ============================================================
 */

const SaaSVersionService = (() => {
  const ENDPOINT = "/api/v1/versions/";

  async function listarVersiones(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.status) query.set("status", params.status);
      if (params.search) query.set("search", params.search);
      if (params.page) query.set("page", params.page);

      const qs = query.toString();
      const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[SAAS VERSION SERVICE] Error al listar versiones:", error);
      throw error;
    }
  }

  async function obtenerVersion(id) {
    try {
      return await ApiClient.get(`${ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[SAAS VERSION SERVICE] Error al obtener versión ${id}:`, error);
      throw error;
    }
  }

  async function crearVersion(data) {
    try {
      return await ApiClient.post(ENDPOINT, data);
    } catch (error) {
      console.error("[SAAS VERSION SERVICE] Error al crear versión:", error);
      throw error;
    }
  }

  async function actualizarVersion(id, data) {
    try {
      return await ApiClient.patch(`${ENDPOINT}${id}/`, data);
    } catch (error) {
      console.error(`[SAAS VERSION SERVICE] Error al actualizar versión ${id}:`, error);
      throw error;
    }
  }

  async function eliminarVersion(id) {
    try {
      return await ApiClient.delete(`${ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[SAAS VERSION SERVICE] Error al eliminar versión ${id}:`, error);
      throw error;
    }
  }

  async function agregarChangelog(id, data) {
    try {
      return await ApiClient.post(`${ENDPOINT}${id}/changelog/`, data);
    } catch (error) {
      console.error(`[SAAS VERSION SERVICE] Error al agregar changelog a versión ${id}:`, error);
      throw error;
    }
  }

  async function eliminarChangelog(id, changelogId) {
    try {
      return await ApiClient.delete(`${ENDPOINT}${id}/changelog/${changelogId}/`);
    } catch (error) {
      console.error(`[SAAS VERSION SERVICE] Error al eliminar changelog ${changelogId}:`, error);
      throw error;
    }
  }

  async function publicarVersion(id, data = {}) {
    try {
      return await ApiClient.post(`${ENDPOINT}${id}/publish/`, data);
    } catch (error) {
      console.error(`[SAAS VERSION SERVICE] Error al publicar versión ${id}:`, error);
      throw error;
    }
  }

  async function retirarVersion(id, data = {}) {
    try {
      return await ApiClient.post(`${ENDPOINT}${id}/withdraw/`, data);
    } catch (error) {
      console.error(`[SAAS VERSION SERVICE] Error al retirar versión ${id}:`, error);
      throw error;
    }
  }

  return Object.freeze({
    listarVersiones,
    obtenerVersion,
    crearVersion,
    actualizarVersion,
    eliminarVersion,
    agregarChangelog,
    eliminarChangelog,
    publicarVersion,
    retirarVersion,
  });
})();

export default SaaSVersionService;
