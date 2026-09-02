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
                        <div class="col-12">
                            <div class="card card-outline card-primary shadow-sm">
                                <div class="card-header d-flex align-items-center">
                                    <h3 class="card-title font-weight-bold">Listado de Usuarios</h3>
                                    <div class="card-tools ml-auto">
                                        <a href="<?php echo $URL; ?>/usuarios/crear" class="btn btn-primary btn-sm" data-permission="users.create">
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
                                                <th class="text-center" style="width: 135px;">Acciones</th>
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

    <!-- Modal Ver Detalles de Usuario -->
    <div class="modal fade" id="modalDetalleUsuario" tabindex="-1" role="dialog" aria-labelledby="modalDetalleUsuarioLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title" id="modalDetalleUsuarioLabel">
                        <i class="fas fa-id-card mr-2"></i>Información Detallada del Usuario
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- Loader / Spinner -->
                    <div id="user_modal_loader" class="text-center py-5">
                        <div class="spinner-border text-info" role="status" style="width: 3rem; height: 3rem;">
                            <span class="sr-only">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted font-weight-bold">Obteniendo información del servidor...</p>
                    </div>

                    <!-- Contenido principal (Oculto mientras carga) -->
                    <div id="user_modal_content" style="display: none;">
                        <div class="row align-items-center mb-4">
                            <div class="col-md-4 text-center border-right">
                                <i class="fas fa-user-circle fa-6x text-secondary mb-2"></i>
                                <h5 class="font-weight-bold mb-1" id="detail_full_name">---</h5>
                                <p class="text-muted mb-2" id="detail_username">---</p>
                                <div id="detail_status_badge">---</div>
                            </div>

                            <div class="col-md-8">
                                <div class="row">
                                    <div class="col-sm-6 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-envelope mr-1"></i>Correo Electrónico</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_email">---</p>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-id-card-alt mr-1"></i>Número de Documento</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_document">---</p>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-phone mr-1"></i>Teléfono</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_phone">---</p>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-user-shield mr-1"></i>Rol / Permisos</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_role">---</p>
                                    </div>
                                </div>
                                <hr class="my-2">
                                <div class="row">
                                    <div class="col-sm-6 mt-2">
                                        <label class="text-muted small mb-0"><i class="fas fa-calendar-plus mr-1"></i>Fecha de Creación</label>
                                        <p class="small text-secondary mb-0" id="detail_created_at">---</p>
                                    </div>
                                    <div class="col-sm-6 mt-2">
                                        <label class="text-muted small mb-0"><i class="fas fa-calendar-check mr-1"></i>Última Actualización</label>
                                        <p class="small text-secondary mb-0" id="detail_updated_at">---</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Editar Usuario -->
    <div class="modal fade" id="modalEditarUsuario" tabindex="-1" role="dialog" aria-labelledby="modalEditarUsuarioLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header bg-warning text-dark">
                    <h5 class="modal-title font-weight-bold" id="modalEditarUsuarioLabel">
                        <i class="fas fa-user-edit mr-2"></i>Editar Usuario
                    </h5>
                    <button type="button" class="close text-dark" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <form id="formEditarUsuario" novalidate>
                    <div class="modal-body">
                        <!-- Spinner de carga inicial -->
                        <div id="edit_user_modal_loader" class="text-center py-5">
                            <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
                                <span class="sr-only">Cargando...</span>
                            </div>
                            <p class="mt-2 text-muted font-weight-bold">Cargando información del usuario...</p>
                        </div>

                        <!-- Campos del Formulario -->
                        <div id="edit_user_modal_content" style="display: none;">
                            <input type="hidden" id="edit_user_id" name="id_user">

                            <div class="row">
                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_first_name" class="font-weight-bold small">Nombre(s) <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="edit_first_name" name="first_name" required placeholder="Ej: Juan">
                                    <div class="invalid-feedback">El nombre es obligatorio.</div>
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_last_name" class="font-weight-bold small">Apellido(s) <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="edit_last_name" name="last_name" required placeholder="Ej: Pérez">
                                    <div class="invalid-feedback">El apellido es obligatorio.</div>
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_username" class="font-weight-bold small">Nombre de usuario <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="edit_username" name="username" required placeholder="Ej: juanperez">
                                    <div class="invalid-feedback">El nombre de usuario es obligatorio.</div>
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_email" class="font-weight-bold small">Correo electrónico <span class="text-danger">*</span></label>
                                    <input type="email" class="form-control" id="edit_email" name="email" required placeholder="correo@ejemplo.com">
                                    <div class="invalid-feedback">Ingresa un correo electrónico válido.</div>
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_document_number" class="font-weight-bold small">Número de documento <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="edit_document_number" name="document_number" placeholder="Ej: 123456789" required>
                                    <div class="invalid-feedback">El número de documento es obligatorio.</div>
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_phone_number" class="font-weight-bold small">Teléfono</label>
                                    <input type="text" class="form-control" id="edit_phone_number" name="phone_number" placeholder="Ej: 3001234567">
                                </div>

                                <!-- Roles (Select2) -->
                                <div class="col-md-12 form-group mb-3">
                                    <label for="edit_roles" class="font-weight-bold small">Rol(es) <span class="text-danger">*</span></label>
                                    <div class="select2-purple">
                                        <select class="select2" id="edit_roles" name="roles" multiple="multiple" data-placeholder="Seleccionar rol(es)" data-dropdown-css-class="select2-purple" style="width: 100%;" required>
                                            <!-- Las opciones se cargarán por JS -->
                                        </select>
                                    </div>
                                </div>

                                <div class="col-md-12 form-group mb-3">
                                    <div class="custom-control custom-switch mt-2">
                                        <input type="checkbox" class="custom-control-input" id="edit_is_active" name="is_active">
                                        <label class="custom-control-label font-weight-bold" for="edit_is_active">Usuario Activo</label>
                                    </div>
                                </div>
                            </div>
                        </div> <!-- Fin edit_user_modal_content -->
                    </div> <!-- Fin modal-body -->

                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">
                            <i class="fas fa-times mr-1"></i>Cancelar
                        </button>
                        <button type="submit" id="btn_guardar_edicion" class="btn btn-warning btn-sm font-weight-bold">
                            <i class="fas fa-save mr-1"></i>Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Select2 JS -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/select2.full.min.js"></script>

    <!-- Script de inicialización (ahora delegado al controlador JS) -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import UsuarioListController from "<?php echo $URL; ?>/public/assets/js/controllers/usuario/listar.js";

        document.addEventListener("DOMContentLoaded", async () => {
            // Inicializar Select2 nativamente
            $('.select2').select2({
                theme: 'bootstrap4'
            });

            await App.bootstrap();
            UsuarioListController.init();
        });
    </script>
</body>
