import SaaSAdminService from "../../services/saas_admin_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";
import DataTableHelper from "../../utils/DataTableHelper.js";
import Storage from "../../storage/storage.js";
import Config from "../../config/config.js";

const SaaSAdminTenantController = (() => {
  const TABLE_ID = "tbl_saas_tenants";
  let dataTableInstance = null;

  // ───────────────────────────────────────────
  // Utilidades de formato
  // ───────────────────────────────────────────

  function formatDate(isoString) {
    if (!isoString) return "---";
    return new Date(isoString).toLocaleString("es-CO");
  }

  function getStatusBadge(status) {
    const badges = {
      ACTIVE:
        '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem">Activa</span>',
      SUSPENDED:
        '<span class="badge badge-warning px-3 py-2" style="border-radius:20px;font-size:0.75rem">Suspendida</span>',
      PENDING_VERIFICATION:
        '<span class="badge badge-info px-3 py-2" style="border-radius:20px;font-size:0.75rem">Pendiente</span>',
      CANCELLED:
        '<span class="badge badge-danger px-3 py-2" style="border-radius:20px;font-size:0.75rem">Cancelada</span>',
    };
    return (
      badges[status] || `<span class="badge badge-secondary">${status}</span>`
    );
  }

  // ───────────────────────────────────────────
  // DataTable Server-Side
  // ───────────────────────────────────────────

  const COLUMN_ORDERING_MAP = {
    1: "business_name",
    2: "tax_id",
    3: "status",
    4: "created_at",
  };

  function initDataTable() {
    if (dataTableInstance) {
      dataTableInstance.destroy();
      dataTableInstance = null;
    }

    dataTableInstance = $(`#${TABLE_ID}`).DataTable({
      responsive: true,
      lengthChange: true,
      autoWidth: false,
      pageLength: 10,
      processing: true,
      serverSide: true,
      searchDelay: 500,
      dom: DataTableHelper.DEFAULT_DOM,
      buttons: DataTableHelper.getExportButtons("saas_tenants", [1, 2, 3, 4]),
      language: DataTableHelper.LANGUAGE_ES,
      columnDefs: [
        { orderable: false, targets: [0, 5] },
        { className: "text-center", targets: [3, 5] },
      ],
      ajax: async function (data, callback) {
        try {
          const page = Math.floor(data.start / data.length) + 1;
          const pageSize = data.length;
          const search = data.search?.value || "";

          let ordering = "";
          if (data.order && data.order.length > 0) {
            const orderCol = data.order[0].column;
            const orderDir = data.order[0].dir;
            const field = COLUMN_ORDERING_MAP[orderCol];
            if (field) ordering = orderDir === "desc" ? `-${field}` : field;
          }

          const response = await SaaSAdminService.listarEmpresas({
            page,
            page_size: pageSize,
            search,
            ordering,
          });

          if (response?.success && response.data) {
            const tenants = response.data.results || [];
            const totalRecords = response.data.count || 0;

            const rows = tenants.map((t, index) => {
              const actions = buildActionsHtml(t);
              return [
                data.start + index + 1,
                `<strong>${t.business_name}</strong><br><small class="text-muted">${t.email || ""}</small>`,
                t.tax_id,
                getStatusBadge(t.status),
                formatDate(t.created_at),
                actions,
              ];
            });

            callback({
              draw: data.draw,
              recordsTotal: totalRecords,
              recordsFiltered: totalRecords,
              data: rows,
            });

            SecurityManager.processDomPermissions();
          } else {
            callback({
              draw: data.draw,
              recordsTotal: 0,
              recordsFiltered: 0,
              data: [],
            });
          }
        } catch (error) {
          console.error("[SAAS TENANTS] Error server-side:", error);
          callback({
            draw: data.draw,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          });
        }
      },
      drawCallback: function () {
        $(".dataTables_paginate > .pagination").addClass("pagination-sm");
      },
    });
  }

  function buildActionsHtml(tenant) {
    const id = tenant.id_company;
    const name = tenant.business_name;
    const isSuspended = tenant.status === "SUSPENDED";

    // Botones condicionales según el estado
    const toggleAction = isSuspended ? "reactivate" : "suspend";
    const toggleClass = isSuspended
      ? "btn-outline-success"
      : "btn-outline-warning";
    const toggleIcon = isSuspended ? "fa-check-circle" : "fa-pause-circle";
    const toggleTitle = isSuspended ? "Reactivar Empresa" : "Suspender Empresa";

    return `
      <div class="btn-group btn-group-sm">
        <a href="${Config.BASE_PATH}/saas-admin/empresa-detalle?id=${id}" class="btn btn-outline-secondary" title="Ver Detalle Completo">
          <i class="fas fa-eye"></i>
        </a>
        <button type="button" class="btn btn-outline-info btn-impersonate" 
                title="Entrar como Soporte" data-id="${id}" data-name="${name}">
          <i class="fas fa-user-secret"></i>
        </button>
        <button type="button" class="btn btn-outline-primary btn-extend-trial" 
                title="Extender Prueba" data-id="${id}">
          <i class="fas fa-calendar-plus"></i>
        </button>
        <button type="button" class="btn ${toggleClass} btn-toggle-status" 
                title="${toggleTitle}" data-id="${id}" data-action="${toggleAction}">
          <i class="fas ${toggleIcon}"></i>
        </button>
      </div>
    `;
  }

  // ───────────────────────────────────────────
  // Eventos: Acciones y Modales
  // ───────────────────────────────────────────

  function setupEvents() {
    // 1. Suspender / Reactivar Empresa
    $(`#${TABLE_ID}`).on("click", ".btn-toggle-status", async function () {
      const id = $(this).data("id");
      const action = $(this).data("action");
      const isSuspend = action === "suspend";

      const confirmText = isSuspend
        ? "¿Estás seguro de suspender esta empresa? Se bloqueará el acceso a sus usuarios."
        : "¿Deseas reactivar esta empresa? Sus usuarios podrán volver a ingresar.";

      const result = await NotificationService.warning(
        confirmText,
        isSuspend ? "Suspender Empresa" : "Reactivar Empresa",
      );
      if (!result.isConfirmed) return;

      try {
        NotificationService.loading("Procesando...");
        const response = await SaaSAdminService.ejecutarAccionEmpresa(id, {
          action,
        });
        NotificationService.close();

        if (response && response.success) {
          NotificationService.toastSuccess(
            `Empresa ${isSuspend ? "suspendida" : "reactivada"} correctamente.`,
          );
          dataTableInstance.ajax.reload(null, false);
        } else {
          NotificationService.error(
            NotificationService.getApiErrorMessage(response),
          );
        }
      } catch (error) {
        NotificationService.close();
        NotificationService.toastError("Error al ejecutar la acción.");
      }
    });

    // 2. Extender Trial (Modal)
    $(`#${TABLE_ID}`).on("click", ".btn-extend-trial", function () {
      const id = $(this).data("id");
      $("#extend_trial_company_id").val(id);
      $("#extend_trial_days").val("7"); // 7 días por defecto
      $("#modalExtendTrial").modal("show");
    });

    $("#form_extend_trial").on("submit", async function (e) {
      e.preventDefault();
      const id = $("#extend_trial_company_id").val();
      const days = parseInt($("#extend_trial_days").val());
      const reason = $("#extend_trial_reason").val().trim();

      if (days <= 0) {
        NotificationService.toastError("Los días deben ser mayores a cero.");
        return;
      }

      try {
        NotificationService.loading("Extendiendo prueba...");
        const response = await SaaSAdminService.ejecutarAccionEmpresa(id, {
          action: "extend-trial",
          extra_days: days,
          reason: reason || "Extensión manual por soporte",
        });
        NotificationService.close();

        if (response && response.success) {
          NotificationService.success("Prueba extendida correctamente.");
          $("#modalExtendTrial").modal("hide");
          dataTableInstance.ajax.reload(null, false);
        } else {
          NotificationService.error(
            NotificationService.getApiErrorMessage(response),
          );
        }
      } catch (error) {
        NotificationService.close();
        NotificationService.toastError("Error al extender la prueba.");
      }
    });

    // 3. Impersonación
    $(`#${TABLE_ID}`).on("click", ".btn-impersonate", async function () {
      const id = $(this).data("id");
      const name = $(this).data("name");

      const result = await NotificationService.warning(
        `¿Deseas iniciar sesión de soporte en la empresa "${name}"? Esta acción será auditada.`,
        "Iniciar Soporte Técnico",
      );
      if (!result.isConfirmed) return;

      try {
        NotificationService.loading("Generando token de acceso...");
        const response = await SaaSAdminService.impersonarEmpresa(id, {
          reason: "Soporte técnico solicitado por el cliente",
        });
        NotificationService.close();

        if (response && response.success && response.data) {
          //1. Obtenemos el objeto data completo
          const data = response.data;

          //2. Extraemos con los nombres EXACTOS del JSON
          const supportToken = data.access_token;
          const companyId = data.target_company?.id_company;
          const companyName = data.target_company?.business_name || name;
          const targetUser = data.target_user;

          if (!supportToken || !companyId) {
            NotificationService.error(
              "El servidor no devolvió un token o empresa válida.",
            );
            return;
          }

          // 1. Guardar copia de seguridad completa del contexto administrativo antes de impersonar
          Storage.saveImpersonationBackup({
            admin_access_token: Storage.getAccessToken(),
            admin_refresh_token: Storage.getRefreshToken(),
            admin_user: Storage.getUser(),
            admin_permissions: Storage.getPermissions(),
            admin_roles: Storage.getRoles(),
            company_id: companyId,
            company_name: companyName,
            target_user: targetUser,
          });

          // 2. Limpiar caché previo de contexto para evitar permisos residuales
          sessionStorage.removeItem("inventariopme_security_context");

          // 3. Guardar el token de soporte temporal y la empresa activa confinada
          Storage.saveTokens(supportToken, "");
          Storage.saveActiveCompanyId(companyId);

          // 4. Actualizar usuario al usuario impersonado
          if (targetUser) {
            Storage.saveUser({
              id_user: targetUser.id_user,
              username: targetUser.username,
              email: targetUser.email,
              first_name: targetUser.full_name?.split(" ")[0] || targetUser.username,
              last_name: targetUser.full_name?.split(" ").slice(1).join(" ") || "",
              is_superuser: false,
              is_staff: false,
            });
          }

          NotificationService.toastSuccess(
            `Entrando a ${companyName} como soporte...`,
          );

          // 5. Redirigir al dashboard del ERP
          setTimeout(() => {
            window.location.href = `${Config.BASE_PATH}/dashboard`;
          }, 800);
        } else {
          NotificationService.error(
            NotificationService.getApiErrorMessage(response),
          );
        }
      } catch (error) {
        console.error("[IMPERSONATION] Error:", error);
        NotificationService.close();
        NotificationService.toastError("Error al iniciar sesión de soporte.");
      }
    });
  }

  return {
    init: () => {
      initDataTable();
      setupEvents();
      SecurityManager.processDomPermissions();
    },
  };
})();

export default SaaSAdminTenantController;
