/**
 * ============================================================
 * Inventario PME
 * Auth Guard
 * ------------------------------------------------------------
 * Protege las páginas del sistema y controla el acceso
 * según el estado de autenticación del usuario.
 *
 * Responsabilidades:
 *  - Proteger rutas privadas.
 *  - Proteger rutas públicas (login).
 *  - Inicializar la sesión.
 *
 * No contiene lógica de autenticación,
 * permisos ni comunicación HTTP.
 * ============================================================
 */

const AuthGuard = (() => {
  /**
   * Página de login.
   */
  const LOGIN_URL = "login.php";

  /**
   * Página principal del ERP.
   */
  const HOME_URL = "index.php";

  /**
   * Redirecciona al login.
   */
  function redirectToLogin() {
    window.location.replace(LOGIN_URL);
  }

  /**
   * Redirecciona al dashboard.
   */
  function redirectToHome() {
    window.location.replace(HOME_URL);
  }

  /**
   * Protege una página privada.
   *
   * Ej:
   * dashboard.php
   * usuarios/index.php
   * productos/index.php
   */
  async function requireAuth() {
    const authenticated = await SessionManager.initialize();

    if (!authenticated) {
      redirectToLogin();
      return false;
    }

    return true;
  }

  /**
   * Impide acceder al login
   * si ya existe una sesión válida.
   */
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
