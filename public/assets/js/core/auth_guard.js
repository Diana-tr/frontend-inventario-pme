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
import SecurityManager from "./security.js";

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

  /**
   * Verifica que el usuario esté autenticado y posea el permiso requerido.
   * Redirige al Dashboard si no tiene permiso (o mostrar 403).
   * @param {string} permissionCode
   */
  async function requirePermission(permissionCode) {
    const authenticated = await requireAuth();
    if (!authenticated) return false;

    if (!SecurityManager.hasPermission(permissionCode)) {
      console.warn(`[AUTH GUARD] Acceso denegado: requiere ${permissionCode}`);
      redirectToHome(); // Alternativa: redirigir a una página 403
      return false;
    }

    return true;
  }

  return {
    requireAuth,
    requireGuest,
    requirePermission,
    redirectToLogin,
    redirectToHome,
  };
})();

export default AuthGuard;
