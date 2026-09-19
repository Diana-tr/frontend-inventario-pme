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
                            <h1 class="m-0"><i class="fas fa-shopping-basket mr-2"></i>Gestión de Compras</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item active">Compras</li>
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
                                    <h3 class="card-title font-weight-bold">Historial de Compras</h3>
                                    <div class="card-tools ml-auto">
                                        <a href="<?php echo $URL; ?>/compras/crear" class="btn btn-primary btn-sm" data-permission="purchases.create">
                                            <i class="fas fa-plus mr-1"></i> Registrar Nueva Compra
                                        </a>
                                    </div>
                                </div>

                                <div class="card-body">
                                    <table id="tbl_Compras" class="table table-bordered table-striped table-hover responsive nowrap" width="100%">
                                        <thead class="bg-dark text-white">
                                            <tr>
                                                <th class="text-center" style="width: 50px;">N°</th>
                                                <th>N° Compra</th>
                                                <th>Proveedor</th>
                                                <th>Fecha</th>
                                                <th>Subtotal</th>
                                                <th>Total</th>
                                                <th class="text-center">Estado</th>
                                                <th class="text-center" style="width: 170px;">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaComprasBody">
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

    <!-- Modal Ver Detalles de Compra -->
    <div class="modal fade" id="modalDetalleCompra" tabindex="-1" role="dialog" aria-labelledby="modalDetalleCompraLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title" id="modalDetalleCompraLabel">
                        <i class="fas fa-shopping-basket mr-2"></i>Información Detallada de la Compra
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- Loader / Spinner -->
                    <div id="purchase_modal_loader" class="text-center py-5">
                        <div class="spinner-border text-info" role="status" style="width: 3rem; height: 3rem;">
                            <span class="sr-only">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted font-weight-bold">Obteniendo información del servidor...</p>
                    </div>

                    <!-- Contenido principal (Oculto mientras carga) -->
                    <div id="purchase_modal_content" style="display: none;">
                        <div class="row mb-4">
                            <!-- Info de Compra -->
                            <div class="col-md-4 border-right">
                                <h6 class="font-weight-bold text-uppercase text-muted border-bottom pb-2 mb-3">
                                    <i class="fas fa-info-circle mr-1"></i> Datos de Compra
                                </h6>
                                <p class="mb-1"><strong class="text-dark">ID Compra:</strong> #<span id="detail_purchase_id"></span></p>
                                <p class="mb-1"><strong class="text-dark">Fecha Emisión:</strong> <span id="detail_issue_date"></span></p>
                                <p class="mb-1"><strong class="text-dark">Estado:</strong> <span id="detail_status_badge"></span></p>
                                <p class="mb-1"><strong class="text-dark">Notas:</strong> <span id="detail_notes"></span></p>
                            </div>

                            <!-- Info de Proveedor -->
                            <div class="col-md-4 border-right">
                                <h6 class="font-weight-bold text-uppercase text-muted border-bottom pb-2 mb-3">
                                    <i class="fas fa-truck mr-1"></i> Proveedor
                                </h6>
                                <p class="mb-1 font-weight-bold text-primary" id="detail_supplier_name">---</p>
                                <p class="mb-1"><strong class="text-dark">NIT/CC:</strong> <span id="detail_supplier_document"></span></p>
                                <p class="mb-1"><strong class="text-dark">Correo:</strong> <span id="detail_supplier_email"></span></p>
                                <p class="mb-1"><strong class="text-dark">Teléfono:</strong> <span id="detail_supplier_phone"></span></p>
                            </div>

                            <!-- Info de Totales y Factura -->
                            <div class="col-md-4">
                                <h6 class="font-weight-bold text-uppercase text-muted border-bottom pb-2 mb-3">
                                    <i class="fas fa-file-invoice-dollar mr-1"></i> Resumen y Factura
                                </h6>
                                <div class="bg-light p-3 rounded">
                                    <div class="d-flex justify-content-between mb-1">
                                        <span>Subtotal:</span>
                                        <strong id="detail_subtotal"></strong>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="font-weight-bold text-lg">Total:</span>
                                        <strong class="text-lg text-success" id="detail_total"></strong>
                                    </div>
                                </div>
                                
                                <div class="mt-3" id="detail_invoice_section">
                                    <!-- Aquí se inyecta info de la factura o botón para ver -->
                                </div>
                            </div>
                        </div>

                        <!-- Detalles de Productos -->
                        <h6 class="font-weight-bold text-uppercase text-muted border-bottom pb-2 mb-3">
                            <i class="fas fa-box-open mr-1"></i> Productos Recibidos
                        </h6>
                        <div class="table-responsive">
                            <table class="table table-sm table-striped table-bordered text-center">
                                <thead class="bg-secondary text-white">
                                    <tr>
                                        <th>Código</th>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unit.</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody id="detail_products_body">
                                    <!-- Productos inyectados por JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="modal-footer bg-light">
                    <!-- Botones de Acción según el estado (Inyectados por JS) -->
                    <div id="purchase_action_buttons" class="mr-auto"></div>
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Visualizar Factura -->
    <div class="modal fade" id="modalVisualizarFactura" tabindex="-1" role="dialog" aria-hidden="true">
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
                                <strong>Compra Asociada:</strong> #<span id="factura_modal_purchase"></span>
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
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import CompraListController from "<?php echo $URL; ?>/public/assets/js/controllers/compra/listar.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            CompraListController.init();
        });
    </script>
</body>
