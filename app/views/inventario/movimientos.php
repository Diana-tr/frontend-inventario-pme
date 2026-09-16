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
                                <i class="fas fa-exchange-alt mr-2"></i>
                                Ajuste de Inventario
                            </h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/inventario">Inventario</a></li>
                                <li class="breadcrumb-item active">Ajustes</li>
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
                                    <h3 class="card-title font-weight-bold">Historial de Movimientos</h3>
                                    <div class="card-tools ml-auto">
                                        <button type="button" class="btn btn-primary btn-sm" id="btn_nuevo_movimiento">
                                            <i class="fas fa-plus mr-1"></i> Registrar Movimiento
                                        </button>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <table id="tbl_movimientos" class="table table-bordered table-striped table-hover responsive nowrap" width="100%">
                                        <thead class="bg-dark text-white">
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Producto</th>
                                                <th>Tipo</th>
                                                <th>Cantidad</th>
                                                <th>Stock Ant.</th>
                                                <th>Stock Nuevo</th>
                                                <th>Motivo / Ref.</th>
                                                <th class="text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaMovimientosBody">
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
             MODAL: REGISTRAR MOVIMIENTO (UNIFICADO)
        ========================================================= -->
        <div class="modal fade" id="modalRegistrarMovimiento" tabindex="-1" aria-hidden="true" data-backdrop="static">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <form id="formRegistrarMovimiento" novalidate>
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title"><i class="fas fa-exchange-alt mr-2"></i>Registrar Movimiento de Inventario</h5>
                            <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-12 mb-3">
                                    <label for="mov_inventory_id">Producto <span class="text-danger">*</span></label>
                                    <select class="form-control select2" id="mov_inventory_id" style="width: 100%;" required>
                                        <option value="">-- Busque y seleccione un producto --</option>
                                    </select>
                                    <div class="invalid-feedback">Debe seleccionar un producto.</div>
                                </div>
                            </div>

                            <div class="row mb-3" id="mov_product_info" style="display: none;">
                                <div class="col-md-12">
                                    <div class="alert alert-info border shadow-sm p-2 mb-0">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>Código:</strong> <span id="info_product_code"></span><br>
                                                <strong>Existencia Actual:</strong> <span id="info_current_stock" class="font-weight-bold" style="font-size: 1.1rem;"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="mov_type">Tipo de Movimiento <span class="text-danger">*</span></label>
                                    <select class="form-control" id="mov_type" required>
                                        <option value="">-- Seleccione tipo --</option>
                                        <option value="ENTRY">Entrada (+)</option>
                                        <option value="EXIT">Salida (-)</option>
                                        <option value="ADJUSTMENT">Ajuste Físico (=)</option>
                                    </select>
                                    <div class="invalid-feedback">Debe seleccionar el tipo de movimiento.</div>
                                </div>
                                <div class="col-md-6 mb-3" id="container_quantity" style="display: none;">
                                    <label id="lbl_mov_value" for="mov_value">Cantidad <span class="text-danger">*</span></label>
                                    <input type="number" class="form-control" id="mov_value" min="0" step="0.01" required disabled>
                                    <small id="help_mov_value" class="form-text text-muted"></small>
                                    <div class="invalid-feedback">Valor inválido.</div>
                                </div>
                            </div>

                            <div class="row" id="container_supplier" style="display: none;">
                                <div class="col-md-12 mb-3">
                                    <label for="mov_supplier_id"><i class="fas fa-truck mr-1"></i>Proveedor (Opcional)</label>
                                    <select class="form-control select2" id="mov_supplier_id" style="width: 100%;">
                                        <option value="">-- Sin proveedor --</option>
                                    </select>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12 mb-3">
                                    <label for="mov_reference">Referencia / N° Documento</label>
                                    <input type="text" class="form-control" id="mov_reference" placeholder="Ej. Factura 1234, Vale 987, Conteo Físico">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12 mb-3">
                                    <label for="mov_notes">Motivo / Observación <span class="text-danger" id="req_mov_notes" style="display: none;">*</span></label>
                                    <textarea class="form-control" id="mov_notes" rows="2" placeholder="Explique el motivo del movimiento..."></textarea>
                                    <div class="invalid-feedback">Debe especificar un motivo.</div>
                                </div>
                            </div>
                            
                            <div class="row mt-2" id="mov_preview" style="display: none;">
                                <div class="col-md-12">
                                    <div class="alert alert-warning border shadow-sm p-3 mb-0">
                                        <h6 class="font-weight-bold mb-2"><i class="fas fa-exclamation-triangle mr-1"></i> Previsualización Resultante</h6>
                                        <span id="preview_text"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fas fa-times mr-1"></i>Cancelar</button>
                            <button type="submit" class="btn btn-primary" id="btn_guardar_movimiento" disabled><i class="fas fa-save mr-1"></i>Confirmar Movimiento</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- =========================================================
             MODAL: DETALLES DE MOVIMIENTO
        ========================================================= -->
        <div class="modal fade" id="modalDetalleMovimiento" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title"><i class="fas fa-info-circle mr-2"></i>Detalle del Movimiento</h5>
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
                                        </tbody>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-info border-bottom pb-2 mb-3"><i class="fas fa-exchange-alt mr-1"></i>Datos del Movimiento</h6>
                                    <table class="table table-sm table-borderless">
                                        <tbody>
                                            <tr><th style="width: 40%;">Tipo:</th><td id="detail_movement_type"></td></tr>
                                            <tr><th>Cantidad:</th><td id="detail_quantity" class="font-weight-bold"></td></tr>
                                            <tr><th>Referencia:</th><td id="detail_reference"></td></tr>
                                            <tr><th>Fecha:</th><td id="detail_created_at"></td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <h6 class="text-info border-bottom pb-2 mb-3"><i class="fas fa-calculator mr-1"></i>Trazabilidad de Stock</h6>
                                    <table class="table table-sm table-borderless">
                                        <tbody>
                                            <tr><th style="width: 40%;">Stock Anterior:</th><td id="detail_previous_stock"></td></tr>
                                            <tr><th>Stock Resultante:</th><td id="detail_new_stock" class="font-weight-bold text-primary"></td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-info border-bottom pb-2 mb-3"><i class="fas fa-align-left mr-1"></i>Motivo / Observación</h6>
                                    <p id="detail_notes" class="text-muted text-justify" style="min-height: 50px; background: #f8f9fa; padding: 10px; border-radius: 4px;"></p>
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

    </div>
    <!-- ./wrapper -->

    <!-- Inicialización del Controlador -->
    <script type="module">
        import App from '<?php echo $URL; ?>/public/assets/js/core/app.js';
        import MovimientosController from '<?php echo $URL; ?>/public/assets/js/controllers/inventario/movimientos.js';

        document.addEventListener('DOMContentLoaded', async () => {
            await App.bootstrap();
            await MovimientosController.init();
        });
    </script>

</body>
</html>
