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
                    <!-- Contenido dinamico del dashboard -->
                    <div class="row">

                        <!-- Tarjeta 1: Usuarios -->
                        <div class="col-lg-3 col-6" data-permission="users.view">
                            <div class="small-box bg-info">
                                <div class="inner">
                                    <h3 id="total_usuarios">0</h3>
                                    <p>Usuarios</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <a href="<?php echo $URL; ?>/usuarios" class="small-box-footer">
                                    Ver Usuarios <i class="fas fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Tarjeta 2: Roles Creados -->
                        <div class="col-lg-3 col-6" data-permission="roles.view">
                            <div class="small-box bg-success">
                                <div class="inner">
                                    <h3 id="total_roles">0</h3>
                                    <p>Roles Creados</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-user-shield"></i>
                                </div>
                                <a href="<?php echo $URL; ?>/roles" class="small-box-footer">
                                    Ver Roles <i class="fas fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Tarjeta 3: Total Productos -->
                        <div class="col-lg-3 col-6" data-permission="inventory.view">
                            <div class="small-box bg-warning">
                                <div class="inner">
                                    <h3 id="total_productos">0</h3>
                                    <p>Productos en Inventario</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-boxes"></i>
                                </div>
                                <a href="<?php echo $URL; ?>/inventario" class="small-box-footer">
                                    Ver Inventario <i class="fas fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Tarjeta 4: Stock Crítico / Alertas -->
                        <div class="col-lg-3 col-6" data-permission="inventory.view">
                            <div class="small-box bg-danger">
                                <div class="inner">
                                    <h3 id="stock_bajo">0</h3>
                                    <p>Stock Bajo / Crítico</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <a href="<?php echo $URL; ?>/inventario/alertas" class="small-box-footer">
                                    Ver Alertas <i class="fas fa-arrow-circle-right"></i>
                                </a>
                            </div>
                        </div>

                    </div>

                    <!-- Segunda Fila: Módulos adicionales (Categorías) -->
                    <div class="row">
                        <!-- Tarjeta 5: Categorías -->
                        <div class="col-lg-3 col-6" data-permission="categories.view">
                            <div class="small-box bg-primary">
                                <div class="inner">
                                    <h3 id="total_categorias">0</h3>
                                    <p>Categorías</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-tags"></i>
                                </div>
                                <a href="<?php echo $URL; ?>/categorias" class="small-box-footer">
                                    Ver Categorías <i class="fas fa-arrow-circle-right"></i>
                                </a>
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