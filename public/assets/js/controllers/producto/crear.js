/**
 * ============================================================
 * Inventario P.M.E
 * Crear Producto Controller
 * ============================================================
 */

import CategoriaService from "../../services/categoria_service.js";
import NotificationService from "../../core/notification.js";
import ProductoService from "../../services/producto_service.js";

const CrearProductoController = (() => {
    let form = null;
    let isSubmitting = false;

    /**
     * Inicializa el controlador del formulario.
     */
    async function init() {
        form = document.getElementById("form_crear_producto");

        if (!form) {
            return;
        }

        form.addEventListener("submit", handleFormSubmit);

        loadUnitTypes();
        await loadCategories();
    }

    /**
     * Carga las unidades de medida disponibles.
     */
    function loadUnitTypes() {
        const select = $("#unit");

        if (!select.length) {
            return;
        }

        select.empty();

        select.append(
            new Option(
                "Seleccionar unidad de medida",
                "",
                true,
                true,
            ),
        );

        const unitTypes = [
            {
                value: "UNIT",
                label: "Unidad",
            },
            {
                value: "BOX",
                label: "Caja",
            },
            {
                value: "PACKAGE",
                label: "Paquete",
            },
            {
                value: "KILOGRAM",
                label: "Kilogramo",
            },
            {
                value: "GRAM",
                label: "Gramo",
            },
            {
                value: "METER",
                label: "Metro",
            },
            {
                value: "LITER",
                label: "Litro",
            },
            {
                value: "GALLON",
                label: "Galón",
            },
            {
                value: "ROLL",
                label: "Rollo",
            },
            {
                value: "PAIR",
                label: "Par",
            },
        ];

        unitTypes.forEach((type) => {
            const option = new Option(
                type.label,
                type.value,
                false,
                false,
            );

            select.append(option);
        });

        select.val("UNIT").trigger("change");
    }

    /**
     * Carga las categorías existentes desde el backend.
     */
    async function loadCategories() {
        const select = $("#category");

        if (!select.length) {
            return;
        }

        try {
            select.empty();

            select.append(
                new Option(
                    "Cargando categorías...",
                    "",
                    true,
                    true,
                ),
            );

            const response = await CategoriaService.listarCategorias();

            const categories = getCategoriesFromResponse(response);

            select.empty();

            select.append(
                new Option(
                    "Seleccionar categoría",
                    "",
                    true,
                    true,
                ),
            );

            categories.forEach((category) => {
                const option = new Option(
                    category.name,
                    category.id_category,
                    false,
                    false,
                );

                select.append(option);
            });

            select.val("").trigger("change");
        } catch (error) {
            console.error(
                "[CREAR PRODUCTO] Error al cargar categorías:",
                error,
            );

            select.empty();

            select.append(
                new Option(
                    "No se pudieron cargar las categorías",
                    "",
                    true,
                    true,
                ),
            );

            NotificationService.error(
                "No fue posible cargar las categorías.",
            );
        }
    }

    /**
     * Normaliza la respuesta del endpoint de categorías.
     *
     * Permite trabajar tanto con una lista directa como
     * con respuestas paginadas de Django REST Framework.
     */
    function getCategoriesFromResponse(response) {
        if (!response) {
            return [];
        }

        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response.results)) {
            return response.results;
        }

        if (Array.isArray(response.data)) {
            return response.data;
        }

        if (Array.isArray(response.data?.results)) {
            return response.data.results;
        }

        return [];
    }

    /**
     * Procesa el envío del formulario.
     */
    async function handleFormSubmit(event) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const unitTypeValue = $("#unit").val();
        const categoryValue = $("#category").val();

        const data = {
            code: document.getElementById("code")?.value.trim() || "",
            barcode: document
                .getElementById("barcode")
                ?.value.trim() || "",
            name: document.getElementById("name")?.value.trim() || "",
            description: document
                .getElementById("description")
                ?.value.trim() || "",
            category: categoryValue || "",
            unit: unitTypeValue || "",
            purchase_price: document
                .getElementById("purchase_price")
                ?.value.trim() || "",
            sale_price: document
                .getElementById("sale_price")
                ?.value.trim() || "",
            is_active: true,
        };

        if (!data.code) {
            NotificationService.toastError(
                "El número de código es obligatorio.",
            );
            return;
        }

        if (!data.name) {
            NotificationService.toastError(
                "Debe ingresar el nombre del producto.",
            );
            return;
        }

        if (!data.category) {
            NotificationService.toastError(
                "Debe seleccionar una categoría.",
            );
            return;
        }

        if (!data.unit) {
            NotificationService.toastError(
                "Debe seleccionar una unidad de medida.",
            );
            return;
        }

        isSubmitting = true;

        NotificationService.loading(
            "Guardando producto...",
        );

        try {
            const response = await ProductoService.crearProducto(data);

            if (response && response.success) {
                NotificationService.success(
                    "El producto ha sido creado exitosamente.",
                );

                setTimeout(() => {
                    const actualPath =
                        window.location.pathname.substring(
                            0,
                            window.location.pathname.lastIndexOf("/") + 1,
                        );

                    window.location.href = actualPath;
                }, 1500);

                return;
            }

            NotificationService.error(
                NotificationService.getApiErrorMessage(response),
            );

            isSubmitting = false;
        } catch (error) {
            console.error(
                "[CREAR PRODUCTO] Error al crear producto:",
                error,
            );

            NotificationService.error(
                "Ocurrió un error inesperado al guardar "
                + "el producto.",
            );

            isSubmitting = false;
        }
    }

    return Object.freeze({
        init,
    });
})();

export default CrearProductoController;