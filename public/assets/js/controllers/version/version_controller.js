import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm";
import SystemService from "../../services/system_service.js";

const VersionController = (() => {
  const VERSION_ELEMENT_ID = "app-version-text";

  const CATEGORY_META = {
    FEATURE: { label: "Novedad", badge: "badge-success", icon: "fa-plus-circle" },
    IMPROVEMENT: { label: "Mejora", badge: "badge-info", icon: "fa-rocket" },
    BUGFIX: { label: "Corrección", badge: "badge-warning", icon: "fa-bug" },
    SECURITY: { label: "Seguridad", badge: "badge-danger", icon: "fa-shield-alt" },
    TECHNICAL: { label: "Técnico", badge: "badge-secondary", icon: "fa-cogs" },
    BREAKING: { label: "Cambio Importante", badge: "badge-dark", icon: "fa-exclamation-triangle" },
  };

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Inicializa la comprobación de versión instalada y sincronización en la interfaz.
   */
  async function init() {
    const versionElement = document.getElementById(VERSION_ELEMENT_ID);

    try {
      // Consultar estado global del sistema
      const response = await SystemService.obtenerInfoSistema();

      if (!response || response.success === false) {
        return;
      }

      const installedVersion = response.installed_version || response.version || "1.0.0";

      // Inyectar versión instalada en el pie de página
      if (versionElement) {
        versionElement.textContent = `v${installedVersion}`;
        versionElement.style.cursor = "pointer";
        versionElement.title = `Versión instalada v${installedVersion}. Haga clic para ver detalles del sistema.`;
        versionElement.onclick = () => showUpdateDetailsModal();
      }
    } catch (error) {
      console.warn("[VERSION CONTROLLER] No fue posible verificar la versión instalada:", error);
    }
  }

  /**
   * Abre el modal completo con el changelog categorizado de la versión.
   */
  async function showUpdateDetailsModal() {
    Swal.fire({
      title: "Consultando novedades...",
      text: "Obteniendo los detalles de la versión desde el servidor.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const updateData = await SystemService.verificarActualizaciones();
      const release = updateData.latest_release;

      if (!release) {
        Swal.fire({
          icon: "info",
          title: "Sistema Actualizado",
          text: `La versión instalada (v${updateData.installed_version}) es la más reciente.`,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#2563EB",
        });
        return;
      }

      // Renderizar changelog categorizado
      let changelogHtml = "";
      const changelog = release.changelog || {};
      const categories = Object.keys(changelog);

      if (categories.length > 0) {
        categories.forEach((catKey) => {
          const meta = CATEGORY_META[catKey] || {
            label: catKey,
            badge: "badge-secondary",
            icon: "fa-tag",
          };
          const entries = changelog[catKey] || [];

          changelogHtml += `
            <div class="mb-3 text-left">
              <h6 class="font-weight-bold mb-2">
                <span class="badge ${meta.badge} px-2 py-1 mr-1">
                  <i class="fas ${meta.icon} mr-1"></i>${escapeHtml(meta.label)}
                </span>
              </h6>
              <ul class="list-group list-group-flush border-left pl-3" style="font-size: 0.85rem;">
          `;

          entries.forEach((item) => {
            changelogHtml += `
              <li class="py-1 border-0">
                <strong>${escapeHtml(item.title)}</strong>
                ${item.description ? `<br><span class="text-muted">${escapeHtml(item.description)}</span>` : ""}
              </li>
            `;
          });

          changelogHtml += `</ul></div>`;
        });
      } else {
        changelogHtml = `
          <p class="text-muted text-left" style="font-size: 0.85rem;">
            ${escapeHtml(release.description || "Esta versión incluye mejoras generales de estabilidad y rendimiento.")}
          </p>
        `;
      }

      Swal.fire({
        title: `<span style="font-size: 1.25rem;">Novedades de la Versión v${escapeHtml(release.version)}</span>`,
        html: `
          <div class="text-left" style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
            <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <span class="badge badge-primary px-2 py-1">Versión v${escapeHtml(release.version)}</span>
                ${release.name ? `<span class="ml-2 text-muted font-italic font-weight-bold">${escapeHtml(release.name)}</span>` : ""}
              </div>
              <small class="text-muted">${release.published_at ? new Date(release.published_at).toLocaleDateString() : ""}</small>
            </div>
            ${changelogHtml}
            <div class="alert alert-light border shadow-sm text-left p-2 mb-0 mt-3" style="font-size: 0.75rem; border-left: 4px solid #2563EB !important;">
              <i class="fas fa-check-circle text-primary mr-1"></i> Esta versión ya se encuentra desplegada y disponible para su uso en el ERP SaaS.
            </div>
          </div>
        `,
        width: "650px",
        confirmButtonText: '<i class="fas fa-check mr-1"></i> Entendido',
        confirmButtonColor: "#2563EB",
      });
    } catch (error) {
      console.error("[VERSION CONTROLLER] Error al mostrar modal:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No fue posible cargar las novedades de la versión.",
        confirmButtonText: "Cerrar",
      });
    }
  }

  return Object.freeze({
    init,
    showUpdateDetailsModal,
  });
})();

export default VersionController;

