/**
 * ============================================================
 * Inventario P.M.E
 * Controller: Ajuste de Inventario / Movimientos
 * ============================================================
 */

import InventarioService from "../../services/inventario_service.js";
import ProveedorService from "../../services/proveedor_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";

const MovimientosController = (() => {
    const TABLE_BODY_ID = "tablaMovimientosBody";
    const TABLE_ID = "tbl_movimientos";

    const MODAL_REGISTRO_ID = "modalRegistrarMovimiento";
    const FORM_REGISTRO_ID = "formRegistrarMovimiento";

    const MODAL_DETALLE_ID = "modalDetalleMovimiento";

    let dataTableInstance = null;
    let selectedInventoryData = null; // Guardará el objeto del inventario seleccionado

    const COLUMN_ORDERING_MAP = {
        0: "created_at",
        1: "inventory__product__code",
        2: "movement_type",
        3: "quantity",
        4: "previous_stock",
        5: "new_stock",
        6: "reference",
    };

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
            "ADJUSTMENT": "Ajuste Físico",
        };
        return types[type] || type;
    }

    function getMovementBadge(type) {
        const badges = {
            "ENTRY": '<span class="badge badge-success px-2 py-1"><i class="fas fa-arrow-up mr-1"></i>Entrada</span>',
            "EXIT": '<span class="badge badge-warning px-2 py-1 text-dark"><i class="fas fa-arrow-down mr-1"></i>Salida</span>',
            "ADJUSTMENT": '<span class="badge badge-primary px-2 py-1"><i class="fas fa-sliders-h mr-1"></i>Ajuste</span>',
        };
        return badges[type] || type;
    }

    // ─────────────────────────────────────────────────────
    // DataTables
    // ─────────────────────────────────────────────────────

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
            order: [[0, 'desc']], // Por defecto ordenar por fecha descendente

            dom:
                "<'row mb-2'"
                + "<'col-sm-12 col-md-6 d-flex align-items-center'lB>"
                + "<'col-sm-12 col-md-6 d-flex justify-content-end'f>"
                + ">"
                + "<'row'<'col-sm-12'tr>>"
                + "<'row mt-2'"
                + "<'col-sm-12 col-md-5'i>"
                + "<'col-sm-12 col-md-7 d-flex justify-content-end'p>"
                + ">",

            buttons: [
                { extend: "excel", className: "btn btn-success btn-sm", text: '<i class="fas fa-file-excel mr-1"></i>Excel' },
                { extend: "pdf", className: "btn btn-danger btn-sm", text: '<i class="fas fa-file-pdf mr-1"></i>PDF' },
            ],

            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
            },

            columnDefs: [
                { orderable: false, targets: [7] },
                { className: "text-center", targets: [2, 3, 4, 5, 7] },
            ],

            ajax: async function (data, callback) {
                try {
                    const page = Math.floor(data.start / data.length) + 1;
                    const pageSize = data.length;
                    const search = data.search?.value || "";

                    let ordering = "";
                    if (data.order && data.order.length > 0) {
                        const orderColumn = data.order[0].column;
                        const orderDirection = data.order[0].dir;
                        const field = COLUMN_ORDERING_MAP[orderColumn];
                        if (field) {
                            ordering = orderDirection === "desc" ? `-${field}` : field;
                        }
                    }

                    const response = await InventarioService.listarTodosMovimientos({
                        page,
                        page_size: pageSize,
                        search,
                        ordering,
                    });

                    if (response?.success && response.data) {
                        const movements = response.data.results || [];
                        const totalRecords = response.data.count || 0;

                        const rows = movements.map((mov) => {
                            const badge = getMovementBadge(mov.movement_type);
                            const referenceText = mov.reference ? mov.reference : (mov.notes ? mov.notes.substring(0,20)+'...' : 'N/A');

                            const btnView = SecurityManager.hasPermission("inventory.view")
                                ? `<button class="btn btn-sm btn-info btn-view-movement mx-1" data-id="${mov.id_movement}" title="Ver Detalles"><i class="fas fa-eye"></i></button>`
                                : "";

                            return [
                                formatDateTime(mov.created_at),
                                `<strong>${mov.product_code}</strong><br><small>${mov.product_name}</small>`,
                                badge,
                                mov.quantity,
                                mov.previous_stock,
                                `<span class="font-weight-bold text-primary">${mov.new_stock}</span>`,
                                referenceText,
                                `<div class="d-flex justify-content-center">${btnView}</div>`,
                            ];
                        });

                        callback({
                            draw: data.draw,
                            recordsTotal: totalRecords,
                            recordsFiltered: totalRecords,
                            data: rows,
                        });
                    } else {
                        throw new Error("Formato de respuesta inválido.");
                    }
                } catch (error) {
                    console.error("[MOVIMIENTOS] Error server-side:", error);
                    callback({
                        draw: data.draw,
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: [],
                    });
                }
            },
        });
    }

    // ─────────────────────────────────────────────────────
    // Operaciones Modal de Registro Unificado
    // ─────────────────────────────────────────────────────

    async function cargarProductos() {
        const select = $("#mov_inventory_id");
        select.empty();
        select.append('<option value="">-- Busque y seleccione un producto --</option>');

        try {
            const response = await InventarioService.listarInventario();
            if (response?.success && response.data) {
                // Si la respuesta es paginada o lista directa
                const inventarios = Array.isArray(response.data) ? response.data : response.data.results || [];
                
                inventarios.forEach(inv => {
                    if (inv.is_active) {
                        const text = `[${inv.product_code}] ${inv.product_name} - (Stock: ${inv.current_stock})`;
                        // Guardar datos en HTML5 dataset para fácil acceso
                        const option = $(`<option value="${inv.id_inventory}" data-code="${inv.product_code}" data-stock="${inv.current_stock}" data-name="${inv.product_name}">${text}</option>`);
                        select.append(option);
                    }
                });
            }
        } catch (error) {
            console.error("Error al cargar inventarios:", error);
            NotificationService.error("No se pudieron cargar los productos disponibles.");
        }
    }

    async function cargarProveedores() {
        const select = $("#mov_supplier_id");
        select.empty();
        select.append('<option value="">-- Sin proveedor --</option>');

        try {
            const response = await ProveedorService.listarProveedores();
            if (response?.success && response.data) {
                const proveedores = Array.isArray(response.data) ? response.data : response.data.results || [];
                proveedores.forEach(prov => {
                    if (prov.is_active) {
                        const name = prov.business_name ? prov.business_name : `${prov.first_name} ${prov.last_name}`.trim();
                        const finalName = name || prov.document_number;
                        select.append(`<option value="${prov.id_supplier}">${finalName}</option>`);
                    }
                });
            }
        } catch (error) {
            console.error("Error al cargar proveedores:", error);
        }
    }

    function initModals() {
        // Inicializar Select2
        if ($.fn.select2) {
            $('#mov_inventory_id, #mov_supplier_id').select2({
                theme: 'bootstrap4',
                dropdownParent: $(`#${MODAL_REGISTRO_ID}`)
            });
        }

        // Botón Registrar Movimiento principal
        document.getElementById("btn_nuevo_movimiento").addEventListener("click", async () => {
            document.getElementById(FORM_REGISTRO_ID).reset();
            if ($.fn.select2) {
                $('#mov_inventory_id').val('').trigger('change');
                $('#mov_supplier_id').val('').trigger('change');
            }
            
            document.getElementById("mov_product_info").style.display = "none";
            document.getElementById("container_quantity").style.display = "none";
            document.getElementById("container_supplier").style.display = "none";
            document.getElementById("mov_preview").style.display = "none";
            document.getElementById("btn_guardar_movimiento").disabled = true;

            await cargarProductos();
            await cargarProveedores();
            
            $(`#${MODAL_REGISTRO_ID}`).modal("show");
        });

        // Evento al cambiar de Producto
        $('#mov_inventory_id').on('change', function() {
            const selectedOption = $(this).find('option:selected');
            if (this.value) {
                selectedInventoryData = {
                    id: this.value,
                    code: selectedOption.data('code'),
                    name: selectedOption.data('name'),
                    stock: parseFloat(selectedOption.data('stock'))
                };

                document.getElementById("info_product_code").textContent = selectedInventoryData.code;
                document.getElementById("info_current_stock").textContent = selectedInventoryData.stock;
                document.getElementById("mov_product_info").style.display = "flex";
            } else {
                selectedInventoryData = null;
                document.getElementById("mov_product_info").style.display = "none";
            }
            actualizarPrevisualizacion();
        });

        // Evento al cambiar Tipo de Movimiento
        document.getElementById("mov_type").addEventListener("change", (e) => {
            const type = e.target.value;
            const containerQuantity = document.getElementById("container_quantity");
            const lblValue = document.getElementById("lbl_mov_value");
            const inputVal = document.getElementById("mov_value");
            const helpVal = document.getElementById("help_mov_value");
            const containerSupplier = document.getElementById("container_supplier");
            const reqNotes = document.getElementById("req_mov_notes");

            inputVal.value = "";
            inputVal.disabled = false;

            if (!type) {
                containerQuantity.style.display = "none";
                containerSupplier.style.display = "none";
                reqNotes.style.display = "none";
                document.getElementById("mov_notes").required = false;
                actualizarPrevisualizacion();
                return;
            }

            containerQuantity.style.display = "block";

            if (type === "ENTRY") {
                lblValue.innerHTML = 'Cantidad de Entrada <span class="text-danger">*</span>';
                helpVal.textContent = "Ingrese cuánto desea sumar al stock actual.";
                containerSupplier.style.display = "block";
                reqNotes.style.display = "none";
                document.getElementById("mov_notes").required = false;
            } else if (type === "EXIT") {
                lblValue.innerHTML = 'Cantidad de Salida <span class="text-danger">*</span>';
                helpVal.textContent = "Ingrese cuánto desea restar al stock actual.";
                containerSupplier.style.display = "none";
                reqNotes.style.display = "none";
                document.getElementById("mov_notes").required = false;
            } else if (type === "ADJUSTMENT") {
                lblValue.innerHTML = 'Nuevo Stock Resultante Físico <span class="text-danger">*</span>';
                helpVal.textContent = "Ingrese la cantidad EXACTA que contó físicamente.";
                containerSupplier.style.display = "none";
                reqNotes.style.display = "inline";
                document.getElementById("mov_notes").required = true;
            }

            actualizarPrevisualizacion();
        });

        // Evento al escribir cantidad
        document.getElementById("mov_value").addEventListener("input", actualizarPrevisualizacion);

        // Envío de formulario
        document.getElementById(FORM_REGISTRO_ID).addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!e.target.checkValidity()) {
                e.target.classList.add("was-validated");
                return;
            }

            const invId = document.getElementById("mov_inventory_id").value;
            const movType = document.getElementById("mov_type").value;
            const value = parseFloat(document.getElementById("mov_value").value);
            const notes = document.getElementById("mov_notes").value;
            const reference = document.getElementById("mov_reference").value;

            if (!invId || !movType || isNaN(value)) {
                NotificationService.error("Complete todos los campos obligatorios.");
                return;
            }

            const btn = document.getElementById("btn_guardar_movimiento");
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Procesando...';
            btn.disabled = true;

            try {
                let data = { reference, notes };

                if (movType === "ENTRY") {
                    data.quantity = value;
                    const supp = document.getElementById("mov_supplier_id").value;
                    if (supp) data.supplier_id = supp;
                    await InventarioService.registrarEntrada(invId, data);
                } else if (movType === "EXIT") {
                    data.quantity = value;
                    await InventarioService.registrarSalida(invId, data);
                } else if (movType === "ADJUSTMENT") {
                    data.new_stock = value;
                    await InventarioService.registrarAjuste(invId, data);
                }

                $(`#${MODAL_REGISTRO_ID}`).modal("hide");
                NotificationService.success("Movimiento registrado correctamente.");
                dataTableInstance.ajax.reload(null, false);
            } catch (error) {
                console.error("Error al registrar movimiento:", error);
                const apiMsg = error.response?.data?.message || "Ocurrió un error al guardar el movimiento.";
                NotificationService.error(apiMsg);
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    function actualizarPrevisualizacion() {
        const preview = document.getElementById("mov_preview");
        const spanText = document.getElementById("preview_text");
        const btnSave = document.getElementById("btn_guardar_movimiento");

        if (!selectedInventoryData) {
            preview.style.display = "none";
            btnSave.disabled = true;
            return;
        }

        const type = document.getElementById("mov_type").value;
        const value = parseFloat(document.getElementById("mov_value").value);
        const currentStock = selectedInventoryData.stock;

        if (!type || isNaN(value) || value < 0) {
            preview.style.display = "none";
            btnSave.disabled = true;
            return;
        }

        let resultingStock = 0;
        let diff = 0;

        if (type === "ENTRY") {
            resultingStock = currentStock + value;
            diff = value;
        } else if (type === "EXIT") {
            if (value > currentStock) {
                spanText.innerHTML = `<span class="text-danger font-weight-bold">Error:</span> La cantidad de salida (${value}) excede el stock actual (${currentStock}).`;
                preview.style.display = "block";
                btnSave.disabled = true;
                return;
            }
            resultingStock = currentStock - value;
            diff = -value;
        } else if (type === "ADJUSTMENT") {
            if (value === currentStock) {
                spanText.innerHTML = `<span class="text-danger font-weight-bold">Error:</span> El stock ingresado es idéntico al actual. No hay diferencia que ajustar.`;
                preview.style.display = "block";
                btnSave.disabled = true;
                return;
            }
            resultingStock = value;
            diff = value - currentStock;
        }

        const diffText = diff > 0 ? `+${diff}` : diff;
        
        spanText.innerHTML = `
            El stock pasará de <strong>${currentStock}</strong> a <strong style="font-size: 1.2rem;">${resultingStock}</strong> unidades. <br>
            <small class="text-muted">(Diferencia neta: ${diffText})</small>
        `;
        preview.style.display = "block";
        btnSave.disabled = false;
    }

    // ─────────────────────────────────────────────────────
    // Detalle de Movimiento
    // ─────────────────────────────────────────────────────

    async function verDetalle(idMovement) {
        $(`#${MODAL_DETALLE_ID}`).modal("show");
        document.getElementById("detail_modal_loader").style.display = "flex";
        document.getElementById("detail_modal_content").style.display = "none";

        try {
            // Actualmente no hay endpoint de "detalle" por id_movement suelto,
            // pero podemos aprovechar el campo completo en la iteración o crear la función.
            // Puesto que el dataTable tiene todos los datos para listar,
            // podríamos haberlos guardado.
            // Para solucionarlo temporalmente sin backend detail endpoint, leemos el DOM 
            // de la tabla (solo visual), o podríamos añadir un método get() en el backend.
            
            // Reutilizaremos un truco: Si no tenemos endpoint detail global, interceptamos
            // los datos guardados en una variable o hacemos una consulta simple si el backend lo permitiera.
            // Como el backend NO tiene retrieve global fácil, vamos a obtenerlo de DataTables
            
            // ... (implementado abajo en eventos)
        } catch (error) {
            console.error("Error:", error);
            $(`#${MODAL_DETALLE_ID}`).modal("hide");
        }
    }

    function initEvents() {
        // Evento para ver detalles (usando los datos cacheados por DataTables)
        $(`#${TABLE_BODY_ID}`).on("click", ".btn-view-movement", function () {
            const id = $(this).data("id");
            
            // Obtener datos directamente de DataTables API
            const tr = $(this).closest("tr");
            const rowData = dataTableInstance.row(tr).data();
            
            // rowData es un array de lo que retornamos en callback de DataTables.
            // Así que requerimos los datos crudos, vamos a reescribir eso si es necesario, 
            // o lo hacemos interceptando AJAX, pero de manera sencilla, lo tenemos en la tabla!
            // Para hacerlo robusto, mejor hacer fetch al endpoint GET /api/v1/inventory-movements/{id}/
            
            abrirDetalleModal(id);
        });
    }

    async function abrirDetalleModal(idMovement) {
        $(`#${MODAL_DETALLE_ID}`).modal("show");
        const loader = document.getElementById("detail_modal_loader");
        const content = document.getElementById("detail_modal_content");
        
        loader.classList.remove("d-none");
        loader.classList.add("d-flex");
        content.style.display = "none";

        try {
            // Request al nuevo ViewSet usando InventarioService (que usa ApiClient)
            const response = await InventarioService.obtenerMovimientoPorId(idMovement);
            
            if (!response || !response.success) {
                throw new Error("No se pudo obtener el movimiento.");
            }

            const mov = response.data;

            document.getElementById("detail_product_code").textContent = mov.product_code;
            document.getElementById("detail_product_name").textContent = mov.product_name;
            document.getElementById("detail_movement_type").innerHTML = getMovementBadge(mov.movement_type);
            document.getElementById("detail_quantity").textContent = mov.quantity;
            document.getElementById("detail_reference").textContent = mov.reference || "N/A";
            document.getElementById("detail_created_at").textContent = formatDateTime(mov.created_at);
            document.getElementById("detail_previous_stock").textContent = mov.previous_stock;
            document.getElementById("detail_new_stock").textContent = mov.new_stock;
            document.getElementById("detail_notes").textContent = mov.notes || "Sin observaciones registradas.";

            loader.classList.remove("d-flex");
            loader.classList.add("d-none");
            content.style.display = "block";
        } catch (error) {
            console.error("Error al cargar detalle del movimiento:", error);
            NotificationService.error("No se pudo cargar el detalle del movimiento.");
            $(`#${MODAL_DETALLE_ID}`).modal("hide");
        }
    }

    return Object.freeze({
        init: async () => {
            initDataTable();
            initModals();
            initEvents();
        },
    });
})();

export default MovimientosController;
