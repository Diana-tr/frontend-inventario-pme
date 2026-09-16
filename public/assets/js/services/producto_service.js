import ApiClient from "../core/apiClient.js";

const ProductoService = (() => {
  const PRODUCTOS_ENDPOINT = "/api/v1/products/";

  // Listar todas los productos.
  async function listarProductos() {
    try {
      return await ApiClient.get(PRODUCTOS_ENDPOINT);
    } catch (error) {
      console.error("[PRODUCTO SERVICE] Error al listar productos:", error);
      throw error;
    }
  }

  /**
   * Lista productos con parámetros de paginación server-side.
   * @param {Object} params - { page, page_size, search, ordering }
   */
  async function listarProductosPaginados(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);

      const queryString = query.toString();
      const url = queryString
        ? `${PRODUCTOS_ENDPOINT}?${queryString}`
        : PRODUCTOS_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error("[PRODUCTO SERVICE] Error al listar productos paginados:", error);
      throw error;
    }
  }

  // Obtener detalles de un producto por ID.
  async function obtenerProductoPorId(id) {
    try {
      return await ApiClient.get(`${PRODUCTOS_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[PRODUCTO SERVICE] Error al obtener producto ${id}:`, error);
      throw error;
    }
  }

  // Crear un producto.
  async function crearProducto(productoData) {
    try {
      return await ApiClient.post(PRODUCTOS_ENDPOINT, productoData);
    } catch (error) {
      console.error("[PRODUCTO SERVICE] Error al crear producto:", error);
      throw error;
    }
  }

  // Actualizar parcialmente un producto (PATCH).
  async function actualizarProducto(id, productoData) {
    try {
      return await ApiClient.patch(`${PRODUCTOS_ENDPOINT}${id}/`, productoData);
    } catch (error) {
      console.error(
        `[PRODUCTO SERVICE] Error al actualizar (PATCH) producto ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Alternar estado activo/inactivo (DELETE lógico)
  async function cambiarEstadoProducto(id, is_active) {
    try {
      return await ApiClient.patch(`${PRODUCTOS_ENDPOINT}${id}/`, {
        is_active: is_active,
      });
    } catch (error) {
      console.error(
        `[PRODUCTO SERVICE] Error al cambiar estado del producto ${id}:`,
        error,
      );
      throw error;
    }
  }

  return Object.freeze({
    listarProductos,
    listarProductosPaginados,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    cambiarEstadoProducto,
  });
})();

export default ProductoService;
