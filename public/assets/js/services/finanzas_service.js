/**
 * ============================================================
 * Inventario PME
 * Finanzas & Tesorería Service
 * ============================================================
 *
 * Cliente de servicio para el módulo de Finanzas corporativas.
 * Comunica con /api/v1/finance/ en Django REST Framework.
 */

import ApiClient from "../core/apiClient.js";

const FinanzasService = (() => {
  const BASE_ENDPOINT = "/api/v1/finance";

  // ───────────────────────────────────────────
  // DASHBOARD DE TESORERÍA
  // ───────────────────────────────────────────
  async function obtenerDashboard(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.period) query.set("period", params.period);
      if (params.start_date) query.set("start_date", params.start_date);
      if (params.end_date) query.set("end_date", params.end_date);
      if (params.company_id) query.set("company_id", params.company_id);

      const qs = query.toString();
      const url = qs
        ? `${BASE_ENDPOINT}/dashboard/summary/?${qs}`
        : `${BASE_ENDPOINT}/dashboard/summary/`;
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[FINANZAS SERVICE] Error al obtener dashboard:", error);
      throw error;
    }
  }

  // ───────────────────────────────────────────
  // CUENTAS FINANCIERAS
  // ───────────────────────────────────────────
  async function listarCuentas(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      query.set("page_size", params.page_size || 100);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);
      if (params.account_type) query.set("account_type", params.account_type);
      if (params.include_deleted !== undefined) query.set("include_deleted", params.include_deleted);
      if (params.is_active !== undefined) query.set("is_active", params.is_active);

      const qs = query.toString();
      const url = qs
        ? `${BASE_ENDPOINT}/accounts/?${qs}`
        : `${BASE_ENDPOINT}/accounts/`;
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[FINANZAS SERVICE] Error al listar cuentas:", error);
      throw error;
    }
  }

  async function obtenerCuentaPorId(id) {
    try {
      return await ApiClient.get(`${BASE_ENDPOINT}/accounts/${id}/`);
    } catch (error) {
      console.error(`[FINANZAS SERVICE] Error al obtener cuenta #${id}:`, error);
      throw error;
    }
  }

  async function crearCuenta(data) {
    try {
      return await ApiClient.post(`${BASE_ENDPOINT}/accounts/`, data);
    } catch (error) {
      console.error("[FINANZAS SERVICE] Error al crear cuenta:", error);
      throw error;
    }
  }

  async function actualizarCuenta(id, data) {
    try {
      return await ApiClient.put(`${BASE_ENDPOINT}/accounts/${id}/`, data);
    } catch (error) {
      console.error(`[FINANZAS SERVICE] Error al actualizar cuenta #${id}:`, error);
      throw error;
    }
  }

  async function desactivarCuenta(id) {
    try {
      return await ApiClient.delete(`${BASE_ENDPOINT}/accounts/${id}/`);
    } catch (error) {
      console.error(`[FINANZAS SERVICE] Error al desactivar cuenta #${id}:`, error);
      throw error;
    }
  }

  async function restaurarCuenta(id) {
    try {
      return await ApiClient.post(`${BASE_ENDPOINT}/accounts/${id}/restore/`);
    } catch (error) {
      console.error(`[FINANZAS SERVICE] Error al restaurar cuenta #${id}:`, error);
      throw error;
    }
  }

  // ───────────────────────────────────────────
  // CATEGORÍAS FINANCIERAS
  // ───────────────────────────────────────────
  async function listarCategorias(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.category_type) query.set("category_type", params.category_type);
      if (params.search) query.set("search", params.search);

      const qs = query.toString();
      const url = qs
        ? `${BASE_ENDPOINT}/categories/?${qs}`
        : `${BASE_ENDPOINT}/categories/`;
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[FINANZAS SERVICE] Error al listar categorías:", error);
      throw error;
    }
  }

  async function crearCategoria(data) {
    try {
      return await ApiClient.post(`${BASE_ENDPOINT}/categories/`, data);
    } catch (error) {
      console.error("[FINANZAS SERVICE] Error al crear categoría:", error);
      throw error;
    }
  }

  // ───────────────────────────────────────────
  // MOVIMIENTOS FINANCIEROS (INGRESOS / EGRESOS)
  // ───────────────────────────────────────────
  async function listarMovimientos(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      query.set("page_size", params.page_size || 100);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);
      if (params.account_id) query.set("account_id", params.account_id);
      if (params.movement_type) query.set("movement_type", params.movement_type);
      if (params.category_id) query.set("category_id", params.category_id);
      if (params.status) query.set("status", params.status);
      if (params.start_date) query.set("start_date", params.start_date);
      if (params.end_date) query.set("end_date", params.end_date);

      const qs = query.toString();
      const url = qs
        ? `${BASE_ENDPOINT}/movements/?${qs}`
        : `${BASE_ENDPOINT}/movements/`;
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[FINANZAS SERVICE] Error al listar movimientos:", error);
      throw error;
    }
  }

  async function obtenerMovimientoPorId(id) {
    try {
      return await ApiClient.get(`${BASE_ENDPOINT}/movements/${id}/`);
    } catch (error) {
      console.error(`[FINANZAS SERVICE] Error al obtener movimiento #${id}:`, error);
      throw error;
    }
  }

  async function registrarMovimiento(data) {
    try {
      return await ApiClient.post(`${BASE_ENDPOINT}/movements/`, data);
    } catch (error) {
      console.error("[FINANZAS SERVICE] Error al registrar movimiento:", error);
      throw error;
    }
  }

  async function reversarMovimiento(id, reason) {
    try {
      return await ApiClient.post(`${BASE_ENDPOINT}/movements/${id}/reverse/`, {
        reason: reason || "Reverso administrativo",
      });
    } catch (error) {
      console.error(`[FINANZAS SERVICE] Error al reversar movimiento #${id}:`, error);
      throw error;
    }
  }

  // ───────────────────────────────────────────
  // TRANSFERENCIAS ENTRE CUENTAS
  // ───────────────────────────────────────────
  async function listarTransferencias(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      query.set("page_size", params.page_size || 100);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);
      if (params.source_account_id) query.set("source_account_id", params.source_account_id);
      if (params.destination_account_id) query.set("destination_account_id", params.destination_account_id);
      if (params.status) query.set("status", params.status);
      if (params.start_date) query.set("start_date", params.start_date);
      if (params.end_date) query.set("end_date", params.end_date);

      const qs = query.toString();
      const url = qs
        ? `${BASE_ENDPOINT}/transfers/?${qs}`
        : `${BASE_ENDPOINT}/transfers/`;
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[FINANZAS SERVICE] Error al listar transferencias:", error);
      throw error;
    }
  }

  async function ejecutarTransferencia(data) {
    try {
      return await ApiClient.post(`${BASE_ENDPOINT}/transfers/`, data);
    } catch (error) {
      console.error("[FINANZAS SERVICE] Error al ejecutar transferencia:", error);
      throw error;
    }
  }

  async function cancelarTransferencia(id, reason) {
    try {
      return await ApiClient.post(`${BASE_ENDPOINT}/transfers/${id}/cancel/`, {
        reason: reason || "Cancelación de transferencia",
      });
    } catch (error) {
      console.error(`[FINANZAS SERVICE] Error al cancelar transferencia #${id}:`, error);
      throw error;
    }
  }

  // ───────────────────────────────────────────
  // CONCILIACIONES FINANCIERAS
  // ───────────────────────────────────────────
  async function listarConciliaciones(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      query.set("page_size", params.page_size || 100);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);
      if (params.account_id) query.set("account_id", params.account_id);
      if (params.status) query.set("status", params.status);

      const qs = query.toString();
      const url = qs
        ? `${BASE_ENDPOINT}/reconciliations/?${qs}`
        : `${BASE_ENDPOINT}/reconciliations/`;
      return await ApiClient.get(url);
    } catch (error) {
      console.error("[FINANZAS SERVICE] Error al listar conciliaciones:", error);
      throw error;
    }
  }

  async function iniciarConciliacion(data) {
    try {
      return await ApiClient.post(`${BASE_ENDPOINT}/reconciliations/`, data);
    } catch (error) {
      console.error("[FINANZAS SERVICE] Error al iniciar conciliación:", error);
      throw error;
    }
  }

  async function cerrarConciliacion(id) {
    try {
      return await ApiClient.post(`${BASE_ENDPOINT}/reconciliations/${id}/close/`);
    } catch (error) {
      console.error(`[FINANZAS SERVICE] Error al cerrar conciliación #${id}:`, error);
      throw error;
    }
  }

  return Object.freeze({
    obtenerDashboard,
    listarCuentas,
    obtenerCuentaPorId,
    crearCuenta,
    actualizarCuenta,
    desactivarCuenta,
    restaurarCuenta,
    listarCategorias,
    crearCategoria,
    listarMovimientos,
    obtenerMovimientoPorId,
    registrarMovimiento,
    reversarMovimiento,
    listarTransferencias,
    ejecutarTransferencia,
    cancelarTransferencia,
    listarConciliaciones,
    iniciarConciliacion,
    cerrarConciliacion,
  });
})();

export default FinanzasService;
