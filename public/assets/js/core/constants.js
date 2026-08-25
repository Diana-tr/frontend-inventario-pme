/**
 * @fileoverview Constantes globales de Veltrion ERP.
 *
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
  }),

  STORAGE_KEYS: Object.freeze({
    ACCESS_TOKEN: "inventariopme_access_token",

    REFRESH_TOKEN: "inventariopme_refresh_token",

    USER: "inventariopme_user",
  }),

  CSS: Object.freeze({
    HIDDEN: "d-none",

    DISABLED: "disabled",

    ACTIVE: "active",
  }),
});
