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
    .pos-cart-container { height: 400px; overflow-y: auto; }
    .pos-product-list td { vertical-align: middle; }
    .amount-input { font-size: 1.5rem; font-weight: bold; text-align: right; }
    .total-display { font-size: 2.5rem; font-weight: bold; color: #28a745; }
    .change-display { font-size: 1.5rem; font-weight: bold; color: #17a2b8; }
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

        <div class="content-wrapper">
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0"><i class="fas fa-cash-register mr-2"></i>Punto de Venta (POS)</h1>
                        </div>
                        <div class="col-sm-6 text-right">
                            <span class="badge badge-info" style="font-size: 1rem;" id="clock_display"></span>
                        </div>
                    </div>
                </div>
            </div>

            <section class="content">
                <div class="container-fluid">
                    <div class="row">
                        <!-- Izquierda: Búsqueda y Carrito -->
                        <div class="col-md-8">
                            <div class="card card-primary card-outline shadow-sm">
                                <div class="card-body">
                                    <div class="row mb-3">
                                        <div class="col-md-12">
                                            <div class="input-group input-group-lg">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text"><i class="fas fa-barcode"></i></span>
                                                </div>
                                                <input type="text" id="pos_search_product" class="form-control" placeholder="Buscar producto por código o nombre (Enter para agregar)..." autofocus>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="table-responsive pos-cart-container border rounded">
                                        <table class="table table-hover table-striped pos-product-list mb-0" id="pos_cart_table">
                                            <thead class="bg-light sticky-top">
                                                <tr>
                                                    <th>Código</th>
                                                    <th>Producto</th>
                                                    <th class="text-right" width="15%">Precio</th>
                                                    <th class="text-center" width="15%">Cant.</th>
                                                    <th class="text-right" width="15%">Subtotal</th>
                                                    <th width="5%"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr id="empty_cart_row">
                                                    <td colspan="6" class="text-center text-muted py-4">
                                                        <i class="fas fa-shopping-cart fa-3x mb-3 opacity-50"></i>
                                                        <h5>Carrito vacío</h5>
                                                        <p>Busque productos para agregarlos a la venta</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Derecha: Resumen y Pago -->
                        <div class="col-md-4">
                            <div class="card card-success shadow-sm">
                                <div class="card-header">
                                    <h3 class="card-title"><i class="fas fa-receipt mr-1"></i> Resumen de Venta</h3>
                                </div>
                                <div class="card-body">
                                    <form id="form_pos_sale" autocomplete="off">
                                        <div class="form-group">
                                            <label>Cliente</label>
                                            <div class="select2-primary">
                                                <select class="form-control select2-customer" id="pos_customer_id" style="width: 100%;">
                                                    <option value="">Consumidor Final</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div class="form-group">
                                            <label>Método de Pago</label>
                                            <select class="form-control" id="pos_payment_method">
                                                <option value="CASH">Efectivo</option>
                                                <option value="CARD">Tarjeta</option>
                                                <option value="TRANSFER">Transferencia</option>
                                            </select>
                                        </div>

                                        <div class="form-group mb-4">
                                            <div class="custom-control custom-switch custom-switch-off-danger custom-switch-on-success">
                                                <input type="checkbox" class="custom-control-input" id="pos_generate_invoice">
                                                <label class="custom-control-label" for="pos_generate_invoice">Generar Factura Formal</label>
                                            </div>
                                            <small class="form-text text-muted">Si está apagado, solo se generará un ticket de compra interno.</small>
                                        </div>

                                        <hr>

                                        <div class="d-flex justify-content-between mb-2">
                                            <span>Subtotal:</span>
                                            <span id="pos_subtotal" class="font-weight-bold">$0.00</span>
                                        </div>
                                        
                                        <div class="d-flex justify-content-between mb-3 align-items-center">
                                            <span>Descuento global <i class="fas fa-lock text-muted" id="discount_lock_icon" style="display:none;" title="Requiere permisos"></i>:</span>
                                            <div class="input-group input-group-sm w-50">
                                                <div class="input-group-prepend"><span class="input-group-text">$</span></div>
                                                <input type="number" id="pos_global_discount" class="form-control text-right font-weight-bold" value="0.00" min="0" step="0.01">
                                            </div>
                                        </div>

                                        <div class="text-center bg-light rounded p-3 mb-3 border border-success">
                                            <h5 class="text-success font-weight-bold mb-1">TOTAL A PAGAR</h5>
                                            <div class="total-display" id="pos_total_display">$0.00</div>
                                        </div>

                                        <div class="form-group" id="cash_payment_section">
                                            <label>Efectivo Recibido</label>
                                            <div class="input-group mb-2">
                                                <div class="input-group-prepend"><span class="input-group-text">$</span></div>
                                                <input type="number" id="pos_amount_received" class="form-control amount-input text-success" placeholder="0" step="100">
                                            </div>
                                            <div class="d-flex justify-content-between flex-wrap btn-group-sm" id="quick_cash_buttons">
                                                <button type="button" class="btn btn-outline-secondary mb-1 flex-fill mx-1 btn-quick-cash" data-amount="exact">Exacto</button>
                                                <button type="button" class="btn btn-outline-info mb-1 flex-fill mx-1 btn-quick-cash" data-amount="20000">$ 20.000</button>
                                                <button type="button" class="btn btn-outline-info mb-1 flex-fill mx-1 btn-quick-cash" data-amount="50000">$ 50.000</button>
                                                <button type="button" class="btn btn-outline-info mb-1 flex-fill mx-1 btn-quick-cash" data-amount="100000">$ 100.000</button>
                                            </div>
                                        </div>

                                        <div class="d-flex justify-content-between mb-4" id="change_section">
                                            <span>Cambio:</span>
                                            <span id="pos_change_display" class="change-display">$0.00</span>
                                        </div>

                                        <button type="submit" class="btn btn-success btn-lg btn-block" id="btn_process_sale">
                                            <i class="fas fa-check-circle mr-2"></i> Procesar Venta (F2)
                                        </button>
                                        <button type="button" class="btn btn-default btn-block mt-2" id="btn_cancel_pos">
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
            <div class="modal-content">
                <div class="modal-header bg-success">
                    <h5 class="modal-title"><i class="fas fa-print mr-2"></i> Venta Exitosa</h5>
                </div>
                <div class="modal-body text-center">
                    <div class="mb-3">
                        <i class="fas fa-check-circle text-success fa-4x"></i>
                    </div>
                    <h4>¡Cobro realizado!</h4>
                    <p class="text-muted">La venta se registró correctamente.</p>
                    <p class="h3 font-weight-bold mb-3" id="modal_change_amount">$0.00</p>
                    <p class="text-muted text-sm">Cambio a entregar</p>
                </div>
                <div class="modal-footer flex-column">
                    <button type="button" class="btn btn-primary btn-block btn-lg" id="btn_print_ticket">
                        <i class="fas fa-print mr-2"></i> Imprimir Ticket
                    </button>
                    <button type="button" class="btn btn-default btn-block mt-2" id="btn_new_sale" data-dismiss="modal">
                        Siguiente Venta
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

    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        // POSController no se ha envuelto en bootstrap así que lo cargamos igual
    </script>
    <script type="module" src="<?php echo $URL; ?>/public/assets/js/controllers/venta/pos.js"></script>
</body>
</html>
