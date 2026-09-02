/**
 * ============================================================
 * Inventario PME
 * Role List Controller
 * ============================================================
 *
 * Controlador responsable de:
 * - Cargar los roles desde la API.
 * - Renderizar la tabla de roles.
 * - Inicializar y configurar el DataTable.
 * - Manejar modales de Ver Detalles y Editar.
 * - Desactivar roles (borrado lógico).
 *
 * No contiene lógica de:
 * - Manipulación de fetch().
 * - Autenticación.
 * - Redirecciones.
 * ============================================================
 */

import RoleService from "../../services/role_service.js";
import SecurityManager from "../../core/security.js";
import PermissionSelector from "../../components/permission_selector.js";

const RoleListController = (() => {
  const TABLE_BODY_ID = "tablaRolesBody";
  const TABLE_ID = "tbl_roles";
  const DETAIL_MODAL_ID = "modalDetalleRol";
  const EDIT_MODAL_ID = "modalEditarRol";
  const EDIT_FORM_ID = "formEditarRol";

  let permissionCatalog = []; // Catálogo en memoria

  // ───────────────────────────────────────────
  // Helpers de creación de celdas
  // ───────────────────────────────────────────

  function getTableBody() {
    const tbody = document.getElementById(TABLE_BODY_ID);

    if (!tbody) {
      throw new Error(`No se encontró #${TABLE_BODY_ID}.`);
    }

    return tbody;
  }

  function createCell(text, extraClasses = []) {
    const td = document.createElement("td");
    td.classList.add("align-middle");

    if (extraClasses.length) {
      td.classList.add(...extraClasses);
    }

    td.textContent = text ?? "";

    return td;
  }

  function createStatusCell(isActive) {
    const td = document.createElement("td");
    td.classList.add("text-center", "align-middle");

    const badge = document.createElement("span");
    badge.className = isActive
      ? "badge badge-success px-3 py-2"
      : "badge badge-danger px-3 py-2";
    badge.style.borderRadius = "20px";
    badge.style.fontSize = "0.75rem";
    badge.style.letterSpacing = "0.5px";
    badge.textContent = isActive ? "Activo" : "Inactivo";

    td.appendChild(badge);
    return td;
  }

  function createActionsCell(role) {
    const td = document.createElement("td");
    td.classList.add("text-center", "align-middle");

    const container = document.createElement("div");
    container.classList.add("btn-group");

    // Botón Ver Detalles
    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "btn btn-outline-info btn-sm btn-view-role";
    viewButton.title = "Ver detalles";
    viewButton.dataset.roleId = role.id_role ?? "";
    viewButton.dataset.permission = "roles.view";
    viewButton.innerHTML = '<i class="fas fa-eye"></i>';

    // Botón Editar
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn-outline-warning btn-sm btn-edit-role";
    editButton.title = "Editar rol";
    editButton.dataset.roleId = role.id_role ?? "";
    editButton.dataset.permission = "roles.update";
    editButton.innerHTML = '<i class="fas fa-edit"></i>';

    // Botón Desactivar
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-outline-danger btn-sm btn-delete-role";
    deleteButton.title = "Desactivar rol";
    deleteButton.dataset.roleId = role.id_role ?? "";
    deleteButton.dataset.permission = "roles.delete";
    deleteButton.innerHTML = '<i class="fas fa-ban"></i>';

    // Se agregan en orden al grupo
    container.appendChild(viewButton);
    container.appendChild(editButton);
    container.appendChild(deleteButton);

    td.appendChild(container);
    return td;
  }

  // ───────────────────────────────────────────
  // Creación de filas
  // ───────────────────────────────────────────

  function createRoleRow(role, index) {
    const tr = document.createElement("tr");

    // N°
    tr.appendChild(createCell(index + 1, ["text-center"]));

    // Nombre del Rol
    tr.appendChild(createCell(role.role_name || "Sin nombre"));

    // Descripción
    tr.appendChild(createCell(role.role_description || "Sin descripción"));

    // Estado
    tr.appendChild(createStatusCell(role.is_active));

    // Acciones
    tr.appendChild(createActionsCell(role));

    return tr;
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Detalles
  // ───────────────────────────────────────────

  function setupViewDetailsListener() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-view-role")
      .on("click", ".btn-view-role", async function () {
        const roleId = $(this).data("roleId");

        if (!roleId) return;

        // Estado inicial del modal (Mostrar loader y ocultar contenido)
        $("#role_modal_loader").show();
        $("#role_modal_content").hide();
        $(`#${DETAIL_MODAL_ID}`).modal("show");

        try {
          const response = await RoleService.obtenerRolPorId(roleId);

          if (response && response.success && response.data) {
            const role = response.data;

            // Inyectar datos en los elementos del modal
            $("#detail_role_name").text(role.role_name || "Sin nombre");
            $("#detail_role_description").text(
              role.role_description || "Sin descripción",
            );

            // Badge de Estado
            const badgeHtml = role.is_active
              ? '<span class="badge badge-success px-3 py-1 shadow-sm">Activo</span>'
              : '<span class="badge badge-danger px-3 py-1 shadow-sm">Inactivo</span>';
            $("#detail_role_status_badge").html(badgeHtml);

            // Ocultar spinner y mostrar contenido con efecto suave
            $("#role_modal_loader").hide();
            $("#role_modal_content").fadeIn();
          } else {
            throw new Error("Respuesta inválida al consultar el rol.");
          }
        } catch (error) {
          console.error("[ROLES] Error al obtener detalles:", error);
          $(`#${DETAIL_MODAL_ID}`).modal("hide");
        }
      });
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Edición (PATCH)
  // ───────────────────────────────────────────

  function setupEditRoleListener() {
    // 1. Cargar datos en el modal de edición
    $(`#${TABLE_ID}`)
      .off("click", ".btn-edit-role")
      .on("click", ".btn-edit-role", async function () {
        const roleId = $(this).data("roleId");
        if (!roleId) return;

        const form = document.getElementById(EDIT_FORM_ID);
        if (form) {
          form.classList.remove("was-validated");
          form.reset();
        }

        $("#edit_role_modal_loader").show();
        $("#edit_role_modal_content").hide();
        $(`#${EDIT_MODAL_ID}`).modal("show");

        try {
          const response = await RoleService.obtenerRolPorId(roleId);

          if (response && response.success && response.data) {
            const role = response.data;

            $("#edit_role_id").val(role.id_role);
            $("#edit_role_name").val(role.role_name || "");
            $("#edit_role_description").val(role.role_description || "");
            $("#edit_role_is_active").prop(
              "checked",
              Boolean(role.is_active),
            );

            // Cargar selector de permisos
            const container = document.getElementById("edit_permissions_container");
            PermissionSelector.render(container, permissionCatalog, role.permissions || {});

            $("#edit_role_modal_loader").hide();
            $("#edit_role_modal_content").fadeIn();
          } else {
            throw new Error(
              "No se pudo obtener la información del rol.",
            );
          }
        } catch (error) {
          console.error("[ROLES] Error al preparar edición:", error);
          $(`#${EDIT_MODAL_ID}`).modal("hide");
        }
      });

    // 2. Procesar la actualización enviando PATCH
    $(`#${EDIT_FORM_ID}`)
      .off("submit")
      .on("submit", async function (e) {
        e.preventDefault();
        const form = this;

        if (!form.checkValidity()) {
          e.stopPropagation();
          form.classList.add("was-validated");
          return;
        }

        const roleId = $("#edit_role_id").val();
        const submitBtn = $("#btn_guardar_edicion_rol");
        const container = document.getElementById("edit_permissions_container");

        // Payload con actualización parcial (PATCH)
        const payload = {
          role_name: $("#edit_role_name").val().trim(),
          role_description: $("#edit_role_description").val().trim(),
          is_active: $("#edit_role_is_active").is(":checked"),
          permissions: PermissionSelector.getSelectedPermissions(container),
        };

        try {
          submitBtn
            .prop("disabled", true)
            .html(
              '<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...',
            );

          // Ejecución del endpoint HTTP PATCH
          const response = await RoleService.actualizarRol(
            roleId,
            payload,
          );

          if (response && response.success) {
            $(`#${EDIT_MODAL_ID}`).modal("hide");
            await loadRoles(); // Refrescar el DataTable
          } else {
            console.error("[ROLES] Detalles de validación:", response.errors);
            let errMsg = response?.message || "No se pudo actualizar el rol.";
            
            // Extraer mensajes de error detallados si existen
            if (response.errors && typeof response.errors === 'object') {
                const details = [];
                for (const key in response.errors) {
                    details.push(`${key}: ${JSON.stringify(response.errors[key])}`);
                }
                if (details.length > 0) {
                    errMsg += "\nDetalles:\n" + details.join("\n");
                }
            }
            throw new Error(errMsg);
          }
        } catch (error) {
          console.error("[ROLES] Error al actualizar:", error);
          alert("Ocurrió un error al intentar actualizar el rol.");
        } finally {
          submitBtn
            .prop("disabled", false)
            .html(
              '<i class="fas fa-save mr-1"></i>Guardar Cambios',
            );
        }
      });
  }

  // ───────────────────────────────────────────
  // Manejo de Desactivación (DELETE lógico)
  // ───────────────────────────────────────────

  function setupDeleteRoleListener() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-delete-role")
      .on("click", ".btn-delete-role", async function () {
        const roleId = $(this).data("roleId");
        if (!roleId) return;

        const confirmed = confirm(
          "¿Estás seguro de que deseas desactivar este rol?",
        );

        if (!confirmed) return;

        try {
          const response = await RoleService.desactivarRol(roleId);

          if (response && response.success) {
            await loadRoles(); // Refrescar el DataTable
          } else {
            throw new Error(
              response?.message ||
                "No se pudo desactivar el rol.",
            );
          }
        } catch (error) {
          console.error("[ROLES] Error al desactivar:", error);
          alert("Ocurrió un error al intentar desactivar el rol.");
        }
      });
  }

  // ───────────────────────────────────────────
  // DataTable con paginación server-side
  // ───────────────────────────────────────────

  /**
   * Mapa de columnas DataTables → campos de ordering del backend.
   * Solo las columnas ordenables tienen mapping.
   */
  const COLUMN_ORDERING_MAP = {
    1: "role_name",
    2: "role_description",
    3: "is_active",
  };

  let dataTableInstance = null;

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
      searchDelay: 500, // Debounce de 500ms

      // Layout compatible con Bootstrap 4 / AdminLTE 3
      dom:
        "<'row mb-2'" +
        "<'col-sm-12 col-md-6 d-flex align-items-center'lB>" +
        "<'col-sm-12 col-md-6 d-flex justify-content-end'f>" +
        ">" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row mt-2'" +
        "<'col-sm-12 col-md-5'i>" +
        "<'col-sm-12 col-md-7 d-flex justify-content-end'p>" +
        ">",

      buttons: [
        {
          extend: "copy",
          className: "btn btn-secondary btn-sm",
          text: '<i class="fas fa-copy mr-1"></i>Copiar',
          exportOptions: { columns: [1, 2, 3] },
        },
        {
          extend: "csv",
          className: "btn btn-success btn-sm",
          text: '<i class="fas fa-file-csv mr-1"></i>CSV',
          exportOptions: { columns: [1, 2, 3] },
        },
        {
          extend: "excel",
          className: "btn btn-success btn-sm",
          text: '<i class="fas fa-file-excel mr-1"></i>Excel',
          exportOptions: { columns: [1, 2, 3] },
        },
        {
          extend: "pdf",
          className: "btn btn-danger btn-sm",
          text: '<i class="fas fa-file-pdf mr-1"></i>PDF',
          exportOptions: { columns: [1, 2, 3] },
        },
        {
          extend: "print",
          className: "btn btn-info btn-sm",
          text: '<i class="fas fa-print mr-1"></i>Imprimir',
          exportOptions: { columns: [1, 2, 3] },
        },
      ],

      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
      },

      // Columna N° y Acciones no son ordenables
      columnDefs: [
        { orderable: false, targets: [0, 4] },
        { className: "text-center", targets: [0, 3, 4] },
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
            if (field) {
              ordering = orderDir === "desc" ? `-${field}` : field;
            }
          }

          const response = await RoleService.listarRolesPaginados({
            page,
            page_size: pageSize,
            search,
            ordering,
          });

          if (response?.success && response.data) {
            const roles = response.data.results || [];
            const totalRecords = response.data.count || 0;

            const rows = roles.map((role, index) => {
              const statusBadge = role.is_active
                ? '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem">Activo</span>'
                : '<span class="badge badge-danger px-3 py-2" style="border-radius:20px;font-size:0.75rem">Inactivo</span>';

              const actions = buildActionsHtml(role);

              return [
                data.start + index + 1, // N°
                role.role_name || "Sin nombre",
                role.role_description || "Sin descripción",
                statusBadge,
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
            callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
          }
        } catch (error) {
          console.error("[ROLES] Error server-side:", error);
          callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
        }
      },

      drawCallback: function () {
        $(".dataTables_paginate > .pagination").addClass("pagination-sm");
      },
      initComplete: function () {
        $(".dt-buttons").addClass("ml-4");
      },
    });
  }

  /**
   * Construye el HTML de botones de acciones para una fila.
   */
  function buildActionsHtml(role) {
    const roleId = role.id_role ?? "";
    return `
      <div class="btn-group">
        <button type="button" class="btn btn-outline-info btn-sm btn-view-role"
                title="Ver detalles" data-role-id="${roleId}" data-permission="roles.view">
          <i class="fas fa-eye"></i>
        </button>
        <button type="button" class="btn btn-outline-warning btn-sm btn-edit-role"
                title="Editar rol" data-role-id="${roleId}" data-permission="roles.update">
          <i class="fas fa-edit"></i>
        </button>
        <button type="button" class="btn btn-outline-danger btn-sm btn-delete-role"
                title="Desactivar rol" data-role-id="${roleId}" data-permission="roles.delete">
          <i class="fas fa-ban"></i>
        </button>
      </div>
    `;
  }

  function loadRoles() {
    if (dataTableInstance) {
      dataTableInstance.ajax.reload(null, false);
    }
  }

  // ───────────────────────────────────────────
  // Inicialización
  // ───────────────────────────────────────────

  async function init() {
    const tbody = document.getElementById(TABLE_BODY_ID);

    if (!tbody) {
      return;
    }

    try {
      // 1. Cargar el catálogo de permisos globalmente para el selector
      const catalogResponse = await RoleService.obtenerCatalogoPermisos();
      if (catalogResponse && catalogResponse.success && catalogResponse.data) {
        permissionCatalog = catalogResponse.data.modules || [];
      } else {
        console.warn("[ROLES] No se pudo cargar el catálogo de permisos.");
      }
    } catch (error) {
      console.error("[ROLES] Error al cargar catálogo de permisos:", error);
    }

    // 2. Iniciar tabla
    initDataTable();
    setupViewDetailsListener();
    setupEditRoleListener();
    setupDeleteRoleListener();
  }

  return Object.freeze({
    init,
  });
})();

export default RoleListController;
