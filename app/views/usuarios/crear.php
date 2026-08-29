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
                        <div class="col-md-12">
                            <div class="card card-primary shadow-sm">
                                <div class="card-header">
                                    <h3 class="card-title"><i class="fas fa-address-card mr-1"></i> Formulario de Registro</h3>
                                </div>
                                <!-- /.card-header -->

                                <!-- Formulario inicio -->
                                <form id="form_crear_usuario" action="#" method="POST" autocomplete="off">
                                    <div class="card-body">
                                        <div class="row">

                                            <!-- First Name (Nombres) -->
                                            <div class="col-md-6 form-group">
                                                <label for="first_name">Nombres <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                                                    </div>
                                                    <input type="text" name="first_name" id="first_name" class="form-control" placeholder="Ej. Juan" required>
                                                </div>
                                            </div>

                                            <!-- Last Name (Apellidos) -->
                                            <div class="col-md-6 form-group">
                                                <label for="last_name">Apellidos <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                                                    </div>
                                                    <input type="text" name="last_name" id="last_name" class="form-control" placeholder="Ej. Pérez" required>
                                                </div>
                                            </div>

                                            <!-- Username -->
                                            <div class="col-md-6 form-group">
                                                <label for="username">Nombre de Usuario <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-user-tag"></i></span>
                                                    </div>
                                                    <input type="text" name="username" id="username" class="form-control" placeholder="Ej. juanperez" required>
                                                </div>
                                            </div>

                                            <!-- Document Number -->
                                            <div class="col-md-6 form-group">
                                                <label for="document_number">Número de Documento <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-id-card"></i></span>
                                                    </div>
                                                    <input type="text" name="document_number" id="document_number" class="form-control" placeholder="Ej. 123456789" required>
                                                </div>
                                            </div>

                                            <!-- Email -->
                                            <div class="col-md-6 form-group">
                                                <label for="email">Correo Electrónico <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                                    </div>
                                                    <input type="email" name="email" id="email" class="form-control" placeholder="juan@gmail.com" required>
                                                </div>
                                            </div>

                                            <!-- Phone Number -->
                                            <div class="col-md-6 form-group">
                                                <label for="phone_number">Número de Teléfono <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-phone"></i></span>
                                                    </div>
                                                    <input type="text" name="phone_number" id="phone_number" class="form-control" placeholder="Ej. 3001234567" required>
                                                </div>
                                            </div>

                                            <!-- Password -->
                                            <div class="col-md-6 form-group">
                                                <label for="password">Contraseña <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                                    </div>
                                                    <input type="password" name="password" id="password" class="form-control" placeholder="Ingrese contraseña segura" required>
                                                </div>
                                            </div>

                                            <!-- Confirmar Contraseña (para validación visual en cliente) -->
                                            <div class="col-md-6 form-group">
                                                <label for="password_repeat">Confirmar Contraseña <span class="text-danger">*</span></label>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                                    </div>
                                                    <input type="password" id="password_repeat" class="form-control" placeholder="Repita la contraseña" required>
                                                </div>
                                            </div>

                                            <!-- Roles (Select2) -->
                                            <div class="col-md-12 form-group">
                                                <label for="roles">Rol(es) <span class="text-danger">*</span></label>
                                                <div class="select2-purple">
                                                    <select class="select2" id="roles" name="roles" multiple="multiple" data-placeholder="Seleccionar rol(es)" data-dropdown-css-class="select2-purple" style="width: 100%;" required>
                                                        <!-- Las opciones se cargarán por JS -->
                                                    </select>
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
                                            <i class="fas fa-save mr-1"></i> Guardar Usuario
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

    <!-- Script de inicialización (ahora delegado al controlador JS) -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import CrearUsuarioController from "<?php echo $URL; ?>/public/assets/js/controllers/usuario/crear.js";

        document.addEventListener("DOMContentLoaded", async () => {
            // Inicializar Select2 nativamente
            $('.select2').select2({
                theme: 'bootstrap4'
            });

            await App.bootstrap();
            CrearUsuarioController.init();
        });
    </script>
</body>

</html>
