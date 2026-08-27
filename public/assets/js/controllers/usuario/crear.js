import { usuarioService } from '../../services/usuario_service.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('[CREAR USUARIO] Versión 2.0 - Con document_number dinámico');

    const form = document.getElementById('formCrearUsuario') || document.querySelector('form');
    
    if (!form) {
        console.error('[CREAR USUARIO] No se encontró el formulario en el DOM.');
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nameInput = document.getElementById('name') || form.querySelector('[name="name"]');
        const emailInput = document.getElementById('email') || form.querySelector('[name="email"]');
        const passwordInput = document.getElementById('password') || form.querySelector('[name="password"]');

        const valorNombre = nameInput ? nameInput.value : '';
        const usernameLimpio = valorNombre.trim().toLowerCase().replace(/\s+/g, '_');

        // Generamos un número de documento aleatorio de 8 dígitos para evitar duplicados en la BD
        const documentoAleatorio = Math.floor(10000000 + Math.random() * 90000000).toString();

        const userData = {
            name: valorNombre,
            username: usernameLimpio,
            email: emailInput ? emailInput.value : '',
            password: passwordInput ? passwordInput.value : '',
            document_number: documentoAleatorio
        };

        console.log('[CREAR USUARIO] Enviando datos al servidor:', userData);

        try {
            const response = await usuarioService.crearUsuario(userData);
            console.log('[CREAR USUARIO] Respuesta del servidor:', response);
            
            if (response && (response.ok === false || response.success === false)) {
                let detalleError = response.message || 'Error desconocido';
                if (response.errors) {
                    detalleError = JSON.stringify(response.errors);
                }
                throw new Error(detalleError);
            }

            alert('¡Usuario creado con éxito!');
            window.location.href = 'listar.php';

        } catch (error) {
            console.error('[CREAR USUARIO] Error detectado:', error);
            
            let mensajeError = 'No se pudo crear el usuario.';
            if (error.message) {
                mensajeError = error.message;
            }

            alert('Error de validación: ' + mensajeError);
        }
    });
});