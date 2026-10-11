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
        <div class="content-wrapper" style="background-color: #F8FAFC !important;">
            <!-- Header de la página -->
            <div class="content-header py-4">
                <div class="container-fluid">
                    <div class="row mb-2 align-items-center">
                        <div class="col-sm-6">
                            <h2 class="m-0 font-weight-bold text-dark"><i class="fas fa-cash-register mr-2" style="color: #2563EB;"></i>Cajas Registradoras</h2>
                            <p class="text-muted small mb-0 mt-1">Gestión y registro de puntos de venta / cajas</p>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right bg-transparent mb-0">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard" class="text-primary">Inicio</a></li>
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/caja" class="text-primary">Caja</a></li>
                                <li class="breadcrumb-item active text-muted">Crear Caja</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content pb-5">
                <div class="container-fluid">
                    <div class="row justify-content-center">
                        <div class="col-md-8">
                            <div class="card border-0 shadow-sm" style="background-color: #FFFFFF; border-radius: 12px; border-top: 4px solid #2563EB !important;">
                                <div class="card-header bg-white border-0 py-3">
                                    <h5 class="card-title font-weight-bold text-dark mb-0"><i class="fas fa-plus-circle mr-2 text-primary"></i> Formulario de Caja Registradora</h5>
                                </div>
                                <!-- /.card-header -->

                                <!-- Formulario inicio -->
                                <form id="form_crear_caja" action="#" method="POST" autocomplete="off" novalidate>
                                    <div class="card-body p-4">
                                        <div class="row">

                                            <!-- Name -->
                                            <div class="col-md-12 form-group mb-4">
                                                <label for="name" class="font-weight-bold small text-uppercase text-muted">Nombre de Caja <span class="text-danger">*</span></label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text bg-light border-right-0" style="border-color: #E2E8F0; border-radius: 8px 0 0 8px;">
                                                            <i class="fas fa-cash-register text-muted"></i>
                                                        </span>
                                                    </div>
                                                    <input type="text" name="name" id="name" class="form-control border-left-0" placeholder="Ej. Caja Principal, Caja POS 1" style="border-color: #E2E8F0; border-radius: 0 8px 8px 0; color: #0F172A;" required>
                                                    <div class="invalid-feedback">Debe ingresar un nombre para la caja.</div>
                                                </div>
                                            </div>

                                            <!-- Descripción -->
                                            <div class="col-md-12 form-group mb-0">
                                                <label for="description" class="font-weight-bold small text-uppercase text-muted">Descripción</label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text bg-light border-right-0" style="border-color: #E2E8F0; border-radius: 8px 0 0 8px;">
                                                            <i class="fas fa-align-left text-muted"></i>
                                                        </span>
                                                    </div>
                                                    <textarea name="description" id="description" class="form-control border-left-0" rows="3" placeholder="Descripción opcional de la caja" style="border-color: #E2E8F0; border-radius: 0 8px 8px 0; color: #0F172A;"></textarea>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <!-- /.card-body -->

                                    <div class="card-footer border-0 bg-light py-3 px-4 d-flex justify-content-end" style="border-radius: 0 0 12px 12px;">
                                        <a href="index.php" class="btn font-weight-bold px-4 py-2 mr-2 text-white shadow-sm" style="background-color: #64748B; border: none; border-radius: 8px;">
                                            <i class="fas fa-times-circle mr-1"></i> Cancelar
                                        </a>
                                        <button type="submit" class="btn font-weight-bold px-4 py-2 text-white shadow-sm" style="background-color: #2563EB; border: none; border-radius: 8px;">
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