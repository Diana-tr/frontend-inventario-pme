/**
 * ============================================================
 * Inventario PME
 * Auth Service
 * ============================================================
 *
 * Servicio responsable de las operaciones de autenticación.
 *
 * Responsabilidades:
 * - Iniciar sesión.
 * - Cerrar sesión.
 * - Persistir tokens.
 * - Persistir información del usuario.
 *
 * No contiene lógica de:
 * - Manipulación del DOM.
 * - Redirecciones.
 * - Renderizado.
 * - Manejo directo de fetch().
 * ============================================================
 */

import ApiClient from "../core/apiClient.js";
import Storage from "../storage/storage.js";

const AuthService = (() => {
  const LOGIN_ENDPOINT = "/api/v1/auth/login/";
  const LOGOUT_ENDPOINT = "/api/v1/auth/logout/";
  const ME_ENDPOINT = "/api/v1/auth/me/";
  const CACHE_KEY = "inventariopme_security_context";

  /**
   * Inicia sesión contra el backend.
   *
   * @param {{email: string, password: string}} credentials
   * @returns {Promise<Object>}
   */
  async function login(credentials) {
    try {
      const response = await ApiClient.post(LOGIN_ENDPOINT, credentials);

      if (!response.ok || !response.success) {
        return {
          ok: false,
          status: response.status,
          code: response.code ?? "LOGIN_ERROR",
          message: response.message ?? "No fue posible iniciar sesión.",
          data: response.data ?? null,
          errors: response.errors ?? null,
        };
      }

      const data = response.data;

      if (!data) {
        return {
          ok: false,
          status: response.status,
          code: "INVALID_RESPONSE",
          message: "Respuesta inválida del servidor.",
          data: null,
          errors: null,
        };
      }

      const {
        user,
        access_token: accessToken,
        refresh_token: refreshToken,
      } = data;

      if (!accessToken || !refreshToken) {
        return {
          ok: false,
          status: response.status,
          code: "INVALID_TOKENS",
          message: "Respuesta de autenticación inválida.",
          data: null,
          errors: null,
        };
      }

      // ─── LIMPIEZA PREVENTIVA ───
      // Antes de guardar la nueva sesión, eliminamos cualquier
      // residuo de la sesión anterior (permisos, contexto en caché).
      // Esto previene que los permisos del usuario anterior
      // queden activos si la pestaña no fue cerrada.
      Storage.clear();
      sessionStorage.removeItem(CACHE_KEY);

      // ─── GUARDAR NUEVA SESIÓN ───
      Storage.saveTokens(accessToken, refreshToken);

      if (user) {
        Storage.saveUser(user);
      }

      // Obtener los permisos REALES del nuevo usuario desde el backend.
      // forceRefresh = true para garantizar que nunca use caché viejo.
      await fetchSecurityContext(true);

      return {
        ok: true,
        status: response.status,
        code: response.code,
        message: response.message,
        data: {
          user,
        },
        errors: null,
      };
    } catch (error) {
      console.error("[AUTH] Error durante el login:", error);

      return {
        ok: false,
        status: 0,
        code: "NETWORK_ERROR",
        message: "No se pudo conectar con el servidor.",
        data: null,
        errors: error,
      };
    }
  }

  /**
   * Obtiene el contexto de seguridad del servidor y lo guarda.
   * Optimización: Utiliza sessionStorage como caché de primer nivel
   * para evitar consultar a la BD en cada recarga de página,
   * manteniendo un nivel alto de seguridad (se borra al cerrar la pestaña).
   */
  async function fetchSecurityContext(forceRefresh = false) {
    try {
      if (!forceRefresh) {
        const cachedContext = sessionStorage.getItem(CACHE_KEY);
        if (cachedContext) {
          const parsedContext = JSON.parse(cachedContext);
          Storage.savePermissions(parsedContext.permissions);
          return;
        }
      }

      const response = await ApiClient.get("/api/v1/security/context/");
      if (response.ok && response.success && response.data) {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(response.data));
        Storage.savePermissions(response.data.permissions);
      } else {
        console.warn("[AUTH] No se pudo obtener el contexto de seguridad.");
      }
    } catch (error) {
      console.error("[AUTH] Error obteniendo contexto de seguridad:", error);
    }
  }

  /**
   * Cierra la sesión en el backend.
   *
   * El ApiClient adjunta automáticamente el access token
   * mediante el header Authorization.
   *
   * El refresh token se envía explícitamente en el body
   * porque es utilizado por el backend para invalidar
   * la sesión/token de refresco.
   *
   * @returns {Promise<Object>}
   */
  async function logout() {
    try {
      const refreshToken = Storage.getRefreshToken();

      if (!refreshToken) {
        return {
          ok: false,
          status: 400,
          code: "REFRESH_TOKEN_MISSING",
          message: "No existe un refresh token.",
          data: null,
          errors: null,
        };
      }

      const response = await ApiClient.post(LOGOUT_ENDPOINT, {
        refresh: refreshToken,
      });

      // SIN IMPORTAR lo que responda el servidor (puede ser 500 o 400),
      // nosotros DEBEMOS limpiar la sesión en el frontend.
      Storage.clear();
      sessionStorage.removeItem("inventariopme_security_context");

      return {
        ok: response.ok && response.success,
        status: response.status,
        code: response.code ?? "LOGOUT_ERROR",
        message:
          response.message ??
          "No fue posible cerrar sesión en el servidor, pero se cerró localmente.",
        data: response.data ?? null,
        errors: response.errors ?? null,
      };
    } catch (error) {
      console.error("[AUTH] Error durante el logout:", error);

      // Fallo de red severo, forzamos la limpieza de todas formas
      Storage.clear();
      sessionStorage.removeItem("inventariopme_security_context");

      return {
        ok: false,
        status: 0,
        code: "NETWORK_ERROR",
        message:
          "No se pudo conectar con el servidor, sesión cerrada localmente.",
        data: null,
        errors: error,
      };
    }
  }

  /**
   * Obtiene la información del usuario autenticado actual desde el backend.
   * Utiliza el token de acceso inyectado automáticamente por el ApiClient.
   *
   * @returns {Promise<Object>}
   */
  async function getCurrentUser() {
    try {
      const response = await ApiClient.get(ME_ENDPOINT);

      if (!response.ok || !response.success) {
        return {
          ok: false,
          status: response.status,
          code: response.code ?? "FETCH_USER_ERROR",
          message:
            response.message ??
            "No fue posible obtener la información del usuario.",
          data: response.data ?? null,
          errors: response.errors ?? null,
        };
      }

      // Extraemos directamente el objeto 'user' del JSON que devuelve el backend
      const userData = response.data?.user;

      if (userData) {
        Storage.saveUser(userData);
      }

      return {
        ok: true,
        status: response.status,
        code: response.code,
        message: response.message,
        data: {
          user: userData,
        },
        errors: null,
      };
    } catch (error) {
      console.error("[AUTH] Error obteniendo información del usuario:", error);

      return {
        ok: false,
        status: 0,
        code: "NETWORK_ERROR",
        message:
          "No se pudo conectar con el servidor para obtener el perfil del usuario.",
        data: null,
        errors: error,
      };
    }
  }





  return Object.freeze({
    login,
    logout,
    fetchSecurityContext,
    getCurrentUser,
  });
})();

export default AuthService;
