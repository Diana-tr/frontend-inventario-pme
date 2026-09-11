import ApiClient from "../core/apiClient.js";

const ProveedorService = (() => {
  const SUPPLIERS_ENDPOINT = "/api/v1/suppliers/";

  // Listar todos los Proveedores.
  async function listarProveedores() {
    try {
      return await ApiClient.get(SUPPLIERS_ENDPOINT);
    } catch (error) {
      console.error("[SUPPLIER SERVICE] Error al listar proveedores:", error);
      throw error;
    }
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
      return await ApiClient.post(SUPPLIERS_ENDPOINT, proveedorData);
    } catch (error) {
      console.error("[SUPPLIER SERVICE] Error al crear proveedor:", error);
      throw error;
    }
  }

  // Actualizar parcialmente un proveedor (PATCH).
  async function actualizarProveedor(id, supplierData) {
    try {
      return await ApiClient.patch(`${SUPPLIERS_ENDPOINT}${id}/`, supplierData);
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
      return await ApiClient.patch(`${SUPPLIERS_ENDPOINT}${id}/`, {
        is_active: is_active,
      });
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
  });
})();

export default ProveedorService;
