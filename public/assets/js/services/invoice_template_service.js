import ApiClient from "../core/apiClient.js";

const InvoiceTemplateService = (function () {
  const API_URL = "/api/v1/invoices/templates/";

  async function getActiveTemplate(documentType) {
    try {
      const response = await ApiClient.get(API_URL, {
        document_type: documentType,
        is_active: "true"
      });
      if (response.success && response.data && response.data.length > 0) {
        // Return the first active template, preferably default
        return response.data.find(t => t.is_default) || response.data[0];
      }
      return null;
    } catch (error) {
      console.error("[InvoiceTemplateService] Error al obtener template:", error);
      return null;
    }
  }

  return Object.freeze({
    getActiveTemplate
  });
})();

window.InvoiceTemplateService = InvoiceTemplateService;
export default InvoiceTemplateService;
