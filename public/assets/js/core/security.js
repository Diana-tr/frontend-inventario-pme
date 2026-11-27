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
import Config from "../config/config.js";

const SecurityManager = (() => {

  /**
   * Determina si la empresa activa se encuentra en MODO DE SOLO LECTURA.
   * Aplica cuando la suscripción ha expirado, está cancelada o no autoriza escritura.
   * Regla de negocio: Los permisos administrativos no anulan el bloqueo por suscripción vencida.
   * @returns {boolean}
   */
  const isReadOnlyMode = () => {
    // Si estamos en entorno SaaS Admin, no aplica el modo lectura de inquilinos
    if (typeof window !== "undefined" && window.location.pathname.includes("saas-admin")) {
      return false;
    }

    const subStatus = Storage.getSubscriptionStatus();
    if (!subStatus) return false;

    return subStatus.is_read_only === true || subStatus.can_write === false;
  };

  /**
   * Indica si la empresa activa tiene autorización operativa para realizar escrituras.
   * @returns {boolean}
   */
  const canWrite = () => {
    return !isReadOnlyMode();
  };

  /**
   * Muestra un diálogo explicativo y responsive informando que la cuenta está en modo lectura
   * y ofreciendo el botón directo para renovar el plan comercial.
   * @param {string} [actionName]
   */
  const notifyReadOnlyBlocked = (actionName = "esta acción") => {
    const Swal = typeof window !== "undefined" && window.Swal ? window.Swal : null;
    const renewUrl = `${Config.BASE_PATH || ""}/saas-admin/planes`;

    if (Swal) {
      Swal.fire({
        icon: "warning",
        title: "Modo de Solo Lectura",
        html: `
          <div class="text-left" style="font-size: 0.95rem;">
            <p class="mb-2">La suscripción de tu empresa se encuentra <strong>vencida</strong>. La cuenta está operando en <strong>modo de solo lectura</strong>.</p>
            <p class="text-muted small mb-0"><i class="fas fa-lock mr-1 text-warning"></i> No es posible realizar operaciones de escritura (${actionName}) hasta que se renueve o regularice el plan de suscripción.</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: "#4F46E5",
        cancelButtonColor: "#64748B",
        confirmButtonText: '<i class="fas fa-sync-alt mr-1"></i> Renovar Plan',
        cancelButtonText: "Entendido",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = renewUrl;
        }
      });
    } else if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert("Tu suscripción ha vencido. Tu cuenta está en modo de solo lectura.");
    }
  };

  let isObserverSetup = false;

  /**
   * Configura interceptores globales de eventos y observador de mutaciones del DOM
   * para proteger de manera continua elementos creados dinámicamente mediante JS o AJAX.
   */
  const setupDynamicObserver = () => {
    if (isObserverSetup || typeof window === "undefined" || !document.body) return;
    isObserverSetup = true;

    // 1. Escuchar apertura de modales de Bootstrap / AdminLTE
    if (typeof $ !== "undefined") {
      $(document).on("shown.bs.modal show.bs.modal", () => {
        processDomPermissions();
      });
    }

    // 2. MutationObserver defensivo para nuevos nodos insertados en el DOM
    let mutationThrottle = null;
    try {
      const observer = new MutationObserver((mutations) => {
        let hasAddedNodes = false;
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length > 0) {
            hasAddedNodes = true;
            break;
          }
        }
        if (hasAddedNodes) {
          if (mutationThrottle) clearTimeout(mutationThrottle);
          mutationThrottle = setTimeout(() => {
            processDomPermissions();
            mutationThrottle = null;
          }, 120);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } catch (e) {
      console.warn("[SecurityManager] MutationObserver no disponible:", e);
    }

    // 3. Interceptor en fase de captura para clics sobre elementos data-write-action
    document.addEventListener(
      "click",
      (e) => {
        if (!isReadOnlyMode()) return;

        const target = e.target.closest && e.target.closest('[data-write-action="true"]');
        if (target) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          notifyReadOnlyBlocked("crear, editar o eliminar registros");
        }
      },
      true
    );

    // 4. Interceptor en fase de captura para envíos de formularios data-write-action
    document.addEventListener(
      "submit",
      (e) => {
        if (!isReadOnlyMode()) return;

        const form =
          (e.target.closest && e.target.closest('form[data-write-action="true"]')) ||
          (e.target.hasAttribute && e.target.hasAttribute("data-write-action") ? e.target : null);

        if (form) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          notifyReadOnlyBlocked("guardar este formulario");
        }
      },
      true
    );
  };

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

    // ──────────────────────────────────────────────────────────
    // CONTROL DE MODO DE SOLO LECTURA (Suscripción Vencida)
    // ──────────────────────────────────────────────────────────
    const readOnly = isReadOnlyMode();
    const writeElements = document.querySelectorAll('[data-write-action="true"]');

    if (readOnly) {
      writeElements.forEach((el) => {
        el.setAttribute("data-read-only-locked", "true");
        el.title = "Acción no disponible: la suscripción ha vencido (modo de solo lectura).";

        if (el.tagName === "BUTTON" || el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") {
          el.disabled = true;
          el.classList.add("disabled");
        } else if (el.tagName === "A") {
          el.classList.add("disabled");
          el.style.pointerEvents = "none";
          el.style.opacity = "0.65";
          el.style.cursor = "not-allowed";
        } else if (el.tagName === "FORM") {
          // Deshabilitar botones de submit dentro del formulario
          const submitBtns = el.querySelectorAll('button[type="submit"], input[type="submit"]');
          submitBtns.forEach((btn) => {
            btn.disabled = true;
            btn.classList.add("disabled");
            btn.title = "Formulario deshabilitado en modo solo lectura.";
          });
        }
      });
    } else {
      // Restaurar elementos previamente bloqueados si la suscripción está vigente
      const lockedElements = document.querySelectorAll('[data-read-only-locked="true"]');
      lockedElements.forEach((el) => {
        el.removeAttribute("data-read-only-locked");
        if (el.getAttribute("title") && el.getAttribute("title").includes("solo lectura")) {
          el.removeAttribute("title");
        }

        if (el.tagName === "BUTTON" || el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") {
          el.disabled = false;
          el.classList.remove("disabled");
        } else if (el.tagName === "A") {
          el.classList.remove("disabled");
          el.style.pointerEvents = "";
          el.style.opacity = "";
          el.style.cursor = "";
        }
      });
    }

    // Inicializar observador dinámico en primer escaneo
    setupDynamicObserver();
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

  // Auto-inicializar observadores cuando el DOM esté listo
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupDynamicObserver);
    } else {
      setupDynamicObserver();
    }
  }

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
    isReadOnlyMode,
    canWrite,
    notifyReadOnlyBlocked,
    setupDynamicObserver,
    processDomPermissions,
    redirectIfUnauthorized,
  });
})();

export default SecurityManager;
