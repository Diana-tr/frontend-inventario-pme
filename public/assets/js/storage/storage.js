/**
 * @fileoverview
 * Administrador centralizado del almacenamiento del ERP.
 *
 * Responsable únicamente de persistir información
 * relacionada con la sesión del usuario.
 */

const Storage = (() => {
  const KEYS = Object.freeze({
    ACCESS_TOKEN: "inventariopme_access_token",
    REFRESH_TOKEN: "inventariopme_refresh_token",
    USER: "inventariopme_user",
    PERMISSIONS: "inventariopme_permissions",
    ACTIONS: "inventariopme_actions",
    ROLES: "inventariopme_roles",
    CONTRACTED_MODULES: "inventariopme_contracted_modules",
    ACTIVE_COMPANY_ID: "inventariopme_active_company_id",
    ACTIVE_COMPANY: "inventariopme_active_company",
    USER_COMPANIES: "inventariopme_user_companies",
  });

  /* ===========================
       Helpers privados
    =========================== */

  const save = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const read = (key) => {
    const value = localStorage.getItem(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  /* ===========================
       Tokens
    =========================== */

  const saveTokens = (accessToken, refreshToken) => {
    localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  };

  const getAccessToken = () => {
    return localStorage.getItem(KEYS.ACCESS_TOKEN);
  };

  const getRefreshToken = () => {
    return localStorage.getItem(KEYS.REFRESH_TOKEN);
  };

  const hasAccessToken = () => {
    return !!getAccessToken();
  };

  /* ===========================
       Usuario
    =========================== */

  const saveUser = (user) => {
    save(KEYS.USER, user);
  };

  const getUser = () => {
    return read(KEYS.USER);
  };

  /* ===========================
       Permisos y Acciones
    =========================== */

  const savePermissions = (permissions) => {
    save(KEYS.PERMISSIONS, permissions);
  };

  const getPermissions = () => {
    return read(KEYS.PERMISSIONS) || {};
  };

  const saveActions = (actions) => {
    save(KEYS.ACTIONS, actions);
  };

  const getActions = () => {
    return read(KEYS.ACTIONS) || {};
  };

  const saveRoles = (roles) => {
    save(KEYS.ROLES, roles);
  };

  const getRoles = () => {
    return read(KEYS.ROLES) || [];
  };

  /* ===========================
       Módulos Contratados (Plan)
    =========================== */

  const saveContractedModules = (modules) => {
    save(KEYS.CONTRACTED_MODULES, modules);
  };

  const getContractedModules = () => {
    return read(KEYS.CONTRACTED_MODULES);
  };

  /* ===========================
       Multiempresa / Tenants
    =========================== */

  const saveActiveCompanyId = (companyId) => {
    if (companyId === null || companyId === undefined || companyId === "null" || companyId === "undefined" || companyId === "") {
      localStorage.removeItem(KEYS.ACTIVE_COMPANY_ID);
    } else {
      localStorage.setItem(KEYS.ACTIVE_COMPANY_ID, String(companyId));
    }
  };

  const getActiveCompanyId = () => {
    const val = localStorage.getItem(KEYS.ACTIVE_COMPANY_ID);
    if (!val || val === "null" || val === "undefined" || val === "") {
      return null;
    }
    return val;
  };

  const saveActiveCompany = (company) => {
    save(KEYS.ACTIVE_COMPANY, company);
  };

  const getActiveCompany = () => {
    return read(KEYS.ACTIVE_COMPANY);
  };

  const saveUserCompanies = (companies) => {
    save(KEYS.USER_COMPANIES, companies);
  };

  const getUserCompanies = () => {
    return read(KEYS.USER_COMPANIES) || [];
  };

  /* ===========================
       Gestión Segura de Impersonación
    =========================== */

  const IMPERSONATION_BACKUP_KEY = "inventariopme_admin_backup";

  const saveImpersonationBackup = (backup) => {
    try {
      sessionStorage.setItem(IMPERSONATION_BACKUP_KEY, JSON.stringify(backup));
      sessionStorage.setItem("is_impersonating", "true");
      sessionStorage.setItem("impersonating_company_name", backup.company_name || "");
      sessionStorage.setItem("impersonating_company_id", String(backup.company_id || ""));
    } catch (e) {
      console.error("[STORAGE] Fallo al guardar backup de impersonación:", e);
    }
  };

  const getImpersonationBackup = () => {
    try {
      const data = sessionStorage.getItem(IMPERSONATION_BACKUP_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const isImpersonating = () => {
    return sessionStorage.getItem("is_impersonating") === "true";
  };

  const restoreFromImpersonation = () => {
    const backup = getImpersonationBackup();
    if (!backup || !backup.admin_access_token) {
      console.warn("[STORAGE] Backup de impersonación inexistente o inválido. Purgando sesión...");
      clear();
      return false;
    }

    try {
      // 1. Restaurar tokens del Superadmin
      localStorage.setItem(KEYS.ACCESS_TOKEN, backup.admin_access_token);
      if (backup.admin_refresh_token && backup.admin_refresh_token !== "null") {
        localStorage.setItem(KEYS.REFRESH_TOKEN, backup.admin_refresh_token);
      } else {
        localStorage.removeItem(KEYS.REFRESH_TOKEN);
      }

      // 2. Restaurar usuario admin
      if (backup.admin_user) {
        saveUser(backup.admin_user);
      } else {
        localStorage.removeItem(KEYS.USER);
      }

      // 3. Restaurar roles y permisos
      if (backup.admin_roles) {
        saveRoles(backup.admin_roles);
      } else {
        localStorage.removeItem(KEYS.ROLES);
      }
      if (backup.admin_permissions) {
        savePermissions(backup.admin_permissions);
      } else {
        localStorage.removeItem(KEYS.PERMISSIONS);
      }

      // 4. Limpiar contexto de empresa cliente
      localStorage.removeItem(KEYS.ACTIVE_COMPANY_ID);
      localStorage.removeItem(KEYS.ACTIVE_COMPANY);
      localStorage.removeItem(KEYS.USER_COMPANIES);

      // 5. Limpiar caché de sesión de soporte
      sessionStorage.removeItem("inventariopme_security_context");
      sessionStorage.removeItem("is_impersonating");
      sessionStorage.removeItem("impersonating_company_name");
      sessionStorage.removeItem("impersonating_company_id");
      sessionStorage.removeItem(IMPERSONATION_BACKUP_KEY);

      return true;
    } catch (e) {
      console.error("[STORAGE] Error restaurando sesión de Superadmin:", e);
      clear();
      return false;
    }
  };

  /* ===========================
       Limpieza
    =========================== */

  const clear = () => {
    Object.values(KEYS).forEach(localStorage.removeItem.bind(localStorage));
    try {
      sessionStorage.clear();
    } catch {
      // Entornos donde sessionStorage no esté disponible
    }
  };

  return Object.freeze({
    saveTokens,
    getAccessToken,
    getRefreshToken,
    hasAccessToken,

    saveUser,
    getUser,

    savePermissions,
    getPermissions,

    saveActions,
    getActions,

    saveRoles,
    getRoles,

    saveContractedModules,
    getContractedModules,

    saveActiveCompanyId,
    getActiveCompanyId,
    saveActiveCompany,
    getActiveCompany,
    saveUserCompanies,
    getUserCompanies,

    saveImpersonationBackup,
    getImpersonationBackup,
    isImpersonating,
    restoreFromImpersonation,

    clear,
  });
})();

export default Storage;
