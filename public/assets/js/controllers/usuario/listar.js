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

const UsuarioListController = (() => {
  const TABLE_BODY_ID = "tablaUsuariosBody";
  const TABLE_ID = "tbl_usuarios";

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

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn-primary btn-sm";
    editButton.title = "Editar usuario";
    editButton.dataset.userId = user.id_user ?? "";

    const editIcon = document.createElement("i");
    editIcon.className = "fas fa-edit";
    editButton.appendChild(editIcon);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-danger btn-sm";
    deleteButton.title = "Desactivar usuario";
    deleteButton.dataset.userId = user.id_user ?? "";

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fas fa-trash-alt";
    deleteButton.appendChild(deleteIcon);

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
  // Renderizado
  // ───────────────────────────────────────────

  function renderLoadingState() {
    const tbody = getTableBody();
    tbody.replaceChildren();

    const tr = document.createElement("tr");
    const td = document.createElement("td");

    td.colSpan = 7;
    td.classList.add("text-center", "py-4");

    const spinner = document.createElement("div");
    spinner.className = "spinner-border spinner-border-sm text-primary mr-2";
    spinner.setAttribute("role", "status");

    const text = document.createElement("span");
    text.className = "text-muted";
    text.textContent = "Cargando usuarios...";

    td.appendChild(spinner);
    td.appendChild(text);
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  function renderUsers(users) {
    const tbody = getTableBody();

    tbody.replaceChildren();

    if (!users.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");

      td.colSpan = 7;
      td.classList.add("text-center", "py-4", "text-muted");
      td.textContent = "No hay usuarios registrados.";

      tr.appendChild(td);
      tbody.appendChild(tr);

      return;
    }

    users.forEach((user, index) => {
      tbody.appendChild(createUserRow(user, index));
    });

    initDataTable();
  }

  // ───────────────────────────────────────────
  // DataTable
  // ───────────────────────────────────────────

  function initDataTable() {
    if ($.fn.DataTable.isDataTable(`#${TABLE_ID}`)) {
      $(`#${TABLE_ID}`).DataTable().destroy();
    }

    $(`#${TABLE_ID}`).DataTable({
      responsive: true,
      lengthChange: true,
      autoWidth: false,
      pageLength: 10,
      order: [[0, "asc"]],

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
        { orderable: false, targets: [0, 6] },
        { className: "text-center", targets: [0, 5, 6] },
      ],

      drawCallback: function () {
        $(".dataTables_paginate > .pagination").addClass("pagination-sm");
      },
      initComplete: function () {
        // Agrega un margen izquierdo (ml-3 o ml-4 en Bootstrap 4) a los botones
        // para separarlos del control de "Mostrar N registros".
        $(".dt-buttons").addClass("ml-4");
      },
    });
  }

  // ───────────────────────────────────────────
  // Estado de error
  // ───────────────────────────────────────────

  function renderError() {
    const tbody = getTableBody();

    tbody.replaceChildren();

    const tr = document.createElement("tr");
    const td = document.createElement("td");

    td.colSpan = 7;
    td.classList.add("text-center", "py-4");

    const icon = document.createElement("i");
    icon.className = "fas fa-exclamation-triangle text-danger mr-2";

    const text = document.createElement("span");
    text.className = "text-danger";
    text.textContent = "No fue posible cargar los usuarios. Intente nuevamente.";

    td.appendChild(icon);
    td.appendChild(text);
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  // ───────────────────────────────────────────
  // Carga de datos
  // ───────────────────────────────────────────

  async function loadUsers() {
    try {
      renderLoadingState();

      const response = await UsuarioService.listarUsuarios();

      if (!response?.success) {
        throw new Error(
          response?.message ?? "La API no pudo obtener los usuarios.",
        );
      }

      const users = response.data?.results ?? [];

      renderUsers(users);
    } catch (error) {
      console.error("[USUARIOS] Error:", error);

      renderError();
    }
  }

  // ───────────────────────────────────────────
  // Inicialización
  // ───────────────────────────────────────────

  function init() {
    const tbody = document.getElementById(TABLE_BODY_ID);

    if (!tbody) {
      return;
    }

    loadUsers();
  }

  return Object.freeze({
    init,
  });
})();

export default UsuarioListController;
