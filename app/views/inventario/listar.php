<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../layouts/head.php';
?>

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

        <!-- Content Wrapper -->
        <div class="content-wrapper">

            <!-- Header de la página -->
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0">
                                <i class="fas fa-warehouse mr-2"></i>
                                Gestión de Inventario
                            </h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item active">Inventario</li>
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
                                    <h3 class="card-title font-weight-bold">Control de Existencias</h3>
                                    <div class="card-tools ml-auto">
                                    </div>
                                </div>
                                <div class="card-body">
                                    <table id="tbl_inventario" class="table table-bordered table-striped table-hover responsive nowrap" width="100%">
                                        <thead class="bg-dark text-white">
                                            <tr>
                                                <th>Código</th>
                                                <th>Producto</th>
                                                <th>Categoría</th>
                                                <th>Existencia</th>
                                                <th class="text-center">Estado</th>
                                                <th class="text-center" style="width: 135px;">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaInventarioBody">
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
        <!-- /.content-wrapper -->

        <?php require_once __DIR__ . '/../layouts/footer.php'; ?>

        <!-- =========================================================
             MODAL: DETALLES DE INVENTARIO
        ========================================================= -->
        <div class="modal fade" id="modalDetalleInventario" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title"><i class="fas fa-info-circle mr-2"></i>Detalles de Inventario</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body position-relative" style="min-height: 200px;">
                        <div id="detail_modal_loader" class="d-flex justify-content-center align-items-center flex-column" style="height: 100%; position: absolute; top: 0; left: 0; width: 100%; background: rgba(255,255,255,0.9); z-index: 10;">
                            <div class="spinner-border text-info mb-2" role="status"><span class="sr-only">Cargando...</span></div>
                            <p class="text-muted">Cargando información...</p>
                        </div>
                        <div id="detail_modal_content" style="display: none;">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="text-info border-bottom pb-2 mb-3"><i class="fas fa-box mr-1"></i>Datos del Producto</h6>
                                    <table class="table table-sm table-borderless">
                                        <tbody>
                                            <tr><th style="width: 40%;">Código:</th><td id="detail_product_code"></td></tr>
                                            <tr><th>Nombre:</th><td id="detail_product_name"></td></tr>
                                            <tr><th>Cód. Barras:</th><td id="detail_product_barcode"></td></tr>
                                            <tr><th>Categoría:</th><td id="detail_category_name"></td></tr>
                                            <tr><th>Unidad:</th><td id="detail_product_unit"></td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-info border-bottom pb-2 mb-3"><i class="fas fa-chart-line mr-1"></i>Estado de Existencia</h6>
                                    <table class="table table-sm table-borderless">
                                        <tbody>
                                            <tr><th style="width: 40%;">Exist. Actual:</th><td id="detail_current_stock" class="font-weight-bold font-size-lg"></td></tr>
                                            <tr><th>Exist. Mínima:</th><td id="detail_minimum_stock"></td></tr>
                                            <tr><th>Exist. Máxima:</th><td id="detail_maximum_stock"></td></tr>
                                            <tr><th>Alerta Stock:</th><td id="detail_stock_status"></td></tr>
                                            <tr><th>Estado:</th><td id="detail_status_badge"></td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-12">
                                    <h6 class="text-info border-bottom pb-2 mb-3"><i class="fas fa-clock mr-1"></i>Información de Sistema</h6>
                                    <table class="table table-sm table-borderless">
                                        <tbody>
                                            <tr><th style="width: 20%;">Fecha Registro:</th><td id="detail_created_at"></td></tr>
                                            <tr><th>Última Act.:</th><td id="detail_updated_at"></td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fas fa-times mr-1"></i>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- =========================================================
             MODAL: ENTRADA DE INVENTARIO
        ========================================================= -->
        <div class="modal fade" id="modalEntradaInventario" tabindex="-1" aria-hidden="true" data-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="formEntradaInventario" novalidate>
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title"><i class="fas fa-plus-circle mr-2"></i>Registrar Entrada</h5>
                            <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="entry_inventory_id">
                            <div class="alert alert-light border shadow-sm">
                                <strong>Producto:</strong> <span id="entry_product_name"></span>
                            </div>
                            <div class="form-group">
                                <label for="entry_quantity">Cantidad de Entrada <span class="text-danger">*</span></label>
                                <input type="number" class="form-control" id="entry_quantity" min="0.01" step="0.01" required>
                                <div class="invalid-feedback">Debe ingresar una cantidad válida mayor a 0.</div>
                            </div>
                            <div class="form-group">
                                <label for="entry_supplier_id"><i class="fas fa-truck mr-1"></i>Proveedor</label>
                                <select class="form-control" id="entry_supplier_id">
                                    <option value="">-- Sin proveedor --</option>
                                </select>
                                <small class="form-text text-muted">Opcional. Seleccione el proveedor de la compra.</small>
                            </div>
                            <div class="form-group">
                                <label for="entry_reference">Referencia / N° Documento</label>
                                <input type="text" class="form-control" id="entry_reference" placeholder="Ej. Factura 1234">
                            </div>
                            <div class="form-group">
                                <label for="entry_notes">Observación</label>
                                <textarea class="form-control" id="entry_notes" rows="2"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fas fa-times mr-1"></i>Cancelar</button>
                            <button type="submit" class="btn btn-success" id="btn_guardar_entrada"><i class="fas fa-save mr-1"></i>Registrar Entrada</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- =========================================================
             MODAL: SALIDA DE INVENTARIO
        ========================================================= -->
        <div class="modal fade" id="modalSalidaInventario" tabindex="-1" aria-hidden="true" data-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="formSalidaInventario" novalidate>
                        <div class="modal-header bg-warning text-dark">
                            <h5 class="modal-title"><i class="fas fa-minus-circle mr-2"></i>Registrar Salida</h5>
                            <button type="button" class="close text-dark" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="exit_inventory_id">
                            <div class="alert alert-light border shadow-sm">
                                <strong>Producto:</strong> <span id="exit_product_name"></span><br>
                                <strong>Existencia Actual:</strong> <span id="exit_current_stock" class="font-weight-bold"></span>
                            </div>
                            <div class="form-group">
                                <label for="exit_quantity">Cantidad de Salida <span class="text-danger">*</span></label>
                                <input type="number" class="form-control" id="exit_quantity" min="0.01" step="0.01" required>
                                <div class="invalid-feedback">Debe ingresar una cantidad válida mayor a 0.</div>
                            </div>
                            <div class="form-group">
                                <label for="exit_reference">Referencia / N° Documento</label>
                                <input type="text" class="form-control" id="exit_reference" placeholder="Ej. Vale 987">
                            </div>
                            <div class="form-group">
                                <label for="exit_notes">Observación</label>
                                <textarea class="form-control" id="exit_notes" rows="2"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fas fa-times mr-1"></i>Cancelar</button>
                            <button type="submit" class="btn btn-warning text-dark" id="btn_guardar_salida"><i class="fas fa-save mr-1"></i>Registrar Salida</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- =========================================================
             MODAL: AJUSTE DE INVENTARIO
        ========================================================= -->
        <div class="modal fade" id="modalAjusteInventario" tabindex="-1" aria-hidden="true" data-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="formAjusteInventario" novalidate>
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title"><i class="fas fa-sliders-h mr-2"></i>Ajuste Manual</h5>
                            <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="adjust_inventory_id">
                            <div class="alert alert-light border shadow-sm">
                                <strong>Producto:</strong> <span id="adjust_product_name"></span><br>
                                <strong>Existencia Actual:</strong> <span id="adjust_current_stock" class="font-weight-bold"></span>
                            </div>
                            <div class="form-group">
                                <label for="adjust_new_stock">Nueva Existencia Exacta <span class="text-danger">*</span></label>
                                <input type="number" class="form-control" id="adjust_new_stock" min="0" step="0.01" required>
                                <div class="invalid-feedback">Debe ingresar un valor mayor o igual a 0.</div>
                            </div>
                            <div class="form-group">
                                <label for="adjust_notes">Motivo del Ajuste <span class="text-danger">*</span></label>
                                <textarea class="form-control" id="adjust_notes" rows="2" required></textarea>
                                <div class="invalid-feedback">Debe especificar un motivo para el ajuste.</div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fas fa-times mr-1"></i>Cancelar</button>
                            <button type="submit" class="btn btn-primary" id="btn_guardar_ajuste"><i class="fas fa-save mr-1"></i>Registrar Ajuste</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- =========================================================
             MODAL: EDITAR UMBRALES
        ========================================================= -->
        <div class="modal fade" id="modalEditarUmbrales" tabindex="-1" aria-hidden="true" data-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="formEditarUmbrales" novalidate>
                        <div class="modal-header bg-dark text-white">
                            <h5 class="modal-title"><i class="fas fa-cog mr-2"></i>Editar Umbrales</h5>
                            <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body position-relative" style="min-height: 150px;">
                            <div id="threshold_modal_loader" class="d-flex justify-content-center align-items-center flex-column" style="height: 100%; position: absolute; top: 0; left: 0; width: 100%; background: rgba(255,255,255,0.9); z-index: 10;">
                                <div class="spinner-border text-dark mb-2" role="status"><span class="sr-only">Cargando...</span></div>
                            </div>
                            <div id="threshold_modal_content" style="display: none;">
                                <input type="hidden" id="threshold_inventory_id">
                                <div class="alert alert-light border shadow-sm">
                                    <strong>Producto:</strong> <span id="threshold_product_name"></span>
                                </div>
                                <div class="row">
                                    <div class="col-6">
                                        <div class="form-group">
                                            <label for="threshold_minimum_stock">Exist. Mínima <span class="text-danger">*</span></label>
                                            <input type="number" class="form-control" id="threshold_minimum_stock" min="0" step="0.01" required>
                                            <div class="invalid-feedback">Valor inválido.</div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="form-group">
                                            <label for="threshold_maximum_stock">Exist. Máxima</label>
                                            <input type="number" class="form-control" id="threshold_maximum_stock" min="0" step="0.01">
                                            <div class="invalid-feedback">Valor inválido.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fas fa-times mr-1"></i>Cancelar</button>
                            <button type="submit" class="btn btn-dark" id="btn_guardar_umbrales"><i class="fas fa-save mr-1"></i>Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- =========================================================
             MODAL: HISTORIAL DE MOVIMIENTOS
        ========================================================= -->
        <div class="modal fade" id="modalHistorialMovimientos" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-secondary text-white">
                        <h5 class="modal-title"><i class="fas fa-history mr-2"></i>Historial de Movimientos</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table id="tbl_movimientos" class="table table-bordered table-striped table-hover nowrap" width="100%">
                                <!-- Columnas de Movimientos -->
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fas fa-times mr-1"></i>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <!-- ./wrapper -->

    <!-- No requiere scripts.php -->

    <!-- Inicialización del Controlador -->
    <script type="module">
        import App from '<?php echo $URL; ?>/public/assets/js/core/app.js';
        import InventarioListController from '<?php echo $URL; ?>/public/assets/js/controllers/inventario/listar.js';
        import SecurityManager from '<?php echo $URL; ?>/public/assets/js/core/security.js';

        document.addEventListener('DOMContentLoaded', async () => {
            await App.bootstrap();
            await InventarioListController.init();
        });
    </script>

</body>
</html>
