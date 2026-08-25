  /**
   * ============================================================
   * Inventario PME
   * Login Controller
   * ============================================================
   *
   * Controlador de la vista de inicio de sesión.
   *
   * Responsabilidades:
   *  - Inicializar el formulario.
   *  - Capturar el submit.
   *  - Obtener las credenciales.
   *  - Validar campos básicos.
   *  - Ejecutar el login mediante AuthService.
   *  - Mostrar mensajes.
   *  - Controlar el estado del botón.
   *  - Redireccionar después de autenticarse.
   *
   * No contiene:
   *  - fetch().
   *  - JWT.
   *  - localStorage.
   * ============================================================
   */

  import AuthService from "../../services/auth_service.js";
  import Config from "../../config/config.js";

  const LoginController = (() => {
    let form = null;
    let submitButton = null;
    let messageElement = null;

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

      clearMessage();

      const credentials = getCredentials();

      if (!validateCredentials(credentials)) {
        return;
      }

      setLoading(true);

      try {
        const result = await AuthService.login(credentials);

        if (!result.ok) {
          showMessage(result.message ?? "No fue posible iniciar sesión.");

          return;
        }

        redirectAfterLogin();
      } catch (error) {
        console.error("[LOGIN] Error:", error);

        showMessage("Ocurrió un error al iniciar sesión.");
      } finally {
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
     * Valida los campos básicos.
     *
     * La validación de credenciales pertenece al backend.
     *
     * @param {{email: string, password: string}} credentials
     * @returns {boolean}
     */
    function validateCredentials(credentials) {
      if (!credentials.email) {
        showMessage("Ingresa tu correo electrónico.");

        return false;
      }

      if (!credentials.password) {
        showMessage("Ingresa tu contraseña.");

        return false;
      }

      return true;
    }

    /**
     * Muestra un mensaje.
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
     * Limpia el mensaje.
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
     * Cambia el estado del formulario.
     *
     * @param {boolean} loading
     * @returns {void}
     */
    function setLoading(loading) {
      if (!submitButton) {
        return;
      }

      submitButton.disabled = loading;

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

