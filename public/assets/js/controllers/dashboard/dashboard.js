import UsuarioService from "../../services/usuario_service.js";

const DashboardController = (() => {
  async function init() {
    console.log("[DASHBOARD] Inicializando controlador...");
    await cargarTotalUsuarios();
  }

  async function cargarTotalUsuarios() {
    const totalUsuariosElement = document.getElementById("total_usuarios");

    if (!totalUsuariosElement) {
      console.warn(
        "[DASHBOARD] No se encontró el elemento #total_usuarios en el DOM.",
      );
      return;
    }

    try {
      // Llamada al método listarUsuarios() de tu servicio
      const response = await UsuarioService.listarUsuarios();
      console.log("[DASHBOARD] Respuesta de usuarios recibida:", response);

      let total = 0;

      if (response && response.data) {
        // 1. Si Django responde con propiedad 'count' dentro de data (ej. response.data.count)
        if (typeof response.data.count !== "undefined") {
          total = response.data.count;
        }
        // 2. Si responde con el arreglo directo dentro de 'results'
        else if (Array.isArray(response.data.results)) {
          total = response.data.results.length;
        }
        // 3. Si responde con un arreglo directo dentro de 'data'
        else if (Array.isArray(response.data)) {
          total = response.data.length;
        }
      } else if (Array.isArray(response)) {
        total = response.length;
      }

      // Renderizado en el HTML
      totalUsuariosElement.textContent = total;
    } catch (error) {
      console.error(
        "[DASHBOARD] Error al cargar la cantidad de usuarios:",
        error,
      );
      totalUsuariosElement.textContent = "0";
    }
  }

  return Object.freeze({
    init,
  });
})();

export default DashboardController;
