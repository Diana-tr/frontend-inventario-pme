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
                            <h2 class="m-0 font-weight-bold text-dark"><i class="fas fa-balance-scale mr-2" style="color: #2563EB;"></i>Conciliaciones Bancarias</h2>
                            <p class="text-muted small mb-0 mt-1">Cotejo periódico entre saldos contables y extractos bancarios oficiales</p>
                        </div>
                        <div class="col-sm-6 text-sm-right mt-3 mt-sm-0">
                            <ol class="breadcrumb float-sm-right bg-transparent mb-0">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard" class="text-primary">Inicio</a></li>
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/finanzas" class="text-primary">Finanzas</a></li>
                                <li class="breadcrumb-item active text-muted">Conciliaciones</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content pb-5">
                <div class="container-fluid" style="max-width: 1300px;">

                    <!-- Tabla de Conciliaciones -->
                    <div class="card border-0 shadow-sm" style="border-radius: 12px;">
                        <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <h5 class="card-title font-weight-bold text-dark mb-0"><i class="fas fa-clipboard-check text-primary mr-2"></i> Períodos de Conciliación</h5>
                            <button type="button" class="btn btn-primary btn-sm font-weight-bold shadow-sm" id="btn_abrir_modal_conciliacion" style="border-radius: 8px;">
                                <i class="fas fa-plus mr-1"></i> Iniciar Conciliación
                            </button>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table id="tbl_conciliaciones" class="table table-hover table-striped align-middle w-100" style="font-size: 0.875rem;">
                                    <thead class="bg-light">
                                        <tr>
                                            <th>CUENTA</th>
                                            <th>DESDE</th>
                                            <th>HASTA (CORTE)</th>
                                            <th class="text-right">SALDO LIBROS</th>
                                            <th class="text-right">SALDO EXTRACTO</th>
                                            <th class="text-right">DIFERENCIA</th>
                                            <th>ESTADO</th>
                                            <th>CIERRE</th>
                                            <th class="text-center">ACCIONES</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tbody_conciliaciones">
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
             MODAL: INICIAR CONCILIACIÓN
             ============================================================ -->
        <div class="modal fade" id="modalNuevaConciliacion" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow" style="border-radius: 12px;">
                    <div class="modal-header bg-primary text-white py-3">
                        <h5 class="modal-title font-weight-bold"><i class="fas fa-file-invoice-dollar mr-2"></i>Iniciar Proceso de Conciliación</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="formNuevaConciliacion">
                        <div class="modal-body p-4">
                            <div class="form-group">
                                <label class="small font-weight-bold text-muted">Cuenta a Conciliar <span class="text-danger">*</span></label>
                                <select class="custom-select" id="modal_recon_cuenta" required>
                                    <!-- Dinámico -->
                                </select>
                            </div>
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Fecha Inicial del Período <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="modal_recon_inicio" required>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Fecha de Corte / Extracto <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="modal_recon_fin" value="<?php echo date('Y-m-d'); ?>" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="small font-weight-bold text-muted">Saldo Final según Extracto Bancario <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <div class="input-group-prepend"><span class="input-group-text">$</span></div>
                                    <input type="number" step="0.01" class="form-control" id="modal_recon_extracto" placeholder="0.00" required>
                                </div>
                                <small class="text-muted">Importe total que certifica el extracto emitido por la entidad bancaria al cierre del período.</small>
                            </div>
                            <div class="form-group mb-0">
                                <label class="small font-weight-bold text-muted">Notas y Justificaciones de Ajuste</label>
                                <textarea class="form-control" id="modal_recon_notas" rows="2" placeholder="Observaciones sobre partidas en tránsito, cheques pendientes, etc..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer bg-light py-2" style="border-radius: 0 0 12px 12px;">
                            <button type="button" class="btn btn-secondary font-weight-bold px-4" data-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary font-weight-bold px-4" id="btn_submit_conciliacion">Registrar Conciliación</button>
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
        import ConciliacionesController from "<?php echo $URL; ?>/public/assets/js/controllers/finanzas/conciliaciones.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            ConciliacionesController.init();
        });
    </script>
</body>

</html>

