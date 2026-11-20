import Config from "../config/config.js";
import AuthGuard from "./auth_guard.js";
import SecurityManager from "./security.js";
import AuthService from "../services/auth_service.js";
import NotificationService from "./notification.js";
import SidebarController from "../controllers/sidebar/sidebar_controller.js";
import VersionController from "../controllers/version/version_controller.js";
import Storage from "../storage/storage.js";

const App = (() => {
  let isBootstrapped = false;
  let bootstrapPromise = null;

  /**
   * Mapa de rutas del frontend → permiso requerido.
   * Si una ruta no aparece aquí, solo se exige autenticación.
   * Las rutas se comparan sin el BASE_PATH ni trailing slashes.
   */
  const ROUTE_PERMISSIONS = Object.freeze({
    "/usuarios":               "users.view",
    "/usuarios/listar":        "users.view",
    "/usuarios/crear":         "users.create",
    "/roles":                  "roles.view",
    "/roles/listar":           "roles.view",
    "/roles/crear":            "roles.create",
    "/categorias":             "categories.view",
    "/categorias/listar":      "categories.view",
    "/categorias/crear":       "categories.create",
    "/clientes":               "customers.view",
    "/clientes/listar":        "customers.view",
    "/clientes/crear":         "customers.create",
    "/proveedores":            "suppliers.view",
    "/proveedores/listar":     "suppliers.view",
    "/proveedores/crear":      "suppliers.create",
    "/productos":              "products.view",
    "/productos/listar":       "products.view",
    "/productos/crear":        "products.create",
    "/inventario":             "inventory.view",
    "/inventario/listar":      "inventory.view",
    "/inventario/crear":       "inventory.create",
    "/inventario/movimientos": "inventory.view",
    "/compras":                "purchases.view",
    "/compras/listar":         "purchases.view",
    "/compras/crear":          "purchases.create",
    "/compras/facturas":       "purchases.view",
    "/ventas":                 "sales.view",
    "/ventas/listar":          "sales.view",
    "/ventas/crear":           "sales.create",
    "/ventas/pos":             "sales.create",
    "/ventas/facturas":        "sales.view",
    "/caja":                   "cash.view",
    "/caja/historial":         "cash.view",
    "/caja/crear":             "cash.create",
    "/finanzas":               "finance.view",
    "/configuracion":          ["settings.view", "roles.view"],
    "/configuracion/versiones": ["settings.view", "roles.view"],
  });

  async function _executeBootstrap() {
    try {
      console.log("[APP] Aplicación iniciada.");

      const currentPath = window.location.pathname;
      const normalizedPath = AuthGuard.getNormalizedPath(currentPath);
      const isSaaSRoute = normalizedPath.startsWith("/saas-admin");
      const isSaaSLoginRoute =
        normalizedPath === "/saas-admin" ||
        normalizedPath === "/saas-admin/login" ||
        normalizedPath === "/saas-admin/login.php";
      const isERPLoginRoute =
        normalizedPath === "/" ||
        normalizedPath === "/login" ||
        normalizedPath === "/index.php";

      // ─── 1. Control de Rutas de Login / Guest ───
      if (isSaaSLoginRoute) {
        const canProceed = await AuthGuard.requireSaaSGuest();
        if (!canProceed) return false;
        isBootstrapped = true;
        return true;
      }

      if (isERPLoginRoute) {
        const canProceed = await AuthGuard.requireGuest();
        if (!canProceed) return false;
        isBootstrapped = true;
        return true;
      }

      // ─── 2. Control de Rutas Protegidas de SaaS Admin ───
      if (isSaaSRoute) {
        const authorized = await AuthGuard.requireSaaSAdmin(normalizedPath);
        if (!authorized) return false;

        // Inicializar VersionController para el footer y permisos DOM en SaaS
        VersionController.init();
        SecurityManager.processDomPermissions();
        isBootstrapped = true;
        return true;
      }

      // ─── 3. Control de Rutas Protegidas del ERP ───
      const authenticated = await AuthGuard.requireAuth("erp");
      if (!authenticated) return false;

      // ─── Refrescar permisos desde el backend (con caché de sessionStorage) ───
      await AuthService.fetchSecurityContext(false);

      const user = Storage.getUser();

      // Mostrar botón en el navbar del ERP solo si es superadmin o staff
      if (user && (user.is_superuser || user.is_staff)) {
        const saasAdminBtn = document.getElementById("nav-item-saas-admin");
        if (saasAdminBtn) {
          saasAdminBtn.classList.remove("d-none");
        }
      }

      // ─── Verificación de módulo contratado por ruta en el ERP ───
      const ROUTE_TO_MODULE = {
        "/usuarios": "users",
        "/roles": "roles",
        "/categorias": "categories",
        "/clientes": "customers",
        "/proveedores": "suppliers",
        "/productos": "products",
        "/inventario": "inventory",
        "/compras": "purchases",
        "/ventas": "sales",
        "/caja": "cash",
        "/finanzas": "finance",
      };

      for (const [routePrefix, moduleCode] of Object.entries(ROUTE_TO_MODULE)) {
        if (normalizedPath === routePrefix || normalizedPath.startsWith(routePrefix + "/")) {
          if (!SecurityManager.isModuleContracted(moduleCode)) {
            console.warn(
              `[APP] Módulo "${moduleCode}" no contratado en el plan de la empresa. Redirigiendo...`
            );
            AuthGuard.redirectToHome("erp");
            return false;
          }
          break;
        }
      }

      // ─── Verificación de permiso por ruta en el ERP ───
      const requiredPermission = ROUTE_PERMISSIONS[normalizedPath];

      if (requiredPermission) {
        const hasAccess = Array.isArray(requiredPermission)
          ? SecurityManager.hasAnyPermission(requiredPermission)
          : SecurityManager.hasPermission(requiredPermission);

        if (!hasAccess) {
          console.warn(
            `[APP] Acceso denegado a "${normalizedPath}": requiere "${requiredPermission}".`
          );
          AuthGuard.redirectToHome("erp");
          return false;
        }
      }

      // Procesar permisos en la vista (Ocultar botones, widgets, etc.)
      SecurityManager.processDomPermissions();

      // Inicializar SidebarController del ERP
      SidebarController.init();

      // Inicializar VersionController
      VersionController.init();

      // ─── Manejo de Cambio de Empresa Multi-Tenant (Registrado una única vez) ───
      window.addEventListener("company_changed", async (event) => {
        console.log("[APP] Evento company_changed detectado:", event.detail);
        await AuthService.fetchSecurityContext(true);
        SecurityManager.processDomPermissions();
      });

      // ─── Manejo de 403 Global (Registrado una única vez) ───
      window.addEventListener("security_forbidden", async () => {
        console.warn("[APP] Evento 403 Forbidden interceptado. Refrescando contexto...");

        // 1. Refrescamos el contexto (limpia caché local y trae lo nuevo)
        await AuthService.fetchSecurityContext(true);

        // 2. Volvemos a procesar permisos en la vista actual
        SecurityManager.processDomPermissions();

        // 3. Verificamos si seguimos teniendo permiso en la vista actual
        const reqPerm = ROUTE_PERMISSIONS[normalizedPath];
        if (reqPerm && !SecurityManager.hasPermission(reqPerm)) {
          await NotificationService.warning(
            "Tus permisos han cambiado y ya no tienes acceso a esta vista.",
            "Acceso restringido"
          );
          AuthGuard.redirectToHome();
        } else {
          console.warn("[APP] Vista actual sobrevive al 403, UI actualizada.");
        }
      });

      isBootstrapped = true;
      return true;
    } catch (error) {
      console.error("[APP] Error durante la inicialización:", error);
      return false;
    }
  }

  /**
   * Inicializa la aplicación de manera idempotente.
   * Si ya fue ejecutado o está en proceso de ejecución, reutiliza la misma promesa.
   * @returns {Promise<boolean>}
   */
  async function bootstrap() {
    if (isBootstrapped) {
      return true;
    }
    if (bootstrapPromise) {
      return bootstrapPromise;
    }

    bootstrapPromise = _executeBootstrap().finally(() => {
      bootstrapPromise = null;
    });

    return bootstrapPromise;
  }

  return Object.freeze({
    bootstrap,
  });
})();

export default App;
