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

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">

        <!-- Preloader -->
        <div class="preloader flex-column justify-content-center align-items-center">
            <img class="animation__shake" src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo inventario PME" height="60" width="60">
        </div>

        <!-- Módulos Layout -->
        <?php
        require_once __DIR__ . '/../layouts/navbar.php';
        require_once __DIR__ . '/../layouts/sidebar.php';
        ?>

        <!-- Content Wrapper. Contains page content -->
        <div class="content-wrapper" style="background-color: #F4F6F9;">
            <!-- Header de la página -->
            <div class="content-header">
                <div class="container-fluid" style="max-width: 1250px;">
                    <div class="row mb-2 align-items-center">
                        <div class="col-sm-6">
                            <h1 class="m-0 text-dark font-weight-bold" style="font-size: 1.6rem;">
                                <i class="fas fa-shopping-cart text-primary mr-2"></i>Gestión de Ventas
                            </h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right bg-transparent p-0 mb-0" style="font-size: 0.85rem;">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/ventas">Ventas</a></li>
                                <li class="breadcrumb-item active">Registrar</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content">
                <div class="container-fluid" style="max-width: 1250px;">
                    
                    <!-- Tarjeta Principal SaaS Style -->
                    <div class="card shadow-sm border-0" style="border-radius: 12px; overflow: hidden;">
                        <div class="card-header bg-primary text-white py-3">
                            <h3 class="card-title font-weight-bold mb-0" style="font-size: 1rem;">
                                <i class="fas fa-plus-circle mr-2"></i>Registrar Nueva Venta
                            </h3>
                        </div>

                        <form id="form_crear_venta" autocomplete="off" novalidate>
                            <div class="card-body p-4">
                                <!-- SECCIÓN 1: DATOS BÁSICOS -->
                                <div class="mb-4">
                                    <h5 class="font-weight-bold text-dark border-bottom pb-2 mb-3" style="font-size: 1.05rem; color: #1E293B;">
                                        <i class="fas fa-user-tag text-primary mr-2"></i>Datos Básicos
                                    </h5>
                                    
                                    <div class="row">
                                        <div class="col-md-5 form-group">
                                            <label for="customer_id" class="font-weight-bold text-secondary">Cliente <span class="text-danger">*</span></label>
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text bg-light border-right-0"><i class="fas fa-user text-muted"></i></span>
                                                </div>
                                                <div class="select2-primary flex-fill">
                                                    <select class="form-control select2-customer border-left-0" id="customer_id" name="customer_id" style="width: 100%;" required>
                                                        <option value=""></option>
                                                        <!-- Llenado por Select2 AJAX -->
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="invalid-feedback">Debe seleccionar un cliente.</div>
                                        </div>

                                        <div class="col-md-4 form-group">
                                            <label for="payment_method" class="font-weight-bold text-secondary">Método de Pago <span class="text-danger">*</span></label>
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text bg-light border-right-0"><i class="fas fa-wallet text-muted"></i></span>
                                                </div>
                                                <select class="form-control border-left-0" id="payment_method" name="payment_method" required>
                                                    <option value="CASH">Efectivo</option>
                                                    <option value="CREDIT">Crédito</option>
                                                    <option value="TRANSFER">Transferencia</option>
                                                    <option value="CARD">Tarjeta</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div class="col-md-3 form-group">
                                            <label for="issue_date" class="font-weight-bold text-secondary">Fecha de Emisión</label>
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text bg-light border-right-0"><i class="far fa-calendar-alt text-muted"></i></span>
                                                </div>
                                                <input type="date" class="form-control border-left-0" id="issue_date" name="issue_date" value="<?php echo date('Y-m-d'); ?>">
                                            </div>
                                        </div>

                                        <div class="col-md-12 form-group mb-2">
                                            <label for="notes" class="font-weight-bold text-secondary">Observaciones / Notas</label>
                                            <textarea id="notes" name="notes" class="form-control" rows="2" placeholder="Notas opcionales sobre la venta..."></textarea>
                                        </div>
                                    </div>
                                </div>

                                <!-- SECCIÓN 2: AGREGAR PRODUCTOS -->
                                <div class="mb-4">
                                    <h5 class="font-weight-bold text-dark border-bottom pb-2 mb-3 mt-2" style="font-size: 1.05rem; color: #1E293B;">
                                        <i class="fas fa-boxes text-primary mr-2"></i>2. Detalle de Productos
                                    </h5>

                                    <div class="row mb-3 align-items-end p-3 bg-light rounded-lg border">
                                        <div class="col-md-5 form-group mb-0">
                                            <label for="search_product" class="font-weight-bold text-secondary">Buscar Producto</label>
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text bg-white border-right-0"><i class="fas fa-barcode text-muted"></i></span>
                                                </div>
                                                <select class="form-control select2-product border-left-0" id="search_product" style="width: 100%;">
                                                    <option value=""></option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-md-2 form-group mb-0">
                                            <label for="add_quantity" class="font-weight-bold text-secondary">Cantidad</label>
                                            <input type="number" class="form-control text-center font-weight-bold" id="add_quantity" min="1" value="1" step="1">
                                        </div>
                                        <div class="col-md-3 form-group mb-0">
                                            <label for="add_price" class="font-weight-bold text-secondary">Precio Unit. (Venta)</label>
                                            <input type="number" class="form-control text-right" id="add_price" min="0" step="0.01" placeholder="0.00">
                                        </div>
                                        <div class="col-md-2 form-group mb-0 text-right">
                                            <button type="button" id="btn_add_product" class="btn btn-success w-100 font-weight-bold" style="border-radius: 6px;">
                                                <i class="fas fa-plus mr-1"></i> Agregar
                                            </button>
                                        </div>
                                    </div>

                                    <!-- TABLA DE DETALLES -->
                                    <div class="table-responsive rounded border shadow-sm">
                                        <table class="table table-hover table-striped mb-0 text-center align-middle" id="tabla_detalles_venta">
                                            <thead style="background-color: #1E293B; color: #FFFFFF; font-size: 0.85rem;">
                                                <tr>
                                                    <th style="width: 10%;">Código</th>
                                                    <th style="width: 35%; text-align: left;">Producto</th>
                                                    <th style="width: 15%;">Cantidad</th>
                                                    <th style="width: 15%;">Precio Unit.</th>
                                                    <th style="width: 15%;">Subtotal</th>
                                                    <th style="width: 10%;">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <!-- Fila indicadora de tabla vacía -->
                                                <tr id="empty_details_row">
                                                    <td colspan="6" class="text-muted py-4" style="background-color: #FAFAFA;">
                                                        <i class="fas fa-shopping-basket fa-2x mb-2 d-block text-secondary" style="opacity: 0.5;"></i>
                                                        <span>No se han agregado productos a la venta.</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <!-- Panel Inferior de Totales -->
                                <div class="row align-items-center pt-3 border-top">
                                    <div class="col-md-6 mb-3 mb-md-0">
                                        <small class="text-muted d-block">
                                            <i class="fas fa-info-circle mr-1"></i> Verifique los productos y las cantidades antes de registrar la venta.
                                        </small>
                                    </div>
                                    <div class="col-md-6 text-md-right">
                                        <div class="d-inline-flex align-items-center bg-light border rounded px-4 py-2 mb-3 shadow-sm">
                                            <span class="font-weight-bold text-dark mr-3" style="font-size: 1.1rem;">Total:</span>
                                            <span class="font-weight-bold" style="font-size: 1.5rem; color: #16A34A;" id="gran_total">$ 0.00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- /.card-body -->

                            <div class="card-footer d-flex justify-content-end bg-white py-3 border-top">
                                <a href="<?php echo $URL; ?>/ventas" class="btn btn-secondary mr-2 px-4 font-weight-bold" style="border-radius: 6px;">
                                    <i class="fas fa-times-circle mr-1"></i> Cancelar
                                </a>
                                <button type="submit" id="btn_guardar_venta" class="btn btn-primary px-4 font-weight-bold shadow-sm" style="border-radius: 6px;">
                                    <i class="fas fa-save mr-1"></i> Guardar Venta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>

        <?php
        require_once __DIR__ . '/../layouts/control-sidebar.php';
        require_once __DIR__ . '/../layouts/footer.php';
        ?>

    </div>

    <!-- Select2 JS -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/select2.full.min.js"></script>
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/i18n/es.js"></script>

    <!-- Script de inicialización -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js?v=1.1";
        import CrearVentaController from "<?php echo $URL; ?>/public/assets/js/controllers/venta/crear.js?v=1.1";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            CrearVentaController.init();
        });
    </script>
</body>

</html>