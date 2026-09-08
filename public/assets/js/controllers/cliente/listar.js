/**
 * ============================================================
 * Inventario PME
 * Customer List Controller (Clientes)
 * ============================================================
 */

import ClientService from "../../services/cliente_service.js";
import SecurityManager from "../../core/security.js";
import NotificationService from "../../core/notification.js";

const ClienteListController = (() => {
  const TABLE_BODY_ID = "tablaClientesBody";
  const TABLE_ID = "tbl_clientes";
  const DETAIL_MODAL_ID = "modalDetalleCliente";
  const EDIT_MODAL_ID = "modalEditarCliente";
  const EDIT_FORM_ID = "formEditarCliente";

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
      .off("click", ".btn-view-customer")
      .on("click", ".btn-view-customer", async function () {
        const clienteId = $(this).data("customerId");

        if (!clienteId) return;

        $("#customer_modal_loader").show();
        $("#customer_modal_content").hide();
        $(`#${DETAIL_MODAL_ID}`).modal("show");

        try {
          const response = await ClientService.obtenerClientePorId(clienteId);

          if (response && response.success && response.data) {
            const cliente = response.data;

            $("#detail_document_type").text(cliente.document_type || "N/A");
            $("#detail_document_number").text(cliente.document_number || "Sin número");
            $("#detail_first_name").text(cliente.first_name || "Sin nombre");
            $("#detail_last_name").text(cliente.last_name || "Sin apellido");
            $("#detail_business_name").text(cliente.business_name || "N/A");
            $("#detail_email").text(cliente.email || "Sin correo");
            $("#detail_phone").text(cliente.phone || "Sin teléfono");
            $("#detail_mobile").text(cliente.mobile || "Sin celular");
            $("#detail_city").text(cliente.city || "Sin ciudad");

            const badgeHtml = cliente.is_active
              ? '<span class="badge badge-success px-3 py-1 shadow-sm">Activo</span>'
              : '<span class="badge badge-danger px-3 py-1 shadow-sm">Inactivo</span>';
            $("#detail_status_badge").html(badgeHtml);

            $("#customer_modal_loader").hide();
            $("#customer_modal_content").fadeIn();
          } else {
            throw new Error("Respuesta inválida al consultar el cliente.");
          }
        } catch (error) {
          console.error("[CLIENTES] Error al obtener detalles:", error);
          $(`#${DETAIL_MODAL_ID}`).modal("hide");
          NotificationService.toastError("No se pudo cargar la información del cliente.");
        }
      });
  }

  // ───────────────────────────────────────────
  // Manejo del Modal de Edición (PATCH)
  // ───────────────────────────────────────────

  function setupEditCustomerListener() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-edit-customer")
      .on("click", ".btn-edit-customer", async function () {
        const clienteId = $(this).data("customerId");
        if (!clienteId) return;

        const form = document.getElementById(EDIT_FORM_ID);
        if (form) {
          form.classList.remove("was-validated");
          form.reset();
        }

        $("#edit_customer_modal_loader").show();
        $("#edit_customer_modal_content").hide();
        $(`#${EDIT_MODAL_ID}`).modal("show");

        try {
          const response = await ClientService.obtenerClientePorId(clienteId);

          if (response && response.success && response.data) {
            const cliente = response.data;

            $("#edit_customer_id").val(cliente.id_customer);
            $("#edit_document_type").val(cliente.document_type || "CC");
            $("#edit_document_number").val(cliente.document_number || "");
            $("#edit_first_name").val(cliente.first_name || "");
            $("#edit_last_name").val(cliente.last_name || "");
            $("#edit_business_name").val(cliente.business_name || "");
            $("#edit_email").val(cliente.email || "");
            $("#edit_phone").val(cliente.phone || "");
            $("#edit_mobile").val(cliente.mobile || "");
            $("#edit_city").val(cliente.city || "");
            $("#edit_is_active").prop("checked", Boolean(cliente.is_active));

            $("#edit_customer_modal_loader").hide();
            $("#edit_customer_modal_content").fadeIn();
          } else {
            throw new Error("No se pudo obtener la información del cliente.");
          }
        } catch (error) {
          console.error("[CLIENTES] Error al preparar edición:", error);
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

        const clienteId = $("#edit_customer_id").val();
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
          city: $("#edit_city").val().trim(),
          is_active: $("#edit_is_active").is(":checked"),
        };

        try {
          submitBtn
            .prop("disabled", true)
            .html('<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...');

          const response = await ClientService.actualizarCliente(clienteId, payload);

          if (response && response.success) {
            $(`#${EDIT_MODAL_ID}`).modal("hide");
            loadClientes(); 
            NotificationService.toastSuccess("Cliente actualizado correctamente.");
          } else {
            throw response;
          }
        } catch (error) {
          console.error("[CLIENTES] Error al actualizar:", error);
          const errorMsg = NotificationService.getApiErrorMessage(
            error,
            "Ocurrió un error al actualizar el cliente."
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
   * Manejo de Desactivación / Activación de Clientes
   */
  function setupToggleStatusListener() {
    $(`#${TABLE_ID}`)
      .off("click", ".btn-toggle-status")
      .on("click", ".btn-toggle-status", async function () {
        const button = $(this);
        const clienteId = button.data("customerId");
        const clienteName = button.data("customerName") || "este cliente";
        const statusAttr = button.data("status");
        const isCurrentActive = statusAttr === true || statusAttr === "true";
        const newStatus = !isCurrentActive;
        const actionWord = isCurrentActive ? "desactivar" : "activar";

        if (!clienteId) return;

        NotificationService.warning(
          `¿Deseas ${actionWord} al cliente "${clienteName}"?`,
          `Confirmación de ${actionWord}`
        ).then(async (result) => {
          if (!result.isConfirmed) return;

          try {
            const response = await ClientService.cambiarEstadoCliente(clienteId, newStatus);

            if (response && response.success) {
              NotificationService.toastSuccess(
                `Cliente "${clienteName}" ${newStatus ? "activado" : "desactivado"} con éxito.`
              );
              loadClientes();
            } else {
              throw response;
            }
          } catch (error) {
            console.error("[CLIENTES] Error al cambiar estado:", error);
            const errorMsg = NotificationService.getApiErrorMessage(
              error,
              "Ocurrió un problema al cambiar el estado del cliente."
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
    1: "document_number",
    2: "first_name",
    3: "email",
    4: "mobile",
    5: "city",
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

          const response = await ClientService.listarClientesPaginados({
            page,
            page_size: pageSize,
            search,
            ordering,
          });

          if (response?.success && response.data) {
            const resultsContainer = response.data;
            const clientes = Array.isArray(resultsContainer.results) 
              ? resultsContainer.results 
              : (Array.isArray(resultsContainer) ? resultsContainer : (resultsContainer.data || []));
            
            const totalRecords = resultsContainer.count || clientes.length || 0;

            const rows = clientes.map((cliente, index) => {
              const statusBadge = cliente.is_active
                ? '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem">Activo</span>'
                : '<span class="badge badge-danger px-3 py-2" style="border-radius:20px;font-size:0.75rem">Inactivo</span>';

              const actions = buildActionsHtml(cliente);
              const fullName = `${cliente.first_name || ""} ${cliente.last_name || ""}`.trim() || "Sin nombre";

              return [
                data.start + index + 1,
                `${cliente.document_type || "CC"} - ${cliente.document_number || "S/N"}`,
                fullName,
                cliente.email || "Sin correo",
                cliente.mobile || cliente.phone || "Sin teléfono",
                cliente.city || "Sin ciudad",
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
          console.error("[CLIENTES] Error server-side:", error);
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

  function buildActionsHtml(cliente) {
    const clienteId = cliente.id_customer ?? "";
    const clienteName = `${cliente.first_name || ""} ${cliente.last_name || ""}`.trim() || "cliente";
    const isActive = Boolean(cliente.is_active);

    const toggleClass = isActive ? "btn-outline-danger" : "btn-outline-success";
    const toggleIcon = isActive ? "fa-toggle-off" : "fa-toggle-on";
    const toggleTitle = isActive ? "Desactivar cliente" : "Activar cliente";

    return `
      <div class="btn-group">
        <button type="button" class="btn btn-outline-info btn-sm btn-view-customer"
                title="Ver detalles" data-customer-id="${clienteId}" data-permission="customers.view">
          <i class="fas fa-eye"></i>
        </button>
        <button type="button" class="btn btn-outline-warning btn-sm btn-edit-customer"
                title="Editar cliente" data-customer-id="${clienteId}" data-permission="customers.update">
          <i class="fas fa-edit"></i>
        </button>
        <button type="button" class="btn ${toggleClass} btn-sm btn-toggle-status"
                title="${toggleTitle}" data-customer-id="${clienteId}" data-customer-name="${clienteName}" data-status="${isActive}" data-permission="customers.delete">
          <i class="fas ${toggleIcon}"></i>
        </button>
      </div>
    `;
  }

  function loadClientes() {
    if (dataTableInstance) {
      dataTableInstance.ajax.reload(null, false);
    }
  }

  async function init() {
    const tbody = document.getElementById(TABLE_BODY_ID);
    if (!tbody) return;

    initDataTable();
    setupViewDetailsListener();
    setupEditCustomerListener();
    setupToggleStatusListener();
  }

  return Object.freeze({
    init,
  });
})();

export default ClienteListController;