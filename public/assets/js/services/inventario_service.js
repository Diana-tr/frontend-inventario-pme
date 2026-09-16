import ApiClient from "../core/apiClient.js";

const InventarioService = (() => {
    const INVENTORY_ENDPOINT = "/api/v1/inventory/";

    // Listar todos los registros de inventario.
    async function listarInventario() {
        try {
            return await ApiClient.get(INVENTORY_ENDPOINT);
        } catch (error) {
            console.error("[INVENTARIO SERVICE] Error al listar inventarios:", error);
            throw error;
        }
    }

    /**
     * Lista inventarios con parámetros de paginación server-side.
     * @param {Object} params - { page, page_size, search, ordering }
     */
    async function listarInventarioPaginado(params = {}) {
        try {
            const query = new URLSearchParams();

            if (params.page) query.set("page", params.page);
            if (params.page_size) query.set("page_size", params.page_size);
            if (params.search) query.set("search", params.search);
            if (params.ordering) query.set("ordering", params.ordering);

            const queryString = query.toString();
            const url = queryString
                ? `${INVENTORY_ENDPOINT}?${queryString}`
                : INVENTORY_ENDPOINT;

            return await ApiClient.get(url);
        } catch (error) {
            console.error("[INVENTARIO SERVICE] Error al listar inventarios paginados:", error);
            throw error;
        }
    }

    // Obtener detalles de un inventario por ID.
    async function obtenerInventarioPorId(id) {
        try {
            return await ApiClient.get(`${INVENTORY_ENDPOINT}${id}/`);
        } catch (error) {
            console.error(`[INVENTARIO SERVICE] Error al obtener inventario ${id}:`, error);
            throw error;
        }
    }

    // Crear una configuración de inventario.
    async function crearInventario(inventarioData) {
        try {
            return await ApiClient.post(INVENTORY_ENDPOINT, inventarioData);
        } catch (error) {
            console.error("[INVENTARIO SERVICE] Error al crear inventario:", error);
            throw error;
        }
    }

    // Actualizar umbrales (mínimo y máximo).
    async function actualizarUmbrales(id, data) {
        try {
            return await ApiClient.patch(`${INVENTORY_ENDPOINT}${id}/thresholds/`, data);
        } catch (error) {
            console.error(`[INVENTARIO SERVICE] Error al actualizar umbrales del inventario ${id}:`, error);
            throw error;
        }
    }

    // Desactivar (DELETE lógico)
    async function desactivarInventario(id) {
        try {
            return await ApiClient.delete(`${INVENTORY_ENDPOINT}${id}/`);
        } catch (error) {
            console.error(`[INVENTARIO SERVICE] Error al desactivar inventario ${id}:`, error);
            throw error;
        }
    }

    // Activar inventario
    async function activarInventario(id) {
        try {
            return await ApiClient.patch(`${INVENTORY_ENDPOINT}${id}/`, {
                is_active: true,
            });
        } catch (error) {
            console.error(`[INVENTARIO SERVICE] Error al activar inventario ${id}:`, error);
            throw error;
        }
    }

    // Registrar entrada de inventario
    async function registrarEntrada(id, data) {
        try {
            return await ApiClient.post(`${INVENTORY_ENDPOINT}${id}/entry/`, data);
        } catch (error) {
            console.error(`[INVENTARIO SERVICE] Error al registrar entrada en inventario ${id}:`, error);
            throw error;
        }
    }

    // Registrar salida de inventario
    async function registrarSalida(id, data) {
        try {
            return await ApiClient.post(`${INVENTORY_ENDPOINT}${id}/exit/`, data);
        } catch (error) {
            console.error(`[INVENTARIO SERVICE] Error al registrar salida en inventario ${id}:`, error);
            throw error;
        }
    }

    // Registrar ajuste de inventario
    async function registrarAjuste(id, data) {
        try {
            return await ApiClient.post(`${INVENTORY_ENDPOINT}${id}/adjustment/`, data);
        } catch (error) {
            console.error(`[INVENTARIO SERVICE] Error al registrar ajuste en inventario ${id}:`, error);
            throw error;
        }
    }

    /**
     * Obtener el historial de movimientos de un inventario
     * @param {number|string} id 
     * @param {Object} params - Paginación
     */
    async function listarMovimientos(id, params = {}) {
        try {
            const query = new URLSearchParams();

            if (params.page) query.set("page", params.page);
            if (params.page_size) query.set("page_size", params.page_size);

            const queryString = query.toString();
            const url = queryString
                ? `${INVENTORY_ENDPOINT}${id}/movements/?${queryString}`
                : `${INVENTORY_ENDPOINT}${id}/movements/`;

            return await ApiClient.get(url);
        } catch (error) {
            console.error(`[INVENTARIO SERVICE] Error al listar movimientos del inventario ${id}:`, error);
            throw error;
        }
    }

    /**
     * Obtener el historial de movimientos global de todos los inventarios
     * @param {Object} params - Paginación y búsqueda
     */
    async function listarTodosMovimientos(params = {}) {
        try {
            const query = new URLSearchParams();

            if (params.page) query.set("page", params.page);
            if (params.page_size) query.set("page_size", params.page_size);
            if (params.search) query.set("search", params.search);
            if (params.ordering) query.set("ordering", params.ordering);

            const queryString = query.toString();
            const url = queryString
                ? `/api/v1/inventory-movements/?${queryString}`
                : `/api/v1/inventory-movements/`;

            return await ApiClient.get(url);
        } catch (error) {
            console.error(`[INVENTARIO SERVICE] Error al listar todos los movimientos:`, error);
            throw error;
        }
    }

    /**
     * Obtiene el detalle de un movimiento específico
     * @param {number} idMovement
     */
    async function obtenerMovimientoPorId(idMovement) {
        try {
            return await ApiClient.get(`/api/v1/inventory-movements/${idMovement}/`);
        } catch (error) {
            console.error(`[INVENTARIO SERVICE] Error al obtener detalle de movimiento:`, error);
            throw error;
        }
    }

    return Object.freeze({
        listarInventario,
        listarInventarioPaginado,
        obtenerInventarioPorId,
        crearInventario,
        actualizarUmbrales,
        desactivarInventario,
        activarInventario,
        registrarEntrada,
        registrarSalida,
        registrarAjuste,
        listarMovimientos,
        listarTodosMovimientos,
        obtenerMovimientoPorId,
    });
})();

export default InventarioService;
