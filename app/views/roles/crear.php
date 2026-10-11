<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../layouts/head.php';
?>

<!-- Custom CSS para las Tarjetas y Cabeceras de Permisos -->
<style>
    .permissions-wrapper .card, 
    #create_permissions_container .card {
        border: 1px solid #E2E8F0 !important;
        border-radius: 8px !important;
        overflow: hidden;
        margin-bottom: 1.25rem !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    /* Fondo y texto de la cabecera del grupo (Ej: Dashboard, Usuarios) */
    .permissions-wrapper .card-header, 
    #create_permissions_container .card-header {
        background-color: #1E293B !important; /* Azul oscuro corporativo */
        color: #FFFFFF !important;
        padding: 10px 15px !important;
        border-bottom: none !important;
    }

    /* Icono, título y elementos dentro de la cabecera del grupo */
    .permissions-wrapper .card-header i,
    .permissions-wrapper .card-header h5,
    .permissions-wrapper .card-header span,
    #create_permissions_container .card-header * {
        color: #FFFFFF !important;
        font-weight: 600 !important;
    }

    /* Estilo para el texto del checkbox "Todos" en la cabecera */
    .permissions-wrapper .card-header .custom-control-label,
    #create_permissions_container .card-header .custom-control-label {
        color: #E2E8F0 !important;
        font-size: 0.85rem;
    }
</style>

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
        <div class="content-wrapper" style="background-color: #F4F6F9;">
            <!-- Header de la página -->
            <div class="content-header">
                <div class="container-fluid" style="max-width: 1400px;">
                    <div class="row mb-2 align-items-center">
                        <div class="col-sm-6">
                            <h1 class="m-0 text-dark font-weight-bold" style="font-size: 1.6rem;">
                                <i class="fas fa-plus-circle text-primary mr-2"></i>Crear Nuevo Rol
                            </h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right bg-transparent p-0 mb-0" style="font-size: 0.85rem;">
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
                <div class="container-fluid" style="max-width: 1400px;">
                    <form id="formCrearRol" novalidate autocomplete="off">
                        <div class="row">
                            <!-- Columna Izquierda: Información Básica -->
                            <div class="col-lg-4 mb-4 mb-lg-0">
                                <div class="card shadow-sm border-0 h-100" style="border-radius: 12px; overflow: hidden;">
                                    <div class="card-header bg-primary text-white py-3">
                                        <h3 class="card-title font-weight-bold mb-0" style="font-size: 1rem;"><i class="fas fa-info-circle mr-2"></i>Información del Rol</h3>
                                    </div>
                                    <div class="card-body p-4 d-flex flex-column justify-content-between">
                                        <div>
                                            <div class="form-group mb-3">
                                                <label for="create_role_name" class="font-weight-bold text-secondary">Nombre del Rol <span class="text-danger">*</span></label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text bg-light border-right-0"><i class="fas fa-user-shield text-muted"></i></span>
                                                    </div>
                                                    <input type="text" class="form-control border-left-0" id="create_role_name" name="role_name" required placeholder="Ej: Administrador">
                                                </div>
                                                <div class="invalid-feedback">El nombre del rol es obligatorio.</div>
                                            </div>

                                            <div class="form-group mb-3">
                                                <label for="create_role_description" class="font-weight-bold text-secondary">Descripción</label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text bg-light border-right-0"><i class="fas fa-align-left text-muted"></i></span>
                                                    </div>
                                                    <textarea class="form-control border-left-0" id="create_role_description" name="role_description" rows="4" placeholder="Ej: Control total del sistema"></textarea>
                                                </div>
                                            </div>

                                            <div class="form-group mb-3 bg-light p-3 rounded border">
                                                <div class="custom-control custom-switch custom-switch-off-danger custom-switch-on-success">
                                                    <input type="checkbox" class="custom-control-input" id="create_role_is_active" name="is_active" checked>
                                                    <label class="custom-control-label font-weight-bold text-dark" for="create_role_is_active">Rol Activo</label>
                                                </div>
                                                <small class="form-text text-muted mt-1">Los roles inactivos no otorgan permisos a los usuarios.</small>
                                            </div>
                                        </div>

                                        <div class="pt-3 border-top mt-3">
                                            <button type="submit" id="btn_guardar_rol" class="btn btn-success btn-lg btn-block font-weight-bold shadow-sm py-2 mb-2" style="border-radius: 8px;">
                                                <i class="fas fa-save mr-2"></i> Guardar Rol
                                            </button>
                                            <a href="<?php echo $URL; ?>/roles" class="btn btn-outline-secondary btn-block font-weight-bold" style="border-radius: 8px;">
                                                <i class="fas fa-times mr-2"></i> Cancelar
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Columna Derecha: Permisos -->
                            <div class="col-lg-8">
                                <div class="card shadow-sm border-0" style="border-radius: 12px; overflow: hidden;">
                                    <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                                        <h3 class="card-title font-weight-bold text-dark mb-0" style="font-size: 1rem;"><i class="fas fa-shield-alt mr-2 text-primary"></i>Permisos del Rol</h3>
                                        <div class="card-tools ml-auto">
                                            <div class="input-group input-group-sm" style="width: 250px;">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text bg-light border-right-0"><i class="fas fa-search text-muted"></i></span>
                                                </div>
                                                <input type="text" id="create_role_permissions_search" class="form-control border-left-0" placeholder="Buscar permisos...">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="card-body p-4 bg-white">
                                        <div class="custom-control custom-checkbox mb-4 bg-light p-3 border rounded shadow-sm">
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