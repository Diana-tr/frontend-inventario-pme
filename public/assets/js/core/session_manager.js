/**
 * ============================================================
 * Inventario PME
 * Session Manager
 * ============================================================
 *
 * Se encarga de gestionar el ciclo de vida de la sesión local,
 * la inactividad del usuario y el chequeo básico de estado.
 */

import Storage from "../storage/storage.js";
import Config from "../config/config.js";
import AuthService from "../services/auth_service.js";

const SessionManager = (() => {
  let inactivityTimer = null;
  let isActive = false;

  const SESSION_IDLE_TIMEOUT = Config.SESSION_IDLE_TIMEOUT || 1800000; // 30 mins default

  /**
   * Determina si el usuario está (aparentemente) autenticado localmente.
   */
  function isAuthenticated() {
    return Storage.hasAccessToken() && !!Storage.getUser();
  }

  /**
   * Resetea el timer de inactividad.
   */
  function resetInactivityTimer() {
    if (!isAuthenticated()) return;

    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }

    inactivityTimer = setTimeout(async () => {
      console.warn("[SESSION] Sesión expirada por inactividad.");
      await forceLogout();
    }, SESSION_IDLE_TIMEOUT);
  }

  /**
   * Manejador global para la actividad del usuario (throttled).
   */
  let throttleTimeout = null;
  function handleUserActivity() {
    if (throttleTimeout) return;

    throttleTimeout = setTimeout(() => {
      resetInactivityTimer();
      throttleTimeout = null;
    }, 5000); // Throttling de 5 segundos para no asfixiar el main thread
  }

  /**
   * Empieza a monitorear la inactividad.
   */
  function startInactivityMonitor() {
    if (!isAuthenticated() || isActive) return;

    isActive = true;
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    resetInactivityTimer();
  }

  /**
   * Detiene el monitoreo de inactividad.
   */
  function stopInactivityMonitor() {
    isActive = false;
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }

    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
      window.removeEventListener(evt, handleUserActivity);
    });
  }

  /**
   * Fuerza el logout total y redirige al login.
   */
  async function forceLogout() {
    stopInactivityMonitor();
    
    try {
      // Intentamos hacer logout en el backend
      await AuthService.logout();
    } catch (e) {
      console.error("[SESSION] Fallo al invalidar sesión en el servidor:", e);
    } finally {
      // Pero SIEMPRE limpiamos local y redirigimos
      Storage.clear();
      window.location.replace(Config.BASE_PATH + Config.LOGIN_PATH);
    }
  }

  /**
   * Escucha cambios en otras pestañas (si otra pestaña hace logout).
   */
  function setupCrossTabCommunication() {
    window.addEventListener("storage", (event) => {
      // Si el access token fue eliminado desde otra pestaña
      if (event.key === "inventariopme_access_token" && !event.newValue) {
        console.warn("[SESSION] Sesión cerrada desde otra pestaña.");
        stopInactivityMonitor();
        window.location.replace(Config.BASE_PATH + Config.LOGIN_PATH);
      }
    });
  }

  /**
   * Inicializa el gestor de sesión.
   * Retorna true si hay sesión, false si no.
   */
  async function initialize() {
    const isAuth = isAuthenticated();

    if (isAuth) {
      startInactivityMonitor();
      setupCrossTabCommunication();
    }

    return isAuth;
  }

  return Object.freeze({
    isAuthenticated,
    initialize,
    forceLogout,
    startInactivityMonitor,
    stopInactivityMonitor
  });
})();

export default SessionManager;
