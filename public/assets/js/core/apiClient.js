/**
 * @fileoverview
 * Cliente HTTP centralizado.
 *
 * @description
 * Responsable de toda comunicación entre frontend y backend.
 *
 * El backend es la única fuente de mensajes de negocio.
 * Este cliente no crea mensajes de negocio.
 *
 * Responsabilidades:
 *
 * - Ejecutar peticiones HTTP.
 * - Adjuntar el access token.
 * - Detectar access tokens expirados.
 * - Renovar tokens utilizando el refresh token.
 * - Reintentar la petición original.
 * - Evitar múltiples refresh simultáneos.
 */

import Storage from "../storage/storage.js";



const ApiClient = (() => {
  const BASE_URL = "http://127.0.0.1:8000";

  /**
   * Promesa compartida para evitar múltiples refresh
   * simultáneos cuando varias peticiones reciben 401.
   *
   * @type {Promise<boolean> | null}
   */
  let refreshPromise = null;

  /**
   * Renueva los tokens utilizando el refresh token.
   *
   * Esta función NO utiliza request(), porque eso provocaría
   * un ciclo de refresh potencialmente infinito.
   *
   * @returns {Promise<boolean>}
   */
  const refreshAccessToken = async () => {
    const refreshToken = Storage.getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok || !result.success || !result.data) {
        return false;
      }

      const accessToken = result.data.access_token ?? result.data.access;

      const newRefreshToken = result.data.refresh_token ?? result.data.refresh;

      if (!accessToken) {
        return false;
      }

      /**
       * SIMPLE_JWT puede rotar el refresh token.
       *
       * Si el backend devuelve uno nuevo, guardamos ambos.
       * Si no devuelve uno nuevo, conservamos el existente.
       */
      Storage.saveTokens(accessToken, newRefreshToken ?? refreshToken);

      return true;
    } catch {
      return false;
    }
  };

  /**
   * Garantiza que solamente exista un refresh simultáneo.
   *
   * @returns {Promise<boolean>}
   */
  const ensureTokenRefresh = async () => {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    return refreshPromise;
  };

  /**
   * Ejecuta una petición HTTP.
   *
   * @param {string} endpoint
   * @param {RequestInit} options
   * @param {boolean} retry
   * @returns {Promise<Object>}
   */
  const request = async (endpoint, options = {}, retry = true) => {
    const token = Storage.getAccessToken();

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token && !endpoint.includes("/auth/login/")) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      /**
       * Access token expirado.
       *
       * Solamente intentamos renovar una vez.
       */
      if (
        response.status === 401 &&
        retry &&
        !endpoint.includes("/auth/refresh/") &&
        !endpoint.includes("/auth/login/")
      ) {
        const refreshed = await ensureTokenRefresh();

        if (refreshed) {
          return request(endpoint, options, false);
        }
      }

      return {
        ok: response.ok,
        status: response.status,
        ...result,
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        success: false,
        code: "NETWORK_ERROR",
        message: error.message,
        data: null,
        errors: error,
      };
    }
  };

  /**
   * Ejecuta una petición GET.
   */
  const get = (endpoint) => {
    return request(endpoint, {
      method: "GET",
    });
  };

  /**
   * Ejecuta una petición POST.
   */
  const post = (endpoint, body = {}) => {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  };

  /**
   * Ejecuta una petición PUT.
   */
  const put = (endpoint, body = {}) => {
    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  };

  /**
   * Ejecuta una petición PATCH.
   */
  const patch = (endpoint, body = {}) => {
    return request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  };

  /**
   * Ejecuta una petición DELETE.
   */
  const remove = (endpoint) => {
    return request(endpoint, {
      method: "DELETE",
    });
  };

  return Object.freeze({
    get,
    post,
    put,
    patch,
    delete: remove,
  });
})();

export default ApiClient;
