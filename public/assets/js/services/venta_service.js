import ApiClient from "../core/apiClient.js";

const VentaService = (() => {
  const SALES_ENDPOINT = "/api/v1/sales/";

  // Listar ventas con parámetros de paginación server-side.
  async function listarVentasPaginadas(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);

      const queryString = query.toString();
      const url = queryString
        ? `${SALES_ENDPOINT}?${queryString}`
        : SALES_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error("[VENTA SERVICE] Error al listar ventas paginadas:", error);
      throw error;
    }
  }

  // Obtener detalles de una venta por ID.
  async function obtenerVentaPorId(id) {
    try {
      return await ApiClient.get(`${SALES_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[VENTA SERVICE] Error al obtener venta ${id}:`, error);
      throw error;
    }
  }

  // Crear una nueva venta.
  async function crearVenta(ventaData) {
    try {
      return await ApiClient.post(SALES_ENDPOINT, ventaData);
    } catch (error) {
      console.error("[VENTA SERVICE] Error al crear venta:", error);
      throw error;
    }
  }

  // Actualizar una venta (PUT completo).
  async function actualizarVenta(id, ventaData) {
    try {
      return await ApiClient.put(`${SALES_ENDPOINT}${id}/`, ventaData);
    } catch (error) {
      console.error(`[VENTA SERVICE] Error al actualizar venta ${id}:`, error);
      throw error;
    }
  }

  // Actualizar parcialmente una venta (PATCH).
  async function actualizarParcialVenta(id, ventaData) {
    try {
      return await ApiClient.patch(`${SALES_ENDPOINT}${id}/`, ventaData);
    } catch (error) {
      console.error(
        `[VENTA SERVICE] Error al actualizar parcialmente venta ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Desactivar una venta.
  async function desactivarVenta(id) {
    try {
      return await ApiClient.delete(`${SALES_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[VENTA SERVICE] Error al desactivar venta ${id}:`, error);
      throw error;
    }
  }

  // Cancelar venta (Acción personalizada del backend).
  async function cancelarVenta(id) {
    try {
      return await ApiClient.post(`${SALES_ENDPOINT}${id}/cancel/`);
    } catch (error) {
      console.error(`[VENTA SERVICE] Error al cancelar venta ${id}:`, error);
      throw error;
    }
  }

  // Completar venta (Acción personalizada del backend).
  async function completarVenta(id) {
    try {
      return await ApiClient.post(`${SALES_ENDPOINT}${id}/complete/`);
    } catch (error) {
      console.error(`[VENTA SERVICE] Error al completar venta ${id}:`, error);
      throw error;
    }
  }

  // Restaurar venta (Acción personalizada del backend).
  async function restaurarVenta(id) {
    try {
      return await ApiClient.post(`${SALES_ENDPOINT}${id}/restore/`);
    } catch (error) {
      console.error(`[VENTA SERVICE] Error al restaurar venta ${id}:`, error);
      throw error;
    }
  }

  // Facturas
  async function obtenerFacturasPorVentas(saleId) {
    try {
      return await ApiClient.get(`${SALES_ENDPOINT}?purchase=${saleId}`);
    } catch (error) {
      console.error(
        `[VENTA SERVICE] Error al obtener facturas de la venta ${ventaId}:`,
        error,
      );
      throw error;
    }
  }

  async function obtenerFacturaPorId(saleId) {
    try {
      return await ApiClient.get(`${SALES_ENDPOINT}${saleId}/`);
    } catch (error) {
      console.error(
        `[SALE SERVICE] Error al obtener factura ${saleId}:`,
        error,
      );
      throw error;
    }
  }

  async function listarFacturasPaginadas(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);
      if (params.document_type)
        query.set("document_type", params.document_type);

      const queryString = query.toString();
      const url = queryString
        ? `${SALES_ENDPOINT}?${queryString}`
        : SALES_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error(
        "[COMPRA SERVICE] Error al listar facturas paginadas:",
        error,
      );
      throw error;
    }
  }

  return Object.freeze({
    listarVentasPaginadas,
    obtenerVentaPorId,
    crearVenta,
    actualizarVenta,
    actualizarParcialVenta,
    desactivarVenta,
    cancelarVenta,
    completarVenta,
    restaurarVenta,
    obtenerFacturasPorVentas,
    obtenerFacturaPorId,
    listarFacturasPaginadas,
  });
})();

export default VentaService;
