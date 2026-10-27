import ApiClient from "../core/apiClient.js";

/**
 * CompanyInfoService
 *
 * Servicio frontend para consumir el API de información de empresa.
 * Usado por tickets POS, encabezados y configuración del sistema.
 */
const CompanyInfoService = (() => {
  const ENDPOINT = "/api/v1/company-info/";
  let _empresaActualCache = null;

  function invalidarCache() {
    _empresaActualCache = null;
  }

  // Obtener la empresa activa actual (singleton) con soporte de caché.
  async function obtenerEmpresaActual(forceRefresh = false) {
    try {
      if (!forceRefresh && _empresaActualCache) {
        return _empresaActualCache;
      }
      const response = await ApiClient.get(`${ENDPOINT}current/`);
      if (response && response.ok && response.success) {
        _empresaActualCache = response;
      }
      return response;
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
      const response = await ApiClient.post(ENDPOINT, data);
      invalidarCache();
      return response;
    } catch (error) {
      console.error("[COMPANY INFO SERVICE] Error al crear empresa:", error);
      throw error;
    }
  }

  // Actualizar empresa (PATCH parcial).
  async function actualizarEmpresa(id, data) {
    try {
      const response = await ApiClient.patch(`${ENDPOINT}${id}/`, data);
      invalidarCache();
      return response;
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
      const response = await ApiClient.postForm(`${ENDPOINT}${id}/upload-logo/`, formData);
      invalidarCache();
      return response;
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
    invalidarCache,
  });
})();

export default CompanyInfoService;
