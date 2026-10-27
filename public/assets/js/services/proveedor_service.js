import ApiClient from "../core/apiClient.js";

const ProveedorService = (() => {
  const SUPPLIERS_ENDPOINT = "/api/v1/suppliers/";

  let cachedProveedores = null;

  // Listar todos los Proveedores con cache en memoria cliente para evitar peticiones repetidas.
  async function listarProveedores(forceRefresh = false) {
    if (cachedProveedores && !forceRefresh) {
      return cachedProveedores;
    }
    try {
      const response = await ApiClient.get(SUPPLIERS_ENDPOINT);
      if (response && response.success) {
        cachedProveedores = response;
      }
      return response;
    } catch (error) {
      console.error("[SUPPLIER SERVICE] Error al listar proveedores:", error);
      throw error;
    }
  }

  function invalidarCache() {
    cachedProveedores = null;
  }

  /**
   * Lista proveedores con parámetros de paginación server-side.
   * @param {Object} params - { page, page_size, search, ordering }
   */
  async function listarProveedoresPaginados(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);

      const queryString = query.toString();
      const url = queryString
        ? `${SUPPLIERS_ENDPOINT}?${queryString}`
        : SUPPLIERS_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error(
        "[SUPPLIER SERVICE] Error al listar proveedores paginados:",
        error,
      );
      throw error;
    }
  }

  // Obtener detalles de un proveedor  por ID.
  async function obtenerProveedorPorId(id) {
    try {
      return await ApiClient.get(`${SUPPLIERS_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(
        `[SUPPLIER SERVICE] Error al obtener proveedor ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Crear una categoria.
  async function crearProveedor(proveedorData) {
    try {
      const res = await ApiClient.post(SUPPLIERS_ENDPOINT, proveedorData);
      invalidarCache();
      return res;
    } catch (error) {
      console.error("[SUPPLIER SERVICE] Error al crear proveedor:", error);
      throw error;
    }
  }

  // Actualizar parcialmente un proveedor (PATCH).
  async function actualizarProveedor(id, supplierData) {
    try {
      const res = await ApiClient.patch(`${SUPPLIERS_ENDPOINT}${id}/`, supplierData);
      invalidarCache();
      return res;
    } catch (error) {
      console.error(
        `[SUPPLIER SERVICE] Error al actualizar (PATCH) supplier ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Alternar estado activo/inactivo (DELETE lógico)
  async function cambiarEstadoProveedor(id, is_active) {
    try {
      const res = await ApiClient.patch(`${SUPPLIERS_ENDPOINT}${id}/`, {
        is_active: is_active,
      });
      invalidarCache();
      return res;
    } catch (error) {
      console.error(
        `[SUPPLIER SERVICE] Error al cambiar estado del proveedor ${id}:`,
        error,
      );
      throw error;
    }
  }

  return Object.freeze({
    listarProveedores,
    listarProveedoresPaginados,
    obtenerProveedorPorId,
    crearProveedor,
    actualizarProveedor,
    cambiarEstadoProveedor,
    invalidarCache,
  });
})();

export default ProveedorService;
