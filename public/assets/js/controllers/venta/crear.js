/**
 * ============================================================
 * Inventario PME
 * Venta Create Controller (Registrar Venta)
 * ============================================================
 */

import VentaService from "../../services/venta_service.js";
import ClienteService from "../../services/cliente_service.js";
import ProductoService from "../../services/producto_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";

const CrearVentaController = (() => {
  const FORM_ID = "form_crear_venta";
  const TABLE_BODY = "#tabla_detalles_venta tbody";
  const SELECT_CLIENT = "#customer_id"; // Ajustado al nombre del campo en el JSON de Swagger
  const SELECT_PRODUCT = "#search_product";
  const BTN_ADD_PRODUCT = "#btn_add_product";

  let saleDetails = []; // Arreglo para almacenar los detalles de la venta en memoria

  async function initClientSelect() {
    try {
      const response = await ClienteService.listarClientes();
      const select = $(SELECT_CLIENT);

      select
        .empty()
        .append('<option value="">Seleccione un cliente...</option>');

      if (response && response.success && response.data) {
        const clientes = response.data.results || response.data;

        clientes.forEach((cli) => {
          if (cli.is_active) {
            const doc = cli.document_number ? ` - ${cli.document_number}` : "";
            const name =
              cli.business_name ||
              `${cli.first_name || ""} ${cli.last_name || ""}`.trim();
            select.append(
              new Option(
                `${name}${doc}`,
                cli.id_customer,
                false,
                false,
              ),
            );
          }
        });
      }

      select.select2({
        theme: "bootstrap4",
        placeholder: "Buscar cliente...",
        allowClear: true,
      });
    } catch (error) {
      console.error("[VENTAS] Error al cargar clientes:", error);
      NotificationService.toastError("No se pudieron cargar los clientes.");
    }
  }

  async function initProductSelect() {
    try {
      const response = await ProductoService.listarProductos();
      const select = $(SELECT_PRODUCT);

      select
        .empty()
        .append('<option value="">Seleccione un producto...</option>');

      if (response && response.success && response.data) {
        const productos = response.data.results || response.data;

        productos.forEach((prod) => {
          if (prod.is_active) {
            select.append(
              $("<option></option>")
                .val(prod.id_product || prod.id)
                .text(
                  `[${prod.code || "S/N"}] ${prod.name} (Stock: ${prod.stock || 0})`,
                )
                .data("price", prod.sale_price || prod.price || 0)
                .data("code", prod.code || "S/N")
                .data("name", prod.name)
                .data("stock", prod.stock || 0),
            );
          }
        });
      }

      select.select2({
        theme: "bootstrap4",
        placeholder: "Buscar producto por código o nombre...",
        allowClear: true,
      });

      // Autocompletar el precio de venta cuando se selecciona un producto
      select.on("change", function () {
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
      console.error("[VENTAS] Error al cargar productos:", error);
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
      const discountStr = $("#add_discount_item").val() || "0.00"; // Descuento por ítem opcional

      const quantity = parseFloat(qtyStr);
      const unitPrice = parseFloat(priceStr);
      const itemDiscount = parseFloat(discountStr);
      const stockAvailable = parseFloat(select.data("stock") || 0);

      if (isNaN(quantity) || quantity <= 0) {
        NotificationService.toastError("La cantidad debe ser mayor a 0.");
        return;
      }

      if (quantity > stockAvailable) {
        NotificationService.toastError(
          `Stock insuficiente. Disponible: ${stockAvailable}`,
        );
        return;
      }

      if (isNaN(unitPrice) || unitPrice < 0) {
        NotificationService.toastError("El precio unitario no es válido.");
        return;
      }

      const subtotal = quantity * unitPrice - itemDiscount;

      // Verificar si ya existe en el detalle para sumarlo
      const existingIndex = saleDetails.findIndex(
        (item) => item.product_id == productId,
      );

      if (existingIndex !== -1) {
        const nuevaCantidadTotal =
          saleDetails[existingIndex].quantity + quantity;
        if (nuevaCantidadTotal > stockAvailable) {
          NotificationService.toastError(
            `Supera el stock disponible (${stockAvailable}).`,
          );
          return;
        }
        saleDetails[existingIndex].quantity = nuevaCantidadTotal;
        saleDetails[existingIndex].unit_price = unitPrice;
        saleDetails[existingIndex].discount = itemDiscount;
        saleDetails[existingIndex].subtotal =
          nuevaCantidadTotal * unitPrice - itemDiscount;
      } else {
        saleDetails.push({
          product_id: productId,
          code: select.data("code"),
          name: select.data("name"),
          quantity: quantity,
          unit_price: unitPrice,
          discount: itemDiscount,
          subtotal: subtotal >= 0 ? subtotal : 0,
        });
      }

      // Limpiar inputs
      $(SELECT_PRODUCT).val("").trigger("change");
      $("#add_quantity").val(1);
      $("#add_price").val("");
      $("#add_discount_item").val("0.00");

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

    if (saleDetails.length === 0) {
      tbody.html(`
        <tr id="empty_details_row">
          <td colspan="7" class="text-center text-muted font-italic py-4">
            No se han agregado productos a la venta.
          </td>
        </tr>
      `);
      $("#gran_total").text("$ 0.00");
      return;
    }

    let total = 0;

    saleDetails.forEach((item, index) => {
      total += item.subtotal;

      const tr = `
        <tr>
          <td>${item.code}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.unit_price)}</td>
          <td>${formatCurrency(item.discount)}</td>
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
    $(TABLE_BODY)
      .off("click", ".btn-remove-item")
      .on("click", ".btn-remove-item", function () {
        const index = $(this).data("index");
        if (index !== undefined && index >= 0 && index < saleDetails.length) {
          saleDetails.splice(index, 1);
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

      // 1. Validar que se haya seleccionado un cliente obligatorio
      const customerId = $(SELECT_CLIENT).val();
      console.log(
        "Valor capturado de customer_id:",
        customerId,
        typeof customerId,
      );
      if (!customerId) {
        NotificationService.error(
          "Debe seleccionar un cliente para registrar la venta.",
          "Cliente Requerido",
        );
        $(SELECT_CLIENT).focus();
        return;
      }

      if (saleDetails.length === 0) {
        NotificationService.error(
          "Debe agregar al menos un producto a la venta.",
          "Venta Vacía",
        );
        return;
      }

      const paymentMethod = $("#payment_method").val() || "CASH";
      const globalDiscount = $("#global_discount").val() || "0.00";
      const globalTax = $("#global_tax").val() || "0.00";
      const notes = $("#notes").val().trim();

      // Estructura exacta para el endpoint
      const payload = {
        customer_id: parseInt(customerId, 10), // Ahora es un número entero válido
        payment_method: paymentMethod,
        discount: parseFloat(globalDiscount).toFixed(2),
        tax: parseFloat(globalTax).toFixed(2),
        notes: notes || "",
        details: saleDetails.map((item) => ({
          product_id: parseInt(item.product_id, 10),
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price).toFixed(2),
          discount: parseFloat(item.discount).toFixed(2),
        })),
      };

      const submitBtn = $("#btn_guardar_venta");

      try {
        submitBtn
          .prop("disabled", true)
          .html('<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...');

        const response = await VentaService.crearVenta(payload);

        if (response && response.success) {
          NotificationService.toastSuccess(
            "Venta creada correctamente en estado PENDING.",
          );
          setTimeout(() => {
            window.location.href = "/frontend-inventario-pme/ventas/listar.php";
          }, 1500);
        } else {
          throw response;
        }
      } catch (error) {
        console.error("[VENTAS] Error al registrar:", error);
        const errorMsg = NotificationService.getApiErrorMessage(
          error,
          "Ocurrió un error al registrar la venta.",
        );
        NotificationService.error(errorMsg);
        submitBtn
          .prop("disabled", false)
          .html('<i class="fas fa-save mr-1"></i>Guardar Venta');
      }
    });
  }

  async function init() {
    await initClientSelect();
    await initProductSelect();

    setupAddProductListener();
    setupRemoveItemListener();
    setupFormSubmitListener();
  }

  return Object.freeze({
    init,
  });
})();

export default CrearVentaController;
