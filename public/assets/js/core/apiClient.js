/**
 * @fileoverview
 * Cliente HTTP centralizado.
 */

import Storage from "../storage/storage.js";

const ApiClient = (() => {
  const BASE_URL = "http://127.0.0.1:8000";

  let refreshPromise = null;

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

      Storage.saveTokens(accessToken, newRefreshToken ?? refreshToken);

      return true;
    } catch {
      return false;
    }
  };

  const ensureTokenRefresh = async () => {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    return refreshPromise;
  };

  const request = async (endpoint, options = {}, retry = true) => {
    const token = Storage.getAccessToken();

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Únicamente son públicos el login y el refresh de tokens.
    // Todo lo demás (incluyendo crear usuarios desde el panel) exige el Token del admin.
    const isPublicEndpoint = 
      endpoint.includes("/auth/login/") || 
      endpoint.includes("/auth/refresh/");

    if (token && !isPublicEndpoint) {
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

  const get = (endpoint) => request(endpoint, { method: "GET" });
  const post = (endpoint, body = {}) => request(endpoint, { method: "POST", body: JSON.stringify(body) });
  const put = (endpoint, body = {}) => request(endpoint, { method: "PUT", body: JSON.stringify(body) });
  const patch = (endpoint, body = {}) => request(endpoint, { method: "PATCH", body: JSON.stringify(body) });
  const remove = (endpoint) => request(endpoint, { method: "DELETE" });

  return Object.freeze({
    get,
    post,
    put,
    patch,
    delete: remove,
  });
})();

export default ApiClient;