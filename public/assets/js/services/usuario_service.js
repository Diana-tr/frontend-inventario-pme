/**
 * @fileoverview
 * Servicio para la gestión de usuarios (consumo de la API).
 */

import ApiClient from "../core/apiclient.js";

export const usuarioService = {
    /**
     * Lista todos los usuarios registrados.
     */
    async listarUsuarios() {
        return await ApiClient.get("/api/v1/users/");
    },

    /**
     * Crea un nuevo usuario enviando los datos al backend.
     * @param {Object} userData 
     */
    async crearUsuario(userData) {
        return await ApiClient.post("/api/v1/users/", userData);
    }
};