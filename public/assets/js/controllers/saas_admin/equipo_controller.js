import SaaSTeamService from "../../services/saas_team_service.js";
import NotificationService from "../../core/notification.js";
import DataTableHelper from "../../utils/DataTableHelper.js";
import { escapeHtml } from "../../core/utils.js";

const SaasEquipoController = (() => {
  const TABLE_ID = "tbl_saas_team";
  let dataTableInstance = null;
  let membersList = [];

  const PROFILE_BADGES = Object.freeze({
    SUPERADMIN: '<span class="badge badge-danger px-2 py-1"><i class="fas fa-crown mr-1"></i>Superadministrador</span>',
    SUPPORT: '<span class="badge badge-info px-2 py-1"><i class="fas fa-headset mr-1"></i>Soporte Técnico</span>',
    SALES: '<span class="badge badge-primary px-2 py-1"><i class="fas fa-briefcase mr-1"></i>Ventas</span>',
    FINANCE: '<span class="badge badge-success px-2 py-1"><i class="fas fa-coins mr-1"></i>Finanzas</span>',
    STAFF: '<span class="badge badge-secondary px-2 py-1"><i class="fas fa-user-shield mr-1"></i>Personal Interno</span>',
  });

  function getProfileBadge(profile) {
    return PROFILE_BADGES[profile] || PROFILE_BADGES.STAFF;
  }

  function getStatusBadge(isActive) {
    return isActive
      ? '<span class="badge badge-success px-2 py-1"><i class="fas fa-check-circle mr-1"></i>Activo</span>'
      : '<span class="badge badge-secondary px-2 py-1"><i class="fas fa-ban mr-1"></i>Inactivo</span>';
  }

  async function init() {
    setupEvents();
    await cargarMiembros();
  }

  function setupEvents() {
    $("#btn_nuevo_miembro").on("click", abrirModalCrear);
    $("#btn_refrescar_equipo").on("click", async () => {
      NotificationService.loading("Actualizando...", "Consultando integrantes");
      await cargarMiembros();
      NotificationService.close();
      NotificationService.toastSuccess("Equipo actualizado.");
    });

    $("#filtro_perfil_equipo").on("change", renderTabla);
    $("#filtro_estado_equipo").on("change", renderTabla);

    $("#form_miembro_equipo").on("submit", handleGuardarMiembro);
  }

  async function cargarMiembros() {
    $("#equipo_loader").show();
    $("#equipo_content").hide();

    try {
      const response = await SaaSTeamService.listarMiembros();
      if (response && response.success && response.data) {
        membersList = response.data.results || (Array.isArray(response.data) ? response.data : []);

        actualizarKPIs();
        renderTabla();

        $("#equipo_loader").hide();
        $("#equipo_content").fadeIn();
      } else {
        NotificationService.error("No fue posible cargar el equipo.");
        $("#equipo_loader").hide();
      }
    } catch (error) {
      console.error("[SAAS EQUIPO] Error:", error);
      NotificationService.error("Error al consultar el personal interno.");
      $("#equipo_loader").hide();
    }
  }

  function actualizarKPIs() {
    const total = membersList.length;
    const superadmins = membersList.filter((m) => m.is_superuser).length;
    const support = membersList.filter((m) => m.saas_profile === "SUPPORT").length;
    const salesFinance = membersList.filter((m) => m.saas_profile === "SALES" || m.saas_profile === "FINANCE").length;

    $("#kpi_total_equipo").text(total);
    $("#kpi_superadmins").text(superadmins);
    $("#kpi_soporte").text(support);
    $("#kpi_comercial").text(salesFinance);
  }

  function renderTabla() {
    const tbody = $("#tbody_equipo");
    tbody.empty();

    const perfilFiltro = $("#filtro_perfil_equipo").val();
    const estadoFiltro = $("#filtro_estado_equipo").val();

    let filtrados = membersList;
    if (perfilFiltro) {
      filtrados = filtrados.filter((m) => m.saas_profile === perfilFiltro);
    }
    if (estadoFiltro !== "") {
      const isAct = estadoFiltro === "true";
      filtrados = filtrados.filter((m) => m.is_active === isAct);
    }

    if (filtrados.length === 0) {
      tbody.html(`
        <tr>
          <td colspan="7" class="text-center py-5 text-muted">
            <i class="fas fa-users-slash fa-3x mb-3 text-light"></i>
            <p class="mb-0">No se encontraron integrantes con los filtros aplicados.</p>
          </td>
        </tr>
      `);
      return;
    }

    filtrados.forEach((m) => {
      const lastLogin = m.last_login
        ? new Date(m.last_login).toLocaleString("es-CO")
        : '<span class="text-muted font-italic">Sin ingresos</span>';

      const rowHtml = `
        <tr>
          <td class="pl-4 font-weight-bold">
            <span class="text-dark">${escapeHtml(m.full_name)}</span>
            <br><small class="text-muted font-monospace">${escapeHtml(m.username)}</small>
          </td>
          <td>
            <a href="mailto:${escapeHtml(m.email)}" class="text-primary text-decoration-none">${escapeHtml(m.email)}</a>
            ${m.phone_number ? `<br><small class="text-muted"><i class="fas fa-phone mr-1"></i>${escapeHtml(m.phone_number)}</small>` : ""}
          </td>
          <td class="font-monospace text-muted">${escapeHtml(m.document_number)}</td>
          <td>${getProfileBadge(m.saas_profile)}</td>
          <td>${getStatusBadge(m.is_active)}</td>
          <td><small class="text-muted">${lastLogin}</small></td>
          <td class="text-right pr-4">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-info btn-ver-actividad" data-id="${m.id_user}" title="Historial de Actividad">
                <i class="fas fa-history"></i>
              </button>
              <button class="btn btn-outline-primary btn-editar-miembro" data-id="${m.id_user}" title="Editar Información">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn ${m.is_active ? 'btn-outline-warning' : 'btn-outline-success'} btn-toggle-miembro" 
                      data-id="${m.id_user}" data-active="${m.is_active}" 
                      title="${m.is_active ? 'Desactivar Acceso' : 'Activar Acceso'}">
                <i class="fas ${m.is_active ? 'fa-user-slash' : 'fa-user-check'}"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      tbody.append(rowHtml);
    });

    $(".btn-ver-actividad").off("click").on("click", function () {
      abrirModalActividad($(this).data("id"));
    });
    $(".btn-editar-miembro").off("click").on("click", function () {
      abrirModalEditar($(this).data("id"));
    });
    $(".btn-toggle-miembro").off("click").on("click", function () {
      const id = $(this).data("id");
      const currentActive = $(this).data("active");
      confirmarToggleEstado(id, !currentActive);
    });
  }

  function abrirModalCrear() {
    $("#modal_miembro_title").html('<i class="fas fa-user-plus text-primary mr-2"></i>Registrar Integrante del Equipo');
    $("#miembro_id").val("");
    $("#miembro_username").val("").prop("readonly", false);
    $("#miembro_email").val("").prop("readonly", false);
    $("#miembro_password").val("").prop("required", true);
    $("#miembro_first_name").val("");
    $("#miembro_last_name").val("");
    $("#miembro_document").val("").prop("readonly", false);
    $("#miembro_phone").val("");
    $("#miembro_profile").val("SUPPORT");
    $("#seccion_password_help").text("Requerida para el inicio de sesión");
    $("#modal_miembro").modal("show");
  }

  function abrirModalEditar(id) {
    const m = membersList.find((item) => item.id_user === id);
    if (!m) return;

    $("#modal_miembro_title").html(`<i class="fas fa-user-edit text-warning mr-2"></i>Editar Integrante: ${escapeHtml(m.username)}`);
    $("#miembro_id").val(m.id_user);
    $("#miembro_username").val(m.username).prop("readonly", true);
    $("#miembro_email").val(m.email).prop("readonly", true);
    $("#miembro_password").val("").prop("required", false);
    $("#miembro_first_name").val(m.first_name || "");
    $("#miembro_last_name").val(m.last_name || "");
    $("#miembro_document").val(m.document_number || "").prop("readonly", true);
    $("#miembro_phone").val(m.phone_number || "");
    $("#miembro_profile").val(m.saas_profile || "SUPPORT");
    $("#seccion_password_help").text("Dejar en blanco si no desea modificar la contraseña");
    $("#modal_miembro").modal("show");
  }

  async function handleGuardarMiembro(e) {
    e.preventDefault();
    const id = $("#miembro_id").val();
    const isEditing = !!id;

    const payload = {
      first_name: $("#miembro_first_name").val().trim(),
      last_name: $("#miembro_last_name").val().trim(),
      phone_number: $("#miembro_phone").val().trim(),
      saas_profile: $("#miembro_profile").val(),
    };

    const pass = $("#miembro_password").val();
    if (pass) {
      payload.password = pass;
    }

    if (!isEditing) {
      payload.username = $("#miembro_username").val().trim();
      payload.email = $("#miembro_email").val().trim();
      payload.document_number = $("#miembro_document").val().trim();

      if (!payload.username || !payload.email || !payload.document_number || !payload.password) {
        NotificationService.error("Complete todos los campos requeridos para crear al integrante.");
        return;
      }
    }

    try {
      NotificationService.loading(isEditing ? "Actualizando integrante..." : "Registrando integrante...");
      let res;
      if (isEditing) {
        res = await SaaSTeamService.actualizarMiembro(id, payload);
      } else {
        res = await SaaSTeamService.crearMiembro(payload);
      }
      NotificationService.close();

      if (res && res.success) {
        NotificationService.toastSuccess(`Integrante ${isEditing ? "actualizado" : "registrado"} exitosamente.`);
        $("#modal_miembro").modal("hide");
        await cargarMiembros();
      } else {
        NotificationService.error(NotificationService.getApiErrorMessage(res));
      }
    } catch (error) {
      NotificationService.close();
      NotificationService.error("Error al procesar la operación.");
    }
  }

  async function confirmarToggleEstado(id, newActive) {
    const actionText = newActive ? "activar el acceso a" : "revocar el acceso de";
    const result = await NotificationService.warning(
      `¿Desea ${actionText} este integrante del equipo SaaS?`,
      newActive ? "Activar Acceso" : "Revocar Acceso"
    );
    if (!result.isConfirmed) return;

    try {
      NotificationService.loading("Modificando estado...");
      const res = await SaaSTeamService.toggleEstado(id, newActive);
      NotificationService.close();

      if (res && res.success) {
        NotificationService.toastSuccess(`Estado actualizado a ${newActive ? "Activo" : "Inactivo"}.`);
        await cargarMiembros();
      } else {
        NotificationService.error(NotificationService.getApiErrorMessage(res));
      }
    } catch (err) {
      NotificationService.close();
      NotificationService.error("Error al modificar el estado del integrante.");
    }
  }

  async function abrirModalActividad(id) {
    try {
      NotificationService.loading("Consultando actividad...");
      const res = await SaaSTeamService.obtenerMiembro(id);
      NotificationService.close();

      if (res && res.success && res.data) {
        const m = res.data;
        $("#actividad_miembro_name").text(`${m.full_name} (${m.email})`);
        $("#actividad_miembro_rol").html(getProfileBadge(m.saas_profile));

        const list = $("#actividad_logs_container");
        list.empty();
        const logs = m.recent_activity || [];

        if (logs.length === 0) {
          list.html('<div class="text-center text-muted py-4"><i class="fas fa-inbox fa-2x mb-2 text-light"></i><p class="mb-0">Sin registros de auditoría recientes para este usuario.</p></div>');
        } else {
          logs.forEach((log) => {
            const dateStr = log.created_at ? new Date(log.created_at).toLocaleString("es-CO") : "---";
            const eventName = log.payload?.security_event || log.path;
            const statusClass = log.status_code >= 400 ? "badge-danger" : "badge-success";

            list.append(`
              <div class="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                <div>
                  <span class="badge ${statusClass} mr-2">${log.method} ${log.status_code}</span>
                  <strong class="text-dark">${escapeHtml(eventName)}</strong>
                  <br><small class="text-muted font-monospace">${escapeHtml(log.path)}</small>
                </div>
                <small class="text-muted"><i class="far fa-clock mr-1"></i>${dateStr}</small>
              </div>
            `);
          });
        }
        $("#modal_actividad").modal("show");
      }
    } catch (error) {
      NotificationService.close();
      NotificationService.error("No se pudo cargar la actividad del integrante.");
    }
  }

  return Object.freeze({
    init,
  });
})();

export default SaasEquipoController;
