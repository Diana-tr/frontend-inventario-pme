/**
 * Controlador para la gestión de Categorías
 */
const CategoriasController = {
    init() {
        this.handleFormSubmit();
    },

    handleFormSubmit() {
        const form = document.getElementById('form-crear-categoria');
        if (!form) return;

        // Evitar duplicar eventos de envío
        if (form.dataset.listenerAttached) return;
        form.dataset.listenerAttached = 'true';

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);

            try {
                // Construcción de la ruta absoluta basada en tu proyecto en localhost
                const baseUrl = window.location.origin + '/frontend-inventario-pme';
                
                // IMPORTANTE: Valida que esta ruta interna coincida exactamente 
                // con la estructura de carpetas de tu proyecto en htdocs.
                const response = await fetch(`${baseUrl}/app/controllers/categorias/create_controller.php`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status} (El archivo PHP no se encontró en la ruta especificada)`);
                }

                const resultado = await response.json();

                if (resultado.status === 'success') {
                    alert(resultado.message);
                    $('#modal-crear-categoria').modal('hide');
                    form.reset();
                    location.reload(); 
                } else {
                    alert('Error: ' + resultado.message);
                }

            } catch (error) {
                console.error('Error en la petición:', error);
                alert('Ocurrió un error en la solicitud. Revisa la consola para más detalles.');
            }
        });
    }
};

export default CategoriasController;