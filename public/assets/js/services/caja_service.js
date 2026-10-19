import ApiClient from "../core/apiClient.js";

const CajaService = (() => {
  const CASH_ENDPOINT = "/api/v1/cash-sessions/";
  const REGISTER_ENDPOINT = "/api/v1/cash-registers/";

  // Listar sesiones de caja (historial)
  async function listarSesiones(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      
      const queryString = query.toString();
      const url = queryString ? `${CASH_ENDPOINT}?${queryString}` : CASH_ENDPOINT;
      
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[CAJA SERVICE] Error al listar sesiones:", error);
      throw error;
    }
  }

  // Obtener sesión actual
  async function obtenerSesionActual() {
    try {
      return await ApiClient.get(`${CASH_ENDPOINT}current/`);
    } catch (error) {
      console.error("[CAJA SERVICE] Error al obtener sesión actual:", error);
      throw error;
    }
  }

  // Abrir sesión de caja
  async function abrirCaja(data) {
    try {
      return await ApiClient.post(`${CASH_ENDPOINT}open/`, data);
    } catch (error) {
      console.error("[CAJA SERVICE] Error al abrir caja:", error);
      throw error;
    }
  }

  // Cerrar sesión de caja
  async function cerrarCaja(id, data) {
    try {
      return await ApiClient.post(`${CASH_ENDPOINT}${id}/close/`, data);
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

  return Object.freeze({
    listarSesiones,
    obtenerSesionActual,
    abrirCaja,
    cerrarCaja,
    agregarMovimiento,
    listarMovimientos,
    listarCajasRegistradoras,
    crearCajaRegistradora,
  });
})();

export default CajaService;
