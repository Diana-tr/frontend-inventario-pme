import Config from "../config/config.js";
import AuthGuard from "./auth_guard.js";
import SecurityManager from "./security.js";
import AuthService from "../services/auth_service.js";

const App = (() => {

  /**
   * Mapa de rutas del frontend → permiso requerido.
   * Si una ruta no aparece aquí, solo se exige autenticación.
   * Las rutas se comparan sin el BASE_PATH ni trailing slashes.
   */
  const ROUTE_PERMISSIONS = Object.freeze({
    "/usuarios":        "users.view",
    "/usuarios/listar": "users.view",
    "/usuarios/crear":  "users.create",
    "/roles":           "roles.view",
    "/roles/listar":    "roles.view",
    "/roles/crear":     "roles.create",
  });

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
      const authenticated = await AuthGuard.requireAuth();
      if (!authenticated) return;

      // ─── FASE CRÍTICA: Refrescar permisos desde el backend ───
      // Siempre descarga los permisos reales del usuario desde la BD
      // para evitar que use información obsoleta de localStorage.
      await AuthService.fetchSecurityContext();

      // ─── Verificación de permiso por ruta ───
      const normalizedPath = currentPath
        .replace(basePath, "")
        .replace(/\/+$/, "") || "/dashboard";

      const requiredPermission = ROUTE_PERMISSIONS[normalizedPath];

      if (requiredPermission && !SecurityManager.hasPermission(requiredPermission)) {
        console.warn(
          `[APP] Acceso denegado a "${normalizedPath}": requiere "${requiredPermission}".`
        );
        AuthGuard.redirectToHome();
        return;
      }

      // Procesar permisos en la vista (Ocultar botones, widgets, etc.)
      SecurityManager.processDomPermissions();
      
      // ─── Manejo de 403 Global ───
      window.addEventListener("security_forbidden", async () => {
        console.warn("[APP] Evento 403 Forbidden interceptado. Refrescando contexto...");
        
        // 1. Refrescamos el contexto (limpia caché local y trae lo nuevo)
        await AuthService.fetchSecurityContext(true); // asumiendo que fuerza refresh
        
        // 2. Volvemos a procesar permisos en la vista actual
        SecurityManager.processDomPermissions();
        
        // 3. Opcional: Verificamos si seguimos teniendo permiso en la vista actual
        const reqPerm = ROUTE_PERMISSIONS[normalizedPath];
        if (reqPerm && !SecurityManager.hasPermission(reqPerm)) {
          alert("Tus permisos han cambiado y ya no tienes acceso a esta vista.");
          AuthGuard.redirectToHome();
        } else {
          // No lo expulsamos, pero le avisamos (o podemos omitir alert si es muy molesto)
          console.warn("[APP] Vista actual sobrevive al 403, UI actualizada.");
        }
      });
      
    } catch (error) {
      console.error("[APP] Error durante la inicialización:", error);
    }
  }

  return Object.freeze({
    bootstrap,
  });
})();

export default App;
