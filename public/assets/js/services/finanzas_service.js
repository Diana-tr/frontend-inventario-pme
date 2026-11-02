import ApiClient from "../core/apiClient.js";


const FinanzasService = (() => {
    const ENDPOINT = "/api/v1/cash-sessions/financial-summary";

    /**
     * Obtiene el resumen financiero global del sistema.
     * @returns {Promise<Object>}
     */

    async function obtenerResumenFinanciero() {
        try{
            return await ApiClient.get(ENDPOINT);
        } catch (error){
            console.error("[FINANZAS SERVICE] Error al obtener el resumen financiero:", error);
            throw error;
        }
    }

    return Object.freeze({
        obtenerResumenFinanciero
    });
})();

export default FinanzasService;
