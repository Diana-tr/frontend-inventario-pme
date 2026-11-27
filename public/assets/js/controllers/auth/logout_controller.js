/**
 * ============================================================
 * Inventario PME
 * Logout Controller
 * ============================================================
 *
 * Responsabilidades:
 * - Detectar el botón de cerrar sesión.
 * - Solicitar el cierre de sesión al AuthService.
 * - Limpiar la sesión local.
 * - Redirigir al login.
 *
 * No contiene lógica HTTP.
 * ============================================================
 */

import AuthService from "../../services/auth_service.js";
import Config from "../../config/config.js";
import Storage from "../../storage/storage.js";

const LogoutController = (() => {
  /**
   * Maneja el cierre de sesión.
   *
   * @param {Event} event
   * @returns {Promise<void>}
   */
  async function handleLogout(event) {
    event.preventDefault();

    try {
      console.log("[LOGOUT] Cerrando sesión...");

      if (Storage.isImpersonating()) {
        console.log("[LOGOUT] Finalizando sesión de soporte técnico...");
        const restored = Storage.restoreFromImpersonation();
        if (!restored) {
          Storage.clear();
          window.location.replace(`${Config.BASE_PATH}/saas-admin/login`);
          return;
        }
        window.location.replace(`${Config.BASE_PATH}/saas-admin/dashboard`);
        return;
      }

      /**
       * Primero notificamos al backend.
       */
      const response = await AuthService.logout();
      console.log("[LOGOUT] Respuesta backend:", response);

      /**
       * Independientemente de la respuesta del backend,
       * limpiamos la sesión local.
       */
      Storage.clear();
      sessionStorage.removeItem("inventariopme_security_context");

      console.log("[LOGOUT] Sesión local eliminada.");

      const isSaaS = typeof window !== "undefined" && window.location.pathname.includes("saas-admin");
      const loginPath = isSaaS
        ? `${Config.BASE_PATH}/saas-admin/login`
        : `${Config.BASE_PATH}${Config.LOGIN_PATH}`;

      window.location.replace(loginPath);
    } catch (error) {
      console.error("[LOGOUT] Error durante el cierre de sesión:", error);

      if (Storage.isImpersonating()) {
        const restored = Storage.restoreFromImpersonation();
        if (!restored) {
          Storage.clear();
          window.location.replace(`${Config.BASE_PATH}/saas-admin/login`);
          return;
        }
        window.location.replace(`${Config.BASE_PATH}/saas-admin/dashboard`);
        return;
      }

      Storage.clear();
      sessionStorage.removeItem("inventariopme_security_context");

      const isSaaS = typeof window !== "undefined" && window.location.pathname.includes("saas-admin");
      const loginPath = isSaaS
        ? `${Config.BASE_PATH}/saas-admin/login`
        : `${Config.BASE_PATH}${Config.LOGIN_PATH}`;

      window.location.replace(loginPath);
    }
  }

  let isInitialized = false;

  /**
   * Inicializa el controlador.
   *
   * @returns {void}
   */
  function init() {
    if (isInitialized) return;

    const logoutButton = document.querySelector("#logout-btn");

    if (!logoutButton) {
      return;
    }

    isInitialized = true;
    logoutButton.addEventListener("click", handleLogout);
  }

  return Object.freeze({
    init,
    handleLogout,
  });
})();

export default LogoutController;
