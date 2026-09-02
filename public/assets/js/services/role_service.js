import ApiClient from "../core/apiClient.js";

const RoleService = (() => {
  const ROLES_ENDPOINT = "/api/v1/roles/";

  // Listar todos los roles.
  async function listarRoles() {
    try {
      return await ApiClient.get(ROLES_ENDPOINT);
    } catch (error) {
      console.error("[ROLE SERVICE] Error al listar roles:", error);
      throw error;
    }
  }

  /**
   * Lista roles con parámetros de paginación server-side.
   * @param {Object} params - { page, page_size, search, ordering }
   */
  async function listarRolesPaginados(params = {}) {
    try {
      const query = new URLSearchParams();

      if (params.page) query.set("page", params.page);
      if (params.page_size) query.set("page_size", params.page_size);
      if (params.search) query.set("search", params.search);
      if (params.ordering) query.set("ordering", params.ordering);

      const queryString = query.toString();
      const url = queryString
        ? `${ROLES_ENDPOINT}?${queryString}`
        : ROLES_ENDPOINT;

      return await ApiClient.get(url);
    } catch (error) {
      console.error("[ROLE SERVICE] Error al listar roles paginados:", error);
      throw error;
    }
  }

  // Obtener detalles de un rol por ID.
  async function obtenerRolPorId(id) {
    try {
      return await ApiClient.get(`${ROLES_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[ROLE SERVICE] Error al obtener rol ${id}:`, error);
      throw error;
    }
  }

  // Crear un rol.
  async function crearRol(roleData) {
    try {
      return await ApiClient.post(ROLES_ENDPOINT, roleData);
    } catch (error) {
      console.error("[ROLE SERVICE] Error al crear rol:", error);
      throw error;
    }
  }

  // Actualizar parcialmente un rol (PATCH).
  async function actualizarRol(id, roleData) {
    try {
      return await ApiClient.patch(`${ROLES_ENDPOINT}${id}/`, roleData);
    } catch (error) {
      console.error(
        `[ROLE SERVICE] Error al actualizar (PATCH) rol ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Desactivar un rol (DELETE lógico).
  async function desactivarRol(id) {
    try {
      return await ApiClient.delete(`${ROLES_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`[ROLE SERVICE] Error al desactivar rol ${id}:`, error);
      throw error;
    }
  }

  // Obtener catálogo de permisos dinámicos desde backend
  async function obtenerCatalogoPermisos() {
    try {
      return await ApiClient.get("/api/v1/security/permissions/");
    } catch (error) {
      console.error("[ROLE SERVICE] Error al obtener catálogo de permisos:", error);
      throw error;
    }
  }

  return Object.freeze({
    listarRoles,
    listarRolesPaginados,
    obtenerRolPorId,
    crearRol,
    actualizarRol,
    desactivarRol,
    obtenerCatalogoPermisos,
  });
})();

export default RoleService;
