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
            <div class="content-header py-4">
                <div class="container-fluid" style="max-width: 1250px;">
                    <div class="row mb-2 align-items-center">
                        <div class="col-sm-6">
                            <h2 class="m-0 font-weight-bold text-dark"><i class="fas fa-cash-register mr-2" style="color: #2563EB;"></i>Monitor Operativo de Cajas (POS)</h2>
                            <p class="text-muted small mb-0 mt-1">Supervisión en tiempo real de gavetas y recaudos de caja</p>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right bg-transparent mb-0">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard" class="text-primary">Inicio</a></li>
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/caja" class="text-primary">Caja</a></li>
                                <li class="breadcrumb-item active text-muted">Monitor</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <section class="content pb-5">
                <div class="container-fluid" style="max-width: 1250px;">

                    <!-- Loader -->
                    <div id="caja_resumen_loader" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
                        <p class="mt-2 text-muted font-weight-bold">Consultando estado de gavetas...</p>
                    </div>

                    <!-- Contenido -->
                    <div id="caja_resumen_content" style="display: none;">
                        <!-- Fila 1: KPIs de Gavetas y Flujo de Caja -->
                        <div class="row">
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-primary shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_drawers">$ 0.00</h3>
                                        <p>Efectivo en Gavetas (Activo)</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-wallet"></i></div>
                                    <a href="<?php echo $URL; ?>/caja" class="small-box-footer">Ir a Sesión Actual <i class="fas fa-arrow-circle-right"></i></a>
                                </div>
                            </div>
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-success shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_sales_cash">$ 0.00</h3>
                                        <p>Cobros Efectivo Hoy</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-money-bill-wave"></i></div>
                                    <a href="<?php echo $URL; ?>/ventas" class="small-box-footer">Ver Ventas <i class="fas fa-arrow-circle-right"></i></a>
                                </div>
                            </div>
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-info shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_sales_elec">$ 0.00</h3>
                                        <p>Cobros Electrónicos Hoy</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-credit-card"></i></div>
                                    <a href="<?php echo $URL; ?>/ventas" class="small-box-footer">Ver Ventas <i class="fas fa-arrow-circle-right"></i></a>
                                </div>
                            </div>
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-danger shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_cash_out">$ 0.00</h3>
                                        <p>Salidas Manuales de Caja</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-arrow-up"></i></div>
                                    <a href="<?php echo $URL; ?>/caja/historial" class="small-box-footer">Historial <i class="fas fa-arrow-circle-right"></i></a>
                                </div>
                            </div>
                        </div>

                        <!-- Fila 2: Gráfico y Sesiones Activas -->
                        <div class="row mt-3">
                            <div class="col-lg-8 mb-4">
                                <div class="card border-0 shadow-sm" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0 py-3">
                                        <h5 class="card-title font-weight-bold text-dark mb-0"><i class="fas fa-chart-bar mr-2 text-primary"></i> Recaudo del Turno de Hoy</h5>
                                    </div>
                                    <div class="card-body">
                                        <canvas id="chart_caja_flow" style="min-height: 260px; height: 260px; max-height: 260px;"></canvas>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 mb-4">
                                <div class="card border-0 shadow-sm h-100" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                        <h5 class="card-title font-weight-bold text-dark mb-0"><i class="fas fa-cash-register mr-2 text-success"></i> Cajas Abiertas</h5>
                                        <span class="badge badge-success px-2 py-1" id="badge_open_count">0</span>
                                    </div>
                                    <div class="card-body p-0 table-responsive" style="max-height: 280px;">
                                        <table class="table table-hover mb-0">
                                            <thead class="bg-light">
                                                <tr>
                                                    <th class="border-0 text-muted small">Caja</th>
                                                    <th class="border-0 text-muted small">Cajero</th>
                                                    <th class="border-0 text-muted small text-right">Saldo Esperado</th>
                                                </tr>
                                            </thead>
                                            <tbody id="tbody_open_sessions" style="font-size: 0.85rem;">
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>

        <?php require_once __DIR__ . '/../layouts/footer.php'; ?>
    </div>

    <!-- Chart.js -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/chart.js/Chart.bundle.min.js"></script>
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import CajaResumenController from "<?php echo $URL; ?>/public/assets/js/controllers/caja/resumen.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            CajaResumenController.init();
        });
    </script>
</body>

</html>

