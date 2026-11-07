import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";
import SystemService from "../../services/system_service.js";

const VersionesController = (() => {
  let versionesList = [];
  let currentManagingVersionId = null;
  let currentPublishingVersion = null;

  const CATEGORY_MAP = {
    FEATURE: { label: "Novedad", badge: "badge-success", icon: "fa-plus-circle" },
    IMPROVEMENT: { label: "Mejora", badge: "badge-info", icon: "fa-rocket" },
    BUGFIX: { label: "Corrección", badge: "badge-warning", icon: "fa-bug" },
    SECURITY: { label: "Seguridad", badge: "badge-danger", icon: "fa-shield-alt" },
    TECHNICAL: { label: "Técnico", badge: "badge-secondary", icon: "fa-cogs" },
    BREAKING: { label: "Incompatible", badge: "badge-dark", icon: "fa-exclamation-triangle" },
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
   * Inicializa la vista y listeners de eventos.
   */
  async function init() {
    SecurityManager.redirectIfUnauthorized("settings.view");

    setupPermissions();
    await cargarDatos();
  }

  function setupPermissions() {
    // Botón Registrar Nueva Versión (Solo equipo autorizado P.M.E.)
    const canManageReleases = SecurityManager.hasPermission("system.manage_releases");
    const btnNueva = document.getElementById("btn_modal_nueva_version");
    if (btnNueva) {
      if (!canManageReleases) {
        btnNueva.style.display = "none";
      } else {
        btnNueva.addEventListener("click", () => abrirModalCrear());
      }
    }

    // Botón Verificar Actualizaciones
    const btnVerificar = document.getElementById("btn_verificar_actualizaciones");
    if (btnVerificar) {
      btnVerificar.addEventListener("click", async () => {
        NotificationService.loading("Verificando actualizaciones...", "Consultando la API");
        await cargarDatos();
        NotificationService.close();
        NotificationService.toastSuccess("Información de versiones actualizada.");
      });
    }

    // Filtro por estado
    const selectFiltro = document.getElementById("filtro_estado_version");
    if (selectFiltro) {
      selectFiltro.addEventListener("change", () => renderTabla());
    }

    // Submit Formulario Versión (Crear / Editar)
    const formVersion = document.getElementById("form_version");
    if (formVersion) {
      formVersion.addEventListener("submit", handleGuardarVersion);
    }

    // Submit Formulario Changelog Entry
    const formChangelog = document.getElementById("form_add_changelog");
    if (formChangelog) {
      formChangelog.addEventListener("submit", handleAgregarChangelog);
    }

    // Checkbox Forzar Publicación
    const checkForce = document.getElementById("check_force_publish");
    const secReason = document.getElementById("seccion_force_reason");
    if (checkForce && secReason) {
      checkForce.addEventListener("change", () => {
        secReason.style.display = checkForce.checked ? "block" : "none";
      });
    }

    // Botón Confirmar Publicación
    const btnConfirmPub = document.getElementById("btn_confirmar_publicar");
    if (btnConfirmPub) {
      btnConfirmPub.addEventListener("click", handleEjecutarPublicacion);
    }
  }

  /**
   * Consulta toda la información de versiones del servidor.
   */
  async function cargarDatos() {
    const loader = document.getElementById("versiones_loader");
    const content = document.getElementById("versiones_content");

    try {
      if (loader) loader.style.display = "block";
      if (content) content.style.display = "none";

      const [systemInfo, updateInfo, versionsRes] = await Promise.all([
        SystemService.obtenerInfoSistema(),
        SystemService.verificarActualizaciones(),
        SystemService.listarVersiones(),
      ]);

      // Guardar lista en memoria local
      const rawVersions = versionsRes.data?.results || versionsRes.data || versionsRes || [];
      versionesList = Array.isArray(rawVersions) ? rawVersions : [];

      renderKPIs(systemInfo, updateInfo, versionesList);
      renderTabla();

      if (loader) loader.style.display = "none";
      if (content) content.style.display = "block";
    } catch (error) {
      console.error("[VERSIONES CONTROLLER] Error cargando datos:", error);
      NotificationService.error("No fue posible cargar las versiones del sistema.");
      if (loader) loader.style.display = "none";
    }
  }

  /**
   * Actualiza las tarjetas de KPIs principales.
   */
  function renderKPIs(systemInfo, updateInfo, versions) {
    const installed = systemInfo?.installed_version || systemInfo?.version || "1.0.0";
    const elInstalled = document.getElementById("kpi_installed_version");
    const elInstalledDate = document.getElementById("kpi_installed_date");
    if (elInstalled) elInstalled.textContent = `v${installed}`;

    if (elInstalledDate) {
      if (systemInfo?.installed_version_published_at) {
        elInstalledDate.innerHTML = `<i class="fas fa-calendar-check mr-1 text-success"></i>Publicada el ${new Date(systemInfo.installed_version_published_at).toLocaleDateString()}`;
      } else {
        elInstalledDate.innerHTML = `<i class="fas fa-server mr-1"></i>En ejecución en este servidor`;
      }
    }

    // Última publicada
    const latestRelease = updateInfo?.latest_release;
    const latestVer = updateInfo?.latest_version || "--";
    const elLatest = document.getElementById("kpi_latest_version");
    const elLatestDate = document.getElementById("kpi_latest_date");

    if (elLatest) elLatest.textContent = latestVer !== "--" ? `v${latestVer}` : "Ninguna";
    if (elLatestDate) {
      if (latestRelease?.published_at) {
        elLatestDate.innerHTML = `<i class="fas fa-calendar-alt mr-1"></i>${new Date(latestRelease.published_at).toLocaleDateString()}`;
      } else {
        elLatestDate.innerHTML = `<i class="fas fa-calendar-alt mr-1"></i>Sin fecha registrada`;
      }
    }

    // Estado del sistema
    const elStatus = document.getElementById("kpi_update_status");
    const elSubtext = document.getElementById("kpi_update_subtext");
    if (elStatus && elSubtext) {
      if (updateInfo?.has_update) {
        if (updateInfo.is_mandatory) {
          elStatus.innerHTML = '<span class="badge badge-danger">Actualización Obligatoria</span>';
          elSubtext.textContent = `Nueva versión crítica v${latestVer} disponible`;
        } else {
          elStatus.innerHTML = '<span class="badge badge-warning">Actualización Disponible</span>';
          elSubtext.textContent = `Nueva versión v${latestVer} disponible`;
        }
      } else {
        elStatus.innerHTML = '<span class="badge badge-success">Sistema Actualizado</span>';
        elSubtext.textContent = "Versión en ejecución al día";
      }
    }

    // Conteo total y borradores
    const drafts = versions.filter((v) => v.status === "DRAFT").length;
    const elTotal = document.getElementById("kpi_total_versions");
    const elDrafts = document.getElementById("kpi_draft_count");
    if (elTotal) elTotal.textContent = versions.length;
    if (elDrafts) elDrafts.textContent = `${drafts} borrador${drafts === 1 ? "" : "es"} activo${drafts === 1 ? "" : "s"}`;
  }

  /**
   * Renderiza la tabla de versiones aplicando el filtro de estado y permisos.
   */
  function renderTabla() {
    const tbody = document.getElementById("tbody_versiones");
    if (!tbody) return;

    const filtroEstado = document.getElementById("filtro_estado_version")?.value || "";
    const filtered = filtroEstado
      ? versionesList.filter((v) => v.status === filtroEstado)
      : versionesList;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            <i class="fas fa-info-circle mr-1"></i> No se encontraron versiones registradas con el filtro seleccionado.
          </td>
        </tr>
      `;
      return;
    }

    // Regla de seguridad: Solo el equipo autorizado P.M.E. puede mutar versiones
    const canManageReleases = SecurityManager.hasPermission("system.manage_releases");

    tbody.innerHTML = filtered
      .map((ver) => {
        const isDraft = ver.status === "DRAFT";
        const isPublished = ver.status === "PUBLISHED";
        const isWithdrawn = ver.status === "WITHDRAWN";

        let statusBadge = '<span class="badge badge-secondary">Desconocido</span>';
        if (isPublished) statusBadge = '<span class="badge badge-success px-2 py-1"><i class="fas fa-check-circle mr-1"></i>Publicada</span>';
        else if (isDraft) statusBadge = '<span class="badge badge-warning px-2 py-1"><i class="fas fa-edit mr-1"></i>Borrador</span>';
        else if (isWithdrawn) statusBadge = '<span class="badge badge-secondary px-2 py-1"><i class="fas fa-ban mr-1"></i>Retirada</span>';

        let priorityBadge = '<span class="badge badge-light">Opcional</span>';
        if (ver.priority === "MANDATORY") priorityBadge = '<span class="badge badge-danger">Obligatoria</span>';
        else if (ver.priority === "RECOMMENDED") priorityBadge = '<span class="badge badge-info">Recomendada</span>';

        const pubDate = ver.published_at ? new Date(ver.published_at).toLocaleString() : '<span class="text-muted">No publicada</span>';
        const pubBy = escapeHtml(ver.published_by_name) || '<span class="text-muted">--</span>';
        const changesCount = ver.total_changes !== undefined ? ver.total_changes : "--";
        const verSafe = escapeHtml(ver.version);
        const nameSafe = escapeHtml(ver.name);

        return `
          <tr>
            <td class="pl-4 font-weight-bold text-dark">
              <span class="badge badge-primary px-2 py-1" style="font-size: 0.85rem;">v${verSafe}</span>
            </td>
            <td><strong>${nameSafe || '<span class="text-muted font-italic">Sin nombre</span>'}</strong></td>
            <td>${statusBadge}</td>
            <td>${priorityBadge}</td>
            <td><small>${pubDate}</small></td>
            <td>
              <button class="btn btn-xs btn-outline-info font-weight-bold btn-ver-novedades" data-id="${ver.id_version}" style="border-radius: 6px;">
                <i class="fas fa-list-alt mr-1"></i> ${changesCount} cambios
              </button>
            </td>
            <td><small>${pubBy}</small></td>
            <td class="text-right pr-4 text-nowrap">
              ${
                canManageReleases && isDraft
                  ? `
                  <button class="btn btn-xs btn-outline-success font-weight-bold mr-1 btn-publicar" data-id="${ver.id_version}" title="Publicar versión">
                    <i class="fas fa-rocket mr-1"></i> Publicar
                  </button>
                  <button class="btn btn-xs btn-outline-secondary font-weight-bold mr-1 btn-editar" data-id="${ver.id_version}" title="Editar borrador">
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                  <button class="btn btn-xs btn-outline-danger font-weight-bold btn-eliminar-borrador" data-id="${ver.id_version}" title="Eliminar borrador">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                `
                  : ""
              }
              ${
                canManageReleases && isPublished
                  ? `
                  <button class="btn btn-xs btn-outline-warning font-weight-bold btn-retirar" data-id="${ver.id_version}" title="Retirar versión">
                    <i class="fas fa-ban mr-1"></i> Retirar
                  </button>
                `
                  : ""
              }
              ${
                !canManageReleases
                  ? `
                  <button class="btn btn-xs btn-outline-primary font-weight-bold btn-ver-novedades" data-id="${ver.id_version}" title="Ver novedades">
                    <i class="fas fa-eye mr-1"></i> Ver detalles
                  </button>
                `
                  : ""
              }
            </td>
          </tr>
        `;
      })
      .join("");

    // Conectar eventos de los botones de la tabla
    tbody.querySelectorAll(".btn-ver-novedades").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalNovedades(btn.dataset.id));
    });

    tbody.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalEditar(btn.dataset.id));
    });

    tbody.querySelectorAll(".btn-publicar").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalPublicar(btn.dataset.id));
    });

    tbody.querySelectorAll(".btn-retirar").forEach((btn) => {
      btn.addEventListener("click", () => confirmarRetiro(btn.dataset.id));
    });

    tbody.querySelectorAll(".btn-eliminar-borrador").forEach((btn) => {
      btn.addEventListener("click", () => confirmarEliminarBorrador(btn.dataset.id));
    });
  }

  /* ────────────────────────────────────────────────────────────
     MODAL CREAR / EDITAR (Solo Equipo P.M.E.)
     ──────────────────────────────────────────────────────────── */

  function abrirModalCrear() {
    const form = document.getElementById("form_version");
    if (form) form.reset();

    document.getElementById("version_id").value = "";
    document.getElementById("version_number").disabled = false;
    document.getElementById("modal_version_title").innerHTML = '<i class="fas fa-plus-circle text-primary mr-2"></i>Registrar Borrador de Versión';

    $("#modal_version").modal("show");
  }

  async function abrirModalEditar(versionId) {
    NotificationService.loading("Cargando borrador...");
    try {
      const res = await SystemService.obtenerVersion(versionId);
      NotificationService.close();

      const ver = res.data || res;
      if (ver.status !== "DRAFT") {
        NotificationService.warning("Solo se pueden editar versiones en borrador.");
        return;
      }

      document.getElementById("version_id").value = ver.id_version;
      document.getElementById("version_number").value = ver.version;
      document.getElementById("version_number").disabled = true; // SemVer fijo en edición
      document.getElementById("version_name").value = ver.name || "";
      document.getElementById("version_priority").value = ver.priority || "RECOMMENDED";
      document.getElementById("version_description").value = ver.description || "";
      document.getElementById("version_min_compatible").value = ver.min_compatible_version || "";
      document.getElementById("version_prerequisites").value = ver.prerequisites || "";
      document.getElementById("version_upgrade_instructions").value = ver.upgrade_instructions || "";

      document.getElementById("modal_version_title").innerHTML = `<i class="fas fa-pencil-alt text-secondary mr-2"></i>Editar Borrador v${escapeHtml(ver.version)}`;
      $("#modal_version").modal("show");
    } catch (error) {
      NotificationService.error("No fue posible cargar el detalle del borrador.");
    }
  }

  async function handleGuardarVersion(e) {
    e.preventDefault();

    const id = document.getElementById("version_id").value;
    const payload = {
      name: document.getElementById("version_name").value.trim(),
      priority: document.getElementById("version_priority").value,
      description: document.getElementById("version_description").value.trim(),
      min_compatible_version: document.getElementById("version_min_compatible").value.trim(),
      prerequisites: document.getElementById("version_prerequisites").value.trim(),
      upgrade_instructions: document.getElementById("version_upgrade_instructions").value.trim(),
    };

    NotificationService.loading("Guardando versión...");

    try {
      if (id) {
        // Actualizar
        const res = await SystemService.actualizarVersion(id, payload);
        if (res.ok !== false && res.success !== false) {
          NotificationService.toastSuccess("Borrador actualizado correctamente.");
          $("#modal_version").modal("hide");
          await cargarDatos();
          window.dispatchEvent(new CustomEvent("versions_updated"));
        } else {
          NotificationService.error(NotificationService.getApiErrorMessage(res));
        }
      } else {
        // Crear
        payload.version = document.getElementById("version_number").value.trim();
        const res = await SystemService.crearVersion(payload);
        if (res.ok !== false && res.success !== false) {
          NotificationService.toastSuccess("Borrador de versión registrado exitosamente.");
          $("#modal_version").modal("hide");
          await cargarDatos();
          window.dispatchEvent(new CustomEvent("versions_updated"));
        } else {
          NotificationService.error(NotificationService.getApiErrorMessage(res));
        }
      }
    } catch (error) {
      NotificationService.error("Error al procesar la solicitud.");
    }
  }

  /* ────────────────────────────────────────────────────────────
     MODAL GESTIÓN DE NOVEDADES (CHANGELOG)
     ──────────────────────────────────────────────────────────── */

  async function abrirModalNovedades(versionId) {
    currentManagingVersionId = versionId;
    NotificationService.loading("Cargando novedades...");

    try {
      // 1. Obtener datos de la versión y marcarla como leída por el usuario
      const [res] = await Promise.all([
        SystemService.obtenerVersion(versionId),
        SystemService.marcarVersionLeida(versionId),
      ]);
      NotificationService.close();

      // Notificar al navbar para refrescar la campanita
      window.dispatchEvent(new CustomEvent("versions_updated"));

      const ver = res.data || res;
      document.getElementById("changelog_version_badge").textContent = `v${escapeHtml(ver.version)} (${escapeHtml(ver.status_display)})`;

      // Ficha informativa de la versión
      const elFullName = document.getElementById("modal_ver_fullname");
      const elPubDate = document.getElementById("modal_ver_published_date");
      const elDesc = document.getElementById("modal_ver_description");
      const elCompatBox = document.getElementById("modal_ver_compat_box");
      const elCompatText = document.getElementById("modal_ver_compat_text");

      if (elFullName) elFullName.textContent = `v${ver.version}${ver.name ? ' — ' + ver.name : ''}`;
      if (elPubDate) {
        elPubDate.innerHTML = ver.published_at
          ? `<i class="fas fa-calendar-alt mr-1"></i>Publicada el ${new Date(ver.published_at).toLocaleDateString()}`
          : `<i class="fas fa-clock mr-1"></i>En borrador`;
      }
      if (elDesc) elDesc.textContent = ver.description || "Esta versión incluye mejoras generales en la plataforma.";

      if (elCompatBox && elCompatText) {
        let compatNotes = [];
        if (ver.min_compatible_version) compatNotes.push(`Compatibilidad directa desde v${escapeHtml(ver.min_compatible_version)}`);
        if (ver.prerequisites) compatNotes.push(`Requisitos previos: ${escapeHtml(ver.prerequisites)}`);
        if (compatNotes.length > 0) {
          elCompatText.textContent = compatNotes.join(". ");
          elCompatBox.style.display = "block";
        } else {
          elCompatBox.style.display = "none";
        }
      }

      // Si no es borrador o el usuario no puede gestionar releases, ocultar formulario de agregar cambios
      const canManageReleases = SecurityManager.hasPermission("system.manage_releases");
      const seccionAdd = document.getElementById("seccion_agregar_novedad");
      if (seccionAdd) {
        seccionAdd.style.display = canManageReleases && ver.status === "DRAFT" ? "block" : "none";
      }

      renderListaEntradas(ver);
      $("#modal_changelog").modal("show");
    } catch (error) {
      NotificationService.error("No fue posible cargar las novedades.");
    }
  }

  function renderListaEntradas(version) {
    const container = document.getElementById("lista_entradas_container");
    if (!container) return;

    const entries = version.changelog_entries || [];
    if (entries.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="fas fa-info-circle mr-1 fa-2x d-block mb-2"></i> No se han registrado cambios aún en esta versión.
        </div>
      `;
      return;
    }

    const canManageReleases = SecurityManager.hasPermission("system.manage_releases");
    const canDelete = canManageReleases && version.status === "DRAFT";

    // Si viene agrupado por categoría
    const grouped = version.changelog_grouped || {};
    const catKeys = Object.keys(grouped);

    if (catKeys.length > 0) {
      let html = "";
      catKeys.forEach((catKey) => {
        const catData = grouped[catKey];
        const meta = CATEGORY_MAP[catKey] || { label: catData.category_display || catKey, badge: "badge-secondary", icon: "fa-tag" };
        html += `
          <div class="mb-3">
            <h6 class="font-weight-bold text-dark mb-2">
              <span class="badge ${meta.badge} px-2 py-1 mr-1">
                <i class="fas ${meta.icon} mr-1"></i>${escapeHtml(meta.label)}
              </span>
            </h6>
            <ul class="list-group list-group-flush border rounded mb-2">
        `;
        (catData.entries || []).forEach((entry) => {
          html += `
            <li class="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
              <div>
                <strong class="text-dark">${escapeHtml(entry.title)}</strong>
                ${entry.description ? `<p class="text-muted small mb-0 mt-1">${escapeHtml(entry.description)}</p>` : ""}
              </div>
              ${
                canDelete
                  ? `
                <button class="btn btn-xs btn-outline-danger btn-eliminar-entry ml-2" data-entry-id="${entry.id_entry}" title="Eliminar cambio">
                  <i class="fas fa-times"></i>
                </button>
              `
                  : ""
              }
            </li>
          `;
        });
        html += `</ul></div>`;
      });
      container.innerHTML = html;
    } else {
      container.innerHTML = `
        <ul class="list-group list-group-flush border rounded">
          ${entries
            .map((entry) => {
              const meta = CATEGORY_MAP[entry.category] || { label: entry.category, badge: "badge-secondary", icon: "fa-tag" };
              return `
                <li class="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                  <div>
                    <span class="badge ${meta.badge} mr-2"><i class="fas ${meta.icon} mr-1"></i>${escapeHtml(meta.label)}</span>
                    <strong class="text-dark">${escapeHtml(entry.title)}</strong>
                    ${entry.description ? `<p class="text-muted small mb-0 mt-1">${escapeHtml(entry.description)}</p>` : ""}
                  </div>
                  ${
                    canDelete
                      ? `
                    <button class="btn btn-xs btn-outline-danger btn-eliminar-entry ml-2" data-entry-id="${entry.id_entry}" title="Eliminar cambio">
                      <i class="fas fa-times"></i>
                    </button>
                  `
                      : ""
                  }
                </li>
              `;
            })
            .join("")}
        </ul>
      `;
    }

    container.querySelectorAll(".btn-eliminar-entry").forEach((btn) => {
      btn.addEventListener("click", () => handleEliminarEntry(btn.dataset.entryId));
    });
  }

  async function handleAgregarChangelog(e) {
    e.preventDefault();
    if (!currentManagingVersionId) return;

    const payload = {
      category: document.getElementById("entry_category").value,
      title: document.getElementById("entry_title").value.trim(),
      description: document.getElementById("entry_description").value.trim(),
    };

    NotificationService.loading("Agregando novedad...");
    try {
      const res = await SystemService.agregarChangelog(currentManagingVersionId, payload);
      if (res.ok !== false && res.success !== false) {
        document.getElementById("form_add_changelog").reset();
        NotificationService.toastSuccess("Cambio agregado a la versión.");

        // Refrescar modal
        const refreshed = await SystemService.obtenerVersion(currentManagingVersionId);
        renderListaEntradas(refreshed.data || refreshed);
        await cargarDatos();
      } else {
        NotificationService.error(NotificationService.getApiErrorMessage(res));
      }
    } catch (error) {
      NotificationService.error("Error al registrar la novedad.");
    }
  }

  async function handleEliminarEntry(entryId) {
    if (!currentManagingVersionId) return;

    try {
      const res = await SystemService.eliminarChangelog(currentManagingVersionId, entryId);
      if (res.ok !== false && res.success !== false) {
        NotificationService.toastSuccess("Cambio eliminado.");
        const refreshed = await SystemService.obtenerVersion(currentManagingVersionId);
        renderListaEntradas(refreshed.data || refreshed);
        await cargarDatos();
      } else {
        NotificationService.error(NotificationService.getApiErrorMessage(res));
      }
    } catch (error) {
      NotificationService.error("Error al eliminar la novedad.");
    }
  }

  /* ────────────────────────────────────────────────────────────
     MODAL PUBLICAR (Solo Equipo P.M.E.)
     ──────────────────────────────────────────────────────────── */

  function abrirModalPublicar(versionId) {
    const ver = versionesList.find((v) => String(v.id_version) === String(versionId));
    if (!ver) return;

    currentPublishingVersion = ver;

    document.getElementById("pub_version_label").textContent = `v${ver.version}`;
    document.getElementById("pub_version_val").textContent = `v${ver.version}`;
    document.getElementById("pub_name_val").textContent = ver.name || "Sin nombre";
    document.getElementById("pub_priority_val").textContent = ver.priority_display || ver.priority;
    document.getElementById("pub_changes_val").textContent = ver.total_changes || 0;

    const checkForce = document.getElementById("check_force_publish");
    const secReason = document.getElementById("seccion_force_reason");
    const txtReason = document.getElementById("force_publish_reason");

    if (checkForce) checkForce.checked = false;
    if (secReason) secReason.style.display = "none";
    if (txtReason) txtReason.value = "";

    $("#modal_publicar").modal("show");
  }

  async function handleEjecutarPublicacion() {
    if (!currentPublishingVersion) return;

    const checkForce = document.getElementById("check_force_publish")?.checked || false;
    const forceReason = document.getElementById("force_publish_reason")?.value.trim() || "";

    if (checkForce && !forceReason) {
      NotificationService.warning("Debe ingresar un motivo para forzar la publicación.");
      return;
    }

    NotificationService.loading("Publicando versión...");
    try {
      const res = await SystemService.publicarVersion(currentPublishingVersion.id_version, {
        force: checkForce,
        force_reason: forceReason,
      });

      if (res.ok !== false && res.success !== false) {
        $("#modal_publicar").modal("hide");
        NotificationService.success(
          `La versión v${currentPublishingVersion.version} ha sido publicada exitosamente. Ahora está disponible en el registro global de actualizaciones.`,
          "¡Versión Publicada!"
        );
        await cargarDatos();
        window.dispatchEvent(new CustomEvent("versions_updated"));
      } else {
        NotificationService.error(NotificationService.getApiErrorMessage(res));
      }
    } catch (error) {
      NotificationService.error("Error durante la publicación de la versión.");
    }
  }

  /* ────────────────────────────────────────────────────────────
     ACCIONES ADICIONALES (RETIRAR / ELIMINAR - Solo Equipo P.M.E.)
     ──────────────────────────────────────────────────────────── */

  async function confirmarRetiro(versionId) {
    const ver = versionesList.find((v) => String(v.id_version) === String(versionId));
    if (!ver) return;

    const result = await NotificationService.confirm(
      `¿Está seguro de retirar la versión v${ver.version}? Ya no aparecerá sugerida a los usuarios como actualización disponible.`,
      "Retirar Versión",
      {
        input: "textarea",
        inputPlaceholder: "Ingrese el motivo del retiro de esta versión (obligatorio)...",
        inputValidator: (value) => {
          if (!value || value.trim().length < 5) {
            return "Debe ingresar un motivo de al menos 5 caracteres.";
          }
        },
      }
    );

    if (result.isConfirmed) {
      const reason = result.value;
      NotificationService.loading("Retirando versión...");

      try {
        const res = await SystemService.retirarVersion(versionId, { reason });
        if (res.ok !== false && res.success !== false) {
          NotificationService.toastSuccess(`Versión v${ver.version} retirada exitosamente.`);
          await cargarDatos();
          window.dispatchEvent(new CustomEvent("versions_updated"));
        } else {
          NotificationService.error(NotificationService.getApiErrorMessage(res));
        }
      } catch (error) {
        NotificationService.error("Error al retirar la versión.");
      }
    }
  }

  async function confirmarEliminarBorrador(versionId) {
    const ver = versionesList.find((v) => String(v.id_version) === String(versionId));
    if (!ver) return;

    const result = await NotificationService.confirm(
      `¿Desea eliminar definitivamente el borrador de la versión v${ver.version}? Esta acción no se puede deshacer.`,
      "Eliminar Borrador"
    );

    if (result.isConfirmed) {
      NotificationService.loading("Eliminando borrador...");
      try {
        const res = await SystemService.eliminarBorrador(versionId);
        if (res.ok !== false && res.success !== false) {
          NotificationService.toastSuccess("Borrador eliminado correctamente.");
          await cargarDatos();
          window.dispatchEvent(new CustomEvent("versions_updated"));
        } else {
          NotificationService.error(NotificationService.getApiErrorMessage(res));
        }
      } catch (error) {
        NotificationService.error("Error al eliminar el borrador.");
      }
    }
  }

  return Object.freeze({
    init,
    abrirModalCrear,
  });
})();

export default VersionesController;

