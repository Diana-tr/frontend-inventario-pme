/**
 * ============================================================
 * Inventario PME
 * App
 * ============================================================
 *
 * Bootstrap principal de la aplicación.
 *
 * Punto único de entrada del frontend.
 *
 * Responsabilidades:
 * - Inicializar la aplicación.
 * - Detectar la página actual.
 * - Inicializar los controladores necesarios.
 *
 * No contiene lógica de:
 * - Autenticación.
 * - HTTP.
 * - JWT.
 * - LocalStorage.
 * - Carga de dashboard.
 * - Carga de navegación.
 * - Carga de contexto de seguridad.
 * ============================================================
 */

import Config from "../config/config.js";
import LoginController from "../controllers/auth/login_controller.js";
import LogoutController from "../controllers/auth/logout_controller.js";

const App = (() => {
  /**
   * Inicializa la aplicación.
   *
   * @returns {Promise<void>}
   */
  async function bootstrap() {
    try {
      console.log("[APP] Aplicación iniciada.");

      const currentPath = window.location.pathname;

      console.log("[APP] Página:", currentPath);

      const basePath = Config.BASE_PATH;
      const loginPath = `${basePath}${Config.LOGIN_PATH}`;

      /**
       * Entrada principal.
       *
       * /frontend-inventario-pme/
       *
       * Redirige al login.
       */
      if (currentPath === `${basePath}/`) {
        window.location.replace(loginPath);

        return;
      }

      /**
       * Página de login.
       */
      if (currentPath === loginPath) {
        LoginController.init();

        return;
      }

      /**
       * Páginas autenticadas.
       *
       * El Sidebar ya existe en el HTML/PHP cuando
       * llegamos aquí.
       */
      LogoutController.init();

      console.log("[APP] Controladores inicializados.");
    } catch (error) {
      console.error("[APP] Error durante la inicialización:", error);
    }
  }

  return Object.freeze({
    bootstrap,
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  App.bootstrap();
});

export default App;
