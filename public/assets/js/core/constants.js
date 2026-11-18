/**
 * @fileoverview Constantes globales de ERP P.M.E.
 * Centraliza los valores compartidos por toda la aplicación.
 */

const Constants = Object.freeze({
  HTTP: Object.freeze({
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
  }),

  EVENTS: Object.freeze({
    LOGIN: "auth:login",
    LOGOUT: "auth:logout",
    SESSION_EXPIRED: "session:expired",
    COMPANY_CHANGED: "company_changed",
    SECURITY_FORBIDDEN: "security_forbidden",
  }),

  STORAGE_KEYS: Object.freeze({
    ACCESS_TOKEN: "inventariopme_access_token",
    REFRESH_TOKEN: "inventariopme_refresh_token",
    USER: "inventariopme_user",
    PERMISSIONS: "inventariopme_permissions",
    ACTIONS: "inventariopme_actions",
    ROLES: "inventariopme_roles",
    ACTIVE_COMPANY_ID: "inventariopme_active_company_id",
    ACTIVE_COMPANY: "inventariopme_active_company",
    USER_COMPANIES: "inventariopme_user_companies",
  }),

  CSS: Object.freeze({
    HIDDEN: "d-none",
    DISABLED: "disabled",
    ACTIVE: "active",
  }),
});

export default Constants;
