import ApiClient from "../core/apiClient.js";

const ClienteService = (() => {
  const CLIENTES_ENDPOINT = "/api/v1/customers/";
  let _clientesCache = null;

  function invalidarCache() {
    _clientesCache = null;
  }

  // Listar todos los clientes (con caché en memoria para POS y formularios de ventas).
  async function listarClientes(forceRefresh = false) {
    try {
      if (!forceRefresh && _clientesCache) {
        return _clientesCache;
      }
      const response = await ApiClient.get(CLIENTES_ENDPOINT);
      if (response && response.ok && response.success) {
        _clientesCache = response;
      }
      return response;
    } catch (error) {
      console.error("[CLIENTE SERVICE] Error al listar clientes:", error);
      throw error;
    }
  }

  /**
   * Lista clientes con parámetros de paginación server-side.
   * @param {Object} params - { page, page_size, search, ordering }
   */
  async function listarClientesPaginados(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);

      const queryString = query.toString();
      const url = queryString
        ? `${CLIENTES_ENDPOINT}?${queryString}`
        : CLIENTES_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error("[CLIENTE SERVICE] Error al listar clientes paginados:", error);
      throw error;
    }
  }

  // Obtener detalles de un cliente por ID.
  async function obtenerClientePorId(id) {
    try {
      return await ApiClient.get(`${CLIENTES_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[CLIENTE SERVICE] Error al obtener cliente ${id}:`, error);
      throw error;
    }
  }

  // Crear un cliente.
  async function crearCliente(clienteData) {
    try {
      const response = await ApiClient.post(CLIENTES_ENDPOINT, clienteData);
      invalidarCache();
      return response;
    } catch (error) {
      console.error("[CLIENTE SERVICE] Error al crear cliente:", error);
      throw error;
    }
  }

  // Actualizar parcialmente un cliente (PATCH).
  async function actualizarCliente(id, clienteData) {
    try {
      const response = await ApiClient.patch(`${CLIENTES_ENDPOINT}${id}/`, clienteData);
      invalidarCache();
      return response;
    } catch (error) {
      console.error(
        `[CLIENTE SERVICE] Error al actualizar (PATCH) cliente ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Alternar estado activo/inactivo (DELETE lógico)
  async function cambiarEstadoCliente(id, is_active) {
    try {
      const response = await ApiClient.patch(`${CLIENTES_ENDPOINT}${id}/`, {
        is_active: is_active,
      });
      invalidarCache();
      return response;
    } catch (error) {
      console.error(
        `[CLIENTE SERVICE] Error al cambiar estado del cliente ${id}:`,
        error,
      );
      throw error;
    }
  }

  return Object.freeze({
    listarClientes,
    listarClientesPaginados,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    cambiarEstadoCliente,
    invalidarCache,
  });
})();

export default ClienteService;
