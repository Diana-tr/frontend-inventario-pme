/**
 * ============================================================
 * Inventario PME
 * Caja Create Controller
 * ============================================================
 */

import CajaService from "../../services/caja_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";

const CrearCajaController = (() => {
  const FORM_ID = "form_crear_caja";
  let isSubmitting = false;

  function setupFormSubmitListener() {
    $(`#${FORM_ID}`).on("submit", async function (e) {
      e.preventDefault();

      if (isSubmitting) return;

      const form = this;
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add("was-validated");
        return;
      }

      const payload = {
        name: $("#name").val().trim(),
        description: $("#description").val().trim(),
      };

      isSubmitting = true;

      NotificationService.loading("Guardando caja registradora...");

      try {
        const response = await CajaService.crearCajaRegistradora(payload);

        if (response && response.success) {
          NotificationService.success("Caja creada exitosamente.");

          setTimeout(() => {
            window.location.href = "/frontend-inventario-pme/caja";
          }, 1500);

          return;
        }

        NotificationService.error(
          NotificationService.getApiErrorMessage(response)
        );
        isSubmitting = false;
      } catch (error) {
        console.error("[CREAR CAJA] Error al crear caja:", error);
        NotificationService.error(
          "Ocurrió un error inesperado al guardar la caja registradora."
        );
        isSubmitting = false;
      }
    });
  }

  function init() {
    // Validar permisos
    if (!SecurityManager.hasPermission("cash.create")) {
      SecurityManager.redirectIfUnauthorized("cash.create");
      return;
    }

    setupFormSubmitListener();
  }

  return Object.freeze({
    init,
  });
})();

export default CrearCajaController;
