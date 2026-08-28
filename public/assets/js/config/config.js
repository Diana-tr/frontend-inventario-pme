/**
 * ============================================================
 * Inventario PME
 * Frontend Config
 * ============================================================
 */

const Config = Object.freeze({
  APP_NAME: "Software Inventario P.M.E.",
  VERSION: "1.0.0",
  ENVIRONMENT: "development",
  DEBUG: true,
  REQUEST_TIMEOUT: 30000,
  SESSION_REFRESH_INTERVAL: 300000,
  SESSION_IDLE_TIMEOUT: 1800000,

  BASE_PATH: "/frontend-inventario-pme",
  DASHBOARD_PATH: "/app/views/dashboard/index.php",
  LOGIN_PATH: "/app/views/auth/login.php",
});

export default Config;
