import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";
import SystemService from "../../services/system_service.js";
import ApiClient from "../../core/apiClient.js";
import { escapeHtml } from "../../core/utils.js";

const VersionesController = (() => {
  let versionesList = [];

  const CATEGORY_MAP = Object.freeze({
    FEATURE: { label: "Novedad", badge: "badge-success", icon: "fa-plus-circle" },
    IMPROVEMENT: { label: "Mejora", badge: "badge-info", icon: "fa-rocket" },
    BUGFIX: { label: "Corrección", badge: "badge-warning", icon: "fa-bug" },
    SECURITY: { label: "Seguridad", badge: "badge-danger", icon: "fa-shield-alt" },
    TECHNICAL: { label: "Técnico", badge: "badge-secondary", icon: "fa-cogs" },
    BREAKING: { label: "Incompatible", badge: "badge-dark", icon: "fa-exclamation-triangle" },
  });

  function getPriorityBadge(priority) {
    const badges = {
      MANDATORY: '<span class="badge badge-danger">Obligatoria</span>',
      RECOMMENDED: '<span class="badge badge-primary">Recomendada</span>',
      OPTIONAL: '<span class="badge badge-light border">Opcional</span>',
    };
    return badges[priority] || `<span class="badge badge-secondary">${escapeHtml(priority)}</span>`;
  }

  async function init() {
    SecurityManager.redirectIfUnauthorized("settings.view");
    setupEvents();
    await cargarDatos();
  }

  function setupEvents() {
    const btnVerificar = document.getElementById("btn_verificar_actualizaciones");
    if (btnVerificar) {
      btnVerificar.addEventListener("click", async () => {
        NotificationService.loading("Verificando actualizaciones...", "Consultando la plataforma");
        await cargarDatos();
        NotificationService.close();
        NotificationService.toastSuccess("Información de versiones actualizada.");
      });
    }
  }

  async function cargarDatos() {
    const loader = document.getElementById("versiones_loader");
    const content = document.getElementById("versiones_content");

    if (loader) loader.style.display = "block";
    if (content) content.style.display = "none";

    try {
      // 1. Obtener información del sistema y versión instalada
      let sysInfo = null;
      try {
        sysInfo = await SystemService.obtenerInfoSistema();
      } catch (e) {
        console.warn("[VERSIONES CLIENTE] No se pudo obtener sysInfo:", e);
      }

      // 2. Obtener lista de versiones publicadas desde la API
      const response = await ApiClient.get("/api/v1/versions/");

      if (response && response.success && response.data) {
        versionesList = response.data.results || (Array.isArray(response.data) ? response.data : []);

        renderKPIs(sysInfo);
        renderTabla();

        if (loader) loader.style.display = "none";
        if (content) content.style.display = "block";
      } else {
        NotificationService.error("No se pudo cargar el historial de versiones.");
        if (loader) loader.style.display = "none";
      }
    } catch (error) {
      console.error("[VERSIONES CLIENTE] Error:", error);
      NotificationService.error("Error de comunicación al consultar versiones.");
      if (loader) loader.style.display = "none";
    }
  }

  function renderKPIs(sysInfo) {
    const sysData = (sysInfo && sysInfo.data && typeof sysInfo.data === "object") ? sysInfo.data : (sysInfo || {});
    const rawInstalled = sysData.installed_version || sysData.version || sysInfo?.installed_version || "1.0.0";
    const installed = String(rawInstalled).trim().replace(/^v/i, "");
    $("#kpi_installed_version").text(`v${installed}`);

    const published = versionesList.filter((v) => v.status === "PUBLISHED");
    $("#txt_total_publicadas").text(`${published.length} versiones oficiales disponibles`);

    if (published.length > 0) {
      const latest = published[0];
      const cleanLatest = String(latest.version).trim().replace(/^v/i, "");
      $("#kpi_latest_version").text(`v${cleanLatest}`);
      if (latest.published_at) {
        $("#kpi_latest_date").html(`<i class="fas fa-calendar-alt mr-1"></i>${new Date(latest.published_at).toLocaleDateString("es-CO")}`);
      }

      // Comparar con instalada
      if (cleanLatest === installed) {
        $("#kpi_update_status").text("Al Día").removeClass("text-warning text-danger").addClass("text-success");
        $("#kpi_update_subtext").html('<i class="fas fa-check-circle mr-1 text-success"></i>Su sistema posee la última versión oficial');
      } else {
        $("#kpi_update_status").text("Nueva Versión Disponible").removeClass("text-success").addClass("text-warning");
        $("#kpi_update_subtext").html(`<i class="fas fa-arrow-up mr-1 text-warning"></i>v${cleanLatest} lista para consultar`);
      }
    } else {
      $("#kpi_latest_version").text(`v${installed}`);
      $("#kpi_update_status").text("Sincronizado").addClass("text-success");
      $("#kpi_update_subtext").text("Sin publicaciones pendientes");
    }
  }

  function renderTabla() {
    const tbody = $("#tbody_versiones");
    tbody.empty();

    // En el portal de clientes solo se muestran versiones publicadas
    const publicadas = versionesList.filter((v) => v.status === "PUBLISHED");

    if (publicadas.length === 0) {
      tbody.html(`
        <tr>
          <td colspan="6" class="text-center py-5 text-muted">
            <i class="fas fa-check-circle fa-3x mb-3 text-success"></i>
            <p class="mb-0">No hay versiones pendientes. Su plataforma se encuentra al día.</p>
          </td>
        </tr>
      `);
      return;
    }

    publicadas.forEach((v) => {
      const pubDate = v.published_at
        ? new Date(v.published_at).toLocaleDateString("es-CO", { dateStyle: "medium" })
        : "Reciente";

      const changelogCount = v.changelog_entries ? v.changelog_entries.length : (v.total_changes || 0);

      tbody.append(`
        <tr>
          <td class="pl-4 font-weight-bold">
            <span class="text-primary font-monospace" style="font-size: 1rem;">v${escapeHtml(v.version)}</span>
          </td>
          <td>
            <strong class="text-dark">${escapeHtml(v.name || "Actualización del Sistema")}</strong>
            ${v.description ? `<br><small class="text-muted text-truncate d-inline-block" style="max-width:320px;">${escapeHtml(v.description)}</small>` : ""}
          </td>
          <td>${getPriorityBadge(v.priority)}</td>
          <td><i class="far fa-calendar-alt mr-1 text-muted"></i>${pubDate}</td>
          <td>
            <span class="badge badge-light border px-2 py-1">
              <i class="fas fa-check-double mr-1 text-primary"></i>${changelogCount} cambio${changelogCount === 1 ? "" : "s"}
            </span>
          </td>
          <td class="text-right pr-4">
            <button class="btn btn-sm btn-outline-primary btn-ver-detalles-cliente" data-id="${v.id_version}" style="border-radius: 6px;">
              <i class="fas fa-eye mr-1"></i> Ver Novedades
            </button>
          </td>
        </tr>
      `);
    });

    $(".btn-ver-detalles-cliente").off("click").on("click", function () {
      abrirModalDetalles($(this).data("id"));
    });
  }

  async function abrirModalDetalles(id) {
    try {
      NotificationService.loading("Cargando detalles...");
      const res = await ApiClient.get(`/api/v1/versions/${id}/`);
      NotificationService.close();

      if (res && res.success && res.data) {
        const v = res.data;
        $("#detalle_modal_version").text(`v${v.version}`);
        $("#detalle_modal_title").text(v.name || "Actualización del Sistema");
        $("#detalle_modal_priority").html(getPriorityBadge(v.priority));
        $("#detalle_modal_date").text(v.published_at ? new Date(v.published_at).toLocaleDateString("es-CO", { dateStyle: "long" }) : "Lanzamiento oficial");
        $("#detalle_modal_desc").text(v.description || "Esta versión contiene mejoras operativas y optimizaciones de rendimiento.");

        const list = $("#detalle_modal_changelog");
        list.empty();
        const entries = v.changelog_entries || [];

        if (entries.length === 0) {
          list.html('<p class="text-muted small mb-0">No se detallaron cambios específicos en este registro.</p>');
        } else {
          entries.forEach((e) => {
            const meta = CATEGORY_MAP[e.category] || { label: e.category, badge: "badge-secondary", icon: "fa-tag" };
            list.append(`
              <div class="mb-2 pb-2 border-bottom">
                <span class="badge ${meta.badge} mr-1"><i class="fas ${meta.icon} mr-1"></i>${meta.label}</span>
                <strong>${escapeHtml(e.title)}</strong>
                ${e.module ? `<span class="badge badge-light border ml-1">${escapeHtml(e.module)}</span>` : ""}
                ${e.description ? `<p class="mb-0 text-muted small mt-1">${escapeHtml(e.description)}</p>` : ""}
              </div>
            `);
          });
        }
        $("#modal_detalles").modal("show");
      }
    } catch (err) {
      NotificationService.close();
      NotificationService.error("No se pudieron cargar los detalles de la versión.");
    }
  }

  return Object.freeze({
    init,
  });
})();

export default VersionesController;
