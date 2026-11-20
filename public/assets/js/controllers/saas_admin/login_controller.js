/**
 * ============================================================
 * SaaS Admin - Login Controller
 * Proyecto P.M.E. — Plataforma SaaS Multi-Tenant
 * ============================================================
 * Gestión de autenticación segura para administradores globales,
 * verificación estricta de privilegios con SweetAlert2 y protección anti-duplicados.
 */

import Config from "../../config/config.js";
import AuthService from "../../services/auth_service.js";
import ApiClient from "../../core/apiClient.js";
import Storage from "../../storage/storage.js";
import NotificationService from "../../core/notification.js";
import SwalFallback from "https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm";

const Swal = typeof window !== "undefined" && window.Swal ? window.Swal : SwalFallback;

const SaasLoginController = (() => {
  let form = null;
  let submitButton = null;
  let alertElement = null;
  let isSubmitting = false;

  function init() {
    form = document.getElementById("saasLoginForm");
    submitButton = document.getElementById("saas-login-submit");
    alertElement = document.getElementById("saas-login-alert");

    if (!form) return;

    form.addEventListener("submit", handleSubmit);

    const toggleBtn = document.getElementById("btn-toggle-saas-pass");
    const passInput = document.getElementById("saas_password");
    if (toggleBtn && passInput) {
      toggleBtn.addEventListener("click", () => {
        const isPass = passInput.getAttribute("type") === "password";
        passInput.setAttribute("type", isPass ? "text" : "password");
        toggleBtn.setAttribute("aria-pressed", String(isPass));
        const icon = toggleBtn.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-eye", isPass);
          icon.classList.toggle("fa-eye-slash", !isPass);
        }
      });
    }
  }

  function showAlert(message, type = "danger") {
    if (!alertElement) return;
    alertElement.className = `saas-alert saas-alert-${type}`;
    alertElement.innerHTML = `
      <i class="fas fa-${type === 'danger' ? 'circle-exclamation' : 'circle-info'} mt-1"></i>
      <div>${message}</div>
    `;
    alertElement.removeAttribute("hidden");
  }

  function clearAlert() {
    if (!alertElement) return;
    alertElement.setAttribute("hidden", "true");
    alertElement.innerHTML = "";
  }

  function setLoading(loading) {
    if (!submitButton) return;
    if (loading) {
      submitButton.disabled = true;
      submitButton.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i> Verificando credenciales...`;
    } else {
      submitButton.disabled = false;
      submitButton.innerHTML = `<span>Acceder a la Administración</span><i class="fas fa-arrow-right ml-2"></i>`;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    clearAlert();

    const email = document.getElementById("saas_email")?.value.trim() || "";
    const password = document.getElementById("saas_password")?.value || "";

    if (!email) {
      showAlert("Ingrese su correo electrónico o identificador administrativo.");
      document.getElementById("saas_email")?.focus();
      return;
    }

    if (!password) {
      showAlert("Ingrese su contraseña de acceso.");
      document.getElementById("saas_password")?.focus();
      return;
    }

    isSubmitting = true;
    setLoading(true);

    try {
      // 1. Limpieza preventiva total de cualquier sesión residual previa
      Storage.clear();
      sessionStorage.clear();

      // 2. Autenticación contra el backend central
      const loginResult = await AuthService.login({ email, password });

      if (!loginResult.ok) {
        let title = "Acceso no autorizado";
        let msg = loginResult.message || "Credenciales administrativas incorrectas.";

        if (loginResult.code === "ACCOUNT_LOCKED") {
          title = "Cuenta Bloqueada";
          msg = "Su cuenta administrativa ha sido bloqueada temporalmente por exceso de intentos fallidos. Contacte con seguridad.";
        }

        showAlert(msg, "danger");

        // Diálogo SweetAlert2 con estilo oscuro corporativo
        Swal.fire({
          icon: "error",
          title: title,
          text: msg,
          confirmButtonText: '<i class="fas fa-redo-alt mr-1"></i> Reintentar',
          confirmButtonColor: "#2563EB",
          background: "#0F172A",
          color: "#F8FAFC",
          customClass: {
            popup: "saas-swal-dark"
          }
        });

        setLoading(false);
        isSubmitting = false;
        return;
      }

      const user = Storage.getUser();

      // 3. Verificación de autorización estricta en el cliente
      // Un usuario regular de empresa (tenant) NO debe acceder a SaaS Admin
      const isSuperuser = !!user?.is_superuser;
      const isStaff = !!user?.is_staff;

      if (!isSuperuser && !isStaff) {
        console.warn("[SAAS AUTH] Usuario empresarial sin privilegios SaaS intentó acceder al portal admin.");
        Storage.clear();
        sessionStorage.clear();

        const deniedMsg = "Esta cuenta no cuenta con autorización para administrar la plataforma SaaS. Si es cliente de una empresa, ingrese desde el portal del ERP.";
        showAlert(deniedMsg, "danger");

        Swal.fire({
          icon: "warning",
          title: "Acceso Restringido",
          text: deniedMsg,
          confirmButtonText: '<i class="fas fa-store mr-1"></i> Ir al Acceso ERP',
          showCancelButton: true,
          cancelButtonText: "Cerrar",
          confirmButtonColor: "#2563EB",
          cancelButtonColor: "#475569",
          background: "#0F172A",
          color: "#F8FAFC",
          customClass: {
            popup: "saas-swal-dark"
          }
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.replace(`${Config.BASE_PATH || ""}/login`);
          }
        });

        setLoading(false);
        isSubmitting = false;
        return;
      }

      // 4. Verificación activa en el servidor: consultar endpoint protegido
      const checkResponse = await ApiClient.get("/api/v1/saas-admin/tenants/metrics/");
      if (!checkResponse.ok || !checkResponse.success) {
        console.warn("[SAAS AUTH] El backend denegó el acceso a los endpoints de administración global.");
        Storage.clear();
        sessionStorage.clear();

        const deniedBackendMsg = "Acceso denegado por el servidor: Privilegios administrativos insuficientes.";
        showAlert(deniedBackendMsg, "danger");

        Swal.fire({
          icon: "error",
          title: "Privilegios Insuficientes",
          text: deniedBackendMsg,
          confirmButtonText: '<i class="fas fa-check mr-1"></i> Entendido',
          confirmButtonColor: "#2563EB",
          background: "#0F172A",
          color: "#F8FAFC",
          customClass: {
            popup: "saas-swal-dark"
          }
        });

        setLoading(false);
        isSubmitting = false;
        return;
      }

      // 5. Autenticación y autorización exitosas
      submitButton.innerHTML = `<i class="fas fa-check-circle mr-2 text-success"></i> Acceso Autorizado...`;

      NotificationService.toastSuccess(`Bienvenido al Panel SaaS, ${user.first_name || user.username}.`);

      setTimeout(() => {
        window.location.replace(`${Config.BASE_PATH}/saas-admin/dashboard`);
      }, 500);

    } catch (error) {
      console.error("[SAAS LOGIN] Error durante la autenticación:", error);
      Storage.clear();
      sessionStorage.clear();

      const netErrorMsg = "Ocurrió un error de conexión al comunicarse con el servidor central.";
      showAlert(netErrorMsg, "danger");

      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: netErrorMsg,
        confirmButtonText: '<i class="fas fa-redo-alt mr-1"></i> Reintentar',
        confirmButtonColor: "#2563EB",
        background: "#0F172A",
        color: "#F8FAFC",
        customClass: {
          popup: "saas-swal-dark"
        }
      });

      setLoading(false);
      isSubmitting = false;
    }
  }

  return Object.freeze({
    init,
  });
})();

export default SaasLoginController;
