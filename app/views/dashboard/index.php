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
            <section class="content pt-4">
                <div class="container-fluid">

                    <!-- ═══════════════════════════════════════════════
                         FILA 1 — KPI Cards Consolidadas (6 tarjetas)
                         ═══════════════════════════════════════════════ -->
                    <div class="row" id="dashboard-kpi-row">
                        <div class="col-12 text-center py-5" id="kpi-loading">
                            <i class="fas fa-spinner fa-spin fa-2x text-muted"></i>
                            <p class="text-muted mt-2 mb-0">Cargando indicadores...</p>
                        </div>
                    </div>

                    <!-- ═══════════════════════════════════════════════    
                         FILA 2 — Gráficos (Ventas vs Compras & Ventas 30 días)
                         ═══════════════════════════════════════════════ -->
                    <div class="row mt-3" id="dashboard-chart-row">

                        <!-- Gráfico 1: Ventas vs Compras (Barras) -->
                        <div class="col-lg-6 col-md-4 mb-4">
                            <div class="card shadow-sm border-0 h-100" style="border-radius: 0.75rem; background-color: #FFFFFF;">
                                <div class="card-header border-0 bg-white pt-4 pb-2" style="border-radius: 0.75rem 0.75rem 0 0;">
                                    <h3 class="card-title font-weight-bold mb-0" style="color: #0F172A; font-size: 1rem;">
                                        <i class="fas fa-chart-bar mr-2" style="color: #2563EB;"></i>Ventas vs Compras
                                    </h3>
                                </div>
                                <div class="card-body" id="chart-purchases-container">
                                    <canvas id="chart-purchases-monthly" style="min-height: 220px; height: 220px; max-height: 220px; max-width: 100%;"></canvas>
                                    <div class="text-center text-muted py-4 d-none" id="chart-purchases-empty">
                                        <i class="fas fa-chart-bar fa-3x mb-3 text-light"></i>
                                        <p class="mb-0">Sin datos suficientes</p>
                                    </div>
                                </div>
                            </div>
                        </div>          

                        <!-- Gráfico 2: Ventas últimos 30 días (Línea) -->
                        <div class="col-lg-6 col-md-4 mb-4">
                            <div class="card shadow-sm border-0 h-100" style="border-radius: 0.75rem; background-color: #FFFFFF;">
                                <div class="card-header border-0 bg-white pt-4 pb-2" style="border-radius: 0.75rem 0.75rem 0 0;">
                                    <h3 class="card-title font-weight-bold mb-0" style="color: #0F172A; font-size: 1rem;">
                                        <i class="fas fa-chart-line mr-2" style="color: #16A34A;"></i>Ventas últimos 30 días
                                    </h3>
                                </div>
                                <div class="card-body" id="chart-sales-container">
                                    <canvas id="chart-sales-monthly" style="min-height: 220px; height: 220px; max-height: 220px; max-width: 100%;"></canvas>
                                    <div class="text-center text-muted py-4 d-none" id="chart-sales-empty">
                                        <i class="fas fa-chart-line fa-3x mb-3 text-light"></i>
                                        <p class="mb-0">Sin datos suficientes</p>
                                    </div>
                                </div>
                            </div>
                        </div>     
                    </div>

                    <!-- ═══════════════════════════════════════════════    
                         FILA 2.5 — Gráfico Torta con Información del Inventario
                         ═══════════════════════════════════════════════ -->
                    <div class="row mt-2">
                        <!-- Gráfico 3: Stock de inventario (Torta/Rosquilla) -->
                        <div class="col-12 mb-4">
                            <div class="card shadow-sm border-0 h-100" style="border-radius: 0.75rem; background-color: #FFFFFF;">
                                <div class="card-header border-0 bg-white pt-4 pb-2" style="border-radius: 0.75rem 0.75rem 0 0;">
                                    <h3 class="card-title font-weight-bold mb-0" style="color: #0F172A; font-size: 1rem;">
                                        <i class="fas fa-chart-pie mr-2" style="color: #F59E0B;"></i>Stock de inventario
                                    </h3>
                                </div>
                                <div class="card-body" id="chart-pie-container">
                                    <div class="row align-items-center">
                                        <!-- Gráfico -->
                                        <div class="col-lg-6 col-md-12 mb-3 mb-lg-0">
                                            <canvas id="chart-sales-pie" style="min-height: 280px; height: 280px; max-height: 280px; max-width: 100%;"></canvas>
                                            <div class="text-center text-muted py-4 d-none" id="chart-pie-empty">
                                                <i class="fas fa-chart-pie fa-3x mb-3 text-light"></i>
                                                <p class="mb-0">Sin datos suficientes</p>
                                            </div>    
                                        </div>
                                        
                                        <!-- Información de Estado de Stock (Normal, Bajo, Crítico) -->
                                        <div class="col-lg-6 col-md-12" id="chart-pie-info">
                                            <h6 class="font-weight-bold text-dark mb-3">
                                                <i class="fas fa-boxes mr-1 text-muted"></i> Resumen de Niveles de Stock
                                            </h6>
                                            
                                            <div class="d-flex flex-column gap-2">
                                                <!-- Stock Normal -->
                                                <div class="p-3 mb-2 rounded border-left" style="background-color: #F8FAFC; border-left: 5px solid #16A34A !important;">
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span class="badge badge-success px-2 py-1 mb-1"><i class="fas fa-check-circle mr-1"></i> Stock Normal</span>
                                                            <p class="text-muted small mb-0">Productos con cantidad suficiente para venta.</p>
                                                        </div>
                                                        <h4 class="font-weight-bold text-success mb-0" id="stock-normal-count">0</h4>
                                                    </div>
                                                </div>

                                                <!-- Stock Bajo -->
                                                <div class="p-3 mb-2 rounded border-left" style="background-color: #FFFBEB; border-left: 5px solid #F59E0B !important;">
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span class="badge badge-warning text-white px-2 py-1 mb-1" style="background-color: #F59E0B;"><i class="fas fa-exclamation-triangle mr-1"></i> Stock Bajo</span>
                                                            <p class="text-muted small mb-0">Productos próximos a alcanzar el stock mínimo.</p>
                                                        </div>
                                                        <h4 class="font-weight-bold mb-0" style="color: #D97706;" id="stock-bajo-count">0</h4>
                                                    </div>
                                                </div>

                                                <!-- Stock Crítico -->
                                                <div class="p-3 rounded border-left" style="background-color: #FEF2F2; border-left: 5px solid #DC2626 !important;">
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span class="badge badge-danger px-2 py-1 mb-1"><i class="fas fa-times-circle mr-1"></i> Stock Crítico / Agotado</span>
                                                            <p class="text-muted small mb-0">Productos agotados o que requieren reposición urgente.</p>
                                                        </div>
                                                        <h4 class="font-weight-bold text-danger mb-0" id="stock-critico-count">0</h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>                                            
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

                        <!-- Gráfico 4: Métodos de Pago (Rosquilla) -->
                        <div class="col-lg-6 col-xl-4 mb-4">
                            <div class="card shadow-sm border-0 h-100" style="border-radius: 0.75rem; background-color: #FFFFFF;">
                                <div class="card-header border-0 bg-white pt-4 pb-2" style="border-radius: 0.75rem 0.75rem 0 0;">
                                    <h3 class="card-title font-weight-bold mb-0" style="color: #0F172A; font-size: 1rem;">
                                        <i class="fas fa-credit-card mr-2" style="color: #0891B2;"></i>Métodos de Pago
                                    </h3>
                                </div>
                                <div class="card-body" id="chart-payment-container">
                                    <canvas id="chart-payment-methods" style="min-height: 220px; height: 220px; max-height: 220px; max-width: 100%;"></canvas>
                                    <div class="text-center text-muted py-4 d-none" id="chart-payment-empty">
                                        <i class="fas fa-wallet fa-3x mb-3 text-light"></i>
                                        <p class="mb-0">Sin datos suficientes</p>
                                    </div>
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