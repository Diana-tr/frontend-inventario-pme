import Config from "../config/config.js";
import AuthGuard from "./auth_guard.js";

const App = (() => {
  async function bootstrap() {
    try {
      console.log("[APP] Aplicación iniciada.");
      
      const currentPath = window.location.pathname;
      const basePath = Config.BASE_PATH;
      const loginPath = `${basePath}${Config.LOGIN_PATH}`;

      // Si estamos en la raíz o en una ruta sin vista real definida, forzamos redirección según auth
      if (currentPath === `${basePath}/` || currentPath === basePath) {
        await AuthGuard.requireGuest(); // si es guest, va al login. si está auth, va a dashboard.
        return;
      }

      // Si es el login, requerimos ser guest
      if (currentPath === loginPath || currentPath.includes("login")) {
        await AuthGuard.requireGuest();
        return;
      }

      // Si es cualquier otra vista (dashboard, usuarios, etc), requerimos estar logueados
      await AuthGuard.requireAuth();
      
    } catch (error) {
      console.error("[APP] Error durante la inicialización:", error);
    }
  }

  return Object.freeze({
    bootstrap,
  });
})();

export default App;
