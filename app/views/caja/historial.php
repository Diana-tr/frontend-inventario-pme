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

        <!-- Content Wrapper. Contains page content -->
        <div class="content-wrapper">
            <!-- Header de la página -->
            <div class="content-header">
                <div class="container-fluid">
                    <div class="row mb-2">
                        <div class="col-sm-6">
                            <h1 class="m-0"><i class="fas fa-history mr-2"></i>Historial de Cajas</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/caja">Caja</a></li>
                                <li class="breadcrumb-item active">Historial</li>
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
                            <div class="card card-outline card-info shadow-sm">
                                <div class="card-header">
                                    <h3 class="card-title font-weight-bold">Sesiones de Caja Anteriores</h3>
                                </div>
                                <div class="card-body">
                                    <table id="tbl_Cajas" class="table table-bordered table-striped table-hover responsive nowrap" width="100%">
                                        <thead class="bg-dark text-white">
                                            <tr>
                                                <th>Caja Registradora</th>
                                                <th>Usuario</th>
                                                <th>Apertura</th>
                                                <th>Cierre</th>
                                                <th>Saldo Esperado</th>
                                                <th>Saldo Contado</th>
                                                <th>Diferencia</th>
                                                <th>Estado</th>
                                                <th class="text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaCajasBody">
                                        </tbody>
                                    </table>
                                </div>
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

    <!-- Modal Detalles de Sesión (Auditoría) -->
    <div class="modal fade" id="modalDetalleCaja" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
                <div class="modal-header border-0 py-3" style="background-color: #172033; color: #FFFFFF; border-radius: 12px 12px 0 0;">
                    <h5 class="modal-title font-weight-bold" id="detalle_caja_title">
                        <i class="fas fa-file-invoice-dollar mr-2 text-warning"></i>Detalle de la Sesión de Caja
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body p-4">
                    <!-- Resumen General -->
                    <div class="row mb-3">
                        <div class="col-md-3 col-sm-6 mb-2">
                            <div class="p-3 border rounded" style="background-color: #F8FAFC; border-color: #E2E8F0 !important;">
                                <small class="text-uppercase text-muted font-weight-bold d-block mb-1">Caja Registradora</small>
                                <span class="h6 font-weight-bold text-dark mb-0" id="det_caja_nombre">-</span>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 mb-2">
                            <div class="p-3 border rounded" style="background-color: #F8FAFC; border-color: #E2E8F0 !important;">
                                <small class="text-uppercase text-muted font-weight-bold d-block mb-1">Cajero / Usuario</small>
                                <span class="h6 font-weight-bold text-dark mb-0" id="det_caja_usuario">-</span>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 mb-2">
                            <div class="p-3 border rounded" style="background-color: #F8FAFC; border-color: #E2E8F0 !important;">
                                <small class="text-uppercase text-muted font-weight-bold d-block mb-1">Apertura</small>
                                <span class="small font-weight-bold text-dark mb-0" id="det_caja_apertura">-</span>
                            </div>
                        </div>
                        <div class="col-md-3 col-sm-6 mb-2">
                            <div class="p-3 border rounded" style="background-color: #F8FAFC; border-color: #E2E8F0 !important;">
                                <small class="text-uppercase text-muted font-weight-bold d-block mb-1">Cierre</small>
                                <span class="small font-weight-bold text-dark mb-0" id="det_caja_cierre">-</span>
                            </div>
                        </div>
                    </div>

                    <!-- Métricas Financieras -->
                    <div class="row mb-3">
                        <div class="col-md-3 col-6 mb-2">
                            <div class="p-3 text-center rounded border" style="background-color: #EFF6FF; border-color: #BFDBFE !important;">
                                <small class="text-primary font-weight-bold text-uppercase d-block mb-1">Base Inicial</small>
                                <h5 class="font-weight-bold text-primary mb-0" id="det_caja_inicial">$0.00</h5>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 mb-2">
                            <div class="p-3 text-center rounded border" style="background-color: #F0FDF4; border-color: #BBF7D0 !important;">
                                <small class="text-success font-weight-bold text-uppercase d-block mb-1">Esperado Efectivo</small>
                                <h5 class="font-weight-bold text-success mb-0" id="det_caja_esperado">$0.00</h5>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 mb-2">
                            <div class="p-3 text-center rounded border" style="background-color: #FAF5FF; border-color: #E9D5FF !important;">
                                <small class="font-weight-bold text-uppercase d-block mb-1" style="color: #7E22CE;">Arqueo Físico</small>
                                <h5 class="font-weight-bold mb-0" style="color: #7E22CE;" id="det_caja_contado">$0.00</h5>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 mb-2">
                            <div class="p-3 text-center rounded border" id="det_caja_diff_box" style="background-color: #F8FAFC; border-color: #E2E8F0 !important;">
                                <small class="font-weight-bold text-uppercase d-block mb-1" id="det_caja_diff_label">Diferencia</small>
                                <h5 class="font-weight-bold mb-0" id="det_caja_diff">$0.00</h5>
                            </div>
                        </div>
                    </div>

                    <!-- Desglose Operativo del Turno -->
                    <div class="row mb-3" id="det_breakdown_row">
                        <div class="col-md-3 col-6 mb-2">
                            <div class="p-2 border rounded bg-white text-center">
                                <small class="text-muted d-block">Ventas Efectivo</small>
                                <strong class="text-success small" id="det_sales_cash">$0.00</strong>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 mb-2">
                            <div class="p-2 border rounded bg-white text-center">
                                <small class="text-muted d-block">Ventas Electrónicas</small>
                                <strong class="text-primary small" id="det_sales_elec">$0.00</strong>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 mb-2">
                            <div class="p-2 border rounded bg-white text-center">
                                <small class="text-muted d-block">Compras Pagadas</small>
                                <strong class="text-danger small" id="det_purchases_paid">$0.00</strong>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 mb-2">
                            <div class="p-2 border rounded bg-white text-center">
                                <small class="text-muted d-block">Gastos Manuales</small>
                                <strong class="text-warning small" id="det_expenses_manual">$0.00</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Desglose de Denominaciones Registrado -->
                    <div class="p-3 mb-3 rounded border d-none" id="det_denominations_box" style="background-color: #F8FAFC; border-color: #CBD5E1 !important;">
                        <small class="text-uppercase font-weight-bold text-primary d-block mb-2"><i class="fas fa-coins mr-1"></i> Desglose de Billetes y Monedas del Arqueo:</small>
                        <div class="d-flex flex-wrap gap-2" id="det_denominations_badges">
                        </div>
                    </div>

                    <!-- Observaciones -->
                    <div class="p-3 mb-3 rounded border" style="background-color: #FFFBEB; border-color: #FDE68A !important;">
                        <span class="font-weight-bold small text-uppercase text-warning mr-2"><i class="fas fa-comment-alt mr-1"></i>Observaciones / Notas:</span>
                        <span class="text-dark small" id="detalle_caja_notas">Sin observaciones.</span>
                    </div>

                    <!-- Tabla de Movimientos de la Sesión -->
                    <div class="card border-0 shadow-none">
                        <div class="card-header bg-light border-0 py-2 px-0 d-flex justify-content-between align-items-center">
                            <h6 class="font-weight-bold text-dark mb-0"><i class="fas fa-receipt mr-1 text-secondary"></i> Movimientos Registrados en la Sesión</h6>
                            <span class="badge badge-secondary" id="det_mov_count">0 movimientos</span>
                        </div>
                        <div class="table-responsive" style="max-height: 250px;">
                            <table class="table table-sm table-hover align-items-center mb-0" id="tabla_det_movimientos">
                                <thead style="background-color: #1E293B; color: #FFFFFF;">
                                    <tr>
                                        <th style="font-size: 0.725rem;">HORA</th>
                                        <th style="font-size: 0.725rem;">TIPO</th>
                                        <th style="font-size: 0.725rem;">DESCRIPCIÓN</th>
                                        <th style="font-size: 0.725rem;">CANAL</th>
                                        <th style="font-size: 0.725rem;">MÉTODO</th>
                                        <th class="text-right" style="font-size: 0.725rem;">MONTO</th>
                                    </tr>
                                </thead>
                                <tbody style="font-size: 0.825rem;" id="tbody_det_movimientos">
                                    <tr><td colspan="6" class="text-center text-muted py-3">Cargando movimientos...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0 bg-light py-2" style="border-radius: 0 0 12px 12px;">
                    <button type="button" class="btn btn-secondary font-weight-bold px-4" data-dismiss="modal" style="border-radius: 8px;">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Script de inicialización -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import CajaHistorialController from "<?php echo $URL; ?>/public/assets/js/controllers/caja/historial.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            CajaHistorialController.init();
        });
    </script>
</body>
