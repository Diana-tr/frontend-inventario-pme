/**
 * ============================================================
 * Inventario P.M.E
 * Crear Inventario Controller
 * ============================================================
 */

import ProductoService from "../../services/producto_service.js";
import NotificationService from "../../core/notification.js";
import InventarioService from "../../services/inventario_service.js";

const CrearInventarioController = (() => {
    let form = null;
    let isSubmitting = false;

    /**
     * Inicializa el controlador del formulario.
     */
    async function init() {
        form = document.getElementById("form_crear_inventario");

        if (!form) {
            return;
        }

        form.addEventListener("submit", handleFormSubmit);

        await loadProducts();
    }

    /**
     * Carga los productos existentes desde el backend.
     */
    async function loadProducts() {
        const select = $("#product");

        if (!select.length) {
            return;
        }

        try {
            select.empty();

            select.append(
                new Option(
                    "Cargando productos...",
                    "",
                    true,
                    true,
                ),
            );

            const response = await ProductoService.listarProductos();

            const products = getProductsFromResponse(response);

            select.empty();

            select.append(
                new Option(
                    "Seleccionar producto",
                    "",
                    true,
                    true,
                ),
            );

            products.forEach((product) => {
                const option = new Option(
                    `${product.code} - ${product.name}`,
                    product.id_product,
                    false,
                    false,
                );

                select.append(option);
            });

            select.val("").trigger("change");
        } catch (error) {
            console.error(
                "[CREAR INVENTARIO] Error al cargar productos:",
                error,
            );

            select.empty();

            select.append(
                new Option(
                    "No se pudieron cargar los productos",
                    "",
                    true,
                    true,
                ),
            );

            NotificationService.error(
                "No fue posible cargar los productos.",
            );
        }
    }

    /**
     * Normaliza la respuesta del endpoint de productos.
     */
    function getProductsFromResponse(response) {
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

        const productValue = $("#product").val();
        
        const data = {
            product: productValue ? Number(productValue) : null,
            current_stock: document.getElementById("current_stock")?.value || 0,
            minimum_stock: document.getElementById("minimum_stock")?.value || 0,
            maximum_stock: document.getElementById("maximum_stock")?.value || "",
        };

        if (!data.product) {
            NotificationService.toastError(
                "Debe seleccionar un producto.",
            );
            return;
        }
        
        if (data.current_stock < 0) {
            NotificationService.toastError(
                "La existencia actual no puede ser negativa.",
            );
            return;
        }

        if (data.maximum_stock !== "" && Number(data.maximum_stock) < Number(data.minimum_stock)) {
            NotificationService.toastError(
                "La existencia máxima no puede ser menor a la mínima.",
            );
            return;
        }

        // Parse to numbers or null before sending
        data.current_stock = Number(data.current_stock);
        data.minimum_stock = Number(data.minimum_stock);
        data.maximum_stock = data.maximum_stock !== "" ? Number(data.maximum_stock) : null;

        isSubmitting = true;

        NotificationService.loading(
            "Registrando configuración de inventario...",
        );

        try {
            const response = await InventarioService.crearInventario(data);

            if (response && response.success) {
                NotificationService.success(
                    "El inventario ha sido configurado exitosamente.",
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
                "[CREAR INVENTARIO] Error al crear inventario:",
                error,
            );

            NotificationService.error(
                "Ocurrió un error inesperado al registrar el inventario.",
            );

            isSubmitting = false;
        }
    }

    return Object.freeze({
        init,
    });
})();

export default CrearInventarioController;
