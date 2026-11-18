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
                            <h2 class="m-0 font-weight-bold text-dark"><i class="fas fa-random mr-2" style="color: #2563EB;"></i>Transferencias entre Cuentas</h2>
                            <p class="text-muted small mb-0 mt-1">Traslado seguro de fondos entre cuentas bancarias y cajas propias</p>
                        </div>
                        <div class="col-sm-6 text-sm-right mt-3 mt-sm-0">
                            <ol class="breadcrumb float-sm-right bg-transparent mb-0">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard" class="text-primary">Inicio</a></li>
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/finanzas" class="text-primary">Finanzas</a></li>
                                <li class="breadcrumb-item active text-muted">Transferencias</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content pb-5">
                <div class="container-fluid" style="max-width: 1300px;">

                    <!-- Tabla de Transferencias -->
                    <div class="card border-0 shadow-sm" style="border-radius: 12px;">
                        <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <h5 class="card-title font-weight-bold text-dark mb-0"><i class="fas fa-history text-primary mr-2"></i> Historial de Transferencias</h5>
                            <button type="button" class="btn btn-primary btn-sm font-weight-bold shadow-sm" id="btn_abrir_modal_transferencia" style="border-radius: 8px;">
                                <i class="fas fa-plus mr-1"></i> Nueva Transferencia
                            </button>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table id="tbl_transferencias" class="table table-hover table-striped align-middle w-100" style="font-size: 0.875rem;">
                                    <thead class="bg-light">
                                        <tr>
                                            <th>FECHA</th>
                                            <th>CUENTA ORIGEN</th>
                                            <th>CUENTA DESTINO</th>
                                            <th class="text-right">MONTO</th>
                                            <th>REFERENCIA</th>
                                            <th>USUARIO</th>
                                            <th>ESTADO</th>
                                            <th class="text-center">ACCIONES</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tbody_transferencias">
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
             MODAL: NUEVA TRANSFERENCIA
             ============================================================ -->
        <div class="modal fade" id="modalNuevaTransferencia" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content border-0 shadow" style="border-radius: 12px;">
                    <div class="modal-header bg-primary text-white py-3">
                        <h5 class="modal-title font-weight-bold"><i class="fas fa-exchange-alt mr-2"></i>Nueva Transferencia de Fondos</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form id="formNuevaTransferencia">
                        <div class="modal-body p-4">
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Cuenta Origen (Sale dinero) <span class="text-danger">*</span></label>
                                    <select class="custom-select" id="modal_transf_origen" required>
                                        <!-- Dinámico -->
                                    </select>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Cuenta Destino (Entra dinero) <span class="text-danger">*</span></label>
                                    <select class="custom-select" id="modal_transf_destino" required>
                                        <!-- Dinámico -->
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Monto a Transferir <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <div class="input-group-prepend"><span class="input-group-text">$</span></div>
                                        <input type="number" step="0.01" class="form-control" id="modal_transf_monto" placeholder="0.00" required>
                                    </div>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label class="small font-weight-bold text-muted">Fecha de Traslado <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="modal_transf_fecha" value="<?php echo date('Y-m-d'); ?>" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="small font-weight-bold text-muted">Referencia Bancaria / N° Comprobante</label>
                                <input type="text" class="form-control" id="modal_transf_referencia" placeholder="Ej. TRF-2026-001">
                            </div>
                            <div class="form-group mb-0">
                                <label class="small font-weight-bold text-muted">Notas u Observaciones</label>
                                <textarea class="form-control" id="modal_transf_notas" rows="2" placeholder="Motivo de la transferencia interna..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer bg-light py-2" style="border-radius: 0 0 12px 12px;">
                            <button type="button" class="btn btn-secondary font-weight-bold px-4" data-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary font-weight-bold px-4" id="btn_submit_transferencia">Transferir Fondos</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <?php require_once __DIR__ . '/../layouts/footer.php'; ?>
    </div>

    <!-- DataTables & Plugins -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js?v=<?php echo time(); ?>";
        import TransferenciasController from "<?php echo $URL; ?>/public/assets/js/controllers/finanzas/transferencias.js?v=<?php echo time(); ?>";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            TransferenciasController.init();
        });
    </script>
</body>

</html>

