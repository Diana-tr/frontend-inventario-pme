/**
 * ============================================================
 * Inventario PME
 * Notification Service
 * ============================================================
 *
 * Servicio centralizado de notificaciones mediante SweetAlert2.
 *
 * Responsabilidades:
 * - Mostrar éxitos.
 * - Mostrar errores.
 * - Mostrar advertencias.
 * - Mostrar información.
 * - Mostrar confirmaciones.
 * - Mostrar estados de carga.
 *
 * No contiene:
 * - Peticiones HTTP.
 * - Autenticación.
 * - Lógica de negocio.
 * - Redirecciones.
 * ============================================================
 */

import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm";

const NotificationService = (() => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    showCloseButton: true,
    timer: 3000,
    timerProgressBar: true,
  });

  function success(message, title = "Operación exitosa") {
    return Swal.fire({
      icon: "success",
      title,
      text: message,
      confirmButtonText: "Aceptar",
    });
  }

  function error(message, title = "Ha ocurrido un error") {
    return Swal.fire({
      icon: "error",
      title,
      text: message,
      confirmButtonText: "Aceptar",
    });
  }

  function warning(message, title = "Advertencia") {
    return Swal.fire({
      icon: "warning",
      title,
      text: message,
      confirmButtonText: "Aceptar",
    });
  }

  function info(message, title = "Información") {
    return Swal.fire({
      icon: "info",
      title,
      text: message,
      confirmButtonText: "Aceptar",
    });
  }

  function toastSuccess(message) {
    return Toast.fire({
      icon: "success",
      title: message,
    });
  }

  function toastError(message) {
    return Toast.fire({
      icon: "error",
      title: message,
    });
  }

  function toastWarning(message) {
    return Toast.fire({
      icon: "warning",
      title: message,
    });
  }

  function toastInfo(message) {
    return Toast.fire({
      icon: "info",
      title: message,
    });
  }

  function loading(
    title = "Procesando...",
    message = "Por favor, espera un momento.",
  ) {
    return Swal.fire({
      title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  function close() {
    Swal.close();
  }

  function getApiErrorMessage(
    response,
    fallback = "No fue posible completar la operación.",
  ) {
    if (!response) {
      return fallback;
    }

    if (response.message) {
      return response.message;
    }

    if (response.errors) {
      if (typeof response.errors === "string") {
        return response.errors;
      }

      if (Array.isArray(response.errors)) {
        return response.errors.join(" ");
      }

      if (typeof response.errors === "object") {
        const messages = [];

        Object.values(response.errors).forEach((value) => {
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

    return fallback;
  }

  return Object.freeze({
    close,
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
