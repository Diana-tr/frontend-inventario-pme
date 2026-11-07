import ApiClient from "../core/apiClient.js";

const SystemService = (() => {
  const SYSTEM_ENDPOINT = "/api/v1/system/";
  const VERSIONS_ENDPOINT = "/api/v1/versions/";

  /**
   * Obtiene la información y versión del sistema desde el backend.
   * @returns {Promise<Object>}
   */
  async function obtenerInfoSistema() {
    try {
      return await ApiClient.get(SYSTEM_ENDPOINT);
    } catch (error) {
      console.error("[SYSTEM SERVICE] Error al obtener info del sistema:", error);
      return { success: false, version: "Desconocida" };
    }
  }

  /**
   * Verifica si existe una nueva versión publicada superior a la instalada.
   * @returns {Promise<Object>}
   */
  async function verificarActualizaciones() {
    try {
      return await ApiClient.get(`${SYSTEM_ENDPOINT}check-updates/`);
    } catch (error) {
      console.error("[SYSTEM SERVICE] Error al verificar actualizaciones:", error);
      return { has_update: false, installed_version: "1.0.0", error };
    }
  }

  /**
   * Obtiene el historial público de lanzamientos y novedades.
   * @returns {Promise<Array>}
   */
  async function obtenerHistorialPublico() {
    try {
      const response = await ApiClient.get(`${SYSTEM_ENDPOINT}releases/`);
      return response && response.data ? response.data : response || [];
    } catch (error) {
      console.error("[SYSTEM SERVICE] Error al obtener releases:", error);
      return [];
    }
  }

  /* ────────────────────────────────────────────────────────────
     Endpoints administrativos (Gestión de Versiones)
     Requieren permisos de configuración ('settings.view' / 'settings.update')
     ──────────────────────────────────────────────────────────── */

  /**
   * Lista las versiones registradas con filtros opcionales.
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async function listarVersiones(params = {}) {
    return await ApiClient.get(VERSIONS_ENDPOINT, params);
  }

  /**
   * Obtiene el detalle completo de una versión con sus novedades categorizadas.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async function obtenerVersion(id) {
    return await ApiClient.get(`${VERSIONS_ENDPOINT}${id}/`);
  }

  /**
   * Registra un nuevo borrador de versión en el sistema.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async function crearVersion(data) {
    return await ApiClient.post(VERSIONS_ENDPOINT, data);
  }

  /**
   * Actualiza los metadatos de un borrador de versión.
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async function actualizarVersion(id, data) {
    return await ApiClient.patch(`${VERSIONS_ENDPOINT}${id}/`, data);
  }

  /**
   * Elimina un borrador de versión.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async function eliminarBorrador(id) {
    return await ApiClient.delete(`${VERSIONS_ENDPOINT}${id}/`);
  }

  /**
   * Publica formalmente una versión, haciéndola visible y notificable.
   * @param {number|string} id
   * @param {Object} data { force: boolean, force_reason: string }
   * @returns {Promise<Object>}
   */
  async function publicarVersion(id, data = {}) {
    return await ApiClient.post(`${VERSIONS_ENDPOINT}${id}/publish/`, data);
  }

  /**
   * Retira una versión publicada previamente.
   * @param {number|string} id
   * @param {Object} data { reason: string }
   * @returns {Promise<Object>}
   */
  async function retirarVersion(id, data = {}) {
    return await ApiClient.post(`${VERSIONS_ENDPOINT}${id}/withdraw/`, data);
  }

  /**
   * Agrega una entrada de changelog a una versión.
   * @param {number|string} versionId
   * @param {Object} entryData { category, title, description, order }
   * @returns {Promise<Object>}
   */
  async function agregarChangelog(versionId, entryData) {
    return await ApiClient.post(
      `${VERSIONS_ENDPOINT}${versionId}/changelog/`,
      entryData
    );
  }

  /**
   * Elimina una entrada de changelog.
   * @param {number|string} versionId
   * @param {number|string} entryId
   * @returns {Promise<Object>}
   */
  async function eliminarChangelog(versionId, entryId) {
    return await ApiClient.delete(
      `${VERSIONS_ENDPOINT}${versionId}/changelog/${entryId}/`
    );
  }

  /* ────────────────────────────────────────────────────────────
     Endpoints de Notificaciones de Versión (Para campanita del navbar)
     Accesibles por cualquier usuario autenticado y activo
     ──────────────────────────────────────────────────────────── */

  /**
   * Consulta las notificaciones de versiones publicadas para el usuario actual.
   * @returns {Promise<Object>} { unread_count: number, notifications: Array }
   */
  async function obtenerNotificacionesUsuario() {
    try {
      const response = await ApiClient.get(`${VERSIONS_ENDPOINT}notifications/`);
      return response && response.data ? response.data : response || { unread_count: 0, notifications: [] };
    } catch (error) {
      console.warn("[SYSTEM SERVICE] Error al obtener notificaciones:", error);
      return { unread_count: 0, notifications: [] };
    }
  }

  /**
   * Marca una versión específica como leída/consultada por el usuario.
   * @param {number|string} versionId
   * @returns {Promise<Object>}
   */
  async function marcarVersionLeida(versionId) {
    try {
      return await ApiClient.post(`${VERSIONS_ENDPOINT}${versionId}/read/`);
    } catch (error) {
      console.warn("[SYSTEM SERVICE] Error marcando versión como leída:", error);
      return { ok: false, error };
    }
  }

  /**
   * Marca todas las versiones publicadas como leídas para el usuario.
   * @returns {Promise<Object>}
   */
  async function marcarTodasLeidas() {
    try {
      return await ApiClient.post(`${VERSIONS_ENDPOINT}mark-all-read/`);
    } catch (error) {
      console.warn("[SYSTEM SERVICE] Error marcando todas las versiones como leídas:", error);
      return { ok: false, error };
    }
  }

  return Object.freeze({
    obtenerInfoSistema,
    verificarActualizaciones,
    obtenerHistorialPublico,
    listarVersiones,
    obtenerVersion,
    crearVersion,
    actualizarVersion,
    eliminarBorrador,
    publicarVersion,
    retirarVersion,
    agregarChangelog,
    eliminarChangelog,
    obtenerNotificacionesUsuario,
    marcarVersionLeida,
    marcarTodasLeidas,
  });
})();

export default SystemService;
