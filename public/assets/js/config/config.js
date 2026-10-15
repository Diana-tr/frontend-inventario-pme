/**
 * ============================================================
 * Inventario PME
 * Frontend Config
 * ============================================================
 */

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Detecta automáticamente si está corriendo bajo el subdirectorio /frontend-inventario-pme (XAMPP) o en la raíz (Hosting)
const basePath = window.location.pathname.startsWith("/frontend-inventario-pme")
  ? "/frontend-inventario-pme"
  : "";

const Config = Object.freeze({
  APP_NAME: "Software Inventario P.M.E.",
  VERSION: "1.0.0",
  ENVIRONMENT: isLocalhost ? "development" : "production",
  DEBUG: isLocalhost,
  REQUEST_TIMEOUT: 30000,
  SESSION_REFRESH_INTERVAL: 300000,
  SESSION_IDLE_TIMEOUT: 1800000,

  BASE_PATH: basePath,
  DASHBOARD_PATH: "/dashboard",
  LOGIN_PATH: "/",

  // Configuración de la API del Backend:
  // - En local (XAMPP): apunta a tu backend local http://127.0.0.1:8000
  // - En producción: cuando montes el backend en la nube (ej: Render/Railway con HTTPS),
  //   simplemente actualizas esta URL aquí.
  API_BASE_URL: isLocalhost
    ? "http://127.0.0.1:8000"
    : "http://127.0.0.1:8000",
});

export default Config;
