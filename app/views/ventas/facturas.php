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
        <div class="content-wrapper">
            <!-- Header de la página -->
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0"><i class="fas fa-file-invoice-dollar mr-2"></i>Facturas de Ventas</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/ventas">Ventas</a></li>
                                <li class="breadcrumb-item active">Facturas</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="card card-outline card-primary shadow-sm">
                                <div class="card-header d-flex align-items-center">
                                    <h3 class="card-title font-weight-bold">Historial de Facturas</h3>
                                </div>

                                <div class="card-body">
                                    <table id="tbl_FacturasVentas" class="table table-bordered table-striped table-hover responsive nowrap" width="100%">
                                        <thead class="bg-dark text-white">
                                            <tr>
                                                <th>N° Factura</th>
                                                <th>Venta Relacionada</th>
                                                <th>Fecha de Emisión</th>
                                                <th>Subtotal</th>
                                                <th>Total</th>
                                                <th class="text-center">Estado</th>
                                                <th class="text-center" style="width: 170px;">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaFacturasVentasBody">
                                        </tbody>
                                    </table>
                                </div>
                                <!-- /.card-body -->
                            </div>
                            <!-- /.card -->
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <?php
        require_once __DIR__ . '/../layouts/control-sidebar.php';
        require_once __DIR__ . '/../layouts/footer.php';
        ?>

    </div>

    <!-- Modal Visualizar Factura -->
    <div class="modal fade" id="modalVisualizarFacturaVenta" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header bg-dark text-white">
                    <h5 class="modal-title"><i class="fas fa-file-invoice mr-2"></i>Factura: <span id="factura_modal_number"></span></h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- loader -->
                    <div id="factura_modal_loader" class="text-center py-4">
                        <div class="spinner-border text-info" role="status"></div>
                    </div>
                    <!-- content -->
                    <div id="factura_modal_content" style="display:none;">

                        <!-- Template Header -->
                        <div id="factura_modal_header_template" class="w-100 mb-3"></div>

                        <div class="row mb-3">
                            <div class="col-sm-6">
                                <strong>Fecha Emisión:</strong> <span id="factura_modal_date"></span><br>
                                <strong>Estado:</strong> <span id="factura_modal_status"></span><br>
                            </div>
                            <div class="col-sm-6 text-right">
                                <strong>Venta Asociada:</strong> #<span id="factura_modal_sale"></span>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-sm table-bordered">
                                <thead class="bg-light">
                                    <tr>
                                        <th>Producto</th>
                                        <th class="text-center">Cant.</th>
                                        <th class="text-right">Precio Unit.</th>
                                        <th class="text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody id="factura_modal_items"></tbody>
                                <tfoot>
                                    <tr>
                                        <th colspan="3" class="text-right">Subtotal:</th>
                                        <th class="text-right" id="factura_modal_subtotal"></th>
                                    </tr>
                                    <tr>
                                        <th colspan="3" class="text-right text-success">Total:</th>
                                        <th class="text-right text-success" id="factura_modal_total"></th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div class="mt-3">
                            <strong>Observaciones:</strong>
                            <p id="factura_modal_notes" class="text-muted"></p>
                        </div>

                        <!-- Template Footer -->
                        <div id="factura_modal_footer_template" class="w-100 mt-4"></div>

                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-info btn-print-invoice-modal" data-id=""><i class="fas fa-print mr-1"></i> Imprimir</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Select2 JS -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/select2.full.min.js"></script>

    <!-- Script de inicialización -->
    <script src="<?php echo $URL; ?>/public/assets/js/utils/DocumentTemplateRenderer.js"></script>
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import FacturaVentaController from "<?php echo $URL; ?>/public/assets/js/controllers/venta/facturas.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            FacturaVentaController.init();
        });
    </script>
</body>
