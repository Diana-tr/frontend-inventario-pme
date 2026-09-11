/**
 * ============================================================
 * Inventario PME
 * Crear Proveedor Controller
 * ============================================================
 */

import ProveedorService from "../../services/Proveedor_service.js";
import NotificationService from "../../core/notification.js";

const CrearProveedorController = (() => {
    let form = null;
    let isSubmitting = false;

    async function init() {
        form = document.getElementById('form_crear_proveedor');
        if (!form) return;

        form.addEventListener('submit', handleFormSubmit);

        // Cargar las opciones estáticas del Choice de Django en el Select2
        loadDocumentTypes();
    }

    function loadDocumentTypes() {
        const select = $('#document_type');
        select.empty();
        select.append(new Option('Seleccionar tipo de documento', '', true, true));

        // Opciones correspondientes al TextChoices DocumentType de tu modelo en Django
        const documentTypes = [
            { value: 'CC', label: 'Cédula de Ciudadanía' },
            { value: 'NIT', label: 'Número de Identificación Tributaria' },
            { value: 'CE', label: 'Cédula de Extranjería' },
            { value: 'PAS', label: 'Pasaporte' },
            { value: 'TI', label: 'Tarjeta de Identidad' }
        ];

        documentTypes.forEach(type => {
            const option = new Option(type.label, type.value, false, false);
            select.append(option);
        });

        // Seleccionar 'CC' por defecto o disparar el cambio de Select2 si lo requiere
        select.val('CC').trigger('change');
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        if (isSubmitting) return;

        // Obtener el valor del Select2 con jQuery
        const documentTypeVal = $('#document_type').val();

        const data = {
            document_type: documentTypeVal || 'CC',
            document_number: document.getElementById('document_number')?.value.trim() || '',
            first_name: document.getElementById('first_name')?.value.trim() || '',
            last_name: document.getElementById('last_name')?.value.trim() || '',
            business_name: document.getElementById('business_name')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            mobile: document.getElementById('movile')?.value.trim() || '',
            address: document.getElementById('address')?.value.trim() || '',
            city: document.getElementById('city')?.value.trim() || '',
            country: document.getElementById('country')?.value.trim() || 'Colombia',
            notes: document.getElementById('notes')?.value.trim() || '',
            is_active: true // Por defecto activo al crear
        };

        // Validación básica
        if (!data.document_number) {
            NotificationService.toastError('El número de documento es obligatorio');
            return;
        }

        if (!data.first_name && !data.business_name) {
            NotificationService.toastError('Debe ingresar al menos el nombre o la razón social');
            return;
        }

        isSubmitting = true;
        NotificationService.loading('Guardando proveedor...');

        try {
            const response = await ProveedorService.crearProveedor(data);

            if (response && response.success) {
                NotificationService.success('El proveedor ha sido creado exitosamente.');

                // Redirigir al listado después de crear exitosamente
                setTimeout(() => {
                    window.location.href = 'listar.php';
                }, 1500);
            } else {
                NotificationService.error(NotificationService.getApiErrorMessage(response));
                isSubmitting = false;
            }
        } catch (error) {
            NotificationService.error('Ocurrió un error inesperado al guardar el proveedor.');
            isSubmitting = false;
        }
    }

    return Object.freeze({
        init
    });
})();

export default CrearProveedorController;