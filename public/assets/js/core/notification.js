/**
 * ============================================================
 * Inventario PME
 * Notification Service
 * ============================================================
 *
 * Servicio centralizado de notificaciones mediante SweetAlert2.
 * Consume exclusivamente la librería local empaquetada en AdminLTE
 * evitando dependencias externas por red o violaciones de CSP.
 */

const NotificationService = (() => {
  const getSwal = () => {
    if (typeof window !== "undefined" && window.Swal) {
      return window.Swal;
    }
    // Fallback defensivo offline local
    return {
      fire: async (opts) => {
        if (typeof window !== "undefined" && typeof window.alert === "function") {
          window.alert(`${opts.title || ""}\n${opts.text || ""}`);
        }
        return { isConfirmed: true, isDismissed: false };
      },
      mixin: () => ({
        fire: async (opts) => {
          console.log(`[TOAST ${opts.icon || "info"}]: ${opts.title || ""}`);
        },
      }),
    };
  };

  const getToast = () =>
    getSwal().mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      showCloseButton: true,
      timer: 3000,
      timerProgressBar: true,
    });

  function success(message, title = "Operación exitosa") {
    return getSwal().fire({
      icon: "success",
      title,
      text: message,
      confirmButtonText: "Aceptar",
    });
  }

  function error(message, title = "Ha ocurrido un error") {
    return getSwal().fire({
      icon: "error",
      title,
      text: message,
      confirmButtonText: "Aceptar",
    });
  }

  function warning(message, title = "Advertencia") {
    return getSwal().fire({
      icon: "warning",
      title,
      text: message,
      confirmButtonText: "Aceptar",
    });
  }

  function info(message, title = "Información") {
    return getSwal().fire({
      icon: "info",
      title,
      text: message,
      confirmButtonText: "Aceptar",
    });
  }

  function confirm(message, title = "Confirmar acción", customOptions = {}) {
    return getSwal().fire({
      icon: "warning",
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      ...customOptions,
    });
  }

  function toastSuccess(message) {
    return getToast().fire({
      icon: "success",
      title: message,
    });
  }

  function toastError(message) {
    return getToast().fire({
      icon: "error",
      title: message,
    });
  }

  function toastWarning(message) {
    return getToast().fire({
      icon: "warning",
      title: message,
    });
  }

  function toastInfo(message) {
    return getToast().fire({
      icon: "info",
      title: message,
    });
  }

  function loading(
    title = "Procesando...",
    message = "Por favor, espera un momento."
  ) {
    return getSwal().fire({
      title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        getSwal().showLoading();
      },
    });
  }

  function close() {
    getSwal().close();
  }

  function getApiErrorMessage(
    response,
    fallback = "No fue posible completar la operación."
  ) {
    if (!response) {
      return fallback;
    }

    const payload = response.response?.data || response.data || response;

    if (payload.errors) {
      if (typeof payload.errors === "string" && payload.errors.trim()) {
        return payload.errors;
      }

      if (Array.isArray(payload.errors) && payload.errors.length > 0) {
        return payload.errors.join(" ");
      }

      if (typeof payload.errors === "object" && payload.errors !== null) {
        const messages = [];

        Object.values(payload.errors).forEach((value) => {
          if (Array.isArray(value)) {
            messages.push(...value);
          } else if (typeof value === "string") {
            messages.push(value);
          }
        });

        if (messages.length > 0) {
          return messages.join(" ");
        }
      }
    }

    if (payload.message) {
      return payload.message;
    }

    return fallback;
  }

  return Object.freeze({
    close,
    confirm,
    error,
    getApiErrorMessage,
    info,
    loading,
    success,
    toastError,
    toastInfo,
    toastSuccess,
    toastWarning,
    warning,
  });
})();

export default NotificationService;
