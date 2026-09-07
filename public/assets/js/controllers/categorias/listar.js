/**
 * ============================================================
 * Inventario PME
 * Category List Controller
 * ============================================================
 *
 * Controlador responsable de:
 * - Cargar las categorías desde la API.
 * - Renderizar la tabla de categorías.
 * - Inicializar y configurar el DataTable.
 * - Manejar modales de Ver Detalles y Editar.
 * - Desactivar / Activar o Eliminar categorías.
 *
 * No contiene lógica de:
 * - Manipulación de fetch().
 * - Autenticación.
 * - Redirecciones.
 * ============================================================
 */

import CategoryService from "../../services/categoria_service.js";
import SecurityManager from "../../core/security.js";
import NotificationService from "../../core/notification.js";

const CategoryListController = (() => {
  const TABLE_BODY_ID = "tablaCategoriasBody";
  const TABLE_ID = "tbl_categorias";
  const DETAIL_MODAL_ID = "modalDetalleCategoria";
  const EDIT_MODAL_ID = "modalEditarCategoria";
  const EDIT_FORM_ID = "formEditarCategoria";

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

  function createActionsCell(category) {
    const td = document.createElement("td");
    td.classList.add("text-center", "align-middle");

    const container = document.createElement("div");
    container.classList.add("btn-group");

    // Botón Ver Detalles
    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "btn btn-outline-info btn-sm btn-view-category";
    viewButton.title = "Ver detalles";
    viewButton.dataset.categoryId = category.id_category ?? category.id ?? "";
    viewButton.dataset.permission = "categories.view";
    viewButton.innerHTML = '<i class="fas fa-eye"></i>';

    // Botón Editar
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn-outline-warning btn-sm btn-edit-category";
    editButton.title = "Editar categoría";
    editButton.dataset.categoryId = category.id_category ?? category.id ?? "";
    editButton.dataset.permission = "categories.update";
    editButton.innerHTML = '<i class="fas fa-edit"></i>';

    // Botón Desactivar / Activar
    const isActive = Boolean(category.is_active);
    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = isActive
      ? "btn btn-outline-danger btn-sm btn-toggle-status"
      : "btn btn-outline-success btn-sm btn-toggle-status";
    toggleButton.title = isActive ? "Desactivar categoría" : "Activar categoría";
    toggleButton.dataset.categoryId = category.id_category ?? category.id ?? "";
    toggleButton.dataset.categoryName = category.category_name ?? category.name ?? "";
    toggleButton.dataset.status = isActive ? "true" : "false";
    toggleButton.dataset.permission = "categories.update";
    toggleButton.innerHTML = isActive
      ? '<i class="fas fa-toggle-off"></i>'
      : '<i class="fas fa-toggle-on"></i>';

    container.appendChild(viewButton);
    container.appendChild(editButton);
    container.appendChild(toggleButton);

    td.appendChild(container);
    return td;
  }

  // ───────────────────────────────────────────
  // Creación de filas
  // ───────────────────────────────────────────

  function createCategoryRow(category, index) {
    const tr = document.createElement("tr");

    // N°
    tr.appendChild(createCell(index + 1, ["text-center"]));

    // Nombre de Categoría
    tr.appendChild(
      createCell(category.category_name || category.name || "Sin nombre")
    );

    // Descripción
    tr.appendChild(
      createCell(
        category.category_description || category.description || "Sin descripción"
      )
    );

    // Estado
    tr.appendChild(createStatusCell(category.is_active));

    // Acciones
    tr.appendChild(createActionsCell(category));

    return tr;
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Detalles
  // ───────────────────────────────────────────

  function setupViewDetailsListener() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-view-category")
      .on("click", ".btn-view-category", async function () {
        const categoryId = $(this).data("categoryId");

        if (!categoryId) return;

        // Estado inicial del modal (Mostrar loader y ocultar contenido)
        $("#category_modal_loader").show();
        $("#category_modal_content").hide();
        $(`#${DETAIL_MODAL_ID}`).modal("show");

        try {
          const response = await CategoryService.obtenerCategoriaPorId(
            categoryId
          );

          if (response && response.success && response.data) {
            const category = response.data;

            // Inyectar datos en los elementos del modal
            $("#detail_category_name").text(
              category.category_name || category.name || "Sin nombre"
            );
            $("#detail_category_description").text(
              category.category_description ||
                category.description ||
                "Sin descripción"
            );

            // Badge de Estado
            const badgeHtml = category.is_active
              ? '<span class="badge badge-success px-3 py-1 shadow-sm">Activo</span>'
              : '<span class="badge badge-danger px-3 py-1 shadow-sm">Inactivo</span>';
            $("#detail_category_status_badge").html(badgeHtml);

            // Ocultar spinner y mostrar contenido con efecto suave
            $("#category_modal_loader").hide();
            $("#category_modal_content").fadeIn();
          } else {
            throw new Error(
              "Respuesta inválida al consultar la categoría."
            );
          }
        } catch (error) {
          console.error(
            "[CATEGORIES] Error al obtener detalles:",
            error
          );
          $(`#${DETAIL_MODAL_ID}`).modal("hide");
        }
      });
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Edición (PATCH)
  // ───────────────────────────────────────────

  function setupEditCategoryListener() {
    // 1. Cargar datos en el modal de edición
    $(`#${TABLE_ID}`)
      .off("click", ".btn-edit-category")
      .on("click", ".btn-edit-category", async function () {
        const categoryId = $(this).data("categoryId");
        if (!categoryId) return;

        const form = document.getElementById(EDIT_FORM_ID);
        if (form) {
          form.classList.remove("was-validated");
          form.reset();
        }

        $("#edit_category_modal_loader").show();
        $("#edit_category_modal_content").hide();
        $(`#${EDIT_MODAL_ID}`).modal("show");

        try {
          const response = await CategoryService.obtenerCategoriaPorId(
            categoryId
          );

          if (response && response.success && response.data) {
            const category = response.data;

            $("#edit_category_id").val(
              category.id_category || category.id
            );
            $("#edit_category_name").val(
              category.category_name || category.name || ""
            );
            $("#edit_category_description").val(
              category.category_description || category.description || ""
            );
            $("#edit_category_is_active").prop(
              "checked",
              Boolean(category.is_active)
            );

            $("#edit_category_modal_loader").hide();
            $("#edit_category_modal_content").fadeIn();
          } else {
            throw new Error(
              "No se pudo obtener la información de la categoría."
            );
          }
        } catch (error) {
          console.error(
            "[CATEGORIES] Error al preparar edición:",
            error
          );
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

        const categoryId = $("#edit_category_id").val();
        const submitBtn = $("#btn_guardar_edicion_categoria");

        // Payload con actualización parcial (PATCH)
        const payload = {
          category_name: $("#edit_category_name").val().trim(),
          category_description: $("#edit_category_description")
            .val()
            .trim(),
          is_active: $("#edit_category_is_active").is(":checked"),
        };

        try {
          submitBtn
            .prop("disabled", true)
            .html(
              '<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...'
            );

          // Ejecución del endpoint HTTP PATCH
          const response = await CategoryService.actualizarCategoria(
            categoryId,
            payload
          );

          if (response && response.success) {
            $(`#${EDIT_MODAL_ID}`).modal("hide");
            await loadCategories(); // Refrescar el DataTable
            NotificationService.toastSuccess(
              "Categoría actualizada correctamente."
            );
          } else {
            console.error(
              "[CATEGORIES] Detalles de validación:",
              response.errors
            );
            let errMsg =
              response?.message ||
              "No se pudo actualizar la categoría.";

            if (
              response.errors &&
              typeof response.errors === "object"
            ) {
              const details = [];
              for (const key in response.errors) {
                details.push(
                  `${key}: ${JSON.stringify(response.errors[key])}`
                );
              }
              if (details.length > 0) {
                errMsg += "\nDetalles:\n" + details.join("\n");
              }
            }
            throw new Error(errMsg);
          }
        } catch (error) {
          console.error("[CATEGORIES] Error al actualizar:", error);
          const errorMsg = NotificationService.getApiErrorMessage(
            error,
            "Ocurrió un error al actualizar la categoría."
          );
          NotificationService.error(errorMsg);
        } finally {
          submitBtn
            .prop("disabled", false)
            .html('<i class="fas fa-save mr-1"></i>Guardar Cambios');
        }
      });
  }

  /**
   * Manejo de Desactivación / Activación de Categorías
   */
  function setupToggleStatusListener() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-toggle-status")
      .on("click", ".btn-toggle-status", async function () {
        const button = $(this);
        const categoryId = button.data("categoryId");
        const categoryName = button.data("categoryName") || "esta categoría";
        const statusAttr = button.data("status");
        const isCurrentActive =
          statusAttr === true || statusAttr === "true";
        const newStatus = !isCurrentActive;
        const actionWord = isCurrentActive ? "desactivar" : "activar";

        if (!categoryId) return;

        NotificationService.warning(
          `¿Deseas ${actionWord} la categoría "${categoryName}"?`,
          `Confirmación de ${actionWord}`
        ).then(async (result) => {
          if (!result.isConfirmed) return;

          try {
            const response =
              await CategoryService.cambiarEstadoCategoria(
                categoryId,
                newStatus
              );

            if (response && response.success) {
              NotificationService.toastSuccess(
                `Categoría "${categoryName}" ${
                  newStatus ? "activada" : "desactivada"
                } con éxito.`
              );
              loadCategories(); // Recargar la tabla
            } else {
              throw response;
            }
          } catch (error) {
            console.error(
              "[CATEGORIES] Error al cambiar estado:",
              error
            );
            const errorMsg = NotificationService.getApiErrorMessage(
              error,
              "Ocurrió un problema al cambiar el estado de la categoría."
            );
            NotificationService.error(errorMsg);
          }
        });
      });
  }

  // ───────────────────────────────────────────
  // DataTable con paginación server-side
  // ───────────────────────────────────────────

  /**
   * Mapa de columnas DataTables → campos de ordering del backend.
   */
  const COLUMN_ORDERING_MAP = {
    1: "category_name",
    2: "category_description",
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

          const response =
            await CategoryService.listarCategoriasPaginadas({
              page,
              page_size: pageSize,
              search,
              ordering,
            });

          if (response?.success && response.data) {
            const categories = response.data.results || [];
            const totalRecords = response.data.count || 0;

            const rows = categories.map((category, index) => {
              const statusBadge = category.is_active
                ? '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem">Activo</span>'
                : '<span class="badge badge-danger px-3 py-2" style="border-radius:20px;font-size:0.75rem">Inactivo</span>';

              const actions = buildActionsHtml(category);

              return [
                data.start + index + 1, // N°
                category.category_name || category.name || "Sin nombre",
                category.category_description ||
                  category.description ||
                  "Sin descripción",
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
            callback({
              draw: data.draw,
              recordsTotal: 0,
              recordsFiltered: 0,
              data: [],
            });
          }
        } catch (error) {
          console.error("[CATEGORIES] Error server-side:", error);
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
      initComplete: function () {
        $(".dt-buttons").addClass("ml-4");
      },
    });
  }

  /**
   * Construye el HTML de botones de acciones para una fila.
   */
  function buildActionsHtml(category) {
    const categoryId = category.id_category ?? category.id ?? "";
    const categoryName =
      category.category_name ?? category.name ?? "categoría";
    const isActive = Boolean(category.is_active);

    const toggleClass = isActive
      ? "btn-outline-danger"
      : "btn-outline-success";
    const toggleIcon = isActive ? "fa-toggle-off" : "fa-toggle-on";
    const toggleTitle = isActive
      ? "Desactivar categoría"
      : "Activar categoría";

    return `
      <div class="btn-group">
        <button type="button" class="btn btn-outline-info btn-sm btn-view-category"
                title="Ver detalles" data-category-id="${categoryId}" data-permission="categories.view">
          <i class="fas fa-eye"></i>
        </button>
        <button type="button" class="btn btn-outline-warning btn-sm btn-edit-category"
                title="Editar categoría" data-category-id="${categoryId}" data-permission="categories.update">
          <i class="fas fa-edit"></i>
        </button>
        <button type="button" class="btn ${toggleClass} btn-sm btn-toggle-status"
                title="${toggleTitle}" data-category-id="${categoryId}" data-category-name="${categoryName}" data-status="${isActive}" data-permission="categories.delete">
          <i class="fas ${toggleIcon}"></i>
        </button>
      </div>
    `;
  }

  function loadCategories() {
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

    // Inicializar tabla y eventos
    initDataTable();
    setupViewDetailsListener();
    setupEditCategoryListener();
    setupToggleStatusListener();
  }

  return Object.freeze({
    init,
  });
})();

export default CategoryListController;