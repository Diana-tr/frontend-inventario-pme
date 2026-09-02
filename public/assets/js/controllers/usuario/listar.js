/**
 * ============================================================
 * Inventario PME
 * Usuario List Controller
 * ============================================================
 *
 * Controlador responsable de:
 * - Cargar los usuarios desde la API.
 * - Renderizar la tabla de usuarios.
 * - Inicializar y configurar el DataTable.
 *
 * No contiene lógica de:
 * - Manipulación de fetch().
 * - Autenticación.
 * - Redirecciones.
 * ============================================================
 */

import UsuarioService from "../../services/usuario_service.js";
import RoleService from "../../services/role_service.js";
import SecurityManager from "../../core/security.js";

const UsuarioListController = (() => {
  const TABLE_BODY_ID = "tablaUsuariosBody";
  const TABLE_ID = "tbl_usuarios";
  const EDIT_MODAL_ID = "modalEditarUsuario";
  const EDIT_FORM_ID = "formEditarUsuario";

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

  function createActionsCell(user) {
    const td = document.createElement("td");
    td.classList.add("text-center", "align-middle");

    const container = document.createElement("div");
    container.classList.add("btn-group");

    // Botón Ver Detalles
    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "btn btn-outline-info btn-sm btn-view-user";
    viewButton.title = "Ver detalles";
    viewButton.dataset.userId = user.id_user ?? "";
    viewButton.dataset.permission = "users.view";
    viewButton.innerHTML = '<i class="fas fa-eye"></i>';

    // Botón Editar
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn-outline-warning btn-sm btn-edit-user";
    editButton.title = "Editar usuario";
    editButton.dataset.userId = user.id_user ?? "";
    editButton.dataset.permission = "users.update";
    editButton.innerHTML = '<i class="fas fa-edit"></i>';

    // Botón Desactivar/Eliminar
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-outline-danger btn-sm";
    deleteButton.title = "Desactivar usuario";
    deleteButton.dataset.userId = user.id_user ?? "";
    deleteButton.dataset.permission = "users.delete";
    deleteButton.innerHTML = '<i class="fas fa-user-slash"></i>';

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

  function createUserRow(user, index) {
    const tr = document.createElement("tr");

    // N°
    tr.appendChild(createCell(index + 1, ["text-center"]));

    // Nombre completo
    const fullNameParts = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ");
    const fullName = user.name || fullNameParts || "Sin nombre";
    tr.appendChild(createCell(fullName));

    // Username
    tr.appendChild(createCell(user.username || "Sin usuario"));

    // Email
    tr.appendChild(createCell(user.email || "Sin correo"));

    // Roles
    const roleName = user.roles?.length
      ? user.roles.map((role) => role.role_name).join(", ")
      : "Sin rol";
    tr.appendChild(createCell(roleName));

    // Estado
    tr.appendChild(createStatusCell(user.is_active));

    // Acciones
    tr.appendChild(createActionsCell(user));

    return tr;
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Detalles
  // ───────────────────────────────────────────

  function formatDate(isoStr) {
    if (!isoStr) return "N/A";
    const date = new Date(isoStr);
    return date.toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function setupViewDetailsListener() {
    // Usamos delegación de eventos en la tabla mediante jQuery para DataTables
    $(`#${TABLE_ID}`)
      .off("click", ".btn-view-user")
      .on("click", ".btn-view-user", async function () {
        const userId = $(this).data("userId");

        if (!userId) return;

        // Estado inicial del modal (Mostrar loader y ocultar contenido)
        $("#user_modal_loader").show();
        $("#user_modal_content").hide();
        $("#modalDetalleUsuario").modal("show");

        try {
          const response = await UsuarioService.obtenerUsuarioPorId(userId);

          if (response && response.success && response.data) {
            const user = response.data;

            // Nombre completo
            const fullNameParts = [user.first_name, user.last_name]
              .filter(Boolean)
              .join(" ");
            const fullName = fullNameParts || "Sin nombre";

            // Roles
            const roleName =
              user.roles && user.roles.length > 0
                ? user.roles.map((r) => r.role_name).join(", ")
                : "Sin rol asignado";

            // Inyectar datos en los elementos del modal
            $("#detail_full_name").text(fullName);
            $("#detail_username").text(`@${user.username || "sin_usuario"}`);
            $("#detail_email").text(user.email || "No registrado");
            $("#detail_document").text(user.document_number || "Sin documento");
            $("#detail_phone").text(user.phone_number || "Sin teléfono");
            $("#detail_role").text(roleName);
            $("#detail_created_at").text(formatDate(user.created_at));
            $("#detail_updated_at").text(formatDate(user.updated_at));

            // Badge de Estado
            const badgeHtml = user.is_active
              ? '<span class="badge badge-success px-3 py-1 shadow-sm">Activo</span>'
              : '<span class="badge badge-danger px-3 py-1 shadow-sm">Inactivo</span>';
            $("#detail_status_badge").html(badgeHtml);

            // Ocultar spinner y mostrar contenido con efecto suave
            $("#user_modal_loader").hide();
            $("#user_modal_content").fadeIn();
          } else {
            throw new Error("Respuesta inválida al consultar el usuario.");
          }
        } catch (error) {
          console.error("[USUARIOS] Error al obtener detalles:", error);
          $("#modalDetalleUsuario").modal("hide");
        }
      });
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Edición (PATCH / PUT)
  // ───────────────────────────────────────────

  function setupEditUserListener() {
    // 1. Cargar datos en el modal de edición
    $(`#${TABLE_ID}`)
      .off("click", ".btn-edit-user")
      .on("click", ".btn-edit-user", async function () {
        const userId = $(this).data("userId");
        if (!userId) return;

        const form = document.getElementById(EDIT_FORM_ID);
        if (form) {
          form.classList.remove("was-validated");
          form.reset();
        }

        $("#edit_user_modal_loader").show();
        $("#edit_user_modal_content").hide();
        $(`#${EDIT_MODAL_ID}`).modal("show");

        try {
          const response = await UsuarioService.obtenerUsuarioPorId(userId);

          if (response && response.success && response.data) {
            const user = response.data;

            $("#edit_user_id").val(user.id_user);
            $("#edit_first_name").val(user.first_name || "");
            $("#edit_last_name").val(user.last_name || "");
            $("#edit_username").val(user.username || "");
            $("#edit_email").val(user.email || "");
            $("#edit_document_number").val(user.document_number || "");
            $("#edit_phone_number").val(user.phone_number || "");
            $("#edit_is_active").prop("checked", Boolean(user.is_active));
            
            // Set roles in Select2
            const userRoles = user.roles ? user.roles.map(r => r.id_role) : [];
            $("#edit_roles").val(userRoles).trigger("change");

            $("#edit_user_modal_loader").hide();
            $("#edit_user_modal_content").fadeIn();
          } else {
            throw new Error("No se pudo obtener la información del usuario.");
          }
        } catch (error) {
          console.error("[USUARIOS] Error al preparar edición:", error);
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

        const userId = $("#edit_user_id").val();
        const submitBtn = $("#btn_guardar_edicion");

        const rolesSelect = $("#edit_roles").val() || [];
        const rolesIds = rolesSelect.map(val => parseInt(val, 10));

        // Payload con actualización parcial (PATCH)
        const payload = {
          first_name: $("#edit_first_name").val().trim(),
          last_name: $("#edit_last_name").val().trim(),
          username: $("#edit_username").val().trim(),
          email: $("#edit_email").val().trim(),
          document_number: $("#edit_document_number").val().trim(),
          phone_number: $("#edit_phone_number").val().trim(),
          is_active: $("#edit_is_active").is(":checked"),
        };
        
        if (rolesIds.length > 0) {
            payload.roles = rolesIds;
        }

        try {
          submitBtn
            .prop("disabled", true)
            .html('<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...');

          // Ejecución del endpoint HTTP PATCH
          const response = await UsuarioService.actualizarUsuario(
            userId,
            payload,
          );

          if (response && response.success) {
            $(`#${EDIT_MODAL_ID}`).modal("hide");
            await loadUsers(); // Refrescar el DataTable
          } else {
            throw new Error(
              response?.message || "No se pudo actualizar el usuario.",
            );
          }
        } catch (error) {
          console.error("[USUARIOS] Error al actualizar:", error);
          alert("Ocurrió un error al intentar actualizar el usuario.");
        } finally {
          submitBtn
            .prop("disabled", false)
            .html('<i class="fas fa-save mr-1"></i>Guardar Cambios');
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
    1: "first_name",   // Nombre completo → ordena por first_name
    2: "username",
    3: "email",
    // 4: roles (no ordenable en backend)
    5: "is_active",
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
      searchDelay: 500, // Debounce de 500ms para evitar ráfagas de peticiones

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
          exportOptions: { columns: [1, 2, 3, 4, 5] },
        },
        {
          extend: "csv",
          className: "btn btn-success btn-sm",
          text: '<i class="fas fa-file-csv mr-1"></i>CSV',
          exportOptions: { columns: [1, 2, 3, 4, 5] },
        },
        {
          extend: "excel",
          className: "btn btn-success btn-sm",
          text: '<i class="fas fa-file-excel mr-1"></i>Excel',
          exportOptions: { columns: [1, 2, 3, 4, 5] },
        },
        {
          extend: "pdf",
          className: "btn btn-danger btn-sm",
          text: '<i class="fas fa-file-pdf mr-1"></i>PDF',
          exportOptions: { columns: [1, 2, 3, 4, 5] },
        },
        {
          extend: "print",
          className: "btn btn-info btn-sm",
          text: '<i class="fas fa-print mr-1"></i>Imprimir',
          exportOptions: { columns: [1, 2, 3, 4, 5] },
        },
      ],

      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
      },

      // Columna N° y Acciones no son ordenables
      columnDefs: [
        { orderable: false, targets: [0, 4, 6] },
        { className: "text-center", targets: [0, 5, 6] },
      ],

      /**
       * ajax: función personalizada que conecta DataTables con
       * nuestro UsuarioService paginado del backend.
       */
      ajax: async function (data, callback) {
        try {
          // Calcular página (DataTables envía 'start' y 'length')
          const page = Math.floor(data.start / data.length) + 1;
          const pageSize = data.length;
          const search = data.search?.value || "";

          // Calcular ordering
          let ordering = "";
          if (data.order && data.order.length > 0) {
            const orderCol = data.order[0].column;
            const orderDir = data.order[0].dir;
            const field = COLUMN_ORDERING_MAP[orderCol];
            if (field) {
              ordering = orderDir === "desc" ? `-${field}` : field;
            }
          }

          const response = await UsuarioService.listarUsuariosPaginados({
            page,
            page_size: pageSize,
            search,
            ordering,
          });

          if (response?.success && response.data) {
            const users = response.data.results || [];
            const totalRecords = response.data.count || 0;

            // Transformar los datos al formato que DataTables espera
            const rows = users.map((user, index) => {
              const fullNameParts = [user.first_name, user.last_name]
                .filter(Boolean)
                .join(" ");
              const fullName = user.name || fullNameParts || "Sin nombre";

              const roleName = user.roles?.length
                ? user.roles.map((role) => role.role_name).join(", ")
                : "Sin rol";

              const statusBadge = user.is_active
                ? '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem">Activo</span>'
                : '<span class="badge badge-danger px-3 py-2" style="border-radius:20px;font-size:0.75rem">Inactivo</span>';

              const actions = buildActionsHtml(user);

              return [
                data.start + index + 1, // N°
                fullName,
                user.username || "Sin usuario",
                user.email || "Sin correo",
                roleName,
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

            // Procesar permisos en la tabla recién renderizada
            SecurityManager.processDomPermissions();
          } else {
            callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
          }
        } catch (error) {
          console.error("[USUARIOS] Error server-side:", error);
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
  function buildActionsHtml(user) {
    const userId = user.id_user ?? "";
    return `
      <div class="btn-group">
        <button type="button" class="btn btn-outline-info btn-sm btn-view-user"
                title="Ver detalles" data-user-id="${userId}" data-permission="users.view">
          <i class="fas fa-eye"></i>
        </button>
        <button type="button" class="btn btn-outline-warning btn-sm btn-edit-user"
                title="Editar usuario" data-user-id="${userId}" data-permission="users.update">
          <i class="fas fa-edit"></i>
        </button>
        <button type="button" class="btn btn-outline-danger btn-sm"
                title="Desactivar usuario" data-user-id="${userId}" data-permission="users.delete">
          <i class="fas fa-user-slash"></i>
        </button>
      </div>
    `;
  }

  /**
   * Recarga los datos de la tabla del servidor.
   */
  function loadUsers() {
    if (dataTableInstance) {
      dataTableInstance.ajax.reload(null, false);
    }
  }

  // ───────────────────────────────────────────
  // Inicialización
  // ───────────────────────────────────────────

  async function cargarRoles() {
    try {
      const response = await RoleService.listarRoles();
      if (response && response.success) {
        const roles = response.data?.results ?? [];
        const select = $("#edit_roles");
        
        select.empty();
        
        // Mostrar roles activos o los que ya tiene el usuario
        roles.forEach(role => {
            // Incluso si está inactivo, si un usuario lo tiene, lo dejamos en el select por compatibilidad.
            // Para eso, agregamos todos y cuando se edite un usuario se seleccionará correctamente.
            // Pero idealmente mostramos activos para nuevas asignaciones, pero el usuario ya lo podría tener.
            // Para simplificar, listaremos solo activos para que al guardar solo se guarden activos.
            if(role.is_active) {
                const option = new Option(role.role_name, role.id_role, false, false);
                select.append(option);
            }
        });
      }
    } catch (error) {
      console.error("[USUARIOS] Error al cargar roles:", error);
    }
  }

  function init() {
    const tbody = document.getElementById(TABLE_BODY_ID);

    if (!tbody) {
      return;
    }
    
    cargarRoles();
    initDataTable();
    setupViewDetailsListener();
    setupEditUserListener();
  }

  return Object.freeze({
    init,
  });
})();

export default UsuarioListController;
