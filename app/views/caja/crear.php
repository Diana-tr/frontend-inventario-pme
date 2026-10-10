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
                            <h1 class="m-0"><i class="fas fa-cash-register mr-2"></i>Cajas Registradoras</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/caja">Caja</a></li>
                                <li class="breadcrumb-item active">Crear Caja</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card card-primary shadow-sm">
                                <div class="card-header">
                                    <h3 class="card-title"><i class="fas fa-plus-circle mr-1"></i> Formulario de Caja Registradora</h3>
                                </div>
                                <!-- /.card-header -->

                                <!-- Formulario inicio -->
                                <form id="form_crear_caja" action="#" method="POST" autocomplete="off" novalidate>
                                    <div class="card-body">
                                        <div class="row">

                                            <!-- Name -->
                                            <div class="col-md-12 form-group">
                                                <label for="name">Nombre de Caja <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-cash-register"></i></span>
                                                    </div>
                                                    <input type="text" name="name" id="name" class="form-control" placeholder="Ej. Caja Principal, Caja POS 1" required>
                                                    <div class="invalid-feedback">Debe ingresar un nombre para la caja.</div>
                                                </div>
                                            </div>

                                            <!-- Descripción -->
                                            <div class="col-md-12 form-group">
                                                <label for="description">Descripción</label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-align-left"></i></span>
                                                    </div>
                                                    <textarea name="description" id="description" class="form-control" rows="3" placeholder="Descripción opcional de la caja"></textarea>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <!-- /.card-body -->

                                    <div class="card-footer d-flex justify-content-end">
                                        <a href="index.php" class="btn btn-secondary mr-2">
                                            <i class="fas fa-times-circle mr-1"></i> Cancelar
                                        </a>
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-save mr-1"></i> Guardar Caja
                                        </button>
                                    </div>
                                </form>
                                <!-- Formulario fin -->
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

    <!-- Script de inicialización -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import CrearCajaController from "<?php echo $URL; ?>/public/assets/js/controllers/caja/crear.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            CrearCajaController.init();
        });
    </script>
</body>
</html>
