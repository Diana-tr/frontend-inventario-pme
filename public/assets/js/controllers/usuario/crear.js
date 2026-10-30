import usuarioService from "../../services/usuario_service.js";
import RoleService from "../../services/role_service.js";
import NotificationService from "../../core/notification.js";

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
    
    // Cargar roles en el select
    cargarRoles();

    form.addEventListener("submit", handleSubmit);
  }
  
  async function cargarRoles() {
    try {
      const response = await RoleService.listarRoles();
      if (response && response.success) {
        const roles = response.data?.results ?? [];
        const select = $("#roles");
        
        select.empty(); // Limpiar opciones
        
        // Solo mostrar roles activos
        const rolesActivos = roles.filter(r => r.is_active);
        
        rolesActivos.forEach(role => {
          const option = new Option(role.role_name, role.id_role, false, false);
          select.append(option);
        });
        
        // Refrescar Select2
        select.trigger("change");
      }
    } catch (error) {
      console.error("[CREAR USUARIO] Error al cargar roles:", error);
    }
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
    
    // Obtener roles seleccionados usando jQuery ya que es un Select2
    const rolesSelect = $("#roles").val() || [];
    const rolesIds = rolesSelect.map(val => parseInt(val, 10));

    // Validar coincidencia de contraseñas
    if (
      passwordRepeatInput &&
      passwordInput.value !== passwordRepeatInput.value
    ) {
      await NotificationService.warning(
        "Las contraseñas no coinciden. Por favor verifique.",
        "Atención",
      );
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
    
    if (rolesIds.length > 0) {
      userData.roles = rolesIds;
    }

    console.log("[CREAR USUARIO] Enviando payload al backend:", userData);

    // Deshabilitar botón para evitar múltiples peticiones
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await usuarioService.crearUsuario(userData);
      console.log("[CREAR USUARIO] Respuesta del servidor:", response);

      if (response && (response.ok === false || response.success === false)) {
        const errorMsg = NotificationService.getApiErrorMessage(
          response,
          "No fue posible crear el usuario.",
        );
        throw new Error(errorMsg);
      }

      await NotificationService.success(
        "Usuario creado exitosamente.",
        "¡Éxito!",
      );

      // Redirección segura a la vista de la misma carpeta actual
      const actualPath = window.location.pathname.substring(
        0,
        window.location.pathname.lastIndexOf("/"),
      );
      window.location.href = `${actualPath}`;
    } catch (error) {
      console.error("[CREAR USUARIO] Error detectado:", error);

      const mensajeError = NotificationService.getApiErrorMessage(
        error,
        error.message || "No se pudo crear el usuario.",
      );

      await NotificationService.error(mensajeError, "Error al registrar");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  return Object.freeze({
    init,
  });
})();

export default CrearUsuarioController;
