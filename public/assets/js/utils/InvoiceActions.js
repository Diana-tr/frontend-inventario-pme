/**
 * ============================================================
 * Inventario PME
 * Invoice Actions Utility
 * ============================================================
 *
 * Encapsula la lógica reutilizable para la previsualización
 * y la impresión silenciosa de facturas (Ventas o Compras).
 */

import NotificationService from "../core/notification.js";
import DocumentTemplateRenderer from "./DocumentTemplateRenderer.js";
import { renderInvoiceItems } from "./invoice_utils.js";

const InvoiceActions = (() => {
  /**
   * Helper para formatear fechas.
   */
  function formatDate(isoStr) {
    if (!isoStr) return "N/A";
    const date = new Date(isoStr);
    return date.toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  /**
   * Helper para generar el badge de estado.
   */
  function getStatusBadge(status) {
    const badges = {
      DRAFT:
        '<span class="badge badge-warning px-3 py-2" style="border-radius:20px;font-size:0.75rem">Borrador</span>',
      ISSUED:
        '<span class="badge badge-success px-3 py-2" style="border-radius:20px;font-size:0.75rem">Emitida</span>',
      CANCELLED:
        '<span class="badge badge-danger px-3 py-2" style="border-radius:20px;font-size:0.75rem">Anulada</span>',
    };
    return (
      badges[status] ||
      `<span class="badge badge-secondary px-3 py-2" style="border-radius:20px;font-size:0.75rem">${status}</span>`
    );
  }

  /**
   * Carga y muestra los detalles de una factura en un modal específico.
   *
   * @param {number|string} invoiceId - ID de la factura.
   * @param {Object} options - Opciones de configuración.
   * @param {Function} options.fetchFn - Función asíncrona que retorna `{ success, data }` para la factura.
   * @param {string} options.modalId - ID del contenedor modal (ej. "modalVisualizarFactura").
   */
  async function viewInvoice(invoiceId, options = {}) {
    const { fetchFn, modalId } = options;
    
    if (!fetchFn) {
      console.error("[InvoiceActions] Faltan opciones requeridas (fetchFn).");
      return;
    }

    $("#factura_modal_loader").show();
    $("#factura_modal_content").hide();
    $(`#${modalId}`).modal("show");

    try {
      const response = await fetchFn(invoiceId);

      if (response && response.success && response.data) {
        const factura = response.data;

        // Llenar datos básicos en la UI compartida
        $("#factura_modal_number").text(factura.invoice_number || factura.id);
        $("#factura_modal_date").text(
          factura.issue_date ? formatDate(factura.issue_date) : "N/A"
        );
        $("#factura_modal_status").html(getStatusBadge(factura.status));
        
        const reference = factura.sale ? `Venta #${factura.sale}` : (factura.purchase ? `Compra #${factura.purchase}` : "N/A");
        $("#factura_modal_sale").text(reference);
        $("#factura_modal_notes").text(factura.notes || "Sin observaciones");

        // Preparar plantilla y datos
        if (typeof DocumentTemplateRenderer !== 'undefined') {
          const normalizedCompanyData = {
            name: factura.company_name_snapshot,
            tax_id: factura.company_tax_id_snapshot,
            address: factura.company_address_snapshot,
            phone: factura.company_phone_snapshot,
            email: factura.company_email_snapshot,
            city: factura.company_city_snapshot,
            receipt_footer: factura.company_receipt_footer_snapshot
          };

          const normalizedDocumentData = {
            document_number: factura.invoice_number,
            document_date: factura.issue_date || factura.created_at,
            customer_name: factura.customer_name || "Cliente / Proveedor",
            subtotal: factura.subtotal,
            discount: factura.discount,
            tax: factura.tax,
            total: factura.total,
            amount_received: factura.amount_received,
            change_amount: factura.change_amount,
            items: (factura.items || []).map(item => ({
              product_name: item.product_name || item.product,
              quantity: item.quantity,
              unit_price: item.unit_price,
              subtotal: item.subtotal
            }))
          };

          const renderer = new DocumentTemplateRenderer(factura.template, normalizedDocumentData, normalizedCompanyData);
          
          if (factura.template) {
            if (factura.template.body_content) {
               $("#factura_modal_header_template").empty();
               $("#factura_modal_footer_template").empty();
               $("#factura_modal_items").closest('table').parent().html(renderer.render());
            } else {
               $("#factura_modal_header_template").html(renderer._parseTemplate(factura.template.header_content || ""));
               $("#factura_modal_footer_template").html(renderer._parseTemplate(factura.template.footer_content || ""));
               renderInvoiceItems(factura.items, "#factura_modal_items");
            }
          }
        }

        // Asignar ID al botón de impresión dentro del modal si existe
        $(".btn-print-invoice-modal").data("id", factura.id);

        $("#factura_modal_loader").hide();
        $("#factura_modal_content").fadeIn();
      } else {
        throw new Error("Respuesta inválida al consultar la factura.");
      }
    } catch (error) {
      console.error("[InvoiceActions] Error al obtener detalle de factura:", error);
      $(`#${modalId}`).modal("hide");
      NotificationService.toastError("No se pudo cargar el detalle de la factura.");
    }
  }

  /**
   * Obtiene la factura y la envía de forma silenciosa al cuadro de diálogo
   * de impresión del navegador mediante un iframe oculto.
   *
   * @param {number|string} invoiceId - ID de la factura.
   * @param {Object} options - Opciones de configuración.
   * @param {Function} options.fetchFn - Función asíncrona para obtener la factura.
   * @param {jQuery} options.$btn - Botón jQuery que disparó la acción para manejar estado de carga.
   */
  async function printInvoice(invoiceId, options = {}) {
    const { fetchFn, $btn } = options;

    if (!fetchFn) {
      console.error("[InvoiceActions] Faltan opciones requeridas (fetchFn) para imprimir.");
      return;
    }

    let originalHtml = "";
    if ($btn && $btn.length) {
      originalHtml = $btn.html();
      $btn.prop("disabled", true).html('<i class="fas fa-spinner fa-spin mr-1"></i> Cargando...');
    }

    try {
      const response = await fetchFn(invoiceId);

      if (response && response.success && response.data) {
        const factura = response.data;
        const template = factura.template;
        
        if (!template) {
          NotificationService.toastError("La factura no tiene una plantilla asociada.");
          return;
        }

        if (typeof DocumentTemplateRenderer !== 'undefined') {
          const normalizedCompanyData = {
            name: factura.company_name_snapshot,
            tax_id: factura.company_tax_id_snapshot,
            address: factura.company_address_snapshot,
            phone: factura.company_phone_snapshot,
            email: factura.company_email_snapshot,
            city: factura.company_city_snapshot,
            receipt_footer: factura.company_receipt_footer_snapshot
          };

          const normalizedDocumentData = {
            document_number: factura.invoice_number,
            document_date: factura.issue_date || factura.created_at,
            customer_name: factura.customer_name || "Cliente / Proveedor",
            subtotal: factura.subtotal,
            discount: factura.discount,
            tax: factura.tax,
            total: factura.total,
            amount_received: factura.amount_received,
            change_amount: factura.change_amount,
            items: (factura.items || []).map(item => ({
              product_name: item.product_name || item.product,
              quantity: item.quantity,
              unit_price: item.unit_price,
              subtotal: item.subtotal
            }))
          };

          const renderer = new DocumentTemplateRenderer(template, normalizedDocumentData, normalizedCompanyData);
          const printHtml = renderer.renderForPrint("300px");

          let printIframe = document.getElementById("hidden-print-iframe");
          if (!printIframe) {
            printIframe = document.createElement("iframe");
            printIframe.id = "hidden-print-iframe";
            printIframe.style.position = "fixed";
            printIframe.style.right = "0";
            printIframe.style.bottom = "0";
            printIframe.style.width = "0";
            printIframe.style.height = "0";
            printIframe.style.border = "0";
            document.body.appendChild(printIframe);
          }

          const doc = printIframe.contentWindow.document;
          doc.open();
          doc.write(printHtml);
          doc.close();

          setTimeout(() => {
            printIframe.contentWindow.focus();
            printIframe.contentWindow.print();
          }, 250);
        }
      } else {
        NotificationService.toastError("No se pudo obtener la información de la factura.");
      }
    } catch (error) {
      console.error("[InvoiceActions] Error al imprimir:", error);
      NotificationService.toastError("Error al generar la impresión.");
    } finally {
      if ($btn && $btn.length) {
        $btn.prop("disabled", false).html(originalHtml);
      }
    }
  }

  return Object.freeze({
    viewInvoice,
    printInvoice
  });
})();

export const { viewInvoice, printInvoice } = InvoiceActions;
export default InvoiceActions;
