import SaaSVersionService from "../../services/saas_version_service.js";
import NotificationService from "../../core/notification.js";
import { escapeHtml } from "../../core/utils.js";

const SaasVersionesController = (() => {
  let versionesList = [];
  let currentManagingVersionId = null;
  let currentPublishingVersion = null;

  const CATEGORY_MAP = Object.freeze({
    FEATURE: { label: "Novedad", badge: "badge-success", icon: "fa-plus-circle" },
    IMPROVEMENT: { label: "Mejora", badge: "badge-info", icon: "fa-rocket" },
    BUGFIX: { label: "Corrección", badge: "badge-warning", icon: "fa-bug" },
    SECURITY: { label: "Seguridad", badge: "badge-danger", icon: "fa-shield-alt" },
    TECHNICAL: { label: "Técnico", badge: "badge-secondary", icon: "fa-cogs" },
    BREAKING: { label: "Incompatible", badge: "badge-dark", icon: "fa-exclamation-triangle" },
  });

  function getStatusBadge(status) {
    const badges = {
      PUBLISHED: '<span class="badge badge-success px-2 py-1"><i class="fas fa-check-circle mr-1"></i>Publicada</span>',
      DRAFT: '<span class="badge badge-warning px-2 py-1"><i class="fas fa-edit mr-1"></i>Borrador</span>',
      WITHDRAWN: '<span class="badge badge-danger px-2 py-1"><i class="fas fa-ban mr-1"></i>Retirada</span>',
    };
    return badges[status] || `<span class="badge badge-secondary px-2 py-1">${escapeHtml(status)}</span>`;
  }

  function getPriorityBadge(priority) {
    const badges = {
      MANDATORY: '<span class="badge badge-danger">Obligatoria</span>',
      RECOMMENDED: '<span class="badge badge-primary">Recomendada</span>',
      OPTIONAL: '<span class="badge badge-light border">Opcional</span>',
    };
    return badges[priority] || `<span class="badge badge-secondary">${escapeHtml(priority)}</span>`;
  }

  async function init() {
    setupEvents();
    await cargarVersiones();
  }

  function setupEvents() {
    // Botón nueva versión
    $("#btn_modal_nueva_version").on("click", abrirModalCrear);

    // Botón refrescar
    $("#btn_refrescar_versiones").on("click", async () => {
      NotificationService.loading("Actualizando...", "Consultando versiones");
      await cargarVersiones();
      NotificationService.close();
      NotificationService.toastSuccess("Lista de versiones actualizada.");
    });

    // Filtro estado
    $("#filtro_estado_version").on("change", renderTabla);

    // Formulario versión
    $("#form_version").on("submit", handleGuardarVersion);

    // Formulario changelog
    $("#form_add_changelog").on("submit", handleAgregarChangelog);

    // Checkbox forzar publicación
    $("#check_force_publish").on("change", function () {
      $("#seccion_force_reason").toggle(this.checked);
    });

    // Botón confirmar publicación
    $("#btn_confirmar_publicar").on("click", handleEjecutarPublicacion);

    // Formulario retirar
    $("#form_retirar_version").on("submit", handleEjecutarRetirada);
  }

  async function cargarVersiones() {
    $("#versiones_loader").show();
    $("#versiones_content").hide();

    try {
      const response = await SaaSVersionService.listarVersiones();
      if (response && response.success && response.data) {
        versionesList = response.data.results || (Array.isArray(response.data) ? response.data : []);

        actualizarKPIs();
        renderTabla();

        $("#versiones_loader").hide();
        $("#versiones_content").fadeIn();
      } else {
        NotificationService.error("No fue posible cargar las versiones.");
        $("#versiones_loader").hide();
      }
    } catch (error) {
      console.error("[SAAS VERSIONES] Error cargando versiones:", error);
      NotificationService.error("Error al consultar el catálogo de versiones.");
      $("#versiones_loader").hide();
    }
  }

  function actualizarKPIs() {
    const total = versionesList.length;
    const published = versionesList.filter((v) => v.status === "PUBLISHED").length;
    const drafts = versionesList.filter((v) => v.status === "DRAFT").length;
    const withdrawn = versionesList.filter((v) => v.status === "WITHDRAWN").length;

    $("#kpi_total_versiones").text(total);
    $("#kpi_publicadas").text(published);
    $("#kpi_borradores").text(drafts);
    $("#kpi_retiradas").text(withdrawn);
  }

  function renderTabla() {
    const tbody = $("#tbody_versiones");
    tbody.empty();

    const filtroEstado = $("#filtro_estado_version").val();
    const filtradas = filtroEstado
      ? versionesList.filter((v) => v.status === filtroEstado)
      : versionesList;

    if (filtradas.length === 0) {
      tbody.html(`
        <tr>
          <td colspan="8" class="text-center py-5 text-muted">
            <i class="fas fa-code-branch fa-3x mb-3 text-light"></i>
            <p class="mb-0">No se encontraron versiones registradas con el filtro aplicado.</p>
          </td>
        </tr>
      `);
      return;
    }

    filtradas.forEach((v) => {
      const isDraft = v.status === "DRAFT";
      const isPublished = v.status === "PUBLISHED";
      const isWithdrawn = v.status === "WITHDRAWN";

      const pubDate = v.published_at
        ? new Date(v.published_at).toLocaleDateString("es-CO", { dateStyle: "medium" })
        : '<span class="text-muted font-italic">No publicada</span>';

      const publisher =
        v.published_by_name ||
        (v.published_by
          ? (v.published_by.full_name || v.published_by.username || v.published_by.email)
          : null);

      const publisherHtml = publisher
        ? `<small class="text-muted font-weight-500">${escapeHtml(publisher)}</small>`
        : '<span class="text-muted font-italic">---</span>';

      const changelogCount = v.changelog_entries ? v.changelog_entries.length : (v.total_changes || 0);

      const rowHtml = `
        <tr>
          <td class="pl-4 font-weight-bold">
            <span class="text-primary font-monospace" style="font-size: 1rem;">v${escapeHtml(v.version)}</span>
          </td>
          <td>
            <strong class="text-dark">${escapeHtml(v.name || "Sin nombre")}</strong>
            ${v.description ? `<br><small class="text-muted text-truncate d-inline-block" style="max-width:260px;">${escapeHtml(v.description)}</small>` : ""}
          </td>
          <td>${getStatusBadge(v.status)}</td>
          <td>${getPriorityBadge(v.priority)}</td>
          <td>${pubDate}</td>
          <td>
            <button class="btn btn-sm btn-outline-info btn-manage-changelog px-2 py-1" data-id="${v.id_version}" title="Administrar novedades">
              <i class="fas fa-list-ul mr-1"></i> ${changelogCount} cambio${changelogCount === 1 ? "" : "s"}
            </button>
          </td>
          <td>${publisherHtml}</td>
          <td class="text-right pr-4">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary btn-ver-detalles" data-id="${v.id_version}" title="Ver Detalle">
                <i class="fas fa-eye"></i>
              </button>
              ${
                isDraft
                  ? `
                  <button class="btn btn-outline-primary btn-editar-version" data-id="${v.id_version}" title="Editar Borrador">
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                  <button class="btn btn-outline-success btn-publicar-version" data-id="${v.id_version}" title="Publicar Versión">
                    <i class="fas fa-upload"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-eliminar-borrador" data-id="${v.id_version}" title="Eliminar Borrador">
                    <i class="fas fa-trash"></i>
                  </button>
                  `
                  : ""
              }
              ${
                isPublished
                  ? `
                  <button class="btn btn-outline-warning btn-retirar-version" data-id="${v.id_version}" title="Retirar Versión">
                    <i class="fas fa-ban"></i>
                  </button>
                  `
                  : ""
              }
            </div>
          </td>
        </tr>
      `;
      tbody.append(rowHtml);
    });

    // Delegación de eventos en tabla
    $(".btn-ver-detalles").off("click").on("click", function () {
      abrirModalDetalles($(this).data("id"));
    });
    $(".btn-editar-version").off("click").on("click", function () {
      abrirModalEditar($(this).data("id"));
    });
    $(".btn-manage-changelog").off("click").on("click", function () {
      abrirModalChangelog($(this).data("id"));
    });
    $(".btn-publicar-version").off("click").on("click", function () {
      abrirModalPublicar($(this).data("id"));
    });
    $(".btn-retirar-version").off("click").on("click", function () {
      abrirModalRetirar($(this).data("id"));
    });
    $(".btn-eliminar-borrador").off("click").on("click", function () {
      confirmarEliminarBorrador($(this).data("id"));
    });
  }

  function abrirModalCrear() {
    $("#modal_version_title").html('<i class="fas fa-plus-circle text-primary mr-2"></i>Registrar Borrador de Versión');
    $("#version_id").val("");
    $("#version_number").val("").prop("readonly", false);
    $("#version_name").val("");
    $("#version_priority").val("RECOMMENDED");
    $("#version_description").val("");
    $("#version_min_compatible").val("");
    $("#version_prerequisites").val("");
    $("#version_upgrade_instructions").val("");
    $("#modal_version").modal("show");
  }

  function abrirModalEditar(id) {
    const v = versionesList.find((item) => item.id_version === id);
    if (!v) return;

    $("#modal_version_title").html(`<i class="fas fa-pencil-alt text-warning mr-2"></i>Editar Borrador v${escapeHtml(v.version)}`);
    $("#version_id").val(v.id_version);
    $("#version_number").val(v.version).prop("readonly", true);
    $("#version_name").val(v.name || "");
    $("#version_priority").val(v.priority || "RECOMMENDED");
    $("#version_description").val(v.description || "");
    $("#version_min_compatible").val(v.min_compatible_version || "");
    $("#version_prerequisites").val(v.prerequisites || "");
    $("#version_upgrade_instructions").val(v.upgrade_instructions || "");
    $("#modal_version").modal("show");
  }

  async function handleGuardarVersion(e) {
    e.preventDefault();
    const id = $("#version_id").val();
    const isEditing = !!id;

    const versionNum = $("#version_number").val().trim();
    if (!/^\d+\.\d+\.\d+$/.test(versionNum)) {
      NotificationService.error("El número de versión debe seguir formato SemVer estricto (ej: 1.2.0).");
      return;
    }

    const payload = {
      version: versionNum,
      name: $("#version_name").val().trim(),
      priority: $("#version_priority").val(),
      description: $("#version_description").val().trim(),
      min_compatible_version: $("#version_min_compatible").val().trim() || null,
      prerequisites: $("#version_prerequisites").val().trim() || null,
      upgrade_instructions: $("#version_upgrade_instructions").val().trim() || null,
    };

    try {
      NotificationService.loading(isEditing ? "Actualizando borrador..." : "Registrando borrador...");
      let res;
      if (isEditing) {
        res = await SaaSVersionService.actualizarVersion(id, payload);
      } else {
        res = await SaaSVersionService.crearVersion(payload);
      }
      NotificationService.close();

      if (res && res.success) {
        NotificationService.toastSuccess(`Versión ${isEditing ? "actualizada" : "registrada"} correctamente.`);
        $("#modal_version").modal("hide");
        await cargarVersiones();
      } else {
        NotificationService.error(NotificationService.getApiErrorMessage(res));
      }
    } catch (error) {
      NotificationService.close();
      NotificationService.error("Error al guardar la versión.");
    }
  }

  async function abrirModalChangelog(id) {
    currentManagingVersionId = id;
    try {
      NotificationService.loading("Cargando cambios...");
      const res = await SaaSVersionService.obtenerVersion(id);
      NotificationService.close();

      if (res && res.success && res.data) {
        const v = res.data;
        $("#changelog_version_title").text(`v${v.version} - ${v.name || "Sin nombre"}`);
        $("#changelog_entry_title").val("");
        $("#changelog_entry_description").val("");
        $("#changelog_entry_module").val("");
        $("#changelog_entry_category").val("FEATURE");

        renderListaChangelog(v.changelog_entries || []);
        $("#modal_changelog").modal("show");
      }
    } catch (error) {
      NotificationService.close();
      NotificationService.error("No se pudo cargar el changelog.");
    }
  }

  function renderListaChangelog(entries) {
    const list = $("#changelog_entries_list");
    list.empty();

    if (!entries || entries.length === 0) {
      list.html('<div class="text-center text-muted py-4"><i class="fas fa-inbox fa-2x mb-2 text-light"></i><p class="mb-0">No hay cambios registrados en este changelog.</p></div>');
      return;
    }

    entries.forEach((e) => {
      const meta = CATEGORY_MAP[e.category] || { label: e.category, badge: "badge-secondary", icon: "fa-tag" };
      list.append(`
        <div class="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
          <div>
            <span class="badge ${meta.badge} mr-2"><i class="fas ${meta.icon} mr-1"></i>${meta.label}</span>
            <strong class="text-dark">${escapeHtml(e.title)}</strong>
            ${e.module ? `<span class="badge badge-light border ml-1">${escapeHtml(e.module)}</span>` : ""}
            ${e.description ? `<p class="mb-0 text-muted small mt-1">${escapeHtml(e.description)}</p>` : ""}
          </div>
          <button class="btn btn-sm btn-outline-danger btn-delete-changelog ml-3" data-id="${e.id_entry || e.id}" title="Eliminar entrada">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `);
    });

    $(".btn-delete-changelog").off("click").on("click", async function () {
      const changelogId = $(this).data("id");
      try {
        NotificationService.loading("Eliminando entrada...");
        await SaaSVersionService.eliminarChangelog(currentManagingVersionId, changelogId);
        NotificationService.close();
        NotificationService.toastSuccess("Entrada eliminada.");
        await abrirModalChangelog(currentManagingVersionId);
        await cargarVersiones();
      } catch (err) {
        NotificationService.close();
        NotificationService.error("Error al eliminar la entrada.");
      }
    });
  }

  async function handleAgregarChangelog(e) {
    e.preventDefault();
    if (!currentManagingVersionId) return;

    const payload = {
      category: $("#changelog_entry_category").val(),
      title: $("#changelog_entry_title").val().trim(),
      description: $("#changelog_entry_description").val().trim(),
      module: $("#changelog_entry_module").val().trim(),
    };

    if (!payload.title) {
      NotificationService.error("El título del cambio es obligatorio.");
      return;
    }

    try {
      NotificationService.loading("Agregando novedad...");
      const res = await SaaSVersionService.agregarChangelog(currentManagingVersionId, payload);
      NotificationService.close();

      if (res && res.success) {
        NotificationService.toastSuccess("Cambio agregado al changelog.");
        $("#changelog_entry_title").val("");
        $("#changelog_entry_description").val("");
        await abrirModalChangelog(currentManagingVersionId);
        await cargarVersiones();
      } else {
        NotificationService.error(NotificationService.getApiErrorMessage(res));
      }
    } catch (err) {
      NotificationService.close();
      NotificationService.error("Error al registrar el cambio.");
    }
  }

  function abrirModalPublicar(id) {
    const v = versionesList.find((item) => item.id_version === id);
    if (!v) return;

    currentPublishingVersion = v;
    $("#publicar_version_name").text(`v${v.version} - ${v.name || ""}`);
    $("#check_force_publish").prop("checked", false);
    $("#seccion_force_reason").hide();
    $("#input_force_reason").val("");
    $("#modal_publicar").modal("show");
  }

  async function handleEjecutarPublicacion() {
    if (!currentPublishingVersion) return;

    const force = $("#check_force_publish").is(":checked");
    const reason = $("#input_force_reason").val().trim();

    if (force && !reason) {
      NotificationService.error("Si fuerza la publicación, debe justificar el motivo.");
      return;
    }

    try {
      NotificationService.loading("Publicando versión...", "Notificando a la plataforma");
      const res = await SaaSVersionService.publicarVersion(currentPublishingVersion.id_version, {
        force,
        force_reason: reason,
      });
      NotificationService.close();

      if (res && res.success) {
        NotificationService.toastSuccess(`Versión v${currentPublishingVersion.version} publicada exitosamente.`);
        $("#modal_publicar").modal("hide");
        await cargarVersiones();
      } else {
        NotificationService.error(NotificationService.getApiErrorMessage(res));
      }
    } catch (error) {
      NotificationService.close();
      NotificationService.error("Fallo al publicar la versión.");
    }
  }

  function abrirModalRetirar(id) {
    const v = versionesList.find((item) => item.id_version === id);
    if (!v) return;

    $("#retirar_version_id").val(v.id_version);
    $("#retirar_version_name").text(`v${v.version} - ${v.name || ""}`);
    $("#retirar_reason").val("");
    $("#modal_retirar").modal("show");
  }

  async function handleEjecutarRetirada(e) {
    e.preventDefault();
    const id = $("#retirar_version_id").val();
    const reason = $("#retirar_reason").val().trim();

    if (!reason) {
      NotificationService.error("Debe especificar el motivo del retiro de la versión.");
      return;
    }

    try {
      NotificationService.loading("Retirando versión...");
      const res = await SaaSVersionService.retirarVersion(id, { reason });
      NotificationService.close();

      if (res && res.success) {
        NotificationService.toastSuccess("Versión retirada del catálogo activo.");
        $("#modal_retirar").modal("hide");
        await cargarVersiones();
      } else {
        NotificationService.error(NotificationService.getApiErrorMessage(res));
      }
    } catch (err) {
      NotificationService.close();
      NotificationService.error("Error al retirar la versión.");
    }
  }

  async function confirmarEliminarBorrador(id) {
    const result = await NotificationService.warning(
      "¿Está seguro de eliminar este borrador de versión? Esta acción no se puede deshacer.",
      "Eliminar Borrador"
    );
    if (!result.isConfirmed) return;

    try {
      NotificationService.loading("Eliminando...");
      const res = await SaaSVersionService.eliminarVersion(id);
      NotificationService.close();

      if (res && res.success) {
        NotificationService.toastSuccess("Borrador eliminado correctamente.");
        await cargarVersiones();
      } else {
        NotificationService.error(NotificationService.getApiErrorMessage(res));
      }
    } catch (err) {
      NotificationService.close();
      NotificationService.error("Error al eliminar el borrador.");
    }
  }

  async function abrirModalDetalles(id) {
    try {
      NotificationService.loading("Cargando detalles...");
      const res = await SaaSVersionService.obtenerVersion(id);
      NotificationService.close();

      if (res && res.success && res.data) {
        const v = res.data;
        $("#detalle_modal_version").text(`v${v.version}`);
        $("#detalle_modal_title").text(v.name || "Sin nombre descriptivo");
        $("#detalle_modal_status").html(getStatusBadge(v.status));
        $("#detalle_modal_priority").html(getPriorityBadge(v.priority));
        $("#detalle_modal_date").text(v.published_at ? new Date(v.published_at).toLocaleString("es-CO") : "No publicada");
        $("#detalle_modal_desc").text(v.description || "Sin descripción proporcionada.");

        const list = $("#detalle_modal_changelog");
        list.empty();
        const entries = v.changelog_entries || [];
        if (entries.length === 0) {
          list.html('<p class="text-muted small">No hay cambios registrados en este lanzamiento.</p>');
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
      NotificationService.error("No se pudo cargar el detalle de la versión.");
    }
  }

  return Object.freeze({
    init,
  });
})();

export default SaasVersionesController;
