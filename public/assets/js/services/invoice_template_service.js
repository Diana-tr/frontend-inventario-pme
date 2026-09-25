import ApiClient from "../core/apiClient.js";

const InvoiceTemplateService = (function () {
  const API_URL = "/api/v1/invoice-templates/";

  /**
   * Obtiene una plantilla activa por tipo de documento.
   *
   * El endpoint de listado devuelve únicamente información resumida.
   * Por eso, después de encontrar la plantilla, se consulta su endpoint
   * de detalle para obtener header_content, body_content y footer_content.
   *
   * @param {string} documentType
   * @returns {Promise<Object|null>}
   */
  async function getActiveTemplate(documentType) {
    if (!documentType) {
      console.error(
        "[InvoiceTemplateService] documentType es obligatorio.",
      );

      return null;
    }

    try {
      const response = await ApiClient.get(API_URL, {
        document_type: documentType,
        is_active: "true",
      });

      if (!response) {
        console.warn(
          "[InvoiceTemplateService] La API no devolvió respuesta.",
        );

        return null;
      }

      const responseData = response.data ?? response;

      let templates = [];

      if (Array.isArray(responseData)) {
        templates = responseData;
      } else if (Array.isArray(responseData.results)) {
        templates = responseData.results;
      } else if (Array.isArray(responseData.data)) {
        templates = responseData.data;
      } else if (
        responseData.data &&
        Array.isArray(responseData.data.results)
      ) {
        templates = responseData.data.results;
      }

      const activeTemplates = templates.filter((template) => {
        return (
          template &&
          template.document_type === documentType &&
          template.is_active === true
        );
      });

      if (activeTemplates.length === 0) {
        console.warn(
          "[InvoiceTemplateService] No existe una plantilla activa " +
            `para ${documentType}.`,
        );

        return null;
      }

      const selectedTemplate =
        activeTemplates.find((template) => template.is_default === true) ||
        activeTemplates[0];

      if (!selectedTemplate.id) {
        console.error(
          "[InvoiceTemplateService] La plantilla seleccionada " +
            "no contiene ID.",
        );

        return null;
      }

      const detailResponse = await ApiClient.get(
        `${API_URL}${selectedTemplate.id}/`,
      );

      if (!detailResponse) {
        console.error(
          "[InvoiceTemplateService] No se pudo obtener el detalle " +
            `de la plantilla ${selectedTemplate.id}.`,
        );

        return null;
      }

      const detailResponseData = detailResponse.data ?? detailResponse;

      let template = detailResponseData;

      if (
        detailResponseData &&
        detailResponseData.data &&
        typeof detailResponseData.data === "object"
      ) {
        template = detailResponseData.data;
      }

      if (!template || typeof template !== "object") {
        console.error(
          "[InvoiceTemplateService] El detalle de la plantilla " +
            "no tiene un formato válido.",
        );

        return null;
      }

      if (template.document_type !== documentType) {
        console.error(
          "[InvoiceTemplateService] La plantilla recibida no " +
            `corresponde a ${documentType}.`,
          template,
        );

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

      console.log(
        "[InvoiceTemplateService] Plantilla completa obtenida:",
        template,
      );

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
  });
})();

window.InvoiceTemplateService = InvoiceTemplateService;

export default InvoiceTemplateService;

