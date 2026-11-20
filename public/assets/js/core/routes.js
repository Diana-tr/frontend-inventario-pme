/**
 * @fileoverview
 * Servicio centralizado de rutas y navegación del frontend.
 *
 * Responsabilidades:
 * - Centralizar todas las rutas del sistema PME.
 * - Obtener la página actual.
 * - Navegar entre páginas.
 * * Ningún otro módulo debe manipular window.location directamente.
 */

import Config from "../config/config.js";

const Routes = (() => {
  const PATHS = Object.freeze({
    AUTH: Object.freeze({
      LOGIN: "/login",
      LOGOUT: "/login",
    }),

    DASHBOARD: Object.freeze({
      HOME: "/dashboard",
    }),

    SAAS: Object.freeze({
      LOGIN: "/saas-admin/login",
      DASHBOARD: "/saas-admin/dashboard",
      TENANTS: "/saas-admin/tenants",
      PLANES: "/saas-admin/planes",
      VERSIONES: "/saas-admin/versiones",
      EQUIPO: "/saas-admin/equipo",
      AUDITORIA: "/saas-admin/auditoria",
    }),

    SECURITY: Object.freeze({
      USERS: "/usuarios",
      ROLES: "/roles",
    }),

    CONTACTS: Object.freeze({
      CUSTOMERS: "/clientes",
      SUPPLIERS: "/proveedores",
    }),

    INVENTORY: Object.freeze({
      CATEGORIES: "/categorias",
      PRODUCTS: "/productos",
      INVENTORY: "/inventario",
    }),

    OPERATIONS: Object.freeze({
      PURCHASES: "/compras",
      SALES: "/ventas",
      POS: "/ventas/pos",
      CAJA: "/caja",
    }),

    FINANCES: Object.freeze({
      HOME: "/finanzas",
    }),

    SETTINGS: Object.freeze({
      HOME: "/configuracion",
      VERSIONS: "/configuracion/versiones",
    }),
  });

  const normalizeBasePath = (basePath = Config.BASE_PATH) => {
    let path = String(basePath ?? "").trim();

    if (path === "") {
      return "/";
    }

    if (!path.startsWith("/")) {
      path = `/${path}`;
    }

    if (!path.endsWith("/")) {
      path += "/";
    }

    return path;
  };

  const BASE_PATH = normalizeBasePath(Config.BASE_PATH);

  const stripSlashes = (value = "") => String(value).replace(/^\/+|\/+$/g, "");

  const escapeRegExp = (value = "") =>
    String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const isExternalRoute = (route = "") => {
    return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(String(route).trim());
  };

  const isHashRoute = (route = "") => {
    const value = String(route).trim();
    return value === "#" || value.startsWith("#");
  };

  const normalizePathname = (path = "") => {
    const url = new URL(String(path), window.location.origin);
    return url.pathname.replace(/\/+$/g, "") || "/";
  };

  const resolveRoute = (route) => {
    const value = String(route ?? "").trim();

    if (value === "" || value === "#") {
      return "#";
    }

    if (isExternalRoute(value) || isHashRoute(value)) {
      return value;
    }

    const routePath = value.replace(/^\/+/, "");
    const basePathKey = stripSlashes(BASE_PATH);
    const normalizedRoutePath = routePath.replace(
      new RegExp(`^${escapeRegExp(basePathKey)}/*`, "i"),
      "",
    );

    const absolutePath = `${BASE_PATH}${normalizedRoutePath}`;
    const url = new URL(absolutePath, window.location.origin);

    return `${url.pathname}${url.search}${url.hash}`;
  };

  const current = () => stripSlashes(window.location.pathname);

  const currentFile = () => {
    const path = window.location.pathname;

    return path.split("/").pop();
  };

  const go = (route) => {
    window.location.href = resolveRoute(route);
  };

  const replace = (route) => {
    window.location.replace(resolveRoute(route));
  };

  const reload = () => {
    window.location.reload();
  };

  const is = (route) => {
    if (!route || isHashRoute(route) || isExternalRoute(route)) {
      return false;
    }

    const targetPath = normalizePathname(resolveRoute(route));
    const currentPath = normalizePathname(window.location.pathname);

    // 1. Coincidencia exacta (ej. /views/pages/usuarios/index.php === /views/pages/usuarios/index.php)
    if (currentPath === targetPath) {
      return true;
    }

    // 2. Coincidencia jerárquica (ej. crear.php pertenece al módulo de index.php)
    // Extraemos el directorio padre: "/views/pages/usuarios/index.php" -> "/views/pages/usuarios"
    const targetDir = targetPath.substring(0, targetPath.lastIndexOf("/"));

    // Evitamos que el Dashboard (ruta raíz) marque como activos a todos los submódulos
    // ya que toda la app "empieza" con el directorio raíz.
    const rootDir = normalizePathname(BASE_PATH);
    if (targetDir === rootDir || targetDir === "") {
      return false; // El Dashboard solo acepta coincidencia exacta (paso 1)
    }

    // Si la ruta del sidebar apunta al entrypoint del módulo (index.php o la carpeta base)
    // y estamos navegando dentro de esa misma carpeta (ej: /views/pages/usuarios/crear.php)
    if (
      (targetPath.endsWith("/index.php") || targetPath.endsWith("/")) &&
      currentPath.startsWith(targetDir + "/")
    ) {
      return true;
    }

    return false;
  };

  return Object.freeze({
    PATHS,
    current,
    currentFile,
    go,
    replace,
    reload,
    is,
    resolveRoute,
  });
})();

export default Routes;
