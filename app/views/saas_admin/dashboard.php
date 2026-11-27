<?php

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../layouts/head.php';
?>

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">

        <!-- Navbar SaaS Admin Exclusivo -->
        <?php require_once __DIR__ . '/layouts/navbar.php'; ?>

        <!-- Sidebar SaaS (Nuevo) -->
        <?php require_once __DIR__ . '/layouts/sidebar.php'; ?>

        <!-- Content Wrapper -->
        <div class="content-wrapper" style="background-color: #F8FAFC;">

            <div class="content-header pt-4">
                <div class="container-fluid">
                    <h1 class="m-0 font-weight-bold text-dark"><i class="fas fa-chart-line text-primary mr-2"></i>Dashboard Global SaaS</h1>
                    <p class="text-muted">Métricas de rendimiento y salud de la plataforma.</p>
                </div>
            </div>

            <section class="content">
                <div class="container-fluid">

                    <!-- Loader -->
                    <div id="saas_dashboard_loader" class="text-center py-5">
                        <i class="fas fa-spinner fa-spin fa-3x text-primary"></i>
                        <p class="mt-3 text-muted font-weight-bold">Calculando métricas...</p>
                    </div>

                    <!-- Contenido Real -->
                    <div id="saas_dashboard_content" style="display: none;">

                        <!-- Fila 1: KPIs -->
                        <div class="row">
                            <!-- MRR -->
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-success shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_mrr">$0</h3>
                                        <p>Ingreso Recurrente (MRR)</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-dollar-sign"></i></div>
                                </div>
                            </div>

                            <!-- Empresas Totales -->
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-primary shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_total_companies">0</h3>
                                        <p>Empresas Registradas</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-building"></i></div>
                                </div>
                            </div>

                            <!-- Suscripciones Activas -->
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-info shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_active_subscriptions">0</h3>
                                        <p>Suscripciones Activas</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-check-circle"></i></div>
                                </div>
                            </div>

                            <!-- Trials -->
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-warning shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_active_trials">0</h3>
                                        <p>En Prueba (Trial)</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-hourglass-half"></i></div>
                                </div>
                            </div>
                        </div>

                        <!-- Fila 1b: KPIs Secundarios -->
                        <div class="row mt-3">
                            <!-- Total Usuarios -->
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-gradient-indigo shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_total_users">0</h3>
                                        <p>Usuarios Totales</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-users"></i></div>
                                </div>
                            </div>

                            <!-- Empresas Activas -->
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-gradient-teal shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_active_companies">0</h3>
                                        <p>Empresas Activas</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-check-double"></i></div>
                                </div>
                            </div>

                            <!-- Empresas Suspendidas -->
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-gradient-orange shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_suspended_companies">0</h3>
                                        <p>Empresas Suspendidas</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-ban"></i></div>
                                </div>
                            </div>

                            <!-- Ingresos del Mes -->
                            <div class="col-lg-3 col-6">
                                <div class="small-box bg-gradient-purple shadow-sm" style="border-radius: 12px;">
                                    <div class="inner">
                                        <h3 id="kpi_month_revenue">$0</h3>
                                        <p>Ingresos del Mes</p>
                                    </div>
                                    <div class="icon"><i class="fas fa-chart-bar"></i></div>
                                </div>
                            </div>
                        </div>

                        <!-- Fila 2: Gráfico y Pagos -->
                        <div class="row mt-3">
                            <div class="col-lg-7">
                                <div class="card shadow-sm border-0" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0">
                                        <h3 class="card-title font-weight-bold">Distribución de Clientes</h3>
                                    </div>
                                    <div class="card-body">
                                        <canvas id="chart_saas_distribution" style="min-height: 300px; height: 300px;"></canvas>
                                    </div>
                                </div>
                            </div>

                            <div class="col-lg-5">
                                <div class="card shadow-sm border-0" style="border-radius: 12px;">
                                    <div class="card-header bg-white border-0">
                                        <h3 class="card-title font-weight-bold">Últimos Pagos</h3>
                                    </div>
                                    <div class="card-body p-0">
                                        <table class="table table-hover mb-0">
                                            <thead class="bg-light">
                                                <tr>
                                                    <th>Empresa</th>
                                                    <th>Monto</th>
                                                    <th>Fecha</th>
                                                </tr>
                                            </thead>
                                            <tbody id="tbody_ultimos_pagos">
                                                <!-- Se llena con JS -->
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

        <?php
        require_once __DIR__ . '/../layouts/control-sidebar.php';
        require_once __DIR__ . '/../layouts/footer.php';
        ?>
    </div>

    <!-- Chart.js -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/chart.js/Chart.bundle.min.js"></script>

    <!-- Controlador SaaS -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import SaasDashboardController from "<?php echo $URL; ?>/public/assets/js/controllers/saas_admin/dashboard_controller.js";

        document.addEventListener("DOMContentLoaded", async () => {
            const ok = await App.bootstrap();
            if (!ok) return;
            SaasDashboardController.init();
        });
    </script>
</body>

</html>
