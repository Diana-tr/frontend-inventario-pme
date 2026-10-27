/**
 * @fileoverview
 * Cliente HTTP centralizado.
 */

import Storage from "../storage/storage.js";
import Config from "../config/config.js";

const ApiClient = (() => {
  const BASE_URL = Config.API_BASE_URL || "http://127.0.0.1:8000";

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
      Accept: "application/json",
    };

    // Si el cuerpo es FormData, omitir Content-Type para que el navegador configure automáticamente multipart/form-data con boundary
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // Únicamente son públicos el login y el refresh de tokens.
    // Todo lo demás (incluyendo crear usuarios desde el panel) exige el Token del admin.
    const isPublicEndpoint = 
      endpoint.includes("/auth/login/") || 
      endpoint.includes("/auth/refresh/");

    if (token && !isPublicEndpoint) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Configuración de timeout mediante AbortController si no se proveyó un signal
    let timeoutId = null;
    let effectiveSignal = options.signal;
    if (!effectiveSignal && typeof AbortController !== "undefined") {
      const timeoutMs = Config.REQUEST_TIMEOUT || 30000;
      const controller = new AbortController();
      effectiveSignal = controller.signal;
      timeoutId = setTimeout(() => {
        controller.abort(new Error(`Petición abortada por timeout (${timeoutMs}ms)`));
      }, timeoutMs);
    }

    const config = {
      ...options,
      signal: effectiveSignal,
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
        } else {
          // Si falló el refresh (el refresh token expiró o es inválido)
          // debemos destruir la sesión y mandar al login de inmediato.
          Storage.clear();
          window.location.replace(`${Config.BASE_PATH || ""}/login`);
          return { ok: false, status: 401, success: false };
        }
      }

      // Manejo Global de 403 (Forbidden)
      if (response.status === 403) {
        // El usuario está autenticado pero sus roles/permisos fueron revocados o no alcanzan
        // Despachamos un evento para que el Frontend actualice su contexto sin hacer logout
        window.dispatchEvent(new CustomEvent("security_forbidden"));
      }

      return {
        ok: response.ok,
        status: response.status,
        success: result.success !== undefined ? result.success : response.ok,
        ...result,
      };
    } catch (error) {
      const isAbort = error.name === "AbortError" || (effectiveSignal && effectiveSignal.aborted);
      return {
        ok: false,
        status: isAbort ? 408 : 0,
        success: false,
        code: isAbort ? "TIMEOUT_ERROR" : "NETWORK_ERROR",
        message: error.message || "Error en la petición de red",
        data: null,
        errors: error,
      };
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  const get = (endpoint, paramsOrOptions = null, options = {}) => {
    let url = endpoint;
    let queryParams = paramsOrOptions;
    let requestOptions = options;

    if (paramsOrOptions && typeof paramsOrOptions === "object") {
      if (paramsOrOptions.params && typeof paramsOrOptions.params === "object") {
        queryParams = paramsOrOptions.params;
        requestOptions = { ...paramsOrOptions, ...options };
        delete requestOptions.params;
      } else if (paramsOrOptions.headers || paramsOrOptions.signal) {
        queryParams = null;
        requestOptions = { ...paramsOrOptions, ...options };
      }
    }

    if (queryParams && typeof queryParams === "object") {
      const searchParams = new URLSearchParams();
      for (const [key, val] of Object.entries(queryParams)) {
        if (val !== undefined && val !== null && val !== "") {
          if (Array.isArray(val)) {
            val.forEach((item) => {
              if (item !== undefined && item !== null && item !== "") {
                searchParams.append(key, String(item));
              }
            });
          } else {
            searchParams.append(key, String(val));
          }
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }
    return request(url, { method: "GET", ...requestOptions });
  };

  const post = (endpoint, body = {}, options = {}) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body), ...options });

  const postForm = (endpoint, formData, options = {}) =>
    request(endpoint, { method: "POST", body: formData, ...options });

  const put = (endpoint, body = {}, options = {}) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body), ...options });

  const putForm = (endpoint, formData, options = {}) =>
    request(endpoint, { method: "PUT", body: formData, ...options });

  const patch = (endpoint, body = {}, options = {}) =>
    request(endpoint, { method: "PATCH", body: JSON.stringify(body), ...options });

  const patchForm = (endpoint, formData, options = {}) =>
    request(endpoint, { method: "PATCH", body: formData, ...options });

  const remove = (endpoint, options = {}) =>
    request(endpoint, { method: "DELETE", ...options });

  return Object.freeze({
    get,
    post,
    postForm,
    put,
    putForm,
    patch,
    patchForm,
    delete: remove,
  });
})();

export default ApiClient;