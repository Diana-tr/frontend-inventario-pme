/**
 * ============================================================
 * Inventario PME
 * Auth Guard v2 (Centralizado, Multi-Tenant & SaaS Admin)
 * ============================================================
 * Protege las páginas del sistema y controla el acceso
 * según el estado de autenticación y autorización del usuario.
 */

import SessionManager from "./session_manager.js";
import Config from "../config/config.js";
import SecurityManager from "./security.js";
import Storage from "../storage/storage.js";

const AuthGuard = (() => {
  const ERP_LOGIN_URL = `${Config.BASE_PATH || ""}${Config.LOGIN_PATH || "/"}`;
  const ERP_HOME_URL = `${Config.BASE_PATH || ""}${Config.DASHBOARD_PATH || "/dashboard"}`;
  const SAAS_LOGIN_URL = `${Config.BASE_PATH || ""}/saas-admin/login`;
  const SAAS_HOME_URL = `${Config.BASE_PATH || ""}/saas-admin/dashboard`;

  const SUPERUSER_ONLY_ROUTES = Object.freeze([
    "/saas-admin/equipo/gestionar",
    "/saas-admin/equipo/crear",
  ]);

  /**
   * Determina si la URL o el contexto actual pertenecen al panel SaaS Admin.
   * @param {string} [path]
   * @returns {boolean}
   */
  function isSaaSContext(path) {
    const target = path || (typeof window !== "undefined" ? window.location.pathname : "");
    return target.includes("/saas-admin");
  }

  /**
   * Obtiene la ruta normalizada sin el prefijo BASE_PATH ni trailing slashes.
   * @param {string} [path]
   * @returns {string}
   */
  function getNormalizedPath(path) {
    const target = path || (typeof window !== "undefined" ? window.location.pathname : "");
    const base = Config.BASE_PATH || "";
    return target.replace(base, "").replace(/\/+$/, "") || "/";
  }

  /**
   * Determina si el usuario actual cuenta con autorización administrativa para SaaS.
   * Superusuarios e integrantes del personal interno (is_staff).
   * @returns {boolean}
   */
  function isSaaSAuthorized() {
    if (!SessionManager.isAuthenticated()) return false;
    const user = Storage.getUser();
    return !!(user && (user.is_superuser || user.is_staff));
  }

  /**
   * Determina si el usuario actual es superusuario global.
   * @returns {boolean}
   */
  function isSuperuser() {
    if (!SessionManager.isAuthenticated()) return false;
    const user = Storage.getUser();
    return !!(user && user.is_superuser);
  }

  /**
   * Redirige al login correspondiente según el contexto.
   * @param {"auto"|"erp"|"saas"} [context="auto"]
   */
  function redirectToLogin(context = "auto") {
    const targetContext = context === "auto" ? (isSaaSContext() ? "saas" : "erp") : context;
    const url = targetContext === "saas" ? SAAS_LOGIN_URL : ERP_LOGIN_URL;
    window.location.replace(url);
  }

  /**
   * Redirige al dashboard de inicio correspondiente según el contexto.
   * @param {"auto"|"erp"|"saas"} [context="auto"]
   */
  function redirectToHome(context = "auto") {
    const targetContext = context === "auto" ? (isSaaSContext() ? "saas" : "erp") : context;
    const url = targetContext === "saas" ? SAAS_HOME_URL : ERP_HOME_URL;
    window.location.replace(url);
  }

  /**
   * Exige autenticación en la vista actual.
   * Si no está autenticado, redirige al login contextual sin bucles.
   * @param {"auto"|"erp"|"saas"} [context="auto"]
   * @returns {Promise<boolean>}
   */
  async function requireAuth(context = "auto") {
    const authenticated = await SessionManager.initialize();

    if (!authenticated) {
      redirectToLogin(context);
      return false;
    }

    return true;
  }

  /**
   * Exige ser invitado (no autenticado) para el acceso al login del ERP.
   * Si el usuario ya está autenticado, lo redirige a su Dashboard ERP.
   * @returns {Promise<boolean>}
   */
  async function requireGuest() {
    const authenticated = await SessionManager.initialize();

    if (authenticated) {
      redirectToHome("erp");
      return false;
    }

    return true;
  }

  /**
   * Control de acceso para el portal /saas-admin y /saas-admin/login.
   * - Si el usuario ya cuenta con sesión administrativa activa: redirige a /saas-admin/dashboard.
   * - Si es un usuario empresarial regular del ERP: se permite visualizar el formulario
   *   para iniciar sesión como admin sin destruir su sesión cliente.
   * - Si no está autenticado: permite mostrar el formulario de login.
   * @returns {Promise<boolean>}
   */
  async function requireSaaSGuest() {
    const authenticated = await SessionManager.initialize();

    if (authenticated && isSaaSAuthorized()) {
      redirectToHome("saas");
      return false;
    }

    return true;
  }

  /**
   * Exige autenticación y autorización administrativa para las rutas del SaaS Admin.
   * - Sin sesión válida: redirige a /saas-admin/login.
   * - Con sesión de cliente ERP (sin rol administrativo): deniega el acceso y redirige a /dashboard
   *   conservando la sesión del ERP.
   * - Rutas exclusivas de Superadmin: si es staff pero no superadmin, redirige a /saas-admin/dashboard.
   * @param {string} [path]
   * @returns {Promise<boolean>}
   */
  async function requireSaaSAdmin(path) {
    const authenticated = await requireAuth("saas");
    if (!authenticated) return false;

    if (!isSaaSAuthorized()) {
      console.warn("[AUTH GUARD] Acceso denegado al panel SaaS. Se requiere rol de Superadmin o Staff.");
      // Redirigir a su entorno ERP seguro sin destruir la sesión del cliente
      redirectToHome("erp");
      return false;
    }

    const normalizedPath = getNormalizedPath(path);
    if (SUPERUSER_ONLY_ROUTES.includes(normalizedPath) && !isSuperuser()) {
      console.warn(`[AUTH GUARD] La ruta "${normalizedPath}" es exclusiva del Superadministrador.`);
      redirectToHome("saas");
      return false;
    }

    return true;
  }

  /**
   * Verifica que el usuario esté autenticado y posea el permiso requerido en el ERP.
   * Redirige al Dashboard si no tiene permiso.
   * @param {string|string[]} permissionCode
   * @returns {Promise<boolean>}
   */
  async function requirePermission(permissionCode) {
    const authenticated = await requireAuth("erp");
    if (!authenticated) return false;

    const hasAccess = Array.isArray(permissionCode)
      ? SecurityManager.hasAnyPermission(permissionCode)
      : SecurityManager.hasPermission(permissionCode);

    if (!hasAccess) {
      console.warn(`[AUTH GUARD] Acceso denegado: requiere ${JSON.stringify(permissionCode)}`);
      redirectToHome("erp");
      return false;
    }

    return true;
  }

  return Object.freeze({
    isSaaSContext,
    getNormalizedPath,
    isSaaSAuthorized,
    isSuperuser,
    requireAuth,
    requireGuest,
    requireSaaSGuest,
    requireSaaSAdmin,
    requirePermission,
    redirectToLogin,
    redirectToHome,
    ERP_LOGIN_URL,
    ERP_HOME_URL,
    SAAS_LOGIN_URL,
    SAAS_HOME_URL,
  });
})();

export default AuthGuard;
