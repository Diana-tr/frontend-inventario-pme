/**
 * @fileoverview
 * Cliente HTTP centralizado.
 */

import Storage from "../storage/storage.js";
import Config from "../config/config.js";

const ApiClient = (() => {
  const BASE_URL = Config.API_BASE_URL || "http://127.0.0.1:8000";

  /**
   * Catálogo centralizado de estados y errores HTTP estándar
   * Mapea respuestas hacia códigos y mensajes uniformes de negocio.
   */
  const HTTP_ERROR_CATALOG = Object.freeze({
    400: { code: "VALIDATION_ERROR", message: "Los datos enviados contienen errores de validación." },
    401: { code: "AUTHENTICATION_REQUIRED", message: "Su sesión ha expirado o no está autenticado." },
    403: { code: "PERMISSION_DENIED", message: "No cuenta con los permisos necesarios para realizar esta acción." },
    404: { code: "RESOURCE_NOT_FOUND", message: "El recurso solicitado no fue encontrado en el servidor." },
    405: { code: "METHOD_NOT_ALLOWED", message: "El método HTTP no está permitido para este recurso." },
    409: { code: "CONFLICT", message: "Conflicto con el estado actual del recurso (posible registro duplicado)." },
    413: { code: "PAYLOAD_TOO_LARGE", message: "El tamaño del archivo o contenido enviado excede el límite permitido." },
    415: { code: "UNSUPPORTED_MEDIA_TYPE", message: "El formato de datos enviado no es compatible con el servidor." },
    422: { code: "UNPROCESSABLE_ENTITY", message: "La solicitud contiene parámetros que no pudieron ser procesados." },
    429: { code: "RATE_LIMIT_EXCEEDED", message: "Ha excedido el límite de solicitudes. Por favor espere unos momentos." },
    500: { code: "INTERNAL_SERVER_ERROR", message: "Ocurrió un error interno en el servidor. Intente más tarde." },
    502: { code: "BAD_GATEWAY", message: "El servicio intermedio no está disponible temporalmente." },
    503: { code: "SERVICE_UNAVAILABLE", message: "El servicio se encuentra temporalmente fuera de línea." },
    504: { code: "GATEWAY_TIMEOUT", message: "El servidor demoró demasiado en responder (Tiempo agotado)." },
  });

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

    // Inyección del contexto de Empresa Activa (Multi-Tenant SaaS)
    // Se excluye estrictamente si la petición pertenece a la administración SaaS o si estamos en la interfaz SaaS Admin
    const isSaaSAdminContext =
      endpoint.includes("/saas-admin/") ||
      (typeof window !== "undefined" && window.location.pathname.includes("saas-admin"));

    const isGlobalEndpoint =
      isPublicEndpoint ||
      endpoint.includes("/auth/") ||
      endpoint.includes("/security/context/") ||
      endpoint.includes("/system/") ||
      endpoint.includes("/versions/");

    const activeCompanyId = Storage.getActiveCompanyId();
    if (activeCompanyId && !isSaaSAdminContext) {
      headers["X-Company-ID"] = activeCompanyId;
    } else if (token && !isSaaSAdminContext && !isGlobalEndpoint && !activeCompanyId) {
      // Principio Fail-Closed: Petición a endpoint tenant-scoped sin empresa activa seleccionada
      console.warn(`[ApiClient] Fail-Closed interceptado: petición a '${endpoint}' sin X-Company-ID.`);
      return {
        ok: false,
        status: 400,
        success: false,
        code: "COMPANY_REQUIRED",
        message: "No se ha seleccionado una empresa activa para realizar esta operación.",
        data: null,
        errors: { company: ["Se requiere seleccionar una empresa activa en el encabezado X-Company-ID."] },
      };
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
          // Si estamos en modo soporte / impersonación, restaurar la sesión original del Superadmin y volver
          if (Storage.isImpersonating()) {
            console.warn("[API] Token de soporte expirado o inválido. Restaurando contexto administrativo...");
            const restored = Storage.restoreFromImpersonation();
            if (!restored) {
              Storage.clear();
              window.location.replace(`${Config.BASE_PATH}/saas-admin/login`);
              return { ok: false, status: 401, success: false };
            }
            window.location.replace(`${Config.BASE_PATH}/saas-admin/dashboard`);
            return { ok: false, status: 401, success: false };
          }
          // Si falló el refresh (el refresh token expiró o es inválido)
          // debemos destruir la sesión y mandar al login contextual correspondiente de inmediato.
          Storage.clear();
          const isSaaSContext = typeof window !== "undefined" && window.location.pathname.includes("saas-admin");
          const targetLogin = isSaaSContext
            ? `${Config.BASE_PATH}/saas-admin/login`
            : `${Config.BASE_PATH || ""}/login`;
          window.location.replace(targetLogin);
          return { ok: false, status: 401, success: false };
        }
      }

      // Manejo Global de 403 (Forbidden)
      if (response.status === 403) {
        const isSubscriptionExpired =
          result.code === "SUBSCRIPTION_EXPIRED" ||
          result.error_code === "SUBSCRIPTION_EXPIRED" ||
          (result.data && (result.data.is_read_only === true || result.data.status === "EXPIRED"));

        const isSubscriptionRequired =
          result.code === "SUBSCRIPTION_REQUIRED" ||
          result.error_code === "SUBSCRIPTION_REQUIRED" ||
          (result.data && result.data.status === "NO_SUBSCRIPTION");

        if (isSubscriptionExpired || isSubscriptionRequired) {
          // Despachar evento para sincronizar contexto frontend
          window.dispatchEvent(
            new CustomEvent("subscription_expired", { detail: result })
          );

          // Notificación comprensible con throttling defensivo para evitar loops repetitivos
          if (!window._subscriptionExpiredNotificationActive) {
            window._subscriptionExpiredNotificationActive = true;
            setTimeout(() => {
              window._subscriptionExpiredNotificationActive = false;
            }, 6000);

            const Swal = typeof window !== "undefined" && window.Swal ? window.Swal : null;
            const isRequired = isSubscriptionRequired;
            const title = isRequired ? "Suscripción Requerida" : "Suscripción Vencida (Modo Lectura)";
            const detailHelp = isRequired
              ? '<i class="fas fa-lock mr-1 text-warning"></i> Tu empresa no posee un plan activo. Para registrar operaciones comerciales debes contratar un plan.'
              : '<i class="fas fa-lock mr-1 text-warning"></i> Las operaciones de escritura se encuentran bloqueadas. Puedes continuar consultando tu información histórica.';
            const msg =
              result.message ||
              (isRequired
                ? "Tu empresa no cuenta con una suscripción activa."
                : "Tu suscripción ha vencido. Tu cuenta está en modo lectura.");

            const whatsappUrl = result.data?.contact_whatsapp;
            const emailUrl = result.data?.contact_email;

            let confirmButtonText = null;
            let actionHandler = null;

            if (whatsappUrl) {
              confirmButtonText = '<i class="fab fa-whatsapp mr-1"></i> Contactar Soporte';
              actionHandler = () => window.open(whatsappUrl, "_blank");
            } else if (emailUrl) {
              confirmButtonText = '<i class="fas fa-envelope mr-1"></i> Enviar Email';
              actionHandler = () => { window.location.href = emailUrl; };
            }

            if (Swal) {
              const swalOptions = {
                icon: "warning",
                title: title,
                html: `
                  <div class="text-left" style="font-size: 0.95rem;">
                    <p class="mb-2">${msg}</p>
                    <p class="text-muted small mb-0">${detailHelp}</p>
                  </div>
                `,
                showCancelButton: Boolean(confirmButtonText),
                confirmButtonColor: whatsappUrl ? "#10B981" : "#2563EB",
                cancelButtonColor: "#64748B",
                cancelButtonText: "Entendido",
              };

              if (confirmButtonText) {
                swalOptions.confirmButtonText = confirmButtonText;
              }

              Swal.fire(swalOptions).then((swalRes) => {
                if (swalRes.isConfirmed && typeof actionHandler === "function") {
                  actionHandler();
                }
              });
            } else if (typeof window !== "undefined" && typeof window.alert === "function") {
              window.alert(`${msg}\nContacta a tu administrador para activar o renovar tu plan.`);
            }
          }
        } else {
          // El usuario está autenticado pero sus roles/permisos fueron revocados o no alcanzan
          window.dispatchEvent(new CustomEvent("security_forbidden"));
        }
      }

      const isOk = response.ok;
      const catalogEntry = HTTP_ERROR_CATALOG[response.status];
      const finalCode = result.code || (catalogEntry ? catalogEntry.code : (isOk ? "SUCCESS" : "ERROR"));
      const finalMessage = result.message || (catalogEntry ? catalogEntry.message : (isOk ? "Operación exitosa" : (response.statusText || "Error en la solicitud")));

      return {
        ok: isOk,
        status: response.status,
        success: result.success !== undefined ? Boolean(result.success) : isOk,
        code: finalCode,
        message: finalMessage,
        data: result.data !== undefined ? result.data : (isOk ? result : null),
        errors: result.errors !== undefined ? result.errors : (!isOk ? (result.detail ? { detail: result.detail } : (result && Object.keys(result).length > 0 ? result : null)) : null),
        ...result,
        ok: isOk,
        status: response.status,
        success: result.success !== undefined ? Boolean(result.success) : isOk,
        code: finalCode,
        message: finalMessage,
      };
    } catch (error) {
      const isAbort = error.name === "AbortError" || (effectiveSignal && effectiveSignal.aborted);
      const status = isAbort ? 408 : 0;
      const catalog = HTTP_ERROR_CATALOG[status] || {
        code: isAbort ? "GATEWAY_TIMEOUT" : "NETWORK_ERROR",
        message: isAbort ? "Tiempo de espera agotado al conectar con el servidor." : "Error de conexión con el servidor. Verifique su red.",
      };
      return {
        ok: false,
        status,
        success: false,
        code: catalog.code,
        message: error.message && !isAbort ? error.message : catalog.message,
        data: null,
        errors: { detail: error.message || catalog.message },
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
