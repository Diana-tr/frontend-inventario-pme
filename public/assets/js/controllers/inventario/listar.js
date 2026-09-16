/**
 * ============================================================
 * Inventario P.M.E
 * Inventory List Controller (Inventario)
 * ============================================================
 */

import InventarioService from "../../services/inventario_service.js";
import ProveedorService from "../../services/proveedor_service.js";
import SecurityManager from "../../core/security.js";
import NotificationService from "../../core/notification.js";

const InventarioListController = (() => {
    const TABLE_BODY_ID = "tablaInventarioBody";
    const TABLE_ID = "tbl_inventario";

    // Modals
    const DETAIL_MODAL_ID = "modalDetalleInventario";
    const THRESHOLD_MODAL_ID = "modalEditarUmbrales";
    const ENTRY_MODAL_ID = "modalEntradaInventario";
    const EXIT_MODAL_ID = "modalSalidaInventario";
    const ADJUSTMENT_MODAL_ID = "modalAjusteInventario";
    const HISTORY_MODAL_ID = "modalHistorialMovimientos";

    // Forms
    const THRESHOLD_FORM_ID = "formEditarUmbrales";
    const ENTRY_FORM_ID = "formEntradaInventario";
    const EXIT_FORM_ID = "formSalidaInventario";
    const ADJUSTMENT_FORM_ID = "formAjusteInventario";

    /**
     * Mapeo entre columnas DataTables y campos del backend.
     */
    const COLUMN_ORDERING_MAP = {
        1: "product__code",
        2: "product__name",
        3: "product__category__name",
        4: "current_stock",
        5: "is_active",
    };

    let dataTableInstance = null;
    let movementsDataTableInstance = null;

    /**
     * Obtiene el cuerpo de la tabla.
     *
     * @returns {HTMLElement}
     */
    function getTableBody() {
        const tbody = document.getElementById(TABLE_BODY_ID);

        if (!tbody) {
            throw new Error(`No se encontró #${TABLE_BODY_ID}.`);
        }

        return tbody;
    }

    /**
     * Formatea una fecha ISO en formato legible con hora.
     */
    function formatDateTime(dateString) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("es-ES", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    /**
     * Traduce los tipos de movimiento
     */
    function translateMovementType(type) {
        const types = {
            "ENTRY": "Entrada",
            "EXIT": "Salida",
            "ADJUSTMENT": "Ajuste",
        };
        return types[type] || type;
    }

    // ─────────────────────────────────────────────────────
    // DataTables principal
    // ─────────────────────────────────────────────────────

    /**
     * Inicializa DataTables con paginación server-side.
     */
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
                "<'row mb-2'"
                + "<'col-sm-12 col-md-6 "
                + "d-flex align-items-center'lB>"
                + "<'col-sm-12 col-md-6 "
                + "d-flex justify-content-end'f>"
                + ">"
                + "<'row'<'col-sm-12'tr>>"
                + "<'row mt-2'"
                + "<'col-sm-12 col-md-5'i>"
                + "<'col-sm-12 col-md-7 "
                + "d-flex justify-content-end'p>"
                + ">",

            buttons: [
                {
                    extend: "copy",
                    className: "btn btn-secondary btn-sm",
                    text:
                        '<i class="fas fa-copy mr-1"></i>'
                        + "Copiar",
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4],
                    },
                },
                {
                    extend: "csv",
                    className: "btn btn-success btn-sm",
                    text:
                        '<i class="fas fa-file-csv mr-1"></i>'
                        + "CSV",
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4],
                    },
                },
                {
                    extend: "excel",
                    className: "btn btn-success btn-sm",
                    text:
                        '<i class="fas fa-file-excel mr-1"></i>'
                        + "Excel",
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4],
                    },
                },
                {
                    extend: "pdf",
                    className: "btn btn-danger btn-sm",
                    text:
                        '<i class="fas fa-file-pdf mr-1"></i>'
                        + "PDF",
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4],
                    },
                },
                {
                    extend: "print",
                    className: "btn btn-info btn-sm",
                    text:
                        '<i class="fas fa-print mr-1"></i>'
                        + "Imprimir",
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4],
                    },
                },
            ],

            language: {
                url:
                    "https://cdn.datatables.net/plug-ins/"
                    + "1.13.6/i18n/es-ES.json",
            },

            columnDefs: [
                {
                    orderable: false,
                    targets: [5],
                },
                {
                    className: "text-center",
                    targets: [4, 5],
                },
            ],

            ajax: async function (data, callback) {
                try {
                    const page =
                        Math.floor(
                            data.start / data.length,
                        ) + 1;

                    const pageSize = data.length;

                    const search =
                        data.search?.value || "";

                    let ordering = "";

                    if (
                        data.order
                        && data.order.length > 0
                    ) {
                        const orderColumn =
                            data.order[0].column;

                        const orderDirection =
                            data.order[0].dir;

                        const field =
                            COLUMN_ORDERING_MAP[
                                orderColumn
                            ];

                        if (field) {
                            ordering =
                                orderDirection === "desc"
                                    ? `-${field}`
                                    : field;
                        }
                    }

                    const response =
                        await InventarioService
                            .listarInventarioPaginado({
                                page,
                                page_size: pageSize,
                                search,
                                ordering,
                            });

                    if (
                        response?.success
                        && response.data
                    ) {
                        const inventarios = response.data.results || [];
                        const totalRecords = response.data.count || 0;

                        const rows = inventarios.map(
                            (inv, index) => {
                                const stockValue =
                                    inv.current_stock ?? 0;

                                let stockColorClass =
                                    "text-success";

                                if (inv.is_low_stock) {
                                    stockColorClass =
                                        "text-danger";
                                } else if (inv.is_overstocked) {
                                    stockColorClass =
                                        "text-warning";
                                }

                                const stockHtml =
                                    `<span class="${stockColorClass} font-weight-bold">${stockValue}</span>`;

                                const statusBadge =
                                    inv.is_active
                                        ? '<span class="badge '
                                        + 'badge-success px-3 py-2" '
                                        + 'style="border-radius:20px;'
                                        + 'font-size:0.75rem">'
                                        + "Activo</span>"
                                        : '<span class="badge '
                                        + 'badge-danger px-3 py-2" '
                                        + 'style="border-radius:20px;'
                                        + 'font-size:0.75rem">'
                                        + "Inactivo</span>";

                                const actions =
                                    buildActionsHtml(inv);

                                return [
                                    inv.product_code || "S/C",
                                    inv.product_name
                                        || "Sin nombre",
                                    inv.category_name
                                        || "Sin categoría",
                                    stockHtml,
                                    statusBadge,
                                    actions,
                                ];
                            },
                        );

                        callback({
                            draw: data.draw,
                            recordsTotal: totalRecords,
                            recordsFiltered: totalRecords,
                            data: rows,
                        });

                        SecurityManager
                            .processDomPermissions();
                    } else {
                        callback({
                            draw: data.draw,
                            recordsTotal: 0,
                            recordsFiltered: 0,
                            data: [],
                        });
                    }
                } catch (error) {
                    console.error(
                        "[INVENTARIO] Error server-side:",
                        error,
                    );

                    callback({
                        draw: data.draw,
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: [],
                    });

                    NotificationService.toastError(
                        "No se pudieron cargar los datos del inventario.",
                    );
                }
            },

            drawCallback: function () {
                $(".dataTables_paginate > .pagination")
                    .addClass("pagination-sm");
            },

            initComplete: function () {
                $(".dt-buttons").addClass("ml-4");
            },
        });
    }

    /**
     * Construye los botones de acciones del inventario.
     */
    function buildActionsHtml(inv) {
        const inventoryId =
            inv.id_inventory ?? "";

        const isActive =
            Boolean(inv.is_active);

        // Botones que sólo aparecen cuando está activo
        const activeOnlyBtns = isActive ? `
                <button
                    type="button"
                    class="btn btn-outline-success btn-sm
                    btn-entry-inventory"
                    title="Registrar Entrada"
                    data-inventory-id="${inventoryId}"
                    data-permission="inventory.movement"
                >
                    <i class="fas fa-plus"></i>
                </button>

                <button
                    type="button"
                    class="btn btn-outline-warning btn-sm
                    btn-exit-inventory"
                    title="Registrar Salida"
                    data-inventory-id="${inventoryId}"
                    data-permission="inventory.movement"
                >
                    <i class="fas fa-minus"></i>
                </button>

                <button
                    type="button"
                    class="btn btn-outline-primary btn-sm
                    btn-adjust-inventory"
                    title="Ajuste Manual"
                    data-inventory-id="${inventoryId}"
                    data-permission="inventory.movement"
                >
                    <i class="fas fa-sliders-h"></i>
                </button>

                <button
                    type="button"
                    class="btn btn-outline-dark btn-sm
                    btn-threshold-inventory"
                    title="Editar Umbrales"
                    data-inventory-id="${inventoryId}"
                    data-permission="inventory.update"
                >
                    <i class="fas fa-cog"></i>
                </button>
        ` : '';

        return `
            <div class="btn-group">
                <button
                    type="button"
                    class="btn btn-outline-info btn-sm
                    btn-view-inventory"
                    title="Ver detalles"
                    data-inventory-id="${inventoryId}"
                    data-permission="inventory.view"
                >
                    <i class="fas fa-eye"></i>
                </button>

                <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm
                    btn-history-inventory"
                    title="Historial de movimientos"
                    data-inventory-id="${inventoryId}"
                    data-permission="inventory.view"
                >
                    <i class="fas fa-history"></i>
                </button>

                ${activeOnlyBtns}

            </div>
        `;
    }

    // ─────────────────────────────────────────────────────
    // Modales
    // ─────────────────────────────────────────────────────

    /**
     * Configura el listener para visualizar los detalles.
     */
    function setupViewDetailsListener() {
        $(`#${TABLE_ID}`)
            .off("click", ".btn-view-inventory")
            .on("click", ".btn-view-inventory", async function () {
                const inventoryId = $(this).data("inventoryId");

                if (!inventoryId) {
                    return;
                }

                $("#detail_modal_loader").html(`
                    <div class="spinner-border text-info mb-2" role="status"><span class="sr-only">Cargando...</span></div>
                    <p class="text-muted">Cargando información...</p>
                `).removeClass("d-none").addClass("d-flex");
                $("#detail_modal_content").hide();

                $(`#${DETAIL_MODAL_ID}`).modal("show");

                try {
                    const response =
                        await InventarioService.obtenerInventarioPorId(
                            inventoryId,
                        );

                    if (
                        response
                        && response.success
                        && response.data
                    ) {
                        const inv = response.data;

                        $("#detail_product_code").text(
                            inv.product_code || "N/A",
                        );
                        $("#detail_product_name").text(
                            inv.product_name || "N/A",
                        );
                        $("#detail_product_barcode").text(
                            inv.product_barcode || "N/A",
                        );
                        $("#detail_category_name").text(
                            inv.category_name || "N/A",
                        );
                        $("#detail_product_unit").text(
                            inv.product_unit || "N/A",
                        );

                        $("#detail_current_stock").text(
                            inv.current_stock ?? "0",
                        );
                        $("#detail_minimum_stock").text(
                            inv.minimum_stock ?? "0",
                        );
                        $("#detail_maximum_stock").text(
                            inv.maximum_stock ?? "N/A",
                        );

                        const lowStockHtml = inv.is_low_stock
                            ? '<span class="badge badge-danger">Inventario bajo</span>'
                            : (inv.is_overstocked
                                ? '<span class="badge badge-warning text-dark">Inventario alto</span>'
                                : '<span class="badge badge-success">Normal</span>');
                        $("#detail_stock_status").html(lowStockHtml);

                        $("#detail_created_at").text(
                            formatDateTime(inv.created_at),
                        );
                        $("#detail_updated_at").text(
                            formatDateTime(inv.updated_at),
                        );

                        const badgeHtml = inv.is_active
                            ? '<span class="badge badge-success px-3 py-1 shadow-sm">Activo</span>'
                            : '<span class="badge badge-danger px-3 py-1 shadow-sm">Inactivo</span>';

                        $("#detail_status_badge").html(
                            badgeHtml,
                        );

                        $("#detail_modal_loader").removeClass("d-flex").addClass("d-none");
                        $("#detail_modal_content").fadeIn();
                    } else {
                        throw new Error(
                            "Respuesta inválida al consultar el inventario.",
                        );
                    }
                } catch (error) {
                    console.error(
                        "[INVENTARIO] Error al obtener detalles:",
                        error,
                    );

                    $("#detail_modal_loader").html(`
                        <div class="alert alert-danger text-center w-75">
                            <i class="fas fa-exclamation-triangle fa-2x mb-2 d-block"></i>
                            <strong>Error:</strong> No se pudo cargar la información del inventario.
                        </div>
                    `);
                }
            });
    }

    /**
     * Limpia los errores de validación de un formulario específico
     */
    function clearValidationErrors(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        $(form).find(".is-invalid").removeClass("is-invalid");
        $(form).find(".invalid-feedback").remove();
    }

    /**
     * Muestra errores de validación en un formulario
     */
    function showValidationErrors(errors, fieldMapping) {
        if (!errors || typeof errors !== "object") return;

        Object.entries(errors).forEach(([field, messages]) => {
            const inputId = fieldMapping[field];
            if (!inputId) return;

            const input = $(`#${inputId}`);
            if (!input.length) return;

            input.addClass("is-invalid");

            const errorText = Array.isArray(messages)
                ? messages.join(" ")
                : String(messages);

            const feedback = $(
                '<div class="invalid-feedback">'
                + errorText
                + "</div>",
            );

            input.siblings(".invalid-feedback").remove();
            input.after(feedback);
        });
    }

    /**
     * Configura el listener para editar umbrales
     */
    function setupThresholdsListener() {
        $(`#${TABLE_ID}`)
            .off("click", ".btn-threshold-inventory")
            .on("click", ".btn-threshold-inventory", async function () {
                const inventoryId = $(this).data("inventoryId");
                if (!inventoryId) return;

                $("#threshold_modal_loader").html(`
                    <div class="spinner-border text-dark mb-2" role="status"><span class="sr-only">Cargando...</span></div>
                `).removeClass("d-none").addClass("d-flex");
                $("#threshold_modal_content").hide();
                $(`#${THRESHOLD_MODAL_ID}`).modal("show");

                try {
                    const response =
                        await InventarioService.obtenerInventarioPorId(
                            inventoryId,
                        );

                    if (
                        response
                        && response.success
                        && response.data
                    ) {
                        const inv = response.data;

                        $("#threshold_inventory_id").val(
                            inv.id_inventory,
                        );
                        $("#threshold_product_name").text(
                            `${inv.product_code || "S/C"} - ${inv.product_name || "Sin nombre"}`,
                        );
                        $("#threshold_minimum_stock").val(
                            inv.minimum_stock ?? 0,
                        );
                        $("#threshold_maximum_stock").val(
                            inv.maximum_stock ?? "",
                        );

                        $("#threshold_modal_loader").removeClass("d-flex").addClass("d-none");
                        $("#threshold_modal_content").fadeIn();
                    } else {
                        throw new Error("Error en la respuesta");
                    }
                } catch (error) {
                    console.error("[INVENTARIO] Error en umbrales:", error);
                    $("#threshold_modal_loader").html(`
                        <div class="alert alert-danger text-center w-75">
                            <strong>Error:</strong> No se pudieron cargar los datos del inventario.
                        </div>
                    `);
                }
            });

        $(`#${THRESHOLD_FORM_ID}`)
            .off("submit")
            .on("submit", async function (event) {
                event.preventDefault();

                const form = this;
                if (!form.checkValidity()) {
                    event.stopPropagation();
                    form.classList.add("was-validated");
                    return;
                }

                clearValidationErrors(THRESHOLD_FORM_ID);

                const inventoryId = $("#threshold_inventory_id").val();
                const btn = $("#btn_guardar_umbrales");

                const maxStock = $("#threshold_maximum_stock").val().trim();

                const payload = {
                    minimum_stock: Number(
                        $("#threshold_minimum_stock").val(),
                    ),
                    maximum_stock: maxStock !== ""
                        ? Number(maxStock)
                        : null,
                };

                try {
                    btn.prop("disabled", true).html(
                        '<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...',
                    );

                    const response =
                        await InventarioService.actualizarUmbrales(
                            inventoryId,
                            payload,
                        );

                    if (response && response.success) {
                        $(`#${THRESHOLD_MODAL_ID}`).modal("hide");
                        loadInventario();
                        NotificationService.toastSuccess(
                            "Umbrales actualizados correctamente.",
                        );
                    } else {
                        if (response && response.errors) {
                            showValidationErrors(response.errors, {
                                minimum_stock: "threshold_minimum_stock",
                                maximum_stock: "threshold_maximum_stock",
                            });
                        }
                        NotificationService.error(
                            NotificationService.getApiErrorMessage(
                                response,
                                "Error al actualizar umbrales.",
                            ),
                        );
                    }
                } catch (error) {
                    NotificationService.error(
                        "Ocurrió un error inesperado al actualizar los umbrales.",
                    );
                } finally {
                    btn.prop("disabled", false).html(
                        '<i class="fas fa-save mr-1"></i>Guardar Cambios',
                    );
                }
            });
    }

    /**
     * Configura el listener para registrar ENTRADA
     */
    function setupEntryListener() {
        $(`#${TABLE_ID}`)
            .off("click", ".btn-entry-inventory")
            .on("click", ".btn-entry-inventory", async function () {
                const inventoryId = $(this).data("inventoryId");
                if (!inventoryId) return;

                $("#entry_inventory_id").val(inventoryId);

                try {
                    const response =
                        await InventarioService.obtenerInventarioPorId(
                            inventoryId,
                        );
                    if (response && response.success) {
                        $("#entry_product_name").text(
                            `${response.data.product_code} - ${response.data.product_name}`,
                        );
                    }
                } catch (e) {
                    // Silenciar error de precarga
                }

                $(`#${ENTRY_MODAL_ID}`).modal("show");
            });

        $(`#${ENTRY_FORM_ID}`)
            .off("submit")
            .on("submit", async function (event) {
                event.preventDefault();
                const form = this;
                if (!form.checkValidity()) {
                    event.stopPropagation();
                    form.classList.add("was-validated");
                    return;
                }

                clearValidationErrors(ENTRY_FORM_ID);
                const inventoryId = $("#entry_inventory_id").val();
                const btn = $("#btn_guardar_entrada");
                const payload = {
                    quantity: Number(
                        $("#entry_quantity").val(),
                    ),
                    reference: $("#entry_reference").val().trim(),
                    notes: $("#entry_notes").val().trim(),
                };

                const supplierId = $("#entry_supplier_id").val();
                if (supplierId) {
                    payload.supplier_id = Number(supplierId);
                }

                try {
                    btn.prop("disabled", true).html(
                        '<i class="fas fa-spinner fa-spin mr-1"></i>Registrando...',
                    );

                    const response =
                        await InventarioService.registrarEntrada(
                            inventoryId,
                            payload,
                        );

                    if (response && response.success) {
                        $(`#${ENTRY_MODAL_ID}`).modal("hide");
                        loadInventario();
                        NotificationService.toastSuccess(
                            "Entrada registrada correctamente.",
                        );
                    } else {
                        if (response && response.errors) {
                            showValidationErrors(response.errors, {
                                quantity: "entry_quantity",
                                reference: "entry_reference",
                                notes: "entry_notes",
                            });
                        }
                        NotificationService.error(
                            NotificationService.getApiErrorMessage(
                                response,
                                "Error al registrar la entrada.",
                            ),
                        );
                    }
                } catch (error) {
                    NotificationService.error(
                        "Ocurrió un error inesperado al registrar la entrada.",
                    );
                } finally {
                    btn.prop("disabled", false).html(
                        '<i class="fas fa-save mr-1"></i>Registrar Entrada',
                    );
                }
            });
    }

    /**
     * Configura el listener para registrar SALIDA
     */
    function setupExitListener() {
        $(`#${TABLE_ID}`)
            .off("click", ".btn-exit-inventory")
            .on("click", ".btn-exit-inventory", async function () {
                const inventoryId = $(this).data("inventoryId");
                if (!inventoryId) return;

                $("#exit_inventory_id").val(inventoryId);

                try {
                    const response =
                        await InventarioService.obtenerInventarioPorId(
                            inventoryId,
                        );
                    if (response && response.success) {
                        $("#exit_product_name").text(
                            `${response.data.product_code} - ${response.data.product_name}`,
                        );
                        $("#exit_current_stock").text(
                            response.data.current_stock,
                        );
                    }
                } catch (e) {
                    // Silenciar error de precarga
                }

                $(`#${EXIT_MODAL_ID}`).modal("show");
            });

        $(`#${EXIT_FORM_ID}`)
            .off("submit")
            .on("submit", async function (event) {
                event.preventDefault();
                const form = this;
                if (!form.checkValidity()) {
                    event.stopPropagation();
                    form.classList.add("was-validated");
                    return;
                }

                clearValidationErrors(EXIT_FORM_ID);
                const inventoryId = $("#exit_inventory_id").val();
                const btn = $("#btn_guardar_salida");
                const payload = {
                    quantity: Number(
                        $("#exit_quantity").val(),
                    ),
                    reference: $("#exit_reference").val().trim(),
                    notes: $("#exit_notes").val().trim(),
                };

                try {
                    btn.prop("disabled", true).html(
                        '<i class="fas fa-spinner fa-spin mr-1"></i>Registrando...',
                    );

                    const response =
                        await InventarioService.registrarSalida(
                            inventoryId,
                            payload,
                        );

                    if (response && response.success) {
                        $(`#${EXIT_MODAL_ID}`).modal("hide");
                        loadInventario();
                        NotificationService.toastSuccess(
                            "Salida registrada correctamente.",
                        );
                    } else {
                        if (response && response.errors) {
                            showValidationErrors(response.errors, {
                                quantity: "exit_quantity",
                                reference: "exit_reference",
                                notes: "exit_notes",
                            });
                        }
                        NotificationService.error(
                            NotificationService.getApiErrorMessage(
                                response,
                                "Error al registrar la salida.",
                            ),
                        );
                    }
                } catch (error) {
                    NotificationService.error(
                        "Ocurrió un error inesperado al registrar la salida.",
                    );
                } finally {
                    btn.prop("disabled", false).html(
                        '<i class="fas fa-save mr-1"></i>Registrar Salida',
                    );
                }
            });
    }

    /**
     * Configura el listener para registrar AJUSTE
     */
    function setupAdjustmentListener() {
        $(`#${TABLE_ID}`)
            .off("click", ".btn-adjust-inventory")
            .on("click", ".btn-adjust-inventory", async function () {
                const inventoryId = $(this).data("inventoryId");
                if (!inventoryId) return;

                $("#adjust_inventory_id").val(inventoryId);

                try {
                    const response =
                        await InventarioService.obtenerInventarioPorId(
                            inventoryId,
                        );
                    if (response && response.success) {
                        $("#adjust_product_name").text(
                            `${response.data.product_code} - ${response.data.product_name}`,
                        );
                        $("#adjust_current_stock").text(
                            response.data.current_stock,
                        );
                        $("#adjust_new_stock").val(
                            response.data.current_stock,
                        );
                    }
                } catch (e) {
                    // Silenciar error de precarga
                }

                $(`#${ADJUSTMENT_MODAL_ID}`).modal("show");
            });

        $(`#${ADJUSTMENT_FORM_ID}`)
            .off("submit")
            .on("submit", async function (event) {
                event.preventDefault();
                const form = this;
                if (!form.checkValidity()) {
                    event.stopPropagation();
                    form.classList.add("was-validated");
                    return;
                }

                clearValidationErrors(ADJUSTMENT_FORM_ID);
                const inventoryId = $("#adjust_inventory_id").val();
                const btn = $("#btn_guardar_ajuste");
                const payload = {
                    new_stock: Number(
                        $("#adjust_new_stock").val(),
                    ),
                    notes: $("#adjust_notes").val().trim(),
                };

                try {
                    btn.prop("disabled", true).html(
                        '<i class="fas fa-spinner fa-spin mr-1"></i>Registrando...',
                    );

                    const response =
                        await InventarioService.registrarAjuste(
                            inventoryId,
                            payload,
                        );

                    if (response && response.success) {
                        $(`#${ADJUSTMENT_MODAL_ID}`).modal("hide");
                        loadInventario();
                        NotificationService.toastSuccess(
                            "Ajuste registrado correctamente.",
                        );
                    } else {
                        if (response && response.errors) {
                            showValidationErrors(response.errors, {
                                new_stock: "adjust_new_stock",
                                notes: "adjust_notes",
                            });
                        }
                        NotificationService.error(
                            NotificationService.getApiErrorMessage(
                                response,
                                "Error al registrar el ajuste.",
                            ),
                        );
                    }
                } catch (error) {
                    NotificationService.error(
                        "Ocurrió un error inesperado al registrar el ajuste.",
                    );
                } finally {
                    btn.prop("disabled", false).html(
                        '<i class="fas fa-save mr-1"></i>Registrar Ajuste',
                    );
                }
            });
    }

    /**
     * Configura el listener para ver historial
     */
    function setupHistoryListener() {
        $(`#${TABLE_ID}`)
            .off("click", ".btn-history-inventory")
            .on("click", ".btn-history-inventory", function () {
                const inventoryId = $(this).data("inventoryId");
                if (!inventoryId) return;

                $(`#${HISTORY_MODAL_ID}`).modal("show");

                // Inicializar o recargar tabla de movimientos
                if (movementsDataTableInstance) {
                    movementsDataTableInstance.destroy();
                    movementsDataTableInstance = null;
                    $("#tbl_movimientos").empty();
                }

                movementsDataTableInstance = $("#tbl_movimientos").DataTable({
                    responsive: true,
                    autoWidth: false,
                    processing: true,
                    serverSide: true,
                    searching: false,
                    ordering: false,

                    language: {
                        url:
                            "https://cdn.datatables.net/plug-ins/"
                            + "1.13.6/i18n/es-ES.json",
                    },

                    ajax: async function (data, callback) {
                        try {
                            const page =
                                Math.floor(data.start / data.length) + 1;

                            const response =
                                await InventarioService.listarMovimientos(
                                    inventoryId,
                                    {
                                        page: page,
                                        page_size: data.length,
                                    },
                                );

                            if (
                                response?.success
                                && response.data
                            ) {
                                const movements = response.data.results || [];
                                const totalRecords = response.data.count || 0;

                                const rows = movements.map(
                                    (mov) => {
                                        let badgeClass =
                                            "badge-secondary";

                                        if (mov.movement_type === "ENTRY") {
                                            badgeClass = "badge-success";
                                        } else if (mov.movement_type === "EXIT") {
                                            badgeClass = "badge-warning";
                                        } else if (mov.movement_type === "ADJUSTMENT") {
                                            badgeClass = "badge-primary";
                                        }

                                        const typeBadge =
                                            `<span class="badge ${badgeClass}">${translateMovementType(mov.movement_type)}</span>`;

                                        return [
                                            formatDateTime(mov.created_at),
                                            typeBadge,
                                            mov.quantity ?? "-",
                                            mov.previous_stock ?? "-",
                                            mov.new_stock ?? "-",
                                            mov.supplier_name || "-",
                                            mov.reference || "-",
                                            mov.notes || "-",
                                        ];
                                    },
                                );

                                callback({
                                    draw: data.draw,
                                    recordsTotal: totalRecords,
                                    recordsFiltered: totalRecords,
                                    data: rows,
                                });
                            } else {
                                callback({
                                    draw: data.draw,
                                    recordsTotal: 0,
                                    recordsFiltered: 0,
                                    data: [],
                                });
                            }
                        } catch (error) {
                            callback({
                                draw: data.draw,
                                recordsTotal: 0,
                                recordsFiltered: 0,
                                data: [],
                            });
                        }
                    },

                    columns: [
                        { title: "Fecha" },
                        { title: "Tipo" },
                        { title: "Cantidad", className: "text-right font-weight-bold" },
                        { title: "Exist. Anterior", className: "text-right text-muted" },
                        { title: "Exist. Nueva", className: "text-right text-primary font-weight-bold" },
                        { title: "Proveedor" },
                        { title: "Referencia" },
                        { title: "Observación" },
                    ],
                });
            });
    }

    /**
     * Configura el listener para activar/desactivar.
     */
    function setupToggleStatusListener() {
        $(`#${TABLE_ID}`)
            .off("click", ".btn-toggle-status")
            .on("click", ".btn-toggle-status", async function () {
                const inventoryId =
                    $(this).data("inventoryId");
                const currentStatus =
                    String($(this).data("status"));
                const isActive =
                    currentStatus === "true";
                const productName =
                    $(this).data("productName")
                    || "inventario";

                if (!inventoryId) {
                    return;
                }

                const actionText = isActive
                    ? "desactivar"
                    : "activar";

                const confirmResult = await Swal.fire({
                    icon: "warning",
                    title: "Confirmar acción",
                    text: `¿Estás seguro de que deseas ${actionText} el inventario de "${productName}"?`,
                    showCancelButton: true,
                    confirmButtonText: "Sí, continuar",
                    cancelButtonText: "Cancelar",
                });

                if (!confirmResult.isConfirmed) {
                    return;
                }

                try {
                    let response;

                    if (isActive) {
                        response =
                            await InventarioService
                                .desactivarInventario(
                                    inventoryId,
                                );
                    } else {
                        response =
                            await InventarioService
                                .activarInventario(
                                    inventoryId,
                                );
                    }

                    if (response && response.success) {
                        NotificationService.toastSuccess(
                            `Inventario ${
                                isActive
                                    ? "desactivado"
                                    : "activado"
                            } correctamente.`,
                        );

                        loadInventario();
                    } else {
                        throw response;
                    }
                } catch (error) {
                    console.error(
                        "[INVENTARIO] Error al cambiar estado:",
                        error,
                    );

                    NotificationService.error(
                        NotificationService.getApiErrorMessage(
                            error,
                            "Ocurrió un error al cambiar "
                            + "el estado del inventario.",
                        ),
                    );
                }
            });
    }

    /**
     * Configura la limpieza de modales al cerrarse.
     */
    function setupModalCleanup() {
        const modalsWithForms = [
            { modalId: THRESHOLD_MODAL_ID, formId: THRESHOLD_FORM_ID },
            { modalId: ENTRY_MODAL_ID, formId: ENTRY_FORM_ID },
            { modalId: EXIT_MODAL_ID, formId: EXIT_FORM_ID },
            { modalId: ADJUSTMENT_MODAL_ID, formId: ADJUSTMENT_FORM_ID },
        ];

        modalsWithForms.forEach(({ modalId, formId }) => {
            $(`#${modalId}`).on(
                "hidden.bs.modal",
                function () {
                    const form =
                        document.getElementById(formId);

                    if (form) {
                        form.classList.remove(
                            "was-validated",
                        );
                        form.reset();
                    }

                    clearValidationErrors(formId);
                },
            );
        });

        $(`#${DETAIL_MODAL_ID}`).on(
            "hidden.bs.modal",
            function () {
                $("#detail_modal_loader").removeClass("d-none").addClass("d-flex");
                $("#detail_modal_content").hide();
            },
        );

        $(`#${THRESHOLD_MODAL_ID}`).on(
            "hidden.bs.modal",
            function () {
                $("#threshold_modal_loader").removeClass("d-none").addClass("d-flex");
                $("#threshold_modal_content").hide();
            },
        );

        // Historial Modal
        $(`#${HISTORY_MODAL_ID}`).on(
            "hidden.bs.modal",
            function () {
                if (movementsDataTableInstance) {
                    movementsDataTableInstance.destroy();
                    movementsDataTableInstance = null;
                    $("#tbl_movimientos").empty();
                }
            },
        );
    }

    /**
     * Recarga la tabla de inventario.
     */
    function loadInventario() {
        if (dataTableInstance) {
            dataTableInstance.ajax.reload(
                null,
                false,
            );
        }
    }

    /**
     * Inicializa el controlador.
     */
    async function init() {
        getTableBody();

        initDataTable();
        setupViewDetailsListener();
        setupThresholdsListener();
        setupEntryListener();
        setupExitListener();
        setupAdjustmentListener();
        setupHistoryListener();
        setupModalCleanup();

        // Cargar proveedores activos para el select de entrada
        await loadSuppliers();
    }

    /**
     * Carga los proveedores activos en el select del modal de entrada.
     */
    async function loadSuppliers() {
        try {
            const response = await ProveedorService.listarProveedores();

            if (
                response
                && response.success
                && response.data
            ) {
                const suppliers =
                    Array.isArray(response.data.results)
                        ? response.data.results
                        : (Array.isArray(response.data)
                            ? response.data
                            : []);

                const select = $("#entry_supplier_id");
                select.find("option:not(:first)").remove();

                suppliers.forEach((sup) => {
                    const name = sup.business_name
                        || `${sup.first_name || ''} ${sup.last_name || ''}`.trim()
                        || sup.document_number;
                    select.append(
                        `<option value="${sup.id_supplier}">${name}</option>`,
                    );
                });
            }
        } catch (error) {
            console.warn(
                "[INVENTARIO] No se pudieron cargar los proveedores:",
                error,
            );
        }
    }

    return Object.freeze({
        init,
    });
})();

export default InventarioListController;
