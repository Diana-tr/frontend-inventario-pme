/**
 * ============================================================
 * Inventario PME
 * Crear Categoria Controller
 * ============================================================
 */

import CategoriaService from "../../services/categoria_service.js";
import NotificationService from "../../core/notification.js";

const CrearCategoriaController = (() => {
    let form = null;
    let isSubmitting = false;

    async function init() {
        form = document.getElementById('form_crear_categoria');
        if (!form) return;

        form.addEventListener('submit', handleFormSubmit);

        // Cargar las categorías para el select
        await loadParentCategories();
    }

    async function loadParentCategories(selectedId = null) {
        const select = $('#parent_id');
        select.empty();
        select.append(new Option('Seleccionar categoría padre (opcional)', '', true, true));

        try {
            const response = await CategoriaService.listarCategorias();
            if (response && response.success) {
                const categorias = Array.isArray(response.data) ? response.data : (response.data.results || []);
                
                categorias.forEach(cat => {
                    const option = new Option(cat.name, cat.id_category, false, false);
                    select.append(option);
                });

                if (selectedId) {
                    select.val(selectedId).trigger('change');
                }
            }
        } catch (error) {
            console.error("Error al cargar categorías padre:", error);
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        if (isSubmitting) return;

        // Obtener el valor del Select2 con jQuery (FormData no captura Select2)
        const parentVal = $('#parent_id').val();

        const data = {
            name: document.getElementById('name').value.trim(),
            description: document.getElementById('description').value.trim() || '',
            parent: parentVal || null,
            is_active: true // Por defecto activo al crear
        };

        // Basic validation
        if (!data.name) {
            NotificationService.toastError('El nombre es obligatorio');
            return;
        }

        isSubmitting = true;
        NotificationService.loading('Guardando categoría...');

        try {
            const response = await CategoriaService.crearCategoria(data);

            if (response && response.success) {
                NotificationService.success('La categoría ha sido creada exitosamente.');

                // Redirigir al listado después de crear exitosamente
                setTimeout(() => {
                    window.location.href = 'index.php';
                }, 1500);
            } else {
                NotificationService.error(NotificationService.getApiErrorMessage(response));
                isSubmitting = false;
            }
        } catch (error) {
            NotificationService.error('Ocurrió un error inesperado al guardar la categoría.');
            isSubmitting = false;
        }
    }

    return Object.freeze({
        init
    });
})();

export default CrearCategoriaController;
