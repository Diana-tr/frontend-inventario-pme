import ApiClient from "../core/apiClient.js";

const CajaService = (() => {
  const CASH_ENDPOINT = "/api/v1/cash-sessions/";
  const REGISTER_ENDPOINT = "/api/v1/cash-registers/";

  // Listar sesiones de caja (historial) con paginación server-side
  async function listarSesiones(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);
      
      const queryString = query.toString();
      const url = queryString ? `${CASH_ENDPOINT}?${queryString}` : CASH_ENDPOINT;
      
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[CAJA SERVICE] Error al listar sesiones:", error);
      throw error;
    }
  }

  let cachedCurrentSession = null;
  let lastFetchTime = 0;
  const CACHE_TTL_MS = 30000; // 30 segundos de micro-cache para navegación fluida

  function invalidarSesionActual() {
    cachedCurrentSession = null;
    lastFetchTime = 0;
  }

  // Obtener sesión actual con micro-cache para evitar ráfagas al navegar
  async function obtenerSesionActual(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && cachedCurrentSession !== null && (now - lastFetchTime) < CACHE_TTL_MS) {
      return cachedCurrentSession;
    }

    try {
      const response = await ApiClient.get(`${CASH_ENDPOINT}current/`);
      // Guardar en cache únicamente estados legítimos de negocio: 200 (abierta) o 404 (cerrada)
      // Evita almacenar en caché fallos de red (0), timeouts (408) o errores del servidor (500)
      if (response && (response.status === 200 || response.status === 404)) {
        cachedCurrentSession = response;
        lastFetchTime = now;
      }
      return response;
    } catch (error) {
      console.error("[CAJA SERVICE] Error al obtener sesión actual:", error);
      throw error;
    }
  }

  // Abrir sesión de caja
  async function abrirCaja(data) {
    try {
      const res = await ApiClient.post(`${CASH_ENDPOINT}open/`, data);
      invalidarSesionActual();
      window.dispatchEvent(new CustomEvent("cash_session_updated"));
      return res;
    } catch (error) {
      console.error("[CAJA SERVICE] Error al abrir caja:", error);
      throw error;
    }
  }

  // Cerrar sesión de caja
  async function cerrarCaja(id, data) {
    try {
      const res = await ApiClient.post(`${CASH_ENDPOINT}${id}/close/`, data);
      invalidarSesionActual();
      window.dispatchEvent(new CustomEvent("cash_session_updated"));
      return res;
    } catch (error) {
      console.error("[CAJA SERVICE] Error al cerrar caja:", error);
      throw error;
    }
  }

  // Agregar movimiento manual a la sesión
  async function agregarMovimiento(sessionId, data) {
    try {
      return await ApiClient.post(`${CASH_ENDPOINT}${sessionId}/movements/`, data);
    } catch (error) {
      console.error("[CAJA SERVICE] Error al agregar movimiento:", error);
      throw error;
    }
  }

  // Listar movimientos de una sesión
  async function listarMovimientos(sessionId) {
    try {
      return await ApiClient.get(`${CASH_ENDPOINT}${sessionId}/movements/list/`);
    } catch (error) {
      console.error("[CAJA SERVICE] Error al listar movimientos:", error);
      throw error;
    }
  }

  // Obtener cajas registradoras (si aplica)
  async function listarCajasRegistradoras() {
    try {
      return await ApiClient.get(REGISTER_ENDPOINT);
    } catch (error) {
      console.error("[CAJA SERVICE] Error al listar cajas registradoras:", error);
      throw error;
    }
  }

  // Crear caja registradora
  async function crearCajaRegistradora(data) {
    try {
      return await ApiClient.post(REGISTER_ENDPOINT, data);
    } catch (error) {
      console.error("[CAJA SERVICE] Error al crear caja registradora:", error);
      throw error;
    }
  }

  // Obtener último saldo de cierre para arrastre de saldo (carry-over)
  async function obtenerUltimoSaldoCierre(cashRegisterId) {
    try {
      return await ApiClient.get(`${CASH_ENDPOINT}last-closing-balance/?cash_register_id=${cashRegisterId}`);
    } catch (error) {
      console.error("[CAJA SERVICE] Error al obtener último saldo de cierre:", error);
      throw error;
    }
  }

  // Obtener resumen detallado de auditoría de una sesión
  async function obtenerResumenAuditoria(sessionId) {
    try {
      return await ApiClient.get(`${CASH_ENDPOINT}${sessionId}/audit-summary/`);
    } catch (error) {
      console.error("[CAJA SERVICE] Error al obtener resumen de auditoría:", error);
      throw error;
    }
  }

  // Obtener resumen financiero global
  async function obtenerResumenFinanciero() {
    try {
      return await ApiClient.get(`${CASH_ENDPOINT}financial-summary/`);
    } catch (error) {
      console.error("[CAJA SERVICE] Error al obtener resumen financiero:", error);
      throw error;
    }
  }

  return Object.freeze({
    listarSesiones,
    obtenerSesionActual,
    invalidarSesionActual,
    abrirCaja,
    cerrarCaja,
    agregarMovimiento,
    listarMovimientos,
    listarCajasRegistradoras,
    crearCajaRegistradora,
    obtenerUltimoSaldoCierre,
    obtenerResumenAuditoria,
    obtenerResumenFinanciero,
  });
})();

export default CajaService;
