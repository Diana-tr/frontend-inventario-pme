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

      Storage.saveTokens(accessToken, refreshToken);

      if (user) {
        Storage.saveUser(user);
      }

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

      return {
        ok: response.ok && response.success,
        status: response.status,
        code: response.code ?? "LOGOUT_ERROR",
        message: response.message ?? "No fue posible cerrar sesión en el servidor, pero se cerró localmente.",
        data: response.data ?? null,
        errors: response.errors ?? null,
      };
    } catch (error) {
      console.error("[AUTH] Error durante el logout:", error);
      
      // Fallo de red severo, forzamos la limpieza de todas formas
      Storage.clear();

      return {
        ok: false,
        status: 0,
        code: "NETWORK_ERROR",
        message: "No se pudo conectar con el servidor, sesión cerrada localmente.",
        data: null,
        errors: error,
      };
    }
  }

  return Object.freeze({
    login,
    logout,
  });
})();

export default AuthService;
