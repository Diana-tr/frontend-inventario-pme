/**
 * @fileoverview
 * Controlador exclusivo para listar usuarios registrados en el sistema.
 */

import { usuarioService } from '../../services/usuario_service.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[USUARIOS LISTAR] Iniciando controlador de listado...');
    
    const tbody = document.getElementById('tablaUsuariosBody');
    if (!tbody) {
        console.error('[USUARIOS LISTAR] No se encontró el elemento con ID "tablaUsuariosBody" en el DOM.');
        return;
    }

    try {
        // Llamada directa al servicio de usuarios que ya validamos
        const response = await usuarioService.listarUsuarios();
        console.log('[USUARIOS LISTAR] Respuesta cruda recibida de la API:', response);
        
        tbody.innerHTML = '';

        let usuarios = [];

        // Validación robusta para extraer los datos sin importar el formato de Django REST Framework
        if (Array.isArray(response)) {
            usuarios = response;
        } else if (response && typeof response === 'object') {
            if (Array.isArray(response.data)) {
                usuarios = response.data;
            } else if (Array.isArray(response.results)) {
                usuarios = response.results;
            } else if (Array.isArray(response.users)) {
                usuarios = response.users;
            }
        }

        console.log('[USUARIOS LISTAR] Array final procesado para la tabla:', usuarios);

        if (usuarios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay usuarios registrados en el sistema.</td></tr>`;
            return;
        }

        // Pintar filas asegurando la estructura visual de la tabla
        usuarios.forEach((user, index) => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.id || index + 1}</td>
                    <td>${user.name || user.username || 'Sin nombre'}</td>
                    <td>${user.email || 'Sin correo'}</td>
                    <td><span class="badge bg-success">Activo</span></td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-warning me-1" title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error('[USUARIOS LISTAR] Error crítico al obtener usuarios:', error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Error al cargar los datos del servidor. Revisa la consola.</td></tr>`;
    }
});