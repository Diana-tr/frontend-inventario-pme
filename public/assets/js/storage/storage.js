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

    saveActiveCompanyId,
    getActiveCompanyId,
    saveActiveCompany,
    getActiveCompany,
    saveUserCompanies,
    getUserCompanies,

    clear,
  });
})();

export default Storage;
