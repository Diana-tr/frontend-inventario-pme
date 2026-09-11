/**
 * ============================================================
 * Inventario PME
 * supplier List Controller (Proveedores)
 * ============================================================
 */

import ProveedorService from "../../services/Proveedor_service.js";
import SecurityManager from "../../core/security.js";
import NotificationService from "../../core/notification.js";

const ProveedorListController = (() => {
  const TABLE_BODY_ID = "tablaProveedoresBody";
  const TABLE_ID = "tbl_Proveedores";
  const DETAIL_MODAL_ID = "modalDetalleProveedor";
  const EDIT_MODAL_ID = "modalEditarProveedor";
  const EDIT_FORM_ID = "formEditarProveedor";

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
      .off("click", ".btn-view-supplier")
      .on("click", ".btn-view-supplier", async function () {
        const proveedorId = $(this).data("supplierId");

        if (!proveedorId) return;

        $("#supplier_modal_loader").show();
        $("#supplier_modal_content").hide();
        $(`#${DETAIL_MODAL_ID}`).modal("show");

        try {
          const response = await ProveedorService.obtenerProveedorPorId(proveedorId);

          if (response && response.success && response.data) {
            const proveedor = response.data;

            $("#detail_document_type").text(proveedor.document_type || "N/A");
            $("#detail_document_number").text(proveedor.document_number || "Sin número");
            $("#detail_first_name").text(proveedor.first_name || "Sin nombre");
            $("#detail_last_name").text(proveedor.last_name || "Sin apellido");
            $("#detail_business_name").text(proveedor.business_name || "N/A");
            $("#detail_email").text(proveedor.email || "Sin correo");
            $("#detail_phone").text(proveedor.phone || "Sin teléfono");
            $("#detail_mobile").text(proveedor.mobile || "Sin celular");
            $("#detail_address").text(proveedor.address || "Sin dirección");
            $("#detail_city").text(proveedor.city || "Sin ciudad");
            $("#detail_country").text(proveedor.country || "Sin país");
            $("#detail_notes").text(proveedor.notes || "Sin notas");

            const badgeHtml = proveedor.is_active
              ? '<span class="badge badge-success px-3 py-1 shadow-sm">Activo</span>'
              : '<span class="badge badge-danger px-3 py-1 shadow-sm">Inactivo</span>';
            $("#detail_status_badge").html(badgeHtml);

            $("#supplier_modal_loader").hide();
            $("#supplier_modal_content").fadeIn();
          } else {
            throw new Error("Respuesta inválida al consultar el proveedor.");
          }
        } catch (error) {
          console.error("[PROVEEDORES] Error al obtener detalles:", error);
          $(`#${DETAIL_MODAL_ID}`).modal("hide");
          NotificationService.toastError("No se pudo cargar la información del proveedor.");
        }
      });
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Edición (PATCH)
  // ───────────────────────────────────────────

  function setupEditSupplierListener() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-edit-supplier")
      .on("click", ".btn-edit-supplier", async function () {
        const proveedorId = $(this).data("supplierId");
        if (!proveedorId) return;

        const form = document.getElementById(EDIT_FORM_ID);
        if (form) {
          form.classList.remove("was-validated");
          form.reset();
        }

        $("#edit_supplier_modal_loader").show();
        $("#edit_supplier_modal_content").hide();
        $(`#${EDIT_MODAL_ID}`).modal("show");

        try {
          const response = await ProveedorService.obtenerProveedorPorId(proveedorId);

          if (response && response.success && response.data) {
            const proveedor = response.data;

            $("#edit_supplier_id").val(proveedor.id_supplier);
            $("#edit_document_type").val(proveedor.document_type || "CC");
            $("#edit_document_number").val(proveedor.document_number || "");
            $("#edit_first_name").val(proveedor.first_name || "");
            $("#edit_last_name").val(proveedor.last_name || "");
            $("#edit_business_name").val(proveedor.business_name || "");
            $("#edit_email").val(proveedor.email || "");
            $("#edit_phone").val(proveedor.phone || "");
            $("#edit_mobile").val(proveedor.mobile || "");
            $("#edit_address").val(proveedor.address || "");
            $("#edit_city").val(proveedor.city || "");
            $("#edit_country").val(proveedor.country || "Colombia");
            $("#edit_notes").val(proveedor.notes || "");
            $("#edit_is_active").prop("checked", Boolean(proveedor.is_active));

            $("#edit_supplier_modal_loader").hide();
            $("#edit_supplier_modal_content").fadeIn();
          } else {
            throw new Error("No se pudo obtener la información del proveedor.");
          }
        } catch (error) {
          console.error("[PROVEEDORES] Error al preparar edición:", error);
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

        const proveedorId = $("#edit_supplier_id").val();
        const submitBtn = $("#btn_guardar_edicion");

        const payload = {
          document_type: $("#edit_document_type").val(),
          document_number: $("#edit_document_number").val().trim(),
          first_name: $("#edit_first_name").val().trim(),
          last_name: $("#edit_last_name").val().trim(),
          business_name: $("#edit_business_name").val().trim(),
          email: $("#edit_email").val().trim(),
          phone: $("#edit_phone").val().trim(),
          mobile: $("#edit_mobile").val().trim(),
          address: $("#edit_address").val().trim(),
          city: $("#edit_city").val().trim(),
          country: $("#edit_country").val().trim() || 'Colombia',
          notes: $("#edit_notes").val().trim(),
          is_active: $("#edit_is_active").is(":checked"),
        };

        try {
          submitBtn
            .prop("disabled", true)
            .html('<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...');

          const response = await ProveedorService.actualizarProveedor(proveedorId, payload);

          if (response && response.success) {
            $(`#${EDIT_MODAL_ID}`).modal("hide");
            loadProveedores(); 
            NotificationService.toastSuccess("Proveedor actualizado correctamente.");
          } else {
            throw response;
          }
        } catch (error) {
          console.error("[PROVEEDORES] Error al actualizar:", error);
          const errorMsg = NotificationService.getApiErrorMessage(
            error,
            "Ocurrió un error al actualizar el proveedor."
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
   * Manejo de Desactivación / Activación de Proveedores
   */
  function setupToggleStatusListener() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-toggle-status")
      .on("click", ".btn-toggle-status", async function () {
        const button = $(this);
        const proveedorId = button.data("supplierId");
        const proveedorName = button.data("supplierName") || "este proveedor";
        const statusAttr = button.data("status");
        const isCurrentActive = statusAttr === true || statusAttr === "true";
        const newStatus = !isCurrentActive;
        const actionWord = isCurrentActive ? "desactivar" : "activar";

        if (!proveedorId) return;

        NotificationService.warning(
          `¿Deseas ${actionWord} al proveedor "${proveedorName}"?`,
          `Confirmación de ${actionWord}`
        ).then(async (result) => {
          if (!result.isConfirmed) return;

          try {
            const response = await ProveedorService.cambiarEstadoProveedor(proveedorId, newStatus);

            if (response && response.success) {
              NotificationService.toastSuccess(
                `Proveedor "${proveedorName}" ${newStatus ? "activado" : "desactivado"} con éxito.`
              );
              loadProveedores();
            } else {
              throw response;
            }
          } catch (error) {
            console.error("[PROVEEDORES] Error al cambiar estado:", error);
            const errorMsg = NotificationService.getApiErrorMessage(
              error,
              "Ocurrió un problema al cambiar el estado del proveedor."
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
    1: "first_name",
    2: "document_number",
    3: "email",
    4: "address",
    5: "mobile",
    6: "is_active",
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
          exportOptions: { columns: [1, 2, 3, 4, 5, 6] },
        },
        {
          extend: "csv",
          className: "btn btn-success btn-sm",
          text: '<i class="fas fa-file-csv mr-1"></i>CSV',
          exportOptions: { columns: [1, 2, 3, 4, 5, 6] },
        },
        {
          extend: "excel",
          className: "btn btn-success btn-sm",
          text: '<i class="fas fa-file-excel mr-1"></i>Excel',
          exportOptions: { columns: [1, 2, 3, 4, 5, 6] },
        },
        {
          extend: "pdf",
          className: "btn btn-danger btn-sm",
          text: '<i class="fas fa-file-pdf mr-1"></i>PDF',
          exportOptions: { columns: [1, 2, 3, 4, 5, 6] },
        },
        {
          extend: "print",
          className: "btn btn-info btn-sm",
          text: '<i class="fas fa-print mr-1"></i>Imprimir',
          exportOptions: { columns: [1, 2, 3, 4, 5, 6] },
        },
      ],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
      },
      columnDefs: [
        { orderable: false, targets: [0, 7] },
        { className: "text-center", targets: [0, 6, 7] },
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

          const response = await ProveedorService.listarProveedoresPaginados({
            page,
            page_size: pageSize,
            search,
            ordering,
          });

          if (response?.success && response.data) {
            const resultsContainer = response.data;
            const proveedores = Array.isArray(resultsContainer.results) 
              ? resultsContainer.results 
              : (Array.isArray(resultsContainer) ? resultsContainer : (resultsContainer.data || []));
            
            const totalRecords = resultsContainer.count || proveedores.length || 0;

            const rows = proveedores.map((proveedor, index) => {
              const statusBadge = proveedor.is_active
                ? '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem">Activo</span>'
                : '<span class="badge badge-danger px-3 py-2" style="border-radius:20px;font-size:0.75rem">Inactivo</span>';

              const actions = buildActionsHtml(proveedor);
              const fullName = `${proveedor.first_name || ""} ${proveedor.last_name || ""}`.trim() || "Sin nombre";

              return [
                data.start + index + 1,
                fullName,
                `${proveedor.document_type || "CC"} - ${proveedor.document_number || "S/N"}`,
                proveedor.email || "Sin correo",
                proveedor.address || "Sin dirección",
                proveedor.mobile || proveedor.phone || "Sin teléfono",
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
          console.error("[PROVEEDORES] Error server-side:", error);
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

  function buildActionsHtml(proveedor) {
    const proveedorId = proveedor.id_supplier ?? "";
    const proveedorName = `${proveedor.first_name || ""} ${proveedor.last_name || ""}`.trim() || "proveedor";
    const isActive = Boolean(proveedor.is_active);

    const toggleClass = isActive ? "btn-outline-danger" : "btn-outline-success";
    const toggleIcon = isActive ? "fa-toggle-off" : "fa-toggle-on";
    const toggleTitle = isActive ? "Desactivar proveedor" : "Activar proveedor";

    return `
      <div class="btn-group">
        <button type="button" class="btn btn-outline-info btn-sm btn-view-supplier"
                title="Ver detalles" data-supplier-id="${proveedorId}" data-permission="suppliers.view">
          <i class="fas fa-eye"></i>
        </button>
        <button type="button" class="btn btn-outline-warning btn-sm btn-edit-supplier"
                title="Editar proveedor" data-supplier-id="${proveedorId}" data-permission="suppliers.update">
          <i class="fas fa-edit"></i>
        </button>
        <button type="button" class="btn ${toggleClass} btn-sm btn-toggle-status"
                title="${toggleTitle}" data-supplier-id="${proveedorId}" data-suppliers-name="${proveedorName}" data-status="${isActive}" data-permission="suppliers.delete">
          <i class="fas ${toggleIcon}"></i>
        </button>
      </div>
    `;
  }

  function loadProveedores() {
    if (dataTableInstance) {
      dataTableInstance.ajax.reload(null, false);
    }
  }

  async function init() {
    const tbody = document.getElementById(TABLE_BODY_ID);
    if (!tbody) return;

    initDataTable();
    setupViewDetailsListener();
    setupEditSupplierListener();
    setupToggleStatusListener();
  }

  return Object.freeze({
    init,
  });
})();

export default ProveedorListController;