/**
 * ============================================================
 * Inventario PME
 * Category List Controller
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

  function getTableBody() {
    const tbody = document.getElementById(TABLE_BODY_ID);
    if (!tbody) {
      throw new Error(`No se encontró #${TABLE_BODY_ID}.`);
    }
    return tbody;
  }

  function formatDate(isoStr) {
    if (!isoStr) return "N/A";
    const date = new Date(isoStr);
    return date.toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
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

        $("#category_modal_loader").show();
        $("#category_modal_content").hide();
        $(`#${DETAIL_MODAL_ID}`).modal("show");

        try {
          const response = await CategoryService.obtenerCategoriaPorId(categoryId);

          if (response && response.success && response.data) {
            const category = response.data;

            $("#detail_name").text(category.name || "Sin nombre");
            $("#detail_description").text(category.description || "Sin descripción");
            
            // Obtener nombre del padre si existe
            let parentDisplay = "Ninguna";
            if (category.parent) {
                try {
                    const parentResponse = await CategoryService.obtenerCategoriaPorId(category.parent);
                    if (parentResponse && parentResponse.success && parentResponse.data) {
                        parentDisplay = parentResponse.data.name;
                    }
                } catch (e) {
                    parentDisplay = `ID: ${category.parent}`;
                }
            }
            $("#detail_parent_name").text(parentDisplay);

            $("#detail_created_at").text(formatDate(category.created_at));
            $("#detail_updated_at").text(formatDate(category.updated_at));

            const badgeHtml = category.is_active
              ? '<span class="badge badge-success px-3 py-1 shadow-sm">Activo</span>'
              : '<span class="badge badge-danger px-3 py-1 shadow-sm">Inactivo</span>';
            $("#detail_status_badge").html(badgeHtml);

            $("#category_modal_loader").hide();
            $("#category_modal_content").fadeIn();
          } else {
            throw new Error("Respuesta inválida al consultar la categoría.");
          }
        } catch (error) {
          console.error("[CATEGORÍAS] Error al obtener detalles:", error);
          $(`#${DETAIL_MODAL_ID}`).modal("hide");
          NotificationService.toastError("No se pudo cargar la información de la categoría.");
        }
      });
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Edición (PATCH)
  // ───────────────────────────────────────────

  async function cargarCategoriasPadre(selectedId = null, currentCategoryId = null) {
    const select = $('#edit_parent_id');
    select.empty();
    select.append(new Option('Seleccionar categoría padre (opcional)', '', true, true));

    try {
        const response = await CategoryService.listarCategorias();
        if (response && response.success) {
            const categorias = Array.isArray(response.data) ? response.data : (response.data.results || []);
            
            categorias.forEach(cat => {
                // No permitir seleccionarse a sí misma como padre
                if (cat.id_category != currentCategoryId) {
                    const option = new Option(cat.name, cat.id_category, false, false);
                    select.append(option);
                }
            });

            if (selectedId) {
                select.val(selectedId).trigger('change');
            }
        }
    } catch (error) {
        console.error("Error al cargar categorías padre:", error);
    }
  }

  function setupEditCategoryListener() {
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
          const response = await CategoryService.obtenerCategoriaPorId(categoryId);

          if (response && response.success && response.data) {
            const category = response.data;

            $("#edit_category_id").val(category.id_category);
            $("#edit_name").val(category.name || "");
            $("#edit_description").val(category.description || "");
            $("#edit_is_active").prop("checked", Boolean(category.is_active));

            // Cargar select2 de padres
            await cargarCategoriasPadre(category.parent, category.id_category);

            $("#edit_category_modal_loader").hide();
            $("#edit_category_modal_content").fadeIn();
          } else {
            throw new Error("No se pudo obtener la información de la categoría.");
          }
        } catch (error) {
          console.error("[CATEGORÍAS] Error al preparar edición:", error);
          $(`#${EDIT_MODAL_ID}`).modal("hide");
        }
      });

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
        const submitBtn = $("#btn_guardar_edicion");

        const payload = {
          name: $("#edit_name").val().trim(),
          description: $("#edit_description").val().trim(),
          parent: $("#edit_parent_id").val() || null,
          is_active: $("#edit_is_active").is(":checked"),
        };

        try {
          submitBtn
            .prop("disabled", true)
            .html('<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...');

          const response = await CategoryService.actualizarCategoria(categoryId, payload);

          if (response && response.success) {
            $(`#${EDIT_MODAL_ID}`).modal("hide");
            loadCategories(); 
            NotificationService.toastSuccess("Categoría actualizada correctamente.");
          } else {
            throw response;
          }
        } catch (error) {
          console.error("[CATEGORÍAS] Error al actualizar:", error);
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
        const isCurrentActive = statusAttr === true || statusAttr === "true";
        const newStatus = !isCurrentActive;
        const actionWord = isCurrentActive ? "desactivar" : "activar";

        if (!categoryId) return;

        NotificationService.warning(
          `¿Deseas ${actionWord} la categoría "${categoryName}"?`,
          `Confirmación de ${actionWord}`
        ).then(async (result) => {
          if (!result.isConfirmed) return;

          try {
            const response = await CategoryService.cambiarEstadoCategoria(categoryId, newStatus);

            if (response && response.success) {
              NotificationService.toastSuccess(
                `Categoría "${categoryName}" ${newStatus ? "activada" : "desactivada"} con éxito.`
              );
              loadCategories();
            } else {
              throw response;
            }
          } catch (error) {
            console.error("[CATEGORÍAS] Error al cambiar estado:", error);
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

  const COLUMN_ORDERING_MAP = {
    1: "name",
    2: "description",
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
      searchDelay: 500,
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

          const response = await CategoryService.listarCategoriasPaginadas({
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
                data.start + index + 1,
                category.name || "Sin nombre",
                category.description || "Sin descripción",
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
          console.error("[CATEGORÍAS] Error server-side:", error);
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

  function buildActionsHtml(category) {
    const categoryId = category.id_category ?? "";
    const categoryName = category.name ?? "categoría";
    const isActive = Boolean(category.is_active);

    const toggleClass = isActive ? "btn-outline-danger" : "btn-outline-success";
    const toggleIcon = isActive ? "fa-toggle-off" : "fa-toggle-on";
    const toggleTitle = isActive ? "Desactivar categoría" : "Activar categoría";

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

  async function init() {
    const tbody = document.getElementById(TABLE_BODY_ID);
    if (!tbody) return;

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