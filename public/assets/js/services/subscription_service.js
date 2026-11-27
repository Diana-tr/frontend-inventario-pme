/**
 * ============================================================
 * Inventario PME
 * Subscription Service (Frontend SaaS)
 * ============================================================
 *
 * Servicio frontend para consultar y sincronizar el estado
 * operativo de la suscripción, ciclo de vida, modo de solo lectura
 * y renovación de planes.
 */

import ApiClient from "../core/apiClient.js";
import Storage from "../storage/storage.js";

const SubscriptionService = (() => {
  const ENDPOINT_STATUS = "/api/v1/subscriptions/current/status/";
  const ENDPOINT_CURRENT = "/api/v1/subscriptions/current/";
  const ENDPOINT_CHANGE_PLAN = "/api/v1/subscriptions/change-plan/";

  let inFlightPromise = null;

  /**
   * Invalida el estado de suscripción en caché local (sessionStorage).
   */
  function invalidarEstado() {
    Storage.clearSubscriptionStatus();
  }

  /**
   * Consulta el estado de suscripción de la empresa activa actual.
   * Utiliza caché en sessionStorage con invalidación al cambiar de empresa.
   *
   * @param {boolean} forceRefresh
   * @returns {Promise<Object>} Datos del estado de suscripción
   */
  async function obtenerEstadoSuscripcion(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = Storage.getSubscriptionStatus();
      if (cached && typeof cached === "object" && cached.status) {
        return cached;
      }
    }

    // Evitar peticiones concurrentes duplicadas
    if (inFlightPromise) {
      return inFlightPromise;
    }

    inFlightPromise = (async () => {
      try {
        const response = await ApiClient.get(ENDPOINT_STATUS);
        if (response && response.success && response.data) {
          Storage.saveSubscriptionStatus(response.data);
          return response.data;
        }

        // Si la respuesta falló o no tiene data válida, retornar un fallback seguro
        return (
          Storage.getSubscriptionStatus() || {
            is_valid: true,
            is_read_only: false,
            can_write: true,
            status: "UNKNOWN",
            status_display: "Desconocido",
            plan_name: "Sin Plan",
            days_remaining: 0,
            days_overdue: 0,
            is_in_grace_period: false,
            grace_period_days: 0,
            renew_url: "/saas-admin/planes",
          }
        );
      } catch (error) {
        console.warn("[SUBSCRIPTION SERVICE] Error obteniendo estado de suscripción:", error);
        return (
          Storage.getSubscriptionStatus() || {
            is_valid: true,
            is_read_only: false,
            can_write: true,
            status: "ERROR",
            status_display: "Error de consulta",
            plan_name: "Desconocido",
            days_remaining: 0,
            days_overdue: 0,
            is_in_grace_period: false,
            grace_period_days: 0,
            renew_url: "/saas-admin/planes",
          }
        );
      } finally {
        inFlightPromise = null;
      }
    })();

    return inFlightPromise;
  }

  /**
   * Obtiene la suscripción completa y métricas de consumo de la empresa activa.
   *
   * @returns {Promise<Object>}
   */
  async function obtenerSuscripcionActual() {
    try {
      return await ApiClient.get(ENDPOINT_CURRENT);
    } catch (error) {
      console.error("[SUBSCRIPTION SERVICE] Error al obtener suscripción actual:", error);
      throw error;
    }
  }

  /**
   * Solicita el cambio o renovación del plan de la empresa.
   *
   * @param {string} planCode
   * @returns {Promise<Object>}
   */
  async function cambiarPlan(planCode) {
    try {
      const response = await ApiClient.post(ENDPOINT_CHANGE_PLAN, {
        plan_code: planCode,
      });
      if (response && response.success) {
        invalidarEstado();
      }
      return response;
    } catch (error) {
      console.error("[SUBSCRIPTION SERVICE] Error al cambiar plan:", error);
      throw error;
    }
  }

  return Object.freeze({
    obtenerEstadoSuscripcion,
    obtenerSuscripcionActual,
    cambiarPlan,
    invalidarEstado,
  });
})();

export default SubscriptionService;
