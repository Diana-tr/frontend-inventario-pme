import ApiClient from "../core/apiClient.js";

const UsuarioService = (() => {
  const USERS_ENDPOINT = "/api/v1/users/";

  //Listar los usuarios.
  async function listarUsuarios() {
    try {
      return await ApiClient.get(USERS_ENDPOINT);
    } catch (error) {
      console.error("[USUARIO SERVICE] Error al listar usuarios:", error);

      throw error;
    }
  }

  /**
   * Lista usuarios con parámetros de paginación server-side.
   * @param {Object} params - { page, page_size, search, ordering }
   */
  async function listarUsuariosPaginados(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);

      const queryString = query.toString();
      const url = queryString
        ? `${USERS_ENDPOINT}?${queryString}`
        : USERS_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error("[USUARIO SERVICE] Error al listar usuarios paginados:", error);
      throw error;
    }
  }

  //Obtener detalles de usuarios por ID.
  async function obtenerUsuarioPorId(id) {
    try {
      return await ApiClient.get(`${USERS_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[USUARIO SERVICE] Error al obtener usuario ${id}:`, error);
      throw error;
    }
  }

  //Crear un usuario.
  async function crearUsuario(userData) {
    try {
      return await ApiClient.post(USERS_ENDPOINT, userData);
    } catch (error) {
      console.error("[USUARIO SERVICE] Error al crear usuario:", error);

      throw error;
    }
  }

  // Actualizar parcialmente un usuario (PATCH)
  async function actualizarUsuario(id, userData) {
    try {
      return await ApiClient.patch(`${USERS_ENDPOINT}${id}/`, userData);
    } catch (error) {
      console.error(
        `[USUARIO SERVICE] Error al actualizar (PATCH) usuario ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Reemplazar completamente un usuario (PUT)
  async function reemplazarUsuario(id, userData) {
    try {
      return await ApiClient.put(`${USERS_ENDPOINT}${id}/`, userData);
    } catch (error) {
      console.error(
        `[USUARIO SERVICE] Error al reemplazar (PUT) usuario ${id}:`,
        error,
      );
      throw error;
    }
  }

  return Object.freeze({
    listarUsuarios,
    listarUsuariosPaginados,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
  });
})();

export default UsuarioService;
