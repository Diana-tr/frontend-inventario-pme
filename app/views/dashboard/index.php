<?php
require_once __DIR__ . '../../../config/app.php';
require_once __DIR__ . '../../../../app/views/layouts/head.php';
?>

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">

        <!-- Preloader -->
        <div class="preloader flex-column justify-content-center align-items-center">
            <img class="animation__shake" src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo inventario PME" height="60" width="60">
        </div>

        <!-- Modulos Layout -->
        <?php require_once __DIR__ . '../../../../app/views/layouts/navbar.php'; ?>
        <?php require_once __DIR__ . '../../../../app/views/layouts/sidebar.php'; ?>

        <!-- Content Wrapper. Contains page content -->
        <div class="content-wrapper">
            <section class="content">
                <div class="container-fluid">
                    <!-- Aqui va el contenido dinamico del dashboard -->
                    <div class="row">
                        <div class="col-lg-3 col-6">
                            <!-- small box -->
                            <div class="small-box bg-info">
                                <div class="inner">
                                    <h3>0</h3>

                                    <p>Usuarios</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <a href="#" class="small-box-footer">Ver Usuarios <i class="fas fa-arrow-circle-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <?php require_once __DIR__ . '../../../../app/views/layouts/control-sidebar.php'; ?>
        <?php require_once __DIR__ . '../../../../app/views/layouts/footer.php'; ?>
