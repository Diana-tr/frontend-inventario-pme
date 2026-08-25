/**
 * ============================================================
 * Inventario PME
 * Auth Service
 * ============================================================
 *
 * Servicio responsable de las operaciones de autenticación.
 *
 * Responsabilidades:
 *  - Iniciar sesión.
 *  - Persistir tokens.
 *  - Persistir información del usuario.
 *
 * No contiene lógica de:
 *  - Manipulación del DOM.
 *  - Redirecciones.
 *  - Renderizado.
 *  - Manejo directo de fetch().
 * ============================================================
 */

import ApiClient from "../core/apiClient.js";
import Storage from "../storage/storage.js";

const AuthService = (() => {
  const LOGIN_ENDPOINT = "/api/v1/auth/login/";

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
        console.error("[AUTH] El backend no devolvió data.");

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
        console.error("[AUTH] El backend no devolvió los tokens.");

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

  return Object.freeze({
    login,
  });
})();

export default AuthService;
