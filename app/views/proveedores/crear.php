<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../layouts/head.php';
?>

<!-- Select2 CSS -->
<link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/css/select2.min.css">
<link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2-bootstrap4-theme/select2-bootstrap4.min.css">

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
                            <h1 class="m-0"><i class="fas fa-tags mr-2"></i>Gestión de Proveedores</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item active">Proveedor</li>
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
                                    <h3 class="card-title"><i class="fas fa-tags mr-1"></i> Formulario de Proveedor</h3>
                                </div>
                                <!-- /.card-header -->

                                <!-- Formulario inicio -->
                                <form id="form_crear_proveedor" action="#" method="POST" autocomplete="off">
                                    <div class="card-body">
                                        <div class="row">

                                            <!-- Name -->
                                            <div class="col-md-6 form-group">
                                                <label for="first_name">Nombre <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                                                    </div>
                                                    <input type="text" name="first_name" id="first_name" class="form-control" placeholder="Ej. Juan" required>
                                                </div>
                                            </div>

                                            <!-- Tipo de Documento (Select2) -->
                                            <div class="col-md-6 form-group">
                                                <label for="document_type">Tipo de Documento <span class="text-danger">*</span></label>
                                                <div class="select2-primary">
                                                    <select class="select2" id="document_type" name="document_type" data-placeholder="Seleccionar tipo de Documento" data-dropdown-css-class="select2-primary" style="width: 100%;">
                                                        <!-- Las opciones se cargarán por JS -->
                                                    </select>
                                                </div>
                                            </div>

                                            <!-- Apellidos -->
                                            <div class="col-md-6 form-group">
                                                <label for="last_name">Apellidos <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                                                    </div>
                                                    <input type="text" name="last_name" id="last_name" class="form-control" placeholder="Ej. Pérez" required>
                                                </div>
                                            </div>

                                            <!-- Numero de Documento -->
                                            <div class="col-md-6 form-group">
                                                <label for="document_number">Numero de Documento <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-id-card"></i></span>
                                                    </div>
                                                    <input type="text" name="document_number" id="document_number" class="form-control" placeholder="Ej. 1010101010" required>
                                                </div>
                                            </div>

                                            <!-- Empresa -->
                                            <div class="col-md-6 form-group">
                                                <label for="business_name">Nombre de Empresa</label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-building"></i></span>
                                                    </div>
                                                    <input type="text" name="business_name" id="business_name" class="form-control" placeholder="Ej. Distribuciones Pérez S.A.S.">
                                                </div>
                                            </div>

                                             <!-- Email -->
                                            <div class="col-md-6 form-group">
                                                <label for="email">Email</label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                                    </div>
                                                    <input type="email" name="email" id="email" class="form-control" placeholder="Ej. juan@example.com">
                                                </div>
                                            </div>

                                             <!-- Movile -->
                                            <div class="col-md-6 form-group">
                                                <label for="movile">N° Celular</label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-mobile-alt"></i></span>
                                                    </div>
                                                    <input type="text" name="movile" id="movile" class="form-control" placeholder="Ej. 3207250028">
                                                </div>
                                            </div>
                                            <!-- Direccion -->
                                            <div class="col-md-6 form-group">
                                                <label for="address">Direccion</label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-map-marker-alt"></i></span>
                                                    </div>
                                                    <input type="text" name="address" id="address" class="form-control" placeholder="Ej. Carrera 10 #20-30">
                                                </div>
                                            </div>
                                            
                                             <!-- Ciudad -->
                                            <div class="col-md-6 form-group">
                                                <label for="city">Ciudad</label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-city"></i></span>
                                                    </div>
                                                    <input type="text" name="city" id="city" class="form-control" placeholder="Ej. Bogotá">
                                                </div>
                                            </div>
                                            <!-- Pais -->
                                            <div class="col-md-6 form-group">
                                                <label for="country">Pais</label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-globe"></i></span>
                                                    </div>
                                                    <input type="text" name="country" id="country" class="form-control" placeholder="Ej. Colombia" value="Colombia">
                                                </div>
                                            </div>
                                            
                                            <!-- Teléfono -->
                                            <div class="col-md-6 form-group">
                                                <label for="phone">Teléfono</label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-phone"></i></span>
                                                    </div>
                                                    <input type="text" name="phone" id="phone" class="form-control" placeholder="Ej. 6011234567">
                                                </div>
                                            </div>

                                            <!-- Notas -->
                                            <div class="col-md-12 form-group">
                                                <label for="notes">Notas</label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-sticky-note"></i></span>
                                                    </div>
                                                    <textarea name="notes" id="notes" class="form-control" rows="3" placeholder="Notas adicionales"></textarea>
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
                                            <i class="fas fa-save mr-1"></i> Guardar Proveedor
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

    <!-- Select2 JS -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/select2.full.min.js"></script>

    <!-- Script de inicialización -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import CrearProveedorController from "<?php echo $URL; ?>/public/assets/js/controllers/proveedor/crear.js";

        document.addEventListener("DOMContentLoaded", async () => {
            // Inicializar Select2 nativamente
            $('.select2').select2({
                theme: 'bootstrap4'
            });

            await App.bootstrap();
            CrearProveedorController.init();
        });
    </script>
</body>
</html>
