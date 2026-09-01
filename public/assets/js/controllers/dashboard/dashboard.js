import UsuarioService from "../../services/usuario_service.js";
import RoleService from "../../services/role_service.js";
import SecurityManager from "../../core/security.js";

const DashboardController = (() => {
  /**
   * Punto de entrada del controlador
   */
  async function init() {
    console.log("[DASHBOARD] Inicializando controlador...");

    // Cargar tarjetas condicionalmente según los permisos del usuario
    if (SecurityManager.hasPermission("users.view")) {
      await cargarTotalUsuarios();
    }

    if (SecurityManager.hasPermission("roles.view")) {
      await cargarTotalRoles();
    }
  }

  /**
   * Helper privado para extraer la cantidad total de registros de las respuestas de Django DRF
   */
  function extraerTotal(response) {
    if (!response) return 0;

    if (response.data) {
      // 1. Paginación estándar DRF (response.data.count)
      if (typeof response.data.count !== "undefined") {
        return response.data.count;
      }
      // 2. Arreglo en propiedad results (response.data.results)
      if (Array.isArray(response.data.results)) {
        return response.data.results.length;
      }
      // 3. Arreglo directo en data (response.data)
      if (Array.isArray(response.data)) {
        return response.data.length;
      }
    }

    // 4. Arreglo directo en la raíz de la respuesta
    if (Array.isArray(response)) {
      return response.length;
    }

    return 0;
  }

  /**
   * Obtiene e inyecta el total de usuarios en el DOM
   */
  async function cargarTotalUsuarios() {
    const totalUsuariosElement = document.getElementById("total_usuarios");

    if (!totalUsuariosElement) {
      console.warn(
        "[DASHBOARD] No se encontró el elemento #total_usuarios en el DOM.",
      );
      return;
    }

    try {
      const response = await UsuarioService.listarUsuarios();
      console.log("[DASHBOARD] Respuesta de usuarios recibida:", response);

      const total = extraerTotal(response);
      totalUsuariosElement.textContent = total;
    } catch (error) {
      console.error(
        "[DASHBOARD] Error al cargar la cantidad de usuarios:",
        error,
      );
      totalUsuariosElement.textContent = "0";
    }
  }

  /**
   * Obtiene e inyecta el total de roles en el DOM
   */
  async function cargarTotalRoles() {
    const totalRolesElement = document.getElementById("total_roles");

    if (!totalRolesElement) {
      console.warn(
        "[DASHBOARD] No se encontró el elemento #total_roles en el DOM.",
      );
      return;
    }

    try {
      const response = await RoleService.listarRoles();
      console.log("[DASHBOARD] Respuesta de roles recibida:", response);

      const total = extraerTotal(response);
      totalRolesElement.textContent = total;
    } catch (error) {
      console.error("[DASHBOARD] Error al cargar la cantidad de roles:", error);
      totalRolesElement.textContent = "0";
    }
  }

  return Object.freeze({
    init,
  });
})();

export default DashboardController;
