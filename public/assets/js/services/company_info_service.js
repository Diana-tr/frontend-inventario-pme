import ApiClient from "../core/apiClient.js";

/**
 * CompanyInfoService
 *
 * Servicio frontend para consumir el API de información de empresa.
 * Usado por tickets POS, encabezados y configuración del sistema.
 */
const CompanyInfoService = (() => {
  const ENDPOINT = "/api/v1/company-info/";

  // Obtener la empresa activa actual (singleton).
  async function obtenerEmpresaActual() {
    try {
      return await ApiClient.get(`${ENDPOINT}current/`);
    } catch (error) {
      console.error(
        "[COMPANY INFO SERVICE] Error al obtener empresa actual:",
        error,
      );
      throw error;
    }
  }

  // Listar empresas registradas.
  async function listarEmpresas() {
    try {
      return await ApiClient.get(ENDPOINT);
    } catch (error) {
      console.error("[COMPANY INFO SERVICE] Error al listar empresas:", error);
      throw error;
    }
  }

  // Obtener empresa por ID.
  async function obtenerEmpresaPorId(id) {
    try {
      return await ApiClient.get(`${ENDPOINT}${id}/`);
    } catch (error) {
      console.error(
        `[COMPANY INFO SERVICE] Error al obtener empresa ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Crear empresa (primera configuración).
  async function crearEmpresa(data) {
    try {
      return await ApiClient.post(ENDPOINT, data);
    } catch (error) {
      console.error("[COMPANY INFO SERVICE] Error al crear empresa:", error);
      throw error;
    }
  }

  // Actualizar empresa (PATCH parcial).
  async function actualizarEmpresa(id, data) {
    try {
      return await ApiClient.patch(`${ENDPOINT}${id}/`, data);
    } catch (error) {
      console.error(
        `[COMPANY INFO SERVICE] Error al actualizar empresa ${id}:`,
        error,
      );
      throw error;
    }
  }

  // Subir logo de la empresa.
  async function subirLogo(id, logoFile) {
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      return await ApiClient.postForm(`${ENDPOINT}${id}/upload-logo/`, formData);
    } catch (error) {
      console.error(
        `[COMPANY INFO SERVICE] Error al subir logo empresa ${id}:`,
        error,
      );
      throw error;
    }
  }

  return Object.freeze({
    obtenerEmpresaActual,
    listarEmpresas,
    obtenerEmpresaPorId,
    crearEmpresa,
    actualizarEmpresa,
    subirLogo,
  });
})();

export default CompanyInfoService;
