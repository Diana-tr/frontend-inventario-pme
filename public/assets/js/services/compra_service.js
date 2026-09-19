import ApiClient from "../core/apiClient.js";

const CompraService = (() => {
  const PURCHASES_ENDPOINT = "/api/v1/purchases/";
  const INVOICES_ENDPOINT = "/api/v1/invoices/";

  // Listar compras con parámetros de paginación server-side.
  async function listarComprasPaginadas(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);

      const queryString = query.toString();
      const url = queryString
        ? `${PURCHASES_ENDPOINT}?${queryString}`
        : PURCHASES_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error("[COMPRA SERVICE] Error al listar compras paginadas:", error);
      throw error;
    }
  }

  // Obtener detalles de una compra por ID.
  async function obtenerCompraPorId(id) {
    try {
      return await ApiClient.get(`${PURCHASES_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[COMPRA SERVICE] Error al obtener compra ${id}:`, error);
      throw error;
    }
  }

  // Crear una compra.
  async function crearCompra(compraData) {
    try {
      return await ApiClient.post(PURCHASES_ENDPOINT, compraData);
    } catch (error) {
      console.error("[COMPRA SERVICE] Error al crear compra:", error);
      throw error;
    }
  }

  // Confirmar compra (DRAFT -> PENDING)
  async function confirmarCompra(id) {
    try {
      return await ApiClient.post(`${PURCHASES_ENDPOINT}${id}/confirm/`);
    } catch (error) {
      console.error(`[COMPRA SERVICE] Error al confirmar compra ${id}:`, error);
      throw error;
    }
  }

  // Recibir compra (PENDING -> RECEIVED) - Afecta stock
  async function recibirCompra(id) {
    try {
      return await ApiClient.post(`${PURCHASES_ENDPOINT}${id}/receive/`);
    } catch (error) {
      console.error(`[COMPRA SERVICE] Error al recibir compra ${id}:`, error);
      throw error;
    }
  }

  // Completar compra (RECEIVED -> COMPLETED)
  async function completarCompra(id) {
    try {
      return await ApiClient.post(`${PURCHASES_ENDPOINT}${id}/complete/`);
    } catch (error) {
      console.error(`[COMPRA SERVICE] Error al completar compra ${id}:`, error);
      throw error;
    }
  }

  // Cancelar compra
  async function cancelarCompra(id) {
    try {
      return await ApiClient.post(`${PURCHASES_ENDPOINT}${id}/cancel/`);
    } catch (error) {
      console.error(`[COMPRA SERVICE] Error al cancelar compra ${id}:`, error);
      throw error;
    }
  }

  // Facturas
  async function obtenerFacturasPorCompra(purchaseId) {
    try {
      return await ApiClient.get(`${INVOICES_ENDPOINT}?purchase=${purchaseId}`);
    } catch (error) {
      console.error(`[COMPRA SERVICE] Error al obtener facturas de la compra ${purchaseId}:`, error);
      throw error;
    }
  }

  async function obtenerFacturaPorId(invoiceId) {
    try {
      return await ApiClient.get(`${INVOICES_ENDPOINT}${invoiceId}/`);
    } catch (error) {
      console.error(`[COMPRA SERVICE] Error al obtener factura ${invoiceId}:`, error);
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
      if (params.document_type) query.set("document_type", params.document_type);

      const queryString = query.toString();
      const url = queryString
        ? `${INVOICES_ENDPOINT}?${queryString}`
        : INVOICES_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error("[COMPRA SERVICE] Error al listar facturas paginadas:", error);
      throw error;
    }
  }

  return Object.freeze({
    listarComprasPaginadas,
    obtenerCompraPorId,
    crearCompra,
    confirmarCompra,
    recibirCompra,
    completarCompra,
    cancelarCompra,
    obtenerFacturasPorCompra,
    obtenerFacturaPorId,
    listarFacturasPaginadas
  });
})();

export default CompraService;
