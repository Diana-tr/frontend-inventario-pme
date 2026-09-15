/**
 * ============================================================
 * Inventario P.M.E
 * Product List Controller (Productos)
 * ============================================================
 */

import ProductoService from "../../services/producto_service.js";
import SecurityManager from "../../core/security.js";
import NotificationService from "../../core/notification.js";

const ProductoListController = (() => {
    const TABLE_BODY_ID = "tablaProductosBody";
    const TABLE_ID = "tbl_productos";
    const DETAIL_MODAL_ID = "modalDetalleProducto";
    const EDIT_MODAL_ID = "modalEditarProducto";
    const EDIT_FORM_ID = "formEditarProducto";

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

    function formatDateTime(dateString){
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    /**
     * Configura el listener para visualizar los detalles.
     */
    function setupViewDetailsListener() {
        $(`#${TABLE_ID}`)
            .off("click", ".btn-view-product")
            .on("click", ".btn-view-product", async function () {
                const productId = $(this).data("productId");

                if (!productId) {
                    return;
                }

                $("#product_modal_loader").show();
                $("#product_modal_content").hide();

                $(`#${DETAIL_MODAL_ID}`).modal("show");

                try {
                    const response =
                        await ProductoService.obtenerProductoPorId(
                            productId,
                        );

                    if (
                        response &&
                        response.success &&
                        response.data
                    ) {
                        const producto = response.data;

                         $("#detail_id_product").text(
                            producto.id_product || "N/A",
                        );

                        $("#detail_code").text(
                            producto.code || "N/A",
                        );

                        $("#detail_product_code").text(
                            producto.code || "N/A",
                        );

                        $("#detail_barcode").text(
                            producto.barcode || "N/A",
                        );

                        $("#detail_name").text(
                            producto.name || "Sin nombre",
                        );

                        $("#detail_description").text(
                            producto.description || "Sin descripción",
                        );

                        $("#detail_category").text(
                            getCategoryName(producto),
                        );

                        $("#detail_unit").text(
                            getUnitTypeLabel(producto.unit),
                        );

                        $("#detail_purchase_price").text(
                            formatCurrency(producto.purchase_price),
                        );

                        $("#detail_sale_price").text(
                            formatCurrency(producto.sale_price),
                        );
                        $("#detail_profit_amount").text(
                            formatCurrency(producto.profit_amount)
                        );
                        $("#detail_profit_margin_percentage").text(
                            (producto.profit_margin_percentage ?? 0) + "%"
                        );
                        $("#detail_stock").text(
                            getUnitTypeLabel(producto.stock)
                        );
                        $("#detail_minimum_stock").text(
                            getUnitTypeLabel(producto.minimum_stock)
                        );
                        $("#detail_maximum_stock").text(
                            getUnitTypeLabel(producto.maximum_stock)
                        );
                        const lowStockHtml = producto.is_low_stock
                            ? '<span class="badge bg-danger">Si</span>'
                            : '<span class="badge bg-success">No</span>';
                        $("#detail_is_low_stock").html(lowStockHtml);
                        
                        const overstockHtml = producto.is_overstocked
                            ? '<span class="badge bg-warning text-dark">Si</span>'
                            : '<span class="badge bg-success">No</span>';
                        $("#detail_is_overstocked").html(overstockHtml);
                        $("#detail_created_at").text(
                            formatDateTime(producto.created_at)
                        );
                        $("#detail_updated_at").text(
                            formatDateTime(producto.updated_at)
                        );

                        const badgeHtml = producto.is_active
                            ? '<span class="badge badge-success px-3 py-1 shadow-sm">Activo</span>'
                            : '<span class="badge badge-danger px-3 py-1 shadow-sm">Inactivo</span>';

                        $("#detail_status_badge").html(
                            badgeHtml,
                        );

                        $("#product_modal_loader").hide();
                        $("#product_modal_content").fadeIn();
                    } else {
                        throw new Error(
                            "Respuesta inválida al consultar "
                            + "el producto.",
                        );
                    }
                } catch (error) {
                    console.error(
                        "[PRODUCTOS] Error al obtener detalles:",
                        error,
                    );

                    $(`#${DETAIL_MODAL_ID}`).modal("hide");

                    NotificationService.toastError(
                        "No se pudo cargar la información "
                        + "del producto.",
                    );
                }
            });
    }

    /**
     * Configura el modal de edición.
     */
    function setupEditProductListener() {
        $(`#${TABLE_ID}`)
            .off("click", ".btn-edit-product")
            .on(
                "click",
                ".btn-edit-product",
                async function () {
                    const productId =
                        $(this).data("productId");

                    if (!productId) {
                        return;
                    }

                    const form =
                        document.getElementById(EDIT_FORM_ID);

                    if (form) {
                        form.classList.remove("was-validated");
                        form.reset();
                    }

                    $("#edit_product_modal_loader").show();
                    $("#edit_product_modal_content").hide();

                    $(`#${EDIT_MODAL_ID}`).modal("show");

                    try {
                        const response =
                            await ProductoService
                                .obtenerProductoPorId(productId);

                        if (
                            response &&
                            response.success &&
                            response.data
                        ) {
                            const producto = response.data;

                            $("#edit_id").val(
                                producto.id_product,
                            );

                            $("#edit_code").val(
                                producto.code || "",
                            );

                            $("#edit_barcode").val(
                                producto.barcode || "",
                            );

                            $("#edit_name").val(
                                producto.name || "",
                            );

                            $("#edit_description").val(
                                producto.description || "",
                            );

                            setCategoryValue(producto);

                            $("#edit_unit").val(
                                producto.unit || "",
                            );

                            $("#edit_purchase_price").val(
                                producto.purchase_price || "",
                            );

                            $("#edit_sale_price").val(
                                producto.sale_price || "",
                            );

                            $("#edit_is_active").prop(
                                "checked",
                                Boolean(producto.is_active),
                            );

                            $("#edit_product_modal_loader").hide();
                            $("#edit_product_modal_content")
                                .fadeIn();
                        } else {
                            throw new Error(
                                "No se pudo obtener la información "
                                + "del producto.",
                            );
                        }
                    } catch (error) {
                        console.error(
                            "[PRODUCTOS] Error al preparar edición:",
                            error,
                        );

                        $(`#${EDIT_MODAL_ID}`).modal("hide");

                        NotificationService.toastError(
                            "No se pudo cargar la información "
                            + "del producto.",
                        );
                    }
                },
            );

        $(`#${EDIT_FORM_ID}`)
            .off("submit")
            .on("submit", async function (event) {
                event.preventDefault();

                const form = this;

                if (!form.checkValidity()) {
                    event.stopPropagation();
                    form.classList.add("was-validated");
                    return;
                }

                const productId = $("#edit_product_id").val();
                const submitButton = $("#btn_guardar_edicion");

                const payload = {
                    code: $("#edit_code").val().trim(),
                    barcode: $("#edit_barcode").val().trim(),
                    name: $("#edit_name").val().trim(),
                    description: $("#edit_description")
                        .val()
                        .trim(),
                    category: $("#edit_category").val(),
                    unit: $("#edit_unit").val(),
                    purchase_price: $("#edit_purchase_price")
                        .val()
                        .trim(),
                    sale_price: $("#edit_sale_price")
                        .val()
                        .trim(),
                    is_active: $("#edit_is_active").is(
                        ":checked",
                    ),
                };

                try {
                    submitButton
                        .prop("disabled", true)
                        .html(
                            '<i class="fas fa-spinner fa-spin '
                            + 'mr-1"></i>Guardando...',
                        );

                    const response =
                        await ProductoService.actualizarProducto(
                            productId,
                            payload,
                        );

                    if (response && response.success) {
                        $(`#${EDIT_MODAL_ID}`).modal("hide");

                        loadProductos();

                        NotificationService.toastSuccess(
                            "Producto actualizado correctamente.",
                        );
                    } else {
                        throw response;
                    }
                } catch (error) {
                    console.error(
                        "[PRODUCTOS] Error al actualizar:",
                        error,
                    );

                    const errorMessage =
                        NotificationService
                            .getApiErrorMessage(
                                error,
                                "Ocurrió un error al actualizar "
                                + "el producto.",
                            );

                    NotificationService.error(errorMessage);
                } finally {
                    submitButton
                        .prop("disabled", false)
                        .html(
                            '<i class="fas fa-save mr-1"></i>'
                            + "Guardar Cambios",
                        );
                }
            });
    }

    /**
     * Configura la activación/desactivación del producto.
     */
    function setupToggleStatusListener() {
        $(`#${TABLE_ID}`)
            .off("click", ".btn-toggle-status")
            .on(
                "click",
                ".btn-toggle-status",
                async function () {
                    const button = $(this);

                    const productId =
                        button.data("productId");

                    const productName =
                        button.data("productName")
                        || "este producto";

                    const statusAttr =
                        button.data("status");

                    const isCurrentActive =
                        statusAttr === true
                        || statusAttr === "true";

                    const newStatus = !isCurrentActive;

                    const actionWord =
                        isCurrentActive
                            ? "desactivar"
                            : "activar";

                    if (!productId) {
                        return;
                    }

                    NotificationService.warning(
                        `¿Deseas ${actionWord} el producto `
                        + `"${productName}"?`,
                        `Confirmación de ${actionWord}`,
                    ).then(async (result) => {
                        if (!result.isConfirmed) {
                            return;
                        }

                        try {
                            const response =
                                await ProductoService
                                    .cambiarEstadoProducto(
                                        productId,
                                        newStatus,
                                    );

                            if (
                                response &&
                                response.success
                            ) {
                                NotificationService
                                    .toastSuccess(
                                        `Producto "${productName}" `
                                        + `${
                                            newStatus
                                                ? "activado"
                                                : "desactivado"
                                        } con éxito.`,
                                    );

                                loadProductos();
                            } else {
                                throw response;
                            }
                        } catch (error) {
                            console.error(
                                "[PRODUCTOS] Error al cambiar "
                                + "estado:",
                                error,
                            );

                            const errorMessage =
                                NotificationService
                                    .getApiErrorMessage(
                                        error,
                                        "Ocurrió un problema al "
                                        + "cambiar el estado del "
                                        + "producto.",
                                    );

                            NotificationService.error(
                                errorMessage,
                            );
                        }
                    });
                },
            );
    }

    /**
     * Mapeo entre columnas DataTables y campos del backend.
     */
    const COLUMN_ORDERING_MAP = {
        1: "code",
        2: "name",
        3: "category",
        4: "unit",
        5: "purchase_price",
        6: "sale_price",
        7: "is_active",
    };

    let dataTableInstance = null;

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
                        columns: [1, 2, 3, 4, 5, 6, 7],
                    },
                },
                {
                    extend: "csv",
                    className: "btn btn-success btn-sm",
                    text:
                        '<i class="fas fa-file-csv mr-1"></i>'
                        + "CSV",
                    exportOptions: {
                        columns: [1, 2, 3, 4, 5, 6, 7],
                    },
                },
                {
                    extend: "excel",
                    className: "btn btn-success btn-sm",
                    text:
                        '<i class="fas fa-file-excel mr-1"></i>'
                        + "Excel",
                    exportOptions: {
                        columns: [1, 2, 3, 4, 5, 6, 7],
                    },
                },
                {
                    extend: "pdf",
                    className: "btn btn-danger btn-sm",
                    text:
                        '<i class="fas fa-file-pdf mr-1"></i>'
                        + "PDF",
                    exportOptions: {
                        columns: [1, 2, 3, 4, 5, 6, 7],
                    },
                },
                {
                    extend: "print",
                    className: "btn btn-info btn-sm",
                    text:
                        '<i class="fas fa-print mr-1"></i>'
                        + "Imprimir",
                    exportOptions: {
                        columns: [1, 2, 3, 4, 5, 6, 7],
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
                    targets: [0, 8],
                },
                {
                    className: "text-center",
                    targets: [0, 7, 8],
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
                        await ProductoService
                            .listarProductosPaginados({
                                page,
                                page_size: pageSize,
                                search,
                                ordering,
                            });

                    if (
                        response?.success
                        && response.data
                    ) {
                        const resultsContainer =
                            response.data;

                        const productos =
                            Array.isArray(
                                resultsContainer.results,
                            )
                                ? resultsContainer.results
                                : (
                                    Array.isArray(
                                        resultsContainer,
                                    )
                                        ? resultsContainer
                                        : (
                                            resultsContainer.data
                                            || []
                                        )
                                );

                        const totalRecords =
                            resultsContainer.count
                            || productos.length
                            || 0;

                        const rows = productos.map(
                            (producto, index) => {
                                const statusBadge =
                                    producto.is_active
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
                                    buildActionsHtml(producto);

                                return [
                                    data.start + index + 1,
                                    producto.code || "S/C",
                                    producto.name
                                        || "Sin nombre",
                                    getCategoryName(
                                        producto,
                                    ),
                                    getUnitTypeLabel(
                                        producto.unit,
                                    ),
                                    formatCurrency(
                                        producto.purchase_price,
                                    ),
                                    formatCurrency(
                                        producto.sale_price,
                                    ),
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
                        "[PRODUCTOS] Error server-side:",
                        error,
                    );

                    callback({
                        draw: data.draw,
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: [],
                    });

                    NotificationService.toastError(
                        "No se pudieron cargar los productos.",
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
     * Construye los botones de acciones del producto.
     */
    function buildActionsHtml(producto) {
        const productId =
            producto.id_product ?? "";

        const productName =
            producto.name || "producto";

        const isActive =
            Boolean(producto.is_active);

        const toggleClass =
            isActive
                ? "btn-outline-danger"
                : "btn-outline-success";

        const toggleIcon =
            isActive
                ? "fa-toggle-off"
                : "fa-toggle-on";

        const toggleTitle =
            isActive
                ? "Desactivar producto"
                : "Activar producto";

        return `
            <div class="btn-group">
                <button
                    type="button"
                    class="btn btn-outline-info btn-sm
                    btn-view-product"
                    title="Ver detalles"
                    data-product-id="${productId}"
                    data-permission="products.view"
                >
                    <i class="fas fa-eye"></i>
                </button>

                <button
                    type="button"
                    class="btn btn-outline-warning btn-sm
                    btn-edit-product"
                    title="Editar producto"
                    data-product-id="${productId}"
                    data-permission="products.update"
                >
                    <i class="fas fa-edit"></i>
                </button>

                <button
                    type="button"
                    class="btn ${toggleClass} btn-sm
                    btn-toggle-status"
                    title="${toggleTitle}"
                    data-product-id="${productId}"
                    data-product-name="${productName}"
                    data-status="${isActive}"
                    data-permission="products.delete"
                >
                    <i class="fas ${toggleIcon}"></i>
                </button>
            </div>
        `;
    }

    /**
     * Obtiene el nombre de la categoría.
     *
     * Soporta diferentes representaciones del serializer:
     * - category como string.
     * - category como objeto.
     * - category_name como campo directo.
     */
    function getCategoryName(producto) {
        if (producto.category_name) {
            return producto.category_name;
        }

        if (
            producto.category
            && typeof producto.category === "object"
        ) {
            return (
                producto.category.category_name
                || producto.category.name
                || "Sin categoría"
            );
        }

        if (typeof producto.category === "string") {
            return producto.category;
        }

        if (typeof producto.category === "number") {
            return String(producto.category);
        }

        return "Sin categoría";
    }

    /**
     * Obtiene la etiqueta de la unidad de medida.
     */
    function getUnitTypeLabel(unitType) {
        const units = {
            UNIT: "Unidad",
            BOX: "Caja",
            PACKAGE: "Paquete",
            KILOGRAM: "Kilogramo",
            GRAM: "Gramo",
            METER: "Metro",
            LITER: "Litro",
            GALLON: "Galón",
            ROLL: "Rollo",
            PAIR: "Par",
        };

        return units[unitType] || unitType || "N/A";
    }

    /**
     * Formatea valores monetarios.
     */
    function formatCurrency(value) {
        if (
            value === null
            || value === undefined
            || value === ""
        ) {
            return "N/A";
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return value;
        }

        return new Intl.NumberFormat(
            "es-CO",
            {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            },
        ).format(number);
    }

    /**
     * Obtiene el valor de categoría para edición.
     */
    function setCategoryValue(producto) {
        let categoryId = "";

        if (
            producto.category
            && typeof producto.category === "object"
        ) {
            categoryId =
                producto.category.id_category
                || producto.category.id
                || "";
        } else {
            categoryId = producto.category || "";
        }

        $("#edit_category")
            .val(categoryId)
            .trigger("change");
    }

    /**
     * Recarga la tabla de productos.
     */
    function loadProductos() {
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
        setupEditProductListener();
        setupToggleStatusListener();
    }

    return Object.freeze({
        init,
    });
})();

export default ProductoListController;