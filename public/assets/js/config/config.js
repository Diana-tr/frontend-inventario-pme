/**
 * ============================================================
 * Inventario PME
 * Frontend Config
 * ============================================================
 */

const isLocalhost =
  typeof window !== "undefined"
    ? window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    : true;

// Detecta automáticamente si está corriendo bajo el subdirectorio /frontend-inventario-pme (XAMPP) o en la raíz (Hosting)
const basePath =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/frontend-inventario-pme")
    ? "/frontend-inventario-pme"
    : "";

const Config = Object.freeze({
  APP_NAME: "Software Inventario P.M.E.",
  VERSION: "1.15.2",
  ENVIRONMENT: isLocalhost ? "development" : "production",
  DEBUG: isLocalhost,
  REQUEST_TIMEOUT: 30000,
  SESSION_REFRESH_INTERVAL: 300000,
  SESSION_IDLE_TIMEOUT: 1800000,

  BASE_PATH: basePath,
  DASHBOARD_PATH: "/dashboard",
  LOGIN_PATH: "/",

  // Configuración de la API del Backend:
  // - En local (XAMPP): apunta al backend local http://127.0.0.1:8000
  // - En produccion: cuando se monte el backend en la nube (ej: Render con HTTPS),
  //   simplemente actualizamos esta URL aqui.
  API_BASE_URL: isLocalhost
    ? "http://127.0.0.1:8000"
    : "https://inventario-p-m-e-back-end.onrender.com",
});

export default Config;
