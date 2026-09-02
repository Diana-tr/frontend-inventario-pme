/**
 * ============================================================
 * Inventario PME
 * Login Controller
 * ============================================================
 *
 * Controlador de la vista de inicio de sesión.
 *
 * Responsabilidades:
 * - Inicializar el formulario.
 * - Capturar el submit.
 * - Obtener las credenciales.
 * - Validar campos básicos.
 * - Ejecutar el login mediante AuthService.
 * - Mostrar notificaciones.
 * - Controlar el estado del botón.
 * - Redireccionar después de autenticarse.
 *
 * No contiene:
 * - fetch().
 * - JWT.
 * - localStorage.
 * - sessionStorage.
 * ============================================================
 */

import Config from "../../config/config.js";
import AuthService from "../../services/auth_service.js";
import NotificationService from "../../core/notification.js";

const LoginController = (() => {
  let form = null;
  let submitButton = null;
  let messageElement = null;
  let isSubmitting = false;

  /**
   * Inicializa el controlador.
   *
   * @returns {void}
   */
  function init() {
    try {
      form = document.querySelector("#loginForm");
      submitButton = document.querySelector("#login-submit");
      messageElement = document.querySelector("#login-message");

      if (!form) {
        console.error("[LOGIN] No se encontró #loginForm.");

        return;
      }

      form.addEventListener("submit", handleSubmit);

      console.log("[LOGIN] Controlador inicializado.");
    } catch (error) {
      console.error("[LOGIN] Error al inicializar:", error);
    }
  }

  /**
   * Gestiona el envío del formulario.
   *
   * @param {SubmitEvent} event
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    clearMessage();

    const credentials = getCredentials();

    if (!validateCredentials(credentials)) {
      return;
    }

    isSubmitting = true;
    setLoading(true);

    try {
      const result = await AuthService.login(credentials);

      if (!result.ok) {
        await handleLoginError(result);

        return;
      }

      await handleLoginSuccess(result);
    } catch (error) {
      console.error("[LOGIN] Error inesperado:", error);

      await NotificationService.error(
        "No fue posible completar el inicio de sesión.",
        "Error de conexión",
      );
    } finally {
      isSubmitting = false;
      setLoading(false);
    }
  }

  /**
   * Obtiene las credenciales del formulario.
   *
   * @returns {{email: string, password: string}}
   */
  function getCredentials() {
    const formData = new FormData(form);

    return {
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
    };
  }

  /**
   * Valida los campos básicos del formulario.
   *
   * La validación de las credenciales pertenece al backend.
   *
   * @param {{email: string, password: string}} credentials
   * @returns {boolean}
   */
  function validateCredentials(credentials) {
    if (!credentials.email) {
      showMessage("Ingresa tu correo electrónico.");
      focusField("#email");

      return false;
    }

    if (!credentials.password) {
      showMessage("Ingresa tu contraseña.");
      focusField("#password");

      return false;
    }

    return true;
  }

  /**
   * Procesa un login exitoso.
   *
   * @param {Object} result
   * @returns {Promise<void>}
   */
  async function handleLoginSuccess(result) {
    const userName = result.data?.user?.first_name;

    const welcomeMessage = userName
      ? `Bienvenido, ${userName}.`
      : "Bienvenido al sistema.";

    await NotificationService.toastSuccess(welcomeMessage);

    redirectAfterLogin();
  }

  /**
   * Procesa los errores devueltos por el backend.
   *
   * @param {Object} result
   * @returns {Promise<void>}
   */
  async function handleLoginError(result) {
    const message = NotificationService.getApiErrorMessage(
      result,
      "No fue posible iniciar sesión.",
    );

    switch (result.status) {
      case 400:
        await NotificationService.warning(message, "Datos inválidos");
        break;

      case 401:
        await NotificationService.error(
          "El correo electrónico o la contraseña son incorrectos.",
          "Credenciales incorrectas",
        );
        break;

      case 403:
        await NotificationService.warning(message, "Acceso denegado");
        break;

      case 429:
        await NotificationService.warning(
          "Demasiados intentos de inicio de sesión. " +
            "Espera unos minutos antes de intentarlo nuevamente.",
          "Demasiados intentos",
        );
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        await NotificationService.error(
          "El servidor no pudo procesar el inicio de sesión. " +
            "Inténtalo nuevamente más tarde.",
          "Error del servidor",
        );
        break;

      case 0:
        await NotificationService.error(
          "No fue posible comunicarse con el servidor. " +
            "Verifica tu conexión e inténtalo nuevamente.",
          "Error de conexión",
        );
        break;

      default:
        await NotificationService.error(
          message,
          "No fue posible iniciar sesión",
        );
        break;
    }
  }

  /**
   * Muestra un mensaje accesible dentro del formulario.
   *
   * Se mantiene como apoyo para validaciones locales.
   *
   * @param {string} message
   * @returns {void}
   */
  function showMessage(message) {
    if (!messageElement) {
      return;
    }

    messageElement.textContent = message;
    messageElement.hidden = false;
  }

  /**
   * Limpia el mensaje local del formulario.
   *
   * @returns {void}
   */
  function clearMessage() {
    if (!messageElement) {
      return;
    }

    messageElement.textContent = "";
    messageElement.hidden = true;
  }

  /**
   * Coloca el foco en un campo específico.
   *
   * @param {string} selector
   * @returns {void}
   */
  function focusField(selector) {
    const field = document.querySelector(selector);

    if (field) {
      field.focus();
    }
  }

  /**
   * Cambia el estado visual del botón.
   *
   * @param {boolean} loading
   * @returns {void}
   */
  function setLoading(loading) {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = loading;
    submitButton.setAttribute("aria-busy", String(loading));

    submitButton.textContent = loading
      ? "Iniciando sesión..."
      : "Iniciar sesión";
  }

  /**
   * Redirecciona al dashboard.
   *
   * @returns {void}
   */
  function redirectAfterLogin() {
    window.location.replace(Config.BASE_PATH + Config.DASHBOARD_PATH);
  }

  return Object.freeze({
    init,
  });
})();

export default LoginController;
