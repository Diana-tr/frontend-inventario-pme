/**
 * ============================================================
 * Inventario PME
 * Role Create Controller
 * ============================================================
 */

import RoleService from "../../services/role_service.js";
import PermissionSelector from "../../components/permission_selector.js";
import NotificationService from "../../core/notification.js";

const RoleCreateController = (() => {
  const FORM_ID = "formCrearRol";
  const CONTAINER_ID = "create_permissions_container";
  let permissionCatalog = [];

  async function loadCatalog() {
    const container = document.getElementById(CONTAINER_ID);
    
    try {
      const response = await RoleService.obtenerCatalogoPermisos();
      if (response && response.success && response.data) {
        permissionCatalog = response.data.modules || [];
        
        // Renderizar el selector vacío
        PermissionSelector.render(container, permissionCatalog, {});
      } else {
        throw new Error("Respuesta inválida al cargar catálogo.");
      }
    } catch (error) {
      console.error("[ROLES] Error al cargar catálogo:", error);
      container.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle mr-2"></i> Error al cargar el catálogo de permisos.
        </div>
      `;
    }
  }

  function setupForm() {
    const form = document.getElementById(FORM_ID);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add("was-validated");
        return;
      }

      const submitBtn = document.getElementById("btn_guardar_rol");
      const container = document.getElementById(CONTAINER_ID);

      const payload = {
        role_name: document.getElementById("create_role_name").value.trim(),
        role_description: document.getElementById("create_role_description").value.trim(),
        is_active: document.getElementById("create_role_is_active").checked,
        permissions: PermissionSelector.getSelectedPermissions(container),
      };

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...';

        const response = await RoleService.crearRol(payload);

        if (response && response.success) {
          await NotificationService.success(
            "Rol creado exitosamente.",
            "¡Éxito!",
          );
          // Redirigir al listado de roles de forma dinámica
          const actualPath = window.location.pathname.substring(
            0,
            window.location.pathname.lastIndexOf("/"),
          );
          window.location.href = actualPath;
        } else {
          const errMsg = NotificationService.getApiErrorMessage(
            response,
            "No se pudo crear el rol.",
          );
          throw new Error(errMsg);
        }
      } catch (error) {
        console.error("[ROLES] Error al crear rol:", error);
        const errMsg = NotificationService.getApiErrorMessage(
          error,
          error.message || "Ocurrió un error al crear el rol.",
        );
        await NotificationService.error(errMsg, "Error al crear rol");
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar Rol';
      }
    });
  }

  function init() {
    loadCatalog();
    setupForm();
  }

  return Object.freeze({
    init,
  });
})();

export default RoleCreateController;
