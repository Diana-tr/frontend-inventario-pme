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

      /**
       * Primero notificamos al backend.
       */
      const response = await AuthService.logout();

      console.log("[LOGOUT] Respuesta backend:", response);

      /**
       * Independientemente de la respuesta del backend,
       * limpiamos la sesión local.
       *
       * Esto evita dejar al usuario con tokens inválidos
       * almacenados.
       */
      Storage.clear();

      console.log("[LOGOUT] Sesión local eliminada.");

      /**
       * Redirigimos al login.
       */
      const loginPath = Config.BASE_PATH + Config.LOGIN_PATH;

      window.location.replace(loginPath);
    } catch (error) {
      console.error("[LOGOUT] Error durante el cierre de sesión:", error);

      /**
       * Incluso ante un error de red, eliminamos
       * las credenciales locales.
       */
      Storage.clear();

      const loginPath = Config.BASE_PATH + Config.LOGIN_PATH;

      window.location.replace(loginPath);
    }
  }

  /**
   * Inicializa el controlador.
   *
   * @returns {void}
   */
  function init() {
    const logoutButton = document.querySelector("#logout-btn");

    if (!logoutButton) {
      console.warn("[LOGOUT] No se encontró #logout-btn.");

      return;
    }

    logoutButton.addEventListener("click", handleLogout);

    console.log("[LOGOUT] Controlador inicializado.");
  }

  return Object.freeze({
    init,
    handleLogout,
  });
})();

export default LogoutController;
