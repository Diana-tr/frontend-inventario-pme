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
            <img class="animation__shake" src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo" height="60" width="60">
        </div>

        <?php
        require_once __DIR__ . '/../layouts/navbar.php';
        require_once __DIR__ . '/../layouts/sidebar.php';
        ?>

        <div class="content-wrapper" style="background-color: #F8FAFC !important;">
            <!-- Header -->
            <div class="content-header py-4">
                <div class="container-fluid" style="max-width: 1300px;">
                    <div class="row mb-2 align-items-center">
                        <div class="col-sm-6">
                            <h2 class="m-0 font-weight-bold text-dark"><i class="fas fa-exchange-alt mr-2" style="color: #2563EB;"></i>Movimientos de Tesorería</h2>
                            <p class="text-muted small mb-0 mt-1">Historial auditable de ingresos, egresos operativos y reversos</p>
                        </div>
                        <div class="col-sm-6 text-sm-right mt-3 mt-sm-0">
                            <ol class="breadcrumb float-sm-right bg-transparent mb-0">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard" class="text-primary">Inicio</a></li>
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/finanzas" class="text-primary">Finanzas</a></li>
                                <li class="breadcrumb-item active text-muted">Movimientos</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content pb-5">
                <div class="container-fluid" style="max-width: 1300px;">

                    <!-- Filtros de Búsqueda -->
                    <div class="card border-0 shadow-sm mb-4" style="border-radius: 12px;">
                        <div class="card-body p-3">
                            <div class="row align-items-end">
                                <div class="col-md-3 form-group mb-md-0">
                                    <label class="small text-muted font-weight-bold">Cuenta Financiera</label>
                                    <select class="custom-select custom-select-sm" id="filtro_cuenta">
                                        <option value="">Todas las cuentas</option>
                                    </select>
                                </div>
                                <div class="col-md-2 form-group mb-md-0">
                                    <label class="small text-muted font-weight-bold">Tipo Movimiento</label>
                                    <select class="custom-select custom-select-sm" id="filtro_tipo">
                                        <option value="">Todos</option>
                                        <option value="INFLOW">Ingresos</option>
                                        <option value="OUTFLOW">Egresos</option>
                                    </select>
                                </div>
                                <div class="col-md-2 form-group mb-md-0">
                                    <label class="small text-muted font-weight-bold">Desde</label>
                                    <input type="date" class="form-control form-control-sm" id="filtro_fecha_inicio">
                                </div>
                                <div class="col-md-2 form-group mb-md-0">
                                    <label class="small text-muted font-weight-bold">Hasta</label>
                                    <input type="date" class="form-control form-control-sm" id="filtro_fecha_fin">
                                </div>
                                <div class="col-md-3 d-flex gap-2">
                                    <button type="button" class="btn btn-primary btn-sm flex-fill font-weight-bold shadow-sm" id="btn_aplicar_filtros" style="border-radius: 8px;">
                                        <i class="fas fa-filter mr-1"></i> Filtrar
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary btn-sm font-weight-bold shadow-sm" id="btn_limpiar_filtros" style="border-radius: 8px;">
                                        <i class="fas fa-undo"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla de Movimientos -->
                    <div class="card border-0 shadow-sm" style="border-radius: 12px;">
                        <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <h5 class="card-title font-weight-bold text-dark mb-0"><i class="fas fa-list text-primary mr-2"></i> Listado de Movimientos</h5>
                            <button type="button" class="btn btn-success btn-sm font-weight-bold shadow-sm" id="btn_nuevo_movimiento" style="border-radius: 8px;">
                                <i class="fas fa-plus mr-1"></i> Registrar Movimiento
                            </button>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table id="tbl_movimientos" class="table table-hover table-striped align-middle w-100" style="font-size: 0.875rem;">
                                    <thead class="bg-light">
                                        <tr>
                                            <th>FECHA</th>
                                            <th>CUENTA</th>
                                            <th>TIPO</th>
                                            <th>CATEGORÍA</th>
                                            <th>DESCRIPCIÓN</th>
                                            <th>MÉTODO</th>
                                            <th class="text-right">MONTO</th>
                                            <th>ESTADO</th>
                                            <th class="text-center">ACCIONES</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tbody_movimientos">
                                        <!-- DataTables inyecta datos -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>

        <!-- ============================================================
             MODAL: REVERSAR MOVIMIENTO FINANCIERO
             ============================================================ -->
        <div class="modal fade" id="modalReversarMovimiento" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow" style="border-radius: 12px;">
                    <div class="modal-header bg-danger text-white py-3">
                        <h5 class="modal-title font-weight-bold"><i class="fas fa-history mr-2"></i>Reversar Movimiento Financiero</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="formReversarMovimiento">
                        <input type="hidden" id="rev_movimiento_id" value="">
                        <div class="modal-body p-4">
                            <div class="alert alert-warning border-0 small mb-3" style="border-radius: 8px;">
                                <i class="fas fa-exclamation-triangle mr-1"></i> Esta acción generará un contra-movimiento contable inverso y reajustará el saldo de la cuenta automáticamente.
                            </div>
                            <div class="form-group mb-0">
                                <label class="small font-weight-bold text-muted">Motivo / Justificación del Reverso <span class="text-danger">*</span></label>
                                <textarea class="form-control" id="rev_motivo" rows="3" placeholder="Indique claramente la razón del reverso (ej. Error en el monto, pago duplicado, anulación de factura)..." required></textarea>
                            </div>
                        </div>
                        <div class="modal-footer bg-light py-2" style="border-radius: 0 0 12px 12px;">
                            <button type="button" class="btn btn-secondary font-weight-bold px-4" data-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-danger font-weight-bold px-4" id="btn_confirmar_reverso">Confirmar Reverso</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <?php require_once __DIR__ . '/../layouts/footer.php'; ?>
    </div>

    <!-- DataTables & Plugins -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import MovimientosController from "<?php echo $URL; ?>/public/assets/js/controllers/finanzas/movimientos.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            MovimientosController.init();
        });
    </script>
</body>

</html>

