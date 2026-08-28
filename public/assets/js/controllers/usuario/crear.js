import usuarioService from "../../services/usuario_service.js";

const CrearUsuarioController = (() => {
  function init() {
    console.log("[CREAR USUARIO] Inicializando controlador...");

    const form =
      document.getElementById("form_crear_usuario") ||
      document.querySelector("form");

    if (!form) {
      console.error("[CREAR USUARIO] No se encontró el formulario en el DOM.");
      return;
    }

    form.addEventListener("submit", handleSubmit);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;

    // Referencias a las entradas del formulario
    const firstNameInput =
      document.getElementById("first_name") ||
      form.querySelector('[name="first_name"]');
    const lastNameInput =
      document.getElementById("last_name") ||
      form.querySelector('[name="last_name"]');
    const usernameInput =
      document.getElementById("username") ||
      form.querySelector('[name="username"]');
    const emailInput =
      document.getElementById("email") || form.querySelector('[name="email"]');
    const docNumberInput =
      document.getElementById("document_number") ||
      form.querySelector('[name="document_number"]');
    const phoneNumberInput =
      document.getElementById("phone_number") ||
      form.querySelector('[name="phone_number"]');
    const passwordInput =
      document.getElementById("password") ||
      form.querySelector('[name="password"]');
    const passwordRepeatInput = document.getElementById("password_repeat");

    // Validar coincidencia de contraseñas
    if (
      passwordRepeatInput &&
      passwordInput.value !== passwordRepeatInput.value
    ) {
      if (typeof Swal !== "undefined") {
        Swal.fire(
          "Atención",
          "Las contraseñas no coinciden. Por favor verifique.",
          "warning",
        );
      } else {
        alert("Las contraseñas no coinciden. Por favor verifique.");
      }
      return;
    }

    // Estructura JSON esperada por el backend Django
    const userData = {
      username: usernameInput ? usernameInput.value.trim() : "",
      password: passwordInput ? passwordInput.value : "",
      first_name: firstNameInput ? firstNameInput.value.trim() : "",
      last_name: lastNameInput ? lastNameInput.value.trim() : "",
      email: emailInput ? emailInput.value.trim() : "",
      document_number: docNumberInput ? docNumberInput.value.trim() : "",
      phone_number: phoneNumberInput ? phoneNumberInput.value.trim() : "",
    };

    console.log("[CREAR USUARIO] Enviando payload al backend:", userData);

    // Deshabilitar botón para evitar múltiples peticiones
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await usuarioService.crearUsuario(userData);
      console.log("[CREAR USUARIO] Respuesta del servidor:", response);

      if (response && (response.ok === false || response.success === false)) {
        let detalleError = "Error desconocido al registrar usuario";

        if (response.errors) {
          if (typeof response.errors === "object") {
            // Formatear respuestas de error típicas de Django DRF
            detalleError = Object.entries(response.errors)
              .map(
                ([campo, msgs]) =>
                  `${campo}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`,
              )
              .join("\n");
          } else {
            detalleError = response.errors;
          }
        } else if (response.message) {
          detalleError = response.message;
        }

        throw new Error(detalleError);
      }

      if (typeof Swal !== "undefined") {
        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Usuario creado exitosamente.",
          showConfirmButton: true,
        });
      } else {
        alert("¡Usuario creado con éxito!");
      }

      // Redirección segura a la vista  de la misma carpeta actual
      const actualPath = window.location.pathname.substring(
        0,
        window.location.pathname.lastIndexOf("/"),
      );
      window.location.href = `${actualPath}`;
    } catch (error) {
      console.error("[CREAR USUARIO] Error detectado:", error);

      let mensajeError = "No se pudo crear el usuario.";
      if (error.message) {
        mensajeError = error.message;
      }

      if (typeof Swal !== "undefined") {
        Swal.fire("Error al registrar", mensajeError, "error");
      } else {
        alert("Error al registrar: " + mensajeError);
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  return Object.freeze({
    init,
  });
})();

export default CrearUsuarioController;
