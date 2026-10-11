<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../layouts/head.php';
?>

<!-- Select2 CSS -->
<link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/css/select2.min.css">
<link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2-bootstrap4-theme/select2-bootstrap4.min.css">
<!-- Custom POS CSS -->
<style>
    .pos-cart-container {
        height: 400px;
        overflow-y: auto;
    }

    .pos-product-list td {
        vertical-align: middle;
    }

    .amount-input {
        font-size: 1.5rem;
        font-weight: bold;
        text-align: right;
    }

    .total-display {
        font-size: 2.5rem;
        font-weight: bold;
        color: #16A34A;
    }

    .change-display {
        font-size: 1.5rem;
        font-weight: bold;
        color: #0EA5E9;
    }
</style>

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">
        <!-- Preloader -->
        <div class="preloader flex-column justify-content-center align-items-center">
            <img class="animation__shake" src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo inventario PME" height="60" width="60">
        </div>

        <?php
        require_once __DIR__ . '/../layouts/navbar.php';
        require_once __DIR__ . '/../layouts/sidebar.php';
        ?>

        <div class="content-wrapper" style="background-color: #F4F6F9;">
            <div class="content-header">
                <div class="container-fluid" style="max-width: 1350px;">
                    <div class="row mb-2 align-items-center">
                        <div class="col-sm-6">
                            <h1 class="m-0 text-dark font-weight-bold" style="font-size: 1.6rem;">
                                <i class="fas fa-cash-register text-primary mr-2"></i>Punto de Venta (POS)
                            </h1>
                        </div>
                        <div class="col-sm-6 text-right">
                            <span class="badge badge-light border px-3 py-2 shadow-sm font-weight-bold text-dark" style="font-size: 0.95rem; border-radius: 20px;" id="clock_display">
                                <i class="far fa-clock text-primary mr-1"></i> --:--:--
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <section class="content">
                <div class="container-fluid" style="max-width: 1350px;">
                    <div class="row">
                        <!-- Izquierda: Búsqueda y Carrito -->
                        <div class="col-lg-8 mb-4 mb-lg-0">
                            <div class="card shadow-sm border-0 h-100" style="border-radius: 12px; overflow: hidden;">
                                <div class="card-body p-4">
                                    <div class="row mb-3">
                                        <div class="col-md-12">
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text bg-white border-right-0"><i class="fas fa-barcode text-primary"></i></span>
                                                </div>
                                                <select id="pos_search_product" class="form-control border-left-0" style="width: 100%;"></select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="table-responsive pos-cart-container border rounded shadow-sm bg-white">
                                        <table class="table table-hover table-striped pos-product-list mb-0 text-center align-middle" id="pos_cart_table">
                                            <thead style="background-color: #1E293B; color: #FFFFFF; font-size: 0.85rem;" class="sticky-top">
                                                <tr>
                                                    <th id="pos_cart_counter_th" class="text-center" style="width:70px;">#</th>
                                                    <th style="width: 15%;">Código</th>
                                                    <th style="width: 33%; text-align: left;">Producto</th>
                                                    <th class="text-right" style="width: 15%;">Precio</th>
                                                    <th class="text-center" style="width: 12%;">Cant.</th>
                                                    <th class="text-right" style="width: 15%;">Subtotal</th>
                                                    <th style="width: 10%;"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr id="empty_cart_row">
                                                    <td colspan="7" class="text-muted py-5" style="background-color: #FAFAFA;">
                                                        <i class="fas fa-shopping-cart fa-3x mb-3 text-secondary" style="opacity: 0.4;"></i>
                                                        <h5 class="font-weight-bold text-dark">Carrito vacío</h5>
                                                        <p class="text-sm mb-0">Busque productos por código o nombre para agregarlos a la venta</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Derecha: Resumen y Pago -->
                        <div class="col-lg-4">
                            <div class="card shadow-sm border-0" style="border-radius: 12px; overflow: hidden;">
                                <div class="card-header bg-primary text-white py-3">
                                    <h3 class="card-title font-weight-bold mb-0" style="font-size: 1rem;">
                                        <i class="fas fa-receipt mr-2"></i>Resumen de Venta
                                    </h3>
                                </div>
                                <div class="card-body p-4">
                                    <form id="form_pos_sale" autocomplete="off">
                                        <div class="form-group mb-3">
                                            <label class="font-weight-bold text-secondary">Cliente</label>
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text bg-light border-right-0"><i class="fas fa-user text-muted"></i></span>
                                                </div>
                                                <div class="select2-primary flex-fill">
                                                    <select class="form-control select2-customer border-left-0" id="pos_customer_id" style="width: 100%;">
                                                        <option value="">Consumidor Final</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="form-group mb-3">
                                            <label class="font-weight-bold text-secondary">Método de Pago</label>
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text bg-light border-right-0"><i class="fas fa-wallet text-muted"></i></span>
                                                </div>
                                                <select class="form-control border-left-0" id="pos_payment_method">
                                                    <option value="CASH">Efectivo</option>
                                                    <option value="CARD">Tarjeta</option>
                                                    <option value="TRANSFER">Transferencia</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div class="form-group mb-4 bg-light p-3 rounded border">
                                            <div class="custom-control custom-switch custom-switch-off-danger custom-switch-on-success">
                                                <input type="checkbox" class="custom-control-input" id="pos_generate_invoice">
                                                <label class="custom-control-label font-weight-bold text-dark" for="pos_generate_invoice">Generar Factura Formal</label>
                                            </div>
                                            <small class="form-text text-muted mt-1">Si está apagado, solo se generará un ticket interno.</small>
                                        </div>

                                        <hr class="my-3">

                                        <div class="d-flex justify-content-between mb-2 text-secondary font-weight-bold">
                                            <span>Subtotal:</span>
                                            <span id="pos_subtotal" class="text-dark">$0.00</span>
                                        </div>

                                        <div class="d-flex justify-content-between mb-3 align-items-center">
                                            <span class="text-secondary font-weight-bold">Descuento global <i class="fas fa-lock text-muted" id="discount_lock_icon" style="display:none;" title="Requiere permisos"></i>:</span>
                                            <div class="input-group input-group-sm w-50">
                                                <div class="input-group-prepend"><span class="input-group-text bg-light">$</span></div>
                                                <input type="number" id="pos_global_discount" class="form-control text-right font-weight-bold" value="0.00" min="0" step="0.01">
                                            </div>
                                        </div>

                                        <div class="text-center rounded p-3 mb-3 border shadow-sm" style="background-color: #F8FAFC; border-color: #16A34A !important;">
                                            <span class="d-block text-uppercase font-weight-bold mb-1 text-muted" style="font-size: 0.8rem; letter-spacing: 0.5px;">Total a Pagar</span>
                                            <div class="total-display" id="pos_total_display">$0.00</div>
                                        </div>

                                        <div class="form-group mb-3" id="cash_payment_section">
                                            <label class="font-weight-bold text-secondary">Efectivo Recibido</label>
                                            <div class="input-group mb-2">
                                                <div class="input-group-prepend"><span class="input-group-text bg-light"><i class="fas fa-money-bill-wave text-success"></i></span></div>
                                                <input type="number" id="pos_amount_received" class="form-control amount-input text-success" placeholder="0" step="100">
                                            </div>
                                            <!-- Denominaciones dinámicas -->
                                            <div class="d-flex justify-content-between flex-wrap btn-group-sm gap-1" id="quick_cash_buttons"></div>
                                        </div>

                                        <div class="d-flex justify-content-between align-items-center mb-4 bg-light px-3 py-2 rounded border" id="change_section">
                                            <span class="font-weight-bold text-secondary">Cambio:</span>
                                            <span id="pos_change_display" class="change-display">$0.00</span>
                                        </div>

                                        <button type="submit" class="btn btn-success btn-lg btn-block font-weight-bold shadow-sm py-2 mb-2" id="btn_process_sale" style="border-radius: 8px;">
                                            <i class="fas fa-check-circle mr-2"></i> Procesar Venta (F2)
                                        </button>
                                        <button type="button" class="btn btn-outline-secondary btn-block font-weight-bold" id="btn_cancel_pos" style="border-radius: 8px;">
                                            <i class="fas fa-times mr-2"></i> Cancelar (ESC)
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <?php require_once __DIR__ . '/../layouts/footer.php'; ?>
    </div>

    <!-- Modal para impresión de Ticket -->
    <div class="modal fade" id="modal_print_ticket" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
        <div class="modal-dialog modal-sm" role="document">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px; overflow: hidden;">
                <div class="modal-header bg-success text-white py-3">
                    <h5 class="modal-title font-weight-bold"><i class="fas fa-check-circle mr-2"></i> Venta Exitosa</h5>
                </div>
                <div class="modal-body text-center px-4 py-4">
                    <i class="fas fa-check-circle text-success fa-3x mb-2"></i>
                    <h4 class="font-weight-bold mb-0 text-dark">¡Cobro realizado!</h4>
                    <p class="text-muted text-sm mb-3">La venta se registró correctamente.</p>

                    <!-- Desglose de la venta -->
                    <div class="text-left small border rounded p-3 mb-3 bg-light shadow-sm" id="modal_sale_breakdown">
                        <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted">Subtotal:</span>
                            <span id="modal_breakdown_subtotal" class="font-weight-bold">$0.00</span>
                        </div>
                        <div class="d-flex justify-content-between mb-1" id="modal_breakdown_discount_row">
                            <span class="text-muted">Descuento:</span>
                            <span id="modal_breakdown_discount" class="text-warning font-weight-bold">$0.00</span>
                        </div>
                        <hr class="my-2">
                        <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted font-weight-bold">Total:</span>
                            <span id="modal_breakdown_total" class="text-success font-weight-bold">$0.00</span>
                        </div>
                        <div class="d-flex justify-content-between" id="modal_breakdown_received_row">
                            <span class="text-muted">Recibido:</span>
                            <span id="modal_breakdown_received" class="font-weight-bold">$0.00</span>
                        </div>
                    </div>

                    <div class="bg-success text-white rounded py-2 px-3 mb-1 shadow-sm">
                        <div class="text-sm font-weight-light">Cambio a entregar</div>
                        <div class="h2 font-weight-bold mb-0" id="modal_change_amount">$0.00</div>
                    </div>
                </div>
                <div class="modal-footer flex-column pt-0 pb-4 px-4 bg-white border-0">
                    <button type="button" class="btn btn-primary btn-block btn-lg font-weight-bold shadow-sm mb-2" id="btn_print_ticket" style="border-radius: 8px;">
                        <i class="fas fa-print mr-2"></i> Imprimir Ticket
                    </button>
                    <button type="button" class="btn btn-outline-secondary btn-block font-weight-bold mt-0" id="btn_new_sale" data-dismiss="modal" style="border-radius: 8px;">
                        <i class="fas fa-arrow-right mr-1"></i> Siguiente Venta
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Iframe oculto para imprimir -->
    <iframe id="print_frame" name="print_frame" style="display:none;"></iframe>

    <!-- Select2 JS -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/select2.full.min.js"></script>
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/i18n/es.js"></script>

    <!-- Script de inicialización de POS -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import POSController from "<?php echo $URL; ?>/public/assets/js/controllers/venta/pos.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            if (typeof POSController.init === "function") {
                POSController.init();
            }
        });
    </script>
</body>

</html>