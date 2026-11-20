/**
 * ============================================================
 * Inventario P.M.E. — SaaS Multi-Tenant
 * Notification Feed Service
 * ============================================================
 * Servicio centralizado para comunicación HTTP con los endpoints
 * del sistema de notificaciones y alertas (/api/v1/notifications/).
 */

import ApiClient from "../core/apiClient.js";

const NotificationFeedService = (() => {
  const BASE_ENDPOINT = "/api/v1/notifications";

  /**
   * Obtiene de forma ultraligera el contador de notificaciones no leídas.
   * @returns {Promise<{ unread_count: number }>}
   */
  async function getUnreadCount() {
    try {
      const response = await ApiClient.get(`${BASE_ENDPOINT}/unread-count/`);
      if (response && response.ok && response.data) {
        return {
          unread_count: response.data.unread_count ?? 0,
          company_id: response.data.company_id ?? null,
        };
      }
      return { unread_count: 0, company_id: null };
    } catch (error) {
      console.warn("[NotificationFeedService] Error consultando unread-count:", error);
      return { unread_count: 0, company_id: null };
    }
  }

  /**
   * Consulta el listado paginado y filtrable de notificaciones del usuario.
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.pageSize=10]
   * @param {boolean|null} [params.isRead=null]
   * @param {string|null} [params.category=null]
   * @param {string|null} [params.priority=null]
   * @param {string|null} [params.search=null]
   * @returns {Promise<{ count: number, results: Array, total_pages: number, current_page: number }>}
   */
  async function getNotifications({
    page = 1,
    pageSize = 10,
    isRead = null,
    category = null,
    priority = null,
    search = null,
  } = {}) {
    const queryParts = [];
    if (page) queryParts.push(`page=${encodeURIComponent(page)}`);
    if (pageSize) queryParts.push(`page_size=${encodeURIComponent(pageSize)}`);
    if (isRead !== null && isRead !== undefined) queryParts.push(`is_read=${encodeURIComponent(isRead)}`);
    if (category) queryParts.push(`category=${encodeURIComponent(category)}`);
    if (priority) queryParts.push(`priority=${encodeURIComponent(priority)}`);
    if (search && search.trim()) queryParts.push(`search=${encodeURIComponent(search.trim())}`);

    const queryString = queryParts.length ? `?${queryParts.join("&")}` : "";
    const url = `${BASE_ENDPOINT}/${queryString}`;

    try {
      const response = await ApiClient.get(url);
      if (!response || !response.ok) {
        return { count: 0, results: [], total_pages: 1, current_page: page };
      }

      // Estructura DRF estándar o ApiResponse
      const data = response.data || {};
      if (data.results && Array.isArray(data.results)) {
        return {
          count: data.count || data.results.length,
          results: data.results,
          total_pages: data.total_pages || Math.ceil((data.count || data.results.length) / pageSize) || 1,
          current_page: data.page || page,
        };
      }

      if (Array.isArray(data)) {
        return {
          count: data.length,
          results: data,
          total_pages: 1,
          current_page: 1,
        };
      }

      return { count: 0, results: [], total_pages: 1, current_page: page };
    } catch (error) {
      console.warn("[NotificationFeedService] Error consultando notificaciones:", error);
      return { count: 0, results: [], total_pages: 1, current_page: page };
    }
  }

  /**
   * Obtiene las 5 notificaciones más recientes para el dropdown de la campanita.
   * @returns {Promise<Array>}
   */
  async function getRecentNotifications(limit = 5) {
    try {
      const result = await getNotifications({ page: 1, pageSize: limit });
      return result.results || [];
    } catch (error) {
      console.warn("[NotificationFeedService] Error en getRecentNotifications:", error);
      return [];
    }
  }

  /**
   * Marca una notificación individual como leída.
   * @param {number|string} notificationId
   * @returns {Promise<boolean>}
   */
  async function markAsRead(notificationId) {
    try {
      const response = await ApiClient.post(`${BASE_ENDPOINT}/${notificationId}/read/`);
      return Boolean(response && response.ok);
    } catch (error) {
      console.error("[NotificationFeedService] Error en markAsRead:", error);
      return false;
    }
  }

  /**
   * Marca una notificación individual como no leída.
   * @param {number|string} notificationId
   * @returns {Promise<boolean>}
   */
  async function markAsUnread(notificationId) {
    try {
      const response = await ApiClient.post(`${BASE_ENDPOINT}/${notificationId}/unread/`);
      return Boolean(response && response.ok);
    } catch (error) {
      console.error("[NotificationFeedService] Error en markAsUnread:", error);
      return false;
    }
  }

  /**
   * Marca todas las notificaciones pendientes del usuario como leídas.
   * @returns {Promise<number>} Cantidad de notificaciones marcadas
   */
  async function markAllAsRead() {
    try {
      const response = await ApiClient.post(`${BASE_ENDPOINT}/mark-all-read/`);
      if (response && response.ok && response.data) {
        return response.data.marked_count || 0;
      }
      return 0;
    } catch (error) {
      console.error("[NotificationFeedService] Error en markAllAsRead:", error);
      return 0;
    }
  }

  /**
   * Eliminación lógica de una notificación.
   * @param {number|string} notificationId
   * @returns {Promise<boolean>}
   */
  async function deleteNotification(notificationId) {
    try {
      const response = await ApiClient.delete(`${BASE_ENDPOINT}/${notificationId}/`);
      return Boolean(response && response.ok);
    } catch (error) {
      console.error("[NotificationFeedService] Error en deleteNotification:", error);
      return false;
    }
  }

  return {
    getUnreadCount,
    getNotifications,
    getRecentNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
  };
})();

export default NotificationFeedService;
