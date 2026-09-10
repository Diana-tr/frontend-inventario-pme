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

        <!-- Modulos Layout -->
        <?php
        require_once __DIR__ . '/../layouts/navbar.php';
        require_once __DIR__ . '/../layouts/sidebar.php';
        ?>

        <!-- Content Wrapper. Contains page content -->
        <div class="content-wrapper">
            <section class="content pt-4">
                <div class="container-fluid">

                    <!-- ═══════════════════════════════════════════════
                         FILA 1 — KPI Cards (generadas dinámicamente)
                         ═══════════════════════════════════════════════ -->
                    <div class="row" id="dashboard-kpi-row">
                        <!-- El controlador JS inyecta aquí las tarjetas KPI -->
                        <div class="col-12 text-center py-5" id="kpi-loading">
                            <i class="fas fa-spinner fa-spin fa-2x text-muted"></i>
                            <p class="text-muted mt-2 mb-0">Cargando indicadores...</p>
                        </div>
                    </div>

                    <!-- ═══════════════════════════════════════════════
                         FILA 2 — Gráficos
                         ═══════════════════════════════════════════════ -->
                    <div class="row mt-3" id="dashboard-chart-row">
                        <div class="col-lg-6 col-md-12 mb-4">
                            <div class="card shadow-sm border-0" style="border-radius: 0.75rem;">
                                <div class="card-header border-0 bg-white pt-4 pb-2" style="border-radius: 0.75rem 0.75rem 0 0;">
                                    <h3 class="card-title font-weight-bold text-dark mb-0">
                                        <i class="fas fa-chart-bar mr-2 text-primary"></i>Ventas vs Compras
                                    </h3>
                                </div>
                                <div class="card-body" id="chart-purchases-container">
                                    <canvas id="chart-purchases-monthly" style="min-height: 250px; height: 250px; max-height: 250px; max-width: 100%;"></canvas>
                                    <div class="text-center text-muted py-4 d-none" id="chart-purchases-empty">
                                        <i class="fas fa-chart-bar fa-3x mb-3 text-light"></i>
                                        <p class="mb-0">Sin datos suficientes</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-6 col-md-12 mb-4">
                            <div class="card shadow-sm border-0" style="border-radius: 0.75rem;">
                                <div class="card-header border-0 bg-white pt-4 pb-2" style="border-radius: 0.75rem 0.75rem 0 0;">
                                    <h3 class="card-title font-weight-bold text-dark mb-0">
                                        <i class="fas fa-chart-line mr-2 text-success"></i>Ventas últimos 30 días
                                    </h3>
                                </div>
                                <div class="card-body" id="chart-sales-container">
                                    <canvas id="chart-sales-monthly" style="min-height: 250px; height: 250px; max-height: 250px; max-width: 100%;"></canvas>
                                    <div class="text-center text-muted py-4 d-none" id="chart-sales-empty">
                                        <i class="fas fa-chart-line fa-3x mb-3 text-light"></i>
                                        <p class="mb-0">Sin datos suficientes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ═══════════════════════════════════════════════
                         FILA 3 — Listas / Cards informativas
                         ═══════════════════════════════════════════════ -->
                    <div class="row mt-2" id="dashboard-list-row">
                        <div class="col-lg-6 col-xl-4 mb-4">
                            <div class="card h-100 shadow-sm border-0" style="border-radius: 0.75rem;">
                                <div class="card-header border-0 bg-white pt-4 pb-2" style="border-radius: 0.75rem 0.75rem 0 0;">
                                    <h3 class="card-title font-weight-bold text-dark mb-0">
                                        <i class="fas fa-server mr-2 text-dark"></i>Actividad del Sistema
                                    </h3>
                                </div>
                                <div class="card-body pt-3 pb-4 px-4">
                                    <ul class="list-unstyled mb-0" id="erp_activity_container">
                                        <li class="text-center text-muted py-3">
                                            <i class="fas fa-spinner fa-spin mr-1"></i> Cargando...
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-6 col-xl-4 mb-4">
                            <div class="card h-100 shadow-sm border-0" style="border-radius: 0.75rem;">
                                <div class="card-header border-0 bg-white pt-4 pb-2" style="border-radius: 0.75rem 0.75rem 0 0;">
                                    <h3 class="card-title font-weight-bold text-dark mb-0">
                                        <i class="fas fa-exclamation-circle mr-2 text-danger"></i>Requiere atención
                                    </h3>
                                </div>
                                <div class="card-body pt-3 pb-4 px-4">
                                    <ul class="list-unstyled mb-0" id="needs_attention_container">
                                        <li class="text-center text-muted py-3">
                                            <i class="fas fa-spinner fa-spin mr-1"></i> Cargando...
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-6 col-xl-4 mb-4">
                            <div class="card h-100 shadow-sm border-0" style="border-radius: 0.75rem;">
                                <div class="card-header border-0 bg-white pt-4 pb-2" style="border-radius: 0.75rem 0.75rem 0 0;">
                                    <h3 class="card-title font-weight-bold text-dark mb-0">
                                        <i class="fas fa-trophy mr-2 text-warning"></i>Productos más vendidos
                                    </h3>
                                </div>
                                <div class="card-body pt-3 pb-4 px-4">
                                    <ul class="list-unstyled mb-0" id="top_selling_container">
                                        <li class="text-center text-muted py-3">
                                            <i class="fas fa-spinner fa-spin mr-1"></i> Cargando...
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ═══════════════════════════════════════════════
                         FILA 4 — Tabla de últimas ventas
                         ═══════════════════════════════════════════════ -->
                    <div class="row mt-2" id="dashboard-table-row">
                        <div class="col-12 mb-4">
                            <div class="card shadow-sm border-0" style="border-radius: 0.75rem;">
                                <div class="card-header border-0 bg-white pt-4 pb-2" style="border-radius: 0.75rem 0.75rem 0 0;">
                                    <h3 class="card-title font-weight-bold text-dark mb-0">
                                        <i class="fas fa-receipt mr-2 text-success"></i>Últimas ventas
                                    </h3>
                                </div>
                                <div class="card-body table-responsive p-0 mt-2 px-3 pb-3">
                                    <table class="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th class="border-top-0 text-muted font-weight-bold">ID</th>
                                                <th class="border-top-0 text-muted font-weight-bold">Cliente</th>
                                                <th class="border-top-0 text-muted font-weight-bold">Monto</th>
                                                <th class="border-top-0 text-muted font-weight-bold">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody id="latest_sales_container">
                                            <tr>
                                                <td colspan="4" class="text-center text-muted py-4">
                                                    <i class="fas fa-spinner fa-spin mr-1"></i> Cargando...
                                                </td>
                                            </tr>
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

    <!-- Chart.js (AdminLTE vendor) -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/chart.js/Chart.bundle.min.js"></script>

    <!-- Script al final del archivo PHP -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import DashboardController from "<?php echo $URL; ?>/public/assets/js/controllers/dashboard/dashboard.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            DashboardController.init();
        });
    </script>
</body>

</html>
