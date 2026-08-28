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
                            <h1 class="m-0"><i class="fas fa-users mr-2"></i>Gestión de Usuarios</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item active">Usuarios</li>
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
                            <div class="card card-outline card-primary shadow-sm">
                                <div class="card-header d-flex align-items-center">
                                    <h3 class="card-title font-weight-bold">Listado de Usuarios</h3>
                                    <div class="card-tools ml-auto">
                                        <a href="<?php echo $URL; ?>/usuarios/crear" class="btn btn-primary btn-sm">
                                            <i class="fas fa-user-plus mr-1"></i> Registrar Nuevo Usuario
                                        </a>
                                    </div>
                                </div>

                                <div class="card-body">
                                    <table id="tbl_usuarios" class="table table-bordered table-striped table-hover responsive nowrap" width="100%">
                                        <thead class="bg-dark text-white">
                                            <tr>
                                                <th class="text-center" style="width: 50px;">N°</th>
                                                <th>Nombre Completo</th>
                                                <th>Nombre de Usuario</th>
                                                <th>Correo Electrónico</th>
                                                <th>Rol / Permiso</th>
                                                <th class="text-center">Estado</th>
                                                <th class="text-center" style="width: 110px;">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaUsuariosBody">
                                        </tbody>
                                    </table>
                                </div>
                                <!-- /.card-body -->
                            </div>
                            <!-- /.card -->
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

    <!-- Script de inicialización (ahora delegado al controlador JS) -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import UsuarioListController from "<?php echo $URL; ?>/public/assets/js/controllers/usuario/listar.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            UsuarioListController.init();
        });
    </script>
