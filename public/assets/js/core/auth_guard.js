/**
 * ============================================================
 * Inventario PME
 * Auth Guard
 * ============================================================
 * Protege las páginas del sistema y controla el acceso
 * según el estado de autenticación del usuario.
 */

import SessionManager from "./session_manager.js";
import Config from "../config/config.js";

const AuthGuard = (() => {
  const LOGIN_URL = Config.BASE_PATH + Config.LOGIN_PATH;
  const HOME_URL = Config.BASE_PATH + Config.DASHBOARD_PATH;

  function redirectToLogin() {
    window.location.replace(LOGIN_URL);
  }

  function redirectToHome() {
    window.location.replace(HOME_URL);
  }

  async function requireAuth() {
    const authenticated = await SessionManager.initialize();

    if (!authenticated) {
      redirectToLogin();
      return false;
    }

    return true;
  }

  async function requireGuest() {
    const authenticated = await SessionManager.initialize();

    if (authenticated) {
      redirectToHome();
      return false;
    }

    return true;
  }

  return {
    requireAuth,
    requireGuest,
    redirectToLogin,
    redirectToHome,
  };
})();

export default AuthGuard;
