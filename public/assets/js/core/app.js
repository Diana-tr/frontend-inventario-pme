/* ============================================================
 * Inventario PME
 * App
 * ============================================================
 *
 * Bootstrap principal de la aplicación.
 *
 * Punto único de entrada del frontend.
 *
 * Responsabilidades:
 *  - Inicializar la aplicación.
 *  - Detectar la página actual.
 *  - Inicializar los controladores necesarios.
 *
 * No contiene lógica de:
 *  - Autenticación.
 *  - HTTP.
 *  - JWT.
 *  - LocalStorage.
 *  - Carga de dashboard.
 *  - Carga de navegación.
 *  - Carga de contexto de seguridad.
 * ============================================================
 */

import Config from "../config/config.js";
import LoginController from "../controllers/auth/login_controller.js";

const App = (() => {
  /**
   * Inicializa la aplicación.
   *
   * @returns {Promise<void>}
   */
  async function bootstrap() {
    try {
      console.log("APP INICIADA");

      const currentPath = window.location.pathname;

      console.log("[APP] Página:", currentPath);

      const basePath = Config.BASE_PATH;
      const loginPath = `${basePath}${Config.LOGIN_PATH}`;

      /**
       * Entrada principal del sistema.
       *
       * Si el usuario entra directamente a:
       *
       * /frontend-inventario-pme/
       *
       * lo enviamos al login.
       */
      if (currentPath === `${basePath}/`) {
        window.location.replace(loginPath);

        return;
      }

      /**
       * Página de login.
       */
      if (currentPath === loginPath || currentPath.includes("index.php") || window.location.search.includes("route=login")) {
        LoginController.init();

        return;
      }

      console.warn("[APP] Página no reconocida:", currentPath);
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