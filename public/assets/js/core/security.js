/**
 * ============================================================
 * Inventario PME
 * Security Manager
 * ============================================================
 *
 * Módulo para verificar permisos de usuario de forma sincrónica.
 * 
 * Este módulo depende de que los permisos ya estén cargados
 * en el Storage.
 */

import Storage from "../storage/storage.js";
import Routes from "./routes.js";

const SecurityManager = (() => {

  /**
   * Obtiene los permisos efectivos desde el Storage.
   * @returns {Object} Diccionario { "module.action": true } o anidado
   */
  const getPermissions = () => {
    return Storage.getPermissions() || {};
  };

  /**
   * Obtiene las acciones efectivas desde el Storage.
   * @returns {Object} Diccionario anidado { module: { action: true } }
   */
  const getActions = () => {
    return Storage.getActions() || {};
  };

  /**
   * Verifica si el usuario tiene una acción granular específica.
   * Soporta sintaxis (module, action) o ("module.action").
   * @param {string} module
   * @param {string} [action]
   * @returns {boolean}
   */
  const hasAction = (module, action = null) => {
    // 0. Bypass autorizado para Superusuario
    const user = Storage.getUser();
    if (user && user.is_superuser) {
      return true;
    }

    if (!module) return false;

    const actions = getActions();
    if (!actions) return false;

    if (!action && typeof module === "string" && module.includes(".")) {
      const parts = module.split(".");
      module = parts[0];
      action = parts[1];
    }

    if (!action) return false;

    // Buscar si existe directamente como llave plana
    if (actions[`${module}.${action}`] === true) return true;

    // Buscar jerárquicamente
    return actions[module]?.[action] === true;
  };

  /**
   * Verifica si el usuario tiene un permiso específico o acción granular.
   * Soporta sintaxis plana o anidada, ej. "users.view", "users.export".
   * @param {string} permissionCode
   * @returns {boolean}
   */
  const hasPermission = (permissionCode) => {
    if (!permissionCode) return false;

    // 0. Bypass autorizado para Superusuario
    const user = Storage.getUser();
    if (user && user.is_superuser) {
      return true;
    }

    // 1. Buscar en permisos CRUD
    const permissions = getPermissions();
    if (permissions) {
      if (permissions[permissionCode] === true) return true;

      const parts = permissionCode.split(".");
      let current = permissions;
      for (const part of parts) {
        if (!current || typeof current !== "object" || !(part in current)) {
          current = null;
          break;
        }
        current = current[part];
      }
      if (current === true) return true;
    }

    // 2. Buscar en acciones granulares (ej: "users.export")
    if (hasAction(permissionCode)) return true;

    return false;
  };

  /**
   * Verifica si el usuario tiene autorización para exportar datos en un módulo.
   * @param {string} moduleName - Identificador del módulo (ej. "users", "roles", "products", etc.)
   * @returns {boolean}
   */
  const canExport = (moduleName) => {
    if (!moduleName) return false;
    return hasPermission(`${moduleName}.export`) || hasAction(moduleName, "export");
  };

  /**
   * Verifica si el usuario tiene AL MENOS UNO de los permisos solicitados.
   * @param {string[]} permissionCodes - Array de códigos
   * @returns {boolean}
   */
  const hasAnyPermission = (permissionCodes) => {
    return permissionCodes.some((code) => hasPermission(code));
  };

  /**
   * Verifica si el usuario tiene TODOS los permisos solicitados.
   * @param {string[]} permissionCodes - Array de códigos
   * @returns {boolean}
   */
  const hasAllPermissions = (permissionCodes) => {
    return permissionCodes.every((code) => hasPermission(code));
  };

  /**
   * Obtiene la lista de módulos contratados por el plan de la empresa activa.
   * @returns {string[]|null}
   */
  const getContractedModules = () => {
    return Storage.getContractedModules();
  };

  /**
   * Verifica si un módulo está contratado en el plan de la empresa activa.
   * Soporta retrocompatibilidad (si no hay lista explícita, se permite por defecto).
   * @param {string} moduleCode
   * @returns {boolean}
   */
  const isModuleContracted = (moduleCode) => {
    if (!moduleCode) return true;
    const user = Storage.getUser();
    if (user && (user.is_superuser || user.is_staff)) return true;

    const contracted = getContractedModules();
    if (!contracted || !Array.isArray(contracted)) return true;

    let canonical = moduleCode.toLowerCase().trim();
    if (canonical === "clients") canonical = "customers";
    if (canonical === "stock") canonical = "inventory";

    return contracted.includes(canonical);
  };

  /**
   * Escanea el DOM y muestra/oculta los elementos según
   * el permiso que requieren (atributo data-permission).
   * 
   * Elementos con permiso → se restauran (display = "").
   * Elementos sin permiso → se ocultan (display = "none").
   */
  const processDomPermissions = () => {
    // Procesar elementos con un solo permiso requerido
    const elements = document.querySelectorAll("[data-permission]");
    elements.forEach((el) => {
      const required = el.getAttribute("data-permission");
      if (required && hasPermission(required)) {
        el.style.display = ""; // Restaurar visibilidad
      } else {
        el.style.display = "none"; // Ocultar
      }
    });

    // Procesar elementos que requieren AL MENOS UNO de varios permisos
    const anyElements = document.querySelectorAll("[data-permission-any]");
    anyElements.forEach((el) => {
      const codes = el.getAttribute("data-permission-any");
      if (!codes) {
        el.style.display = "none";
        return;
      }
      const permissionList = codes.split(",").map((c) => c.trim()).filter(Boolean);
      if (hasAnyPermission(permissionList)) {
        el.style.display = "";
      } else {
        el.style.display = "none";
      }
    });

    // Procesar elementos condicionados explícitamente por módulo contratado
    const moduleElements = document.querySelectorAll("[data-module]");
    moduleElements.forEach((el) => {
      const mod = el.getAttribute("data-module");
      if (mod && !isModuleContracted(mod)) {
        el.style.display = "none";
      }
    });

    // Colapsar cabeceras o contenedores de menú padre si todos sus submódulos están ocultos
    const menuParents = document.querySelectorAll(".nav-sidebar li.nav-item");
    menuParents.forEach((parent) => {
      const treeview = parent.querySelector(":scope > ul.nav-treeview");
      if (treeview) {
        const children = treeview.querySelectorAll(":scope > li.nav-item");
        if (children.length > 0) {
          const hasVisibleChild = Array.from(children).some((child) => child.style.display !== "none");
          if (!hasVisibleChild) {
            parent.style.display = "none";
          }
        }
      }
    });
  };

  /**
   * Redirige al dashboard si el usuario no tiene el permiso dado.
   * Úsalo al inicio de las páginas que requieren permisos específicos.
   * @param {string} [permissionCode] - Si se omite, solo verifica autenticación.
   * @param {string} [redirectTo]     - Ruta destino. Por defecto el dashboard.
   */
  const redirectIfUnauthorized = (permissionCode = null, redirectTo = "/ventas/listar") => {
    const isUnauthorized = permissionCode
      ? !hasPermission(permissionCode)
      : false;

    if (isUnauthorized) {
      console.warn(`[SecurityManager] Acceso denegado: permiso '${permissionCode}' requerido. Redirigiendo...`);
      Routes.go(redirectTo);
    }
  };

  return Object.freeze({
    getPermissions,
    getActions,
    getContractedModules,
    isModuleContracted,
    hasPermission,
    hasAction,
    canExport,
    hasAnyPermission,
    hasAllPermissions,
    processDomPermissions,
    redirectIfUnauthorized,
  });
})();

export default SecurityManager;
