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
                            <h1 class="m-0"><i class="fas fa-tags mr-2"></i>Gestión de Categorías</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item active">Categorias</li>
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
                                    <h3 class="card-title font-weight-bold">Listado de Categorias</h3>
                                    <div class="card-tools ml-auto">
                                        <a href="<?php echo $URL; ?>/categorias/crear" class="btn btn-primary btn-sm" data-permission="categories.create">
                                            <i class="fas fa-plus mr-1"></i> Registrar Nueva Categoría
                                        </a>
                                    </div>
                                </div>

                                <div class="card-body">
                                    <table id="tbl_categorias" class="table table-bordered table-striped table-hover responsive nowrap" width="100%">
                                        <thead class="bg-dark text-white">
                                            <tr>
                                                <th class="text-center" style="width: 50px;">N°</th>
                                                <th>Nombre</th>
                                                <th>Descripcion</th>
                                                <th class="text-center">Estado</th>
                                                <th class="text-center" style="width: 135px;">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaCategoriasBody">
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

    <!-- Modal Ver Detalles de Categoría -->
    <div class="modal fade" id="modalDetalleCategoria" tabindex="-1" role="dialog" aria-labelledby="modalDetalleCategoriaLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title" id="modalDetalleCategoriaLabel">
                        <i class="fas fa-tag mr-2"></i>Información Detallada de la Categoría
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- Loader / Spinner -->
                    <div id="category_modal_loader" class="text-center py-5">
                        <div class="spinner-border text-info" role="status" style="width: 3rem; height: 3rem;">
                            <span class="sr-only">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted font-weight-bold">Obteniendo información del servidor...</p>
                    </div>

                    <!-- Contenido principal (Oculto mientras carga) -->
                    <div id="category_modal_content" style="display: none;">
                        <div class="row align-items-center mb-4">
                            <div class="col-md-4 text-center border-right">
                                <i class="fas fa-tags fa-6x text-secondary mb-2"></i>
                                <h5 class="font-weight-bold mb-1" id="detail_name">---</h5>
                                <div id="detail_status_badge" class="mt-2">---</div>
                            </div>

                            <div class="col-md-8">
                                <div class="row">
                                    <div class="col-sm-12 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-align-left mr-1"></i>Descripción</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_description">---</p>
                                    </div>
                                    <div class="col-sm-12 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-sitemap mr-1"></i>Categoría Padre</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_parent_name">---</p>
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

    <!-- Modal Editar Categoría -->
    <div class="modal fade" id="modalEditarCategoria" tabindex="-1" role="dialog" aria-labelledby="modalEditarCategoriaLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header bg-warning text-dark">
                    <h5 class="modal-title font-weight-bold" id="modalEditarCategoriaLabel">
                        <i class="fas fa-edit mr-2"></i>Editar Categoría
                    </h5>
                    <button type="button" class="close text-dark" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <form id="formEditarCategoria" novalidate>
                    <div class="modal-body">
                        <!-- Spinner de carga inicial -->
                        <div id="edit_category_modal_loader" class="text-center py-5">
                            <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
                                <span class="sr-only">Cargando...</span>
                            </div>
                            <p class="mt-2 text-muted font-weight-bold">Cargando información de la categoría...</p>
                        </div>

                        <!-- Campos del Formulario -->
                        <div id="edit_category_modal_content" style="display: none;">
                            <input type="hidden" id="edit_category_id" name="id_category">

                            <div class="row">
                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_name" class="font-weight-bold small">Nombre <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="edit_name" name="name" required placeholder="Ej: Electrónica">
                                    <div class="invalid-feedback">El nombre es obligatorio.</div>
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_parent_id" class="font-weight-bold small">Categoría Padre</label>
                                    <div class="select2-purple">
                                        <select class="select2" id="edit_parent_id" name="parent" data-placeholder="Seleccionar categoría padre" data-dropdown-css-class="select2-purple" style="width: 100%;">
                                            <!-- Las opciones se cargarán por JS -->
                                        </select>
                                    </div>
                                </div>

                                <div class="col-md-12 form-group mb-3">
                                    <label for="edit_description" class="font-weight-bold small">Descripción</label>
                                    <textarea class="form-control" id="edit_description" name="description" rows="3" placeholder="Descripción de la categoría"></textarea>
                                </div>

                                <div class="col-md-12 form-group mb-3">
                                    <div class="custom-control custom-switch mt-2">
                                        <input type="checkbox" class="custom-control-input" id="edit_is_active" name="is_active">
                                        <label class="custom-control-label font-weight-bold" for="edit_is_active">Categoría Activa</label>
                                    </div>
                                </div>
                            </div>
                        </div> <!-- Fin edit_category_modal_content -->
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
        import CategoryListController from "<?php echo $URL; ?>/public/assets/js/controllers/categorias/listar.js";

        document.addEventListener("DOMContentLoaded", async () => {
            // Inicializar Select2 en el modal de edición cuando se muestre
            $('#modalEditarCategoria').on('shown.bs.modal', function () {
                $('#edit_parent_id').select2({
                    theme: 'bootstrap4',
                    dropdownParent: $('#modalEditarCategoria')
                });
            });

            await App.bootstrap();
            CategoryListController.init();
        });
    </script>
</body>
