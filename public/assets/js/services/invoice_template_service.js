import ApiClient from "../core/apiClient.js";

const InvoiceTemplateService = (function () {
  const API_URL = "/api/v1/invoice-templates/";
  const _templateCache = new Map();

  /**
   * Invalida la caché de plantillas (global o por documentType)
   * @param {string|null} documentType
   */
  function invalidarCache(documentType = null) {
    if (documentType) {
      _templateCache.delete(documentType);
    } else {
      _templateCache.clear();
    }
  }

  /**
   * Obtiene una plantilla activa por tipo de documento.
   *
   * Utiliza caché en memoria para evitar múltiples consultas HTTP idénticas
   * en la impresión y previsualización de facturas o tickets POS.
   *
   * @param {string} documentType
   * @param {boolean} forceRefresh
   * @returns {Promise<Object|null>}
   */
  async function getActiveTemplate(documentType, forceRefresh = false) {
    if (!documentType) {
      console.error(
        "[InvoiceTemplateService] documentType es obligatorio.",
      );

      return null;
    }

    if (!forceRefresh && _templateCache.has(documentType)) {
      return _templateCache.get(documentType);
    }

    try {
      const response = await ApiClient.get(API_URL, {
        document_type: documentType,
        is_active: "true",
      });

      if (!response || !response.ok) {
        console.warn("[InvoiceTemplateService] La API devolvió un error o no hay respuesta.");
        return null;
      }

      // ApiClient propaga el JSON en el primer nivel. 
      // Puede estar en 'data' (nuestro estándar) o en 'results' (paginación DRF nativa)
      let templates = [];
      if (Array.isArray(response.data)) {
        templates = response.data;
      } else if (Array.isArray(response.results)) {
        templates = response.results;
      } else if (response.data && Array.isArray(response.data.results)) {
        templates = response.data.results;
      }

      const activeTemplates = templates.filter((template) => {
        return (
          template &&
          template.document_type === documentType &&
          template.is_active === true
        );
      });

      if (activeTemplates.length === 0) {
        console.warn(`[InvoiceTemplateService] No existe una plantilla activa para ${documentType}.`);
        return null;
      }

      const selectedTemplate = activeTemplates.find((t) => t.is_default) || activeTemplates[0];

      if (!selectedTemplate.id) {
        console.error("[InvoiceTemplateService] La plantilla seleccionada no contiene ID.");
        return null;
      }

      const detailResponse = await ApiClient.get(`${API_URL}${selectedTemplate.id}/`);

      if (!detailResponse || !detailResponse.ok) {
        console.error(`[InvoiceTemplateService] No se pudo obtener el detalle de la plantilla ${selectedTemplate.id}.`);
        return null;
      }

      // Para el detalle, la data viene en detailResponse.data o directamente propagada en detailResponse
      const template = detailResponse.data || detailResponse;

      if (!template || typeof template !== "object") {
        console.error("[InvoiceTemplateService] El detalle de la plantilla no tiene un formato válido.");
        return null;
      }

      if (template.document_type !== documentType) {
        console.error(`[InvoiceTemplateService] La plantilla recibida no corresponde a ${documentType}.`, template);
        return null;
      }

      if (template.is_active !== true) {
        console.error(
          "[InvoiceTemplateService] La plantilla recibida está " +
            "inactiva.",
        );

        return null;
      }

      const hasContent =
        Boolean(template.header_content) ||
        Boolean(template.body_content) ||
        Boolean(template.footer_content);

      if (!hasContent) {
        console.error(
          "[InvoiceTemplateService] La plantilla no contiene " +
            "header_content, body_content ni footer_content.",
          template,
        );

        return null;
      }

      // Guardar en caché en memoria
      _templateCache.set(documentType, template);

      return template;
    } catch (error) {
      console.error(
        "[InvoiceTemplateService] Error al obtener la plantilla:",
        error,
      );

      return null;
    }
  }

  return Object.freeze({
    getActiveTemplate,
    invalidarCache,
  });
})();

window.InvoiceTemplateService = InvoiceTemplateService;

export default InvoiceTemplateService;

