/**
 * ============================================================
 * Inventario PME
 * Purchase Create Controller (Registrar Compra)
 * ============================================================
 */

import CompraService from "../../services/compra_service.js";
import ProveedorService from "../../services/proveedor_service.js";
import ProductoService from "../../services/producto_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";

const CrearCompraController = (() => {
  const FORM_ID = "form_crear_compra";
  const TABLE_BODY = "#tabla_detalles_compra tbody";
  const SELECT_SUPPLIER = "#supplier_id";
  const SELECT_PRODUCT = "#search_product";
  const BTN_ADD_PRODUCT = "#btn_add_product";
  
  let purchaseDetails = []; // Arreglo para almacenar los detalles de la compra en memoria

  async function initSupplierSelect() {
    try {
      const response = await ProveedorService.listarProveedores();
      const select = $(SELECT_SUPPLIER);
      
      select.empty().append('<option value="">Seleccione un proveedor...</option>');
      
      if (response && response.success && response.data) {
        // En listarProveedores() de DRF normalmente se devuelve un array, o .results si es paginado.
        // Si no está paginado:
        const proveedores = response.data.results || response.data;
        
        proveedores.forEach(prov => {
          if (prov.is_active) {
            const doc = prov.document_number ? ` - ${prov.document_number}` : '';
            const name = prov.business_name || `${prov.first_name || ''} ${prov.last_name || ''}`.trim();
            select.append(new Option(`${name}${doc}`, prov.id_supplier || prov.id, false, false));
          }
        });
      }
      
      select.select2({
        theme: "bootstrap4",
        placeholder: "Buscar proveedor...",
        allowClear: true
      });
    } catch (error) {
      console.error("[COMPRAS] Error al cargar proveedores:", error);
      NotificationService.toastError("No se pudieron cargar los proveedores.");
    }
  }

  async function initProductSelect() {
    try {
      // Suponemos que ProductoService tiene listarProductos() o similar
      const response = await ProductoService.listarProductos();
      const select = $(SELECT_PRODUCT);
      
      select.empty().append('<option value="">Seleccione un producto...</option>');
      
      if (response && response.success && response.data) {
        const productos = response.data.results || response.data;
        
        productos.forEach(prod => {
          if (prod.is_active) {
            select.append(
              $("<option></option>")
                .val(prod.id_product || prod.id)
                .text(`[${prod.code || 'S/N'}] ${prod.name}`)
                .data("price", prod.purchase_price || prod.price || 0)
                .data("code", prod.code || 'S/N')
                .data("name", prod.name)
            );
          }
        });
      }
      
      select.select2({
        theme: "bootstrap4",
        placeholder: "Buscar producto por código o nombre...",
        allowClear: true
      });

      // Autocompletar el precio cuando se selecciona un producto
      select.on("change", function() {
        const selected = $(this).find(":selected");
        if (selected.val()) {
          const defaultPrice = selected.data("price") || 0;
          $("#add_price").val(defaultPrice);
          $("#add_quantity").val(1).focus();
        } else {
          $("#add_price").val("");
          $("#add_quantity").val(1);
        }
      });
    } catch (error) {
      console.error("[COMPRAS] Error al cargar productos:", error);
      NotificationService.toastError("No se pudieron cargar los productos.");
    }
  }

  function setupAddProductListener() {
    $(BTN_ADD_PRODUCT).on("click", function () {
      const select = $(SELECT_PRODUCT).find(":selected");
      const productId = select.val();
      
      if (!productId) {
        NotificationService.toastError("Debe seleccionar un producto.");
        return;
      }
      
      const qtyStr = $("#add_quantity").val();
      const priceStr = $("#add_price").val();
      
      const quantity = parseFloat(qtyStr);
      const unitPrice = parseFloat(priceStr);
      
      if (isNaN(quantity) || quantity <= 0) {
        NotificationService.toastError("La cantidad debe ser mayor a 0.");
        return;
      }
      
      if (isNaN(unitPrice) || unitPrice < 0) {
        NotificationService.toastError("El precio unitario no es válido.");
        return;
      }
      
      // Verificar si ya existe en el detalle para sumarlo
      const existingIndex = purchaseDetails.findIndex(item => item.product_id == productId);
      
      if (existingIndex !== -1) {
        purchaseDetails[existingIndex].quantity += quantity;
        purchaseDetails[existingIndex].unit_price = unitPrice; // Actualiza al último precio digitado
        purchaseDetails[existingIndex].subtotal = purchaseDetails[existingIndex].quantity * unitPrice;
      } else {
        purchaseDetails.push({
          product_id: productId,
          code: select.data("code"),
          name: select.data("name"),
          quantity: quantity,
          unit_price: unitPrice,
          subtotal: quantity * unitPrice
        });
      }
      
      // Limpiar inputs
      $(SELECT_PRODUCT).val("").trigger("change");
      $("#add_quantity").val(1);
      $("#add_price").val("");
      
      renderTable();
    });
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  function renderTable() {
    const tbody = $(TABLE_BODY);
    tbody.empty();
    
    if (purchaseDetails.length === 0) {
      tbody.html(`
        <tr id="empty_details_row">
          <td colspan="6" class="text-center text-muted font-italic py-4">
            No se han agregado productos a la compra.
          </td>
        </tr>
      `);
      $("#gran_total").text("$ 0.00");
      return;
    }
    
    let total = 0;
    
    purchaseDetails.forEach((item, index) => {
      total += item.subtotal;
      
      const tr = `
        <tr>
          <td>${item.code}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.unit_price)}</td>
          <td class="font-weight-bold">${formatCurrency(item.subtotal)}</td>
          <td>
            <button type="button" class="btn btn-sm btn-outline-danger btn-remove-item" data-index="${index}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
      tbody.append(tr);
    });
    
    $("#gran_total").text(formatCurrency(total));
  }

  function setupRemoveItemListener() {
    $(TABLE_BODY).off("click", ".btn-remove-item").on("click", ".btn-remove-item", function () {
      const index = $(this).data("index");
      if (index !== undefined && index >= 0 && index < purchaseDetails.length) {
        purchaseDetails.splice(index, 1);
        renderTable();
      }
    });
  }

  function setupFormSubmitListener() {
    $(`#${FORM_ID}`).on("submit", async function (e) {
      e.preventDefault();
      
      const form = this;
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add("was-validated");
        return;
      }
      
      if (purchaseDetails.length === 0) {
        NotificationService.error("Debe agregar al menos un producto a la compra.", "Compra Vacía");
        return;
      }
      
      const supplierId = $(SELECT_SUPPLIER).val();
      const issueDate = $("#issue_date").val();
      const notes = $("#notes").val().trim();
      
      const payload = {
        supplier_id: parseInt(supplierId, 10),
        issue_date: issueDate || null,
        notes: notes || "",
        details: purchaseDetails.map(item => ({
          product_id: parseInt(item.product_id, 10),
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price)
        }))
      };
      
      const submitBtn = $("#btn_guardar_compra");
      
      try {
        submitBtn.prop("disabled", true).html('<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...');
        
        const response = await CompraService.crearCompra(payload);
        
        if (response && response.success) {
          NotificationService.toastSuccess("Compra registrada correctamente en estado Borrador.");
          setTimeout(() => {
            window.location.href = "/frontend-inventario-pme/compras";
          }, 1500);
        } else {
          throw response;
        }
      } catch (error) {
        console.error("[COMPRAS] Error al registrar:", error);
        const errorMsg = NotificationService.getApiErrorMessage(
          error,
          "Ocurrió un error al registrar la compra."
        );
        NotificationService.error(errorMsg);
        submitBtn.prop("disabled", false).html('<i class="fas fa-save mr-1"></i>Guardar Compra');
      }
    });
  }

  async function init() {
    await initSupplierSelect();
    await initProductSelect();
    
    setupAddProductListener();
    setupRemoveItemListener();
    setupFormSubmitListener();
  }

  return Object.freeze({
    init,
  });
})();

export default CrearCompraController;
