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
                            <h1 class="m-0"><i class="fas fa-plus-circle mr-2"></i>Crear Nuevo Rol</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/roles">Roles</a></li>
                                <li class="breadcrumb-item active">Crear Rol</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <section class="content">
                <div class="container-fluid">
                    <form id="formCrearRol" novalidate>
                        <div class="row">
                            <!-- Columna Izquierda: Información Básica -->
                            <div class="col-lg-4">
                                <div class="card card-outline card-primary shadow-sm">
                                    <div class="card-header">
                                        <h3 class="card-title font-weight-bold">Información del Rol</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="form-group mb-4">
                                            <label for="create_role_name" class="font-weight-bold">Nombre del Rol <span class="text-danger">*</span></label>
                                            <input type="text" class="form-control" id="create_role_name" name="role_name" required placeholder="Ej: Administrador">
                                            <div class="invalid-feedback">El nombre del rol es obligatorio.</div>
                                        </div>

                                        <div class="form-group mb-4">
                                            <label for="create_role_description" class="font-weight-bold">Descripción</label>
                                            <textarea class="form-control" id="create_role_description" name="role_description" rows="4" placeholder="Ej: Control total del sistema"></textarea>
                                        </div>

                                        <div class="form-group mb-2">
                                            <div class="custom-control custom-switch mt-2">
                                                <input type="checkbox" class="custom-control-input" id="create_role_is_active" name="is_active" checked>
                                                <label class="custom-control-label font-weight-bold" for="create_role_is_active">Rol Activo</label>
                                                <small class="form-text text-muted">Los roles inactivos no otorgan permisos a los usuarios.</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Columna Derecha: Permisos -->
                            <div class="col-lg-8">
                                <div class="card card-outline card-secondary shadow-sm">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <h3 class="card-title font-weight-bold"><i class="fas fa-shield-alt mr-2 text-primary"></i>Permisos del Rol</h3>
                                        <div class="card-tools ml-auto">
                                            <div class="input-group input-group-sm" style="width: 250px;">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text bg-white"><i class="fas fa-search text-muted"></i></span>
                                                </div>
                                                <input type="text" id="create_role_permissions_search" class="form-control" placeholder="Buscar permisos...">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="card-body bg-light">
                                        <div class="custom-control custom-checkbox mb-3 bg-white p-2 border rounded shadow-sm">
                                            <input type="checkbox" class="custom-control-input" id="create_role_select_all_permissions">
                                            <label class="custom-control-label font-weight-bold text-primary ml-2" for="create_role_select_all_permissions" style="cursor: pointer;">
                                                Seleccionar todos los permisos del sistema
                                            </label>
                                        </div>

                                        <!-- Contenedor del Selector Dinámico -->
                                        <div id="create_permissions_container" class="permissions-wrapper">
                                            <div class="text-center py-5">
                                                <div class="spinner-border text-primary mr-2" role="status"></div>
                                                <span class="text-muted h5">Cargando catálogo de permisos...</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="card-footer bg-white text-right">
                                        <a href="<?php echo $URL; ?>/roles" class="btn btn-secondary mr-2">
                                            <i class="fas fa-times mr-1"></i> Cancelar
                                        </a>
                                        <button type="submit" id="btn_guardar_rol" class="btn btn-primary font-weight-bold px-4">
                                            <i class="fas fa-save mr-1"></i> Guardar Rol
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
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
        import RoleCreateController from "<?php echo $URL; ?>/public/assets/js/controllers/role/crear.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            RoleCreateController.init();
        });
    </script>
</body>

</html>
