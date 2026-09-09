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

const SecurityManager = (() => {

  /**
   * Obtiene los permisos efectivos desde el Storage.
   * @returns {Object} Diccionario { "module.action": true }
   */
  const getPermissions = () => {
    return Storage.getPermissions() || {};
  };

  /**
   * Verifica si el usuario tiene un permiso específico.
   * Soporta sintaxis plana o anidada, ej. "users.view".
   * @param {string} permissionCode
   * @returns {boolean}
   */
  const hasPermission = (permissionCode) => {
    const permissions = getPermissions();
    if (!permissions) return false;

    // Buscar si existe directamente como llave plana
    if (permissions[permissionCode] === true) return true;

    // Buscar jerárquicamente
    const parts = permissionCode.split(".");
    let current = permissions;
    for (const part of parts) {
      if (!current || typeof current !== "object" || !(part in current)) {
        return false;
      }
      current = current[part];
    }
    
    return current === true;
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
  };

  return Object.freeze({
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    processDomPermissions,
  });
})();

export default SecurityManager;
