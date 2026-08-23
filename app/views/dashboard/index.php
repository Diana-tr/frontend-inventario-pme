<?php
require_once __DIR__ . '../../../config/app.php';
require_once __DIR__ . '../../../../app/views/layouts/head.php';
?>

<body class="hold-transition sidebar-mini layout-fixed">
    <div class="wrapper">

        <!-- Preloader -->
        <div class="preloader flex-column justify-content-center align-items-center">
            <img class="animation__shake" src="<?php echo $URL; ?>public/assets/vendor/AdminLTE-3.2.0/dist/img/AdminLTELogo.png" alt="AdminLTELogo" height="60" width="60">
        </div>

        <!-- Modulos Layout -->
        <?php require_once __DIR__ . '../../../../app/views/layouts/navbar.php'; ?>
        <?php require_once __DIR__ . '../../../../app/views/layouts/sidebar.php'; ?>

        <!-- Content Wrapper. Contains page content -->
        <div class="content-wrapper">
            <section class="content">
                <div class="container-fluid">
                    <!-- Aqui va el contenido dinamico del dashboard -->
                    <h2>Contenido del dashboar</h2>
                </div>
            </section>
        </div>

        <?php require_once __DIR__ . '../../../../app/views/layouts/control-sidebar.php'; ?>
        <?php require_once __DIR__ . '../../../../app/views/layouts/footer.php'; ?>
