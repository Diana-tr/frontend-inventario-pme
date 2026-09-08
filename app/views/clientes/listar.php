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
                            <h1 class="m-0"><i class="fas fa-tags mr-2"></i>Gestión de Clientes</h1>
                        </div>
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Inicio</a></li>
                                <li class="breadcrumb-item active">Clientes</li>
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
                                    <h3 class="card-title font-weight-bold">Listado de Clientes</h3>
                                    <div class="card-tools ml-auto">
                                        <a href="<?php echo $URL; ?>/clientes/crear" class="btn btn-primary btn-sm" data-permission="customers.create">
                                            <i class="fas fa-plus mr-1"></i> Registrar Nuevo Cliente
                                        </a>
                                    </div>
                                </div>

                                <div class="card-body">
                                    <table id="tbl_clientes" class="table table-bordered table-striped table-hover responsive nowrap" width="100%">
                                        <thead class="bg-dark text-white">
                                            <tr>
                                                <th class="text-center" style="width: 50px;">N°</th>
                                                <th>Nombre</th>
                                                <th>N° Documento</th>
                                                <th>Correo</th>
                                                <th>Direccion</th>
                                                <th>Celular</th>
                                                <th class="text-center">Estado</th>
                                                <th class="text-center" style="width: 135px;">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaClientesBody">
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
    <div class="modal fade" id="modalDetalleCliente" tabindex="-1" role="dialog" aria-labelledby="modalDetalleClienteLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title" id="modalDetalleClienteLabel">
                        <i class="fas fa-tag mr-2"></i>Información Detallada del cliente
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- Loader / Spinner -->
                    <div id="customer_modal_loader" class="text-center py-5">
                        <div class="spinner-border text-info" role="status" style="width: 3rem; height: 3rem;">
                            <span class="sr-only">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted font-weight-bold">Obteniendo información del servidor...</p>
                    </div>

                    <!-- Contenido principal (Oculto mientras carga) -->
                    <div id="customer_modal_content" style="display: none;">
                        <div class="row align-items-center mb-4">
                            <div class="col-md-4 text-center border-right">
                                <i class="fas fa-user-circle fa-6x text-secondary mb-2"></i>
                                <h5 class="font-weight-bold mb-1"><span id="detail_first_name"></span> <span id="detail_last_name"></span></h5>
                                <div id="detail_status_badge" class="mt-2">---</div>
                            </div>

                            <div class="col-md-8">
                                <div class="row">
                                    <div class="col-sm-6 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-id-card mr-1"></i>Tipo y N° Documento</label>
                                        <p class="font-weight-bold text-dark mb-0"><span id="detail_document_type"></span> - <span id="detail_document_number"></span></p>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-building mr-1"></i>Empresa</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_business_name">---</p>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-envelope mr-1"></i>Correo</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_email">---</p>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-mobile-alt mr-1"></i>Celular / Teléfono</label>
                                        <p class="font-weight-bold text-dark mb-0"><span id="detail_mobile"></span> / <span id="detail_phone"></span></p>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-map-marker-alt mr-1"></i>Dirección</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_address">---</p>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-city mr-1"></i>Ciudad</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_city">---</p>
                                    </div>
                                    <div class="col-sm-6 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-globe mr-1"></i>País</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_country">---</p>
                                    </div>
                                    <div class="col-sm-12 mb-3">
                                        <label class="text-muted small mb-0"><i class="fas fa-sticky-note mr-1"></i>Notas</label>
                                        <p class="font-weight-bold text-dark mb-0" id="detail_notes">---</p>
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
    <div class="modal fade" id="modalEditarCliente" tabindex="-1" role="dialog" aria-labelledby="modalEditarClienteLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header bg-warning text-dark">
                    <h5 class="modal-title font-weight-bold" id="modalEditarClienteLabel">
                        <i class="fas fa-edit mr-2"></i>Editar Cliente
                    </h5>
                    <button type="button" class="close text-dark" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <form id="formEditarCliente" novalidate>
                    <div class="modal-body">
                        <!-- Spinner de carga inicial -->
                        <div id="edit_customer_modal_loader" class="text-center py-5">
                            <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
                                <span class="sr-only">Cargando...</span>
                            </div>
                            <p class="mt-2 text-muted font-weight-bold">Cargando información del cliente...</p>
                        </div>

                        <!-- Campos del Formulario -->
                        <div id="edit_customer_modal_content" style="display: none;">
                            <input type="hidden" id="edit_customer_id" name="id_customer">

                            <div class="row">
                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_document_type" class="font-weight-bold small">Tipo de Doc. <span class="text-danger">*</span></label>
                                    <select class="form-control" id="edit_document_type" name="document_type" required>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="NIT">Número de Identificación Tributaria</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                        <option value="PAS">Pasaporte</option>
                                        <option value="TI">Tarjeta de Identidad</option>
                                    </select>
                                </div>
                                
                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_document_number" class="font-weight-bold small">N° Documento <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="edit_document_number" name="document_number" required placeholder="Ej: 10101010">
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_first_name" class="font-weight-bold small">Nombres</label>
                                    <input type="text" class="form-control" id="edit_first_name" name="first_name" placeholder="Ej: Juan">
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_last_name" class="font-weight-bold small">Apellidos</label>
                                    <input type="text" class="form-control" id="edit_last_name" name="last_name" placeholder="Ej: Pérez">
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_business_name" class="font-weight-bold small">Empresa</label>
                                    <input type="text" class="form-control" id="edit_business_name" name="business_name" placeholder="Ej: Empresa S.A.S.">
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_email" class="font-weight-bold small">Correo</label>
                                    <input type="email" class="form-control" id="edit_email" name="email" placeholder="Ej: juan@example.com">
                                </div>

                                <div class="col-md-4 form-group mb-3">
                                    <label for="edit_mobile" class="font-weight-bold small">Celular</label>
                                    <input type="text" class="form-control" id="edit_mobile" name="mobile" placeholder="Ej: 3001234567">
                                </div>
                                
                                <div class="col-md-4 form-group mb-3">
                                    <label for="edit_phone" class="font-weight-bold small">Teléfono</label>
                                    <input type="text" class="form-control" id="edit_phone" name="phone" placeholder="Ej: 6011234">
                                </div>
                                
                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_address" class="font-weight-bold small">Dirección</label>
                                    <input type="text" class="form-control" id="edit_address" name="address" placeholder="Ej: Carrera 10 #20-30">
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_city" class="font-weight-bold small">Ciudad</label>
                                    <input type="text" class="form-control" id="edit_city" name="city" placeholder="Ej: Bogotá">
                                </div>

                                <div class="col-md-6 form-group mb-3">
                                    <label for="edit_country" class="font-weight-bold small">País</label>
                                    <input type="text" class="form-control" id="edit_country" name="country" placeholder="Ej: Colombia" value="Colombia">
                                </div>

                                <div class="col-md-12 form-group mb-3">
                                    <label for="edit_notes" class="font-weight-bold small">Notas</label>
                                    <textarea class="form-control" id="edit_notes" name="notes" rows="2" placeholder="Notas adicionales"></textarea>
                                </div>

                                <div class="col-md-12 form-group mb-3">
                                    <div class="custom-control custom-switch mt-2">
                                        <input type="checkbox" class="custom-control-input" id="edit_is_active" name="is_active">
                                        <label class="custom-control-label font-weight-bold" for="edit_is_active">Cliente Activo</label>
                                    </div>
                                </div>
                            </div>
                        </div> <!-- Fin edit_customer_modal_content -->
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
        import ClienteListController from "<?php echo $URL; ?>/public/assets/js/controllers/cliente/listar.js";

        document.addEventListener("DOMContentLoaded", async () => {
            // El listado no usa select2 para el modal de edición actualmente, ya que lo pasé a un select normal para los tipos de documentos, o si necesita select2, aquí se inicializa.
            $('#modalEditarCliente').on('shown.bs.modal', function () {
                $('#edit_document_type').select2({
                    theme: 'bootstrap4',
                    dropdownParent: $('#modalEditarCliente')
                });
            });

            await App.bootstrap();
            ClienteListController.init();
        });
    </script>
</body>
