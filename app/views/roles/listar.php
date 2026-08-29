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
                            <h1 class="m-0"><i class="fas fa-user-shield mr-2"></i>Gestión de Roles</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item active">Roles</li>
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
                                    <h3 class="card-title font-weight-bold">Listado de Roles</h3>
                                    <div class="card-tools ml-auto">
                                        <a href="<?php echo $URL; ?>/roles/crear" class="btn btn-primary btn-sm" data-permission="roles.create">
                                            <i class="fas fa-plus-circle mr-1"></i> Registrar Nuevo Rol
                                        </a>
                                    </div>
                                </div>

                                <div class="card-body">
                                    <table id="tbl_roles" class="table table-bordered table-striped table-hover responsive nowrap" width="100%">
                                        <thead class="bg-dark text-white">
                                            <tr>
                                                <th class="text-center" style="width: 50px;">N°</th>
                                                <th>Nombre del Rol</th>
                                                <th>Descripción</th>
                                                <th class="text-center">Estado</th>
                                                <th class="text-center" style="width: 135px;">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaRolesBody">
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

    <!-- Modal Ver Detalles del Rol -->
    <div class="modal fade" id="modalDetalleRol" tabindex="-1" role="dialog" aria-labelledby="modalDetalleRolLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title" id="modalDetalleRolLabel">
                        <i class="fas fa-id-card mr-2"></i>Información Detallada del Rol
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- Loader / Spinner -->
                    <div id="role_modal_loader" class="text-center py-5">
                        <div class="spinner-border text-info" role="status" style="width: 3rem; height: 3rem;">
                            <span class="sr-only">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted font-weight-bold">Obteniendo información del servidor...</p>
                    </div>

                    <!-- Contenido principal (Oculto mientras carga) -->
                    <div id="role_modal_content" style="display: none;">
                        <div class="text-center mb-4">
                            <i class="fas fa-user-shield fa-4x text-primary mb-3"></i>
                            <h4 class="font-weight-bold mb-1" id="detail_role_name">---</h4>
                            <div id="detail_role_status_badge" class="mt-2">---</div>
                        </div>
                        <hr>
                        <div class="px-3">
                            <label class="text-muted small mb-1"><i class="fas fa-align-left mr-1"></i>Descripción del Rol</label>
                            <p class="font-weight-bold text-dark" id="detail_role_description">---</p>
                        </div>
                    </div>
                </div>

                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Editar Rol -->
    <div class="modal fade" id="modalEditarRol" tabindex="-1" role="dialog" aria-labelledby="modalEditarRolLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header bg-warning text-dark">
                    <h5 class="modal-title font-weight-bold" id="modalEditarRolLabel">
                        <i class="fas fa-edit mr-2"></i>Editar Rol
                    </h5>
                    <button type="button" class="close text-dark" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <form id="formEditarRol" novalidate>
                    <div class="modal-body">
                        <!-- Spinner de carga inicial -->
                        <div id="edit_role_modal_loader" class="text-center py-5">
                            <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
                                <span class="sr-only">Cargando...</span>
                            </div>
                            <p class="mt-2 text-muted font-weight-bold">Cargando información del rol...</p>
                        </div>

                        <!-- Campos del Formulario -->
                        <div id="edit_role_modal_content" style="display: none;">
                            <input type="hidden" id="edit_role_id" name="id_role">

                            <div class="form-group mb-3">
                                <label for="edit_role_name" class="font-weight-bold small">Nombre del Rol <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="edit_role_name" name="role_name" required placeholder="Ej: Administrador">
                                <div class="invalid-feedback">El nombre del rol es obligatorio.</div>
                            </div>

                            <div class="form-group mb-3">
                                <label for="edit_role_description" class="font-weight-bold small">Descripción</label>
                                <textarea class="form-control" id="edit_role_description" name="role_description" rows="3" placeholder="Ej: Administra todo el sistema"></textarea>
                            </div>

                            <div class="form-group mb-3">
                                <div class="custom-control custom-switch mt-2">
                                    <input type="checkbox" class="custom-control-input" id="edit_role_is_active" name="is_active">
                                    <label class="custom-control-label font-weight-bold" for="edit_role_is_active">Rol Activo</label>
                                </div>
                            </div>

                            <hr class="my-4">

                            <!-- Contenedor del Selector de Permisos -->
                            <h5 class="font-weight-bold mb-3"><i class="fas fa-shield-alt mr-2 text-primary"></i>Permisos del Rol</h5>
                            <div class="input-group input-group-sm mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text bg-white"><i class="fas fa-search text-muted"></i></span>
                                </div>
                                <input type="text" id="edit_role_permissions_search" class="form-control" placeholder="Buscar permisos...">
                            </div>
                            <div class="custom-control custom-checkbox mb-3 border-bottom pb-2">
                                <input type="checkbox" class="custom-control-input" id="edit_role_select_all_permissions">
                                <label class="custom-control-label font-weight-bold text-primary" for="edit_role_select_all_permissions">Seleccionar todos los permisos</label>
                            </div>
                            
                            <!-- Aquí se renderizarán dinámicamente los módulos de permisos -->
                            <div id="edit_permissions_container" class="permissions-wrapper" style="max-height: 400px; overflow-y: auto; overflow-x: hidden;">
                                <div class="text-center py-4">
                                    <div class="spinner-border text-primary spinner-border-sm mr-2" role="status"></div>
                                    <span class="text-muted small">Cargando catálogo de permisos...</span>
                                </div>
                            </div>

                        </div> <!-- Fin edit_role_modal_content -->
                    </div> <!-- Fin modal-body -->

                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">
                            <i class="fas fa-times mr-1"></i>Cancelar
                        </button>
                        <button type="submit" id="btn_guardar_edicion_rol" class="btn btn-warning btn-sm font-weight-bold">
                            <i class="fas fa-save mr-1"></i>Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Script de inicialización (delegado al controlador JS) -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import RoleListController from "<?php echo $URL; ?>/public/assets/js/controllers/role/listar.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            RoleListController.init();
        });
    </script>
</body>

</html>
