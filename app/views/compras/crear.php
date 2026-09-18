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
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/compras">Compras</a></li>
                                <li class="breadcrumb-item active">Registrar</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card card-primary shadow-sm">
                                <div class="card-header">
                                    <h3 class="card-title"><i class="fas fa-plus-circle mr-1"></i> Registrar Nueva Compra</h3>
                                </div>
                                
                                <form id="form_crear_compra" autocomplete="off" novalidate>
                                    <div class="card-body">
                                        <!-- SECCIÓN 1: DATOS BÁSICOS -->
                                        <h5 class="font-weight-bold text-muted border-bottom pb-2 mb-4">1. Datos Básicos</h5>
                                        <div class="row">
                                            <div class="col-md-6 form-group">
                                                <label for="supplier_id">Proveedor <span class="text-danger">*</span></label>
                                                <div class="select2-primary">
                                                    <select class="form-control select2-supplier" id="supplier_id" name="supplier_id" style="width: 100%;" required>
                                                        <option value=""></option>
                                                        <!-- Llenado por Select2 AJAX -->
                                                    </select>
                                                </div>
                                                <div class="invalid-feedback">Debe seleccionar un proveedor.</div>
                                            </div>

                                            <div class="col-md-3 form-group">
                                                <label for="issue_date">Fecha de Emisión</label>
                                                <input type="date" class="form-control" id="issue_date" name="issue_date" value="<?php echo date('Y-m-d'); ?>">
                                            </div>

                                            <div class="col-md-12 form-group">
                                                <label for="notes">Observaciones / Notas</label>
                                                <textarea id="notes" name="notes" class="form-control" rows="2" placeholder="Notas opcionales sobre la compra..."></textarea>
                                            </div>
                                        </div>

                                        <!-- SECCIÓN 2: AGREGAR PRODUCTOS -->
                                        <h5 class="font-weight-bold text-muted border-bottom pb-2 mb-4 mt-2">2. Detalle de Productos</h5>
                                        
                                        <div class="row mb-3 align-items-end">
                                            <div class="col-md-5 form-group mb-0">
                                                <label for="search_product">Buscar Producto</label>
                                                <select class="form-control select2-product" id="search_product" style="width: 100%;">
                                                    <option value=""></option>
                                                </select>
                                            </div>
                                            <div class="col-md-2 form-group mb-0">
                                                <label for="add_quantity">Cantidad</label>
                                                <input type="number" class="form-control" id="add_quantity" min="1" value="1" step="1">
                                            </div>
                                            <div class="col-md-3 form-group mb-0">
                                                <label for="add_price">Precio Unit. (Compra)</label>
                                                <input type="number" class="form-control" id="add_price" min="0" step="0.01" placeholder="0.00">
                                            </div>
                                            <div class="col-md-2 form-group mb-0 text-right">
                                                <button type="button" id="btn_add_product" class="btn btn-success w-100">
                                                    <i class="fas fa-plus"></i> Agregar
                                                </button>
                                            </div>
                                        </div>

                                        <!-- TABLA DE DETALLES -->
                                        <div class="table-responsive">
                                            <table class="table table-bordered table-striped text-center" id="tabla_detalles_compra">
                                                <thead class="bg-secondary text-white">
                                                    <tr>
                                                        <th style="width: 10%;">Código</th>
                                                        <th style="width: 35%;">Producto</th>
                                                        <th style="width: 15%;">Cantidad</th>
                                                        <th style="width: 15%;">Precio Unit.</th>
                                                        <th style="width: 15%;">Subtotal</th>
                                                        <th style="width: 10%;">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <!-- Fila indicadora de tabla vacía -->
                                                    <tr id="empty_details_row">
                                                        <td colspan="6" class="text-center text-muted font-italic py-4">
                                                            No se han agregado productos a la compra.
                                                        </td>
                                                    </tr>
                                                </tbody>
                                                <tfoot class="bg-light">
                                                    <tr>
                                                        <td colspan="4" class="text-right font-weight-bold">Total:</td>
                                                        <td colspan="2" class="text-left font-weight-bold text-success text-lg" id="gran_total">$ 0.00</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                    <!-- /.card-body -->

                                    <div class="card-footer d-flex justify-content-end bg-white">
                                        <a href="<?php echo $URL; ?>/compras" class="btn btn-secondary mr-2">
                                            <i class="fas fa-times-circle mr-1"></i> Cancelar
                                        </a>
                                        <button type="submit" id="btn_guardar_compra" class="btn btn-primary font-weight-bold">
                                            <i class="fas fa-save mr-1"></i> Guardar Compra
                                        </button>
                                    </div>
                                </form>
                            </div>
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

    <!-- Select2 JS -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/select2.full.min.js"></script>
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/i18n/es.js"></script>

    <!-- Script de inicialización -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import CrearCompraController from "<?php echo $URL; ?>/public/assets/js/controllers/compra/crear.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            CrearCompraController.init();
        });
    </script>
</body>
</html>
