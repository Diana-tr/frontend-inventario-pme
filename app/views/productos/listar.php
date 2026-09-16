<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../layouts/head.php';

?>

<!-- Select2 CSS -->
<link
    rel="stylesheet"
    href="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/css/select2.min.css"
>
<link
    rel="stylesheet"
    href="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2-bootstrap4-theme/select2-bootstrap4.min.css"
>

<body class="hold-transition sidebar-mini layout-fixed">

    <div class="wrapper">

        <!-- Preloader -->
        <div
            class="preloader flex-column justify-content-center align-items-center"
        >
            <img
                class="animation__shake"
                src="<?php echo $URL; ?>/public/assets/img/logo-pme.png"
                alt="Logo inventario PME"
                height="60"
                width="60"
            >
        </div>

        <!-- Módulos Layout -->
        <?php

        require_once __DIR__ . '/../layouts/navbar.php';
        require_once __DIR__ . '/../layouts/sidebar.php';

        ?>

        <!-- Content Wrapper -->
        <div class="content-wrapper">

            <!-- Header de la página -->
            <div class="content-header">

                <div class="container-fluid">

                    <div class="row mb-2">

                        <div class="col-sm-6">

                            <h1 class="m-0">
                                <i class="fas fa-boxes mr-2"></i>
                                Gestión de Productos
                            </h1>

                        </div>

                        <div class="col-sm-6">

                            <ol class="breadcrumb float-sm-right">

                                <li class="breadcrumb-item">

                                    <a href="<?php echo $URL; ?>/dashboard">
                                        Inicio
                                    </a>

                                </li>

                                <li class="breadcrumb-item active">
                                    Productos
                                </li>

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

                            <div
                                class="card card-outline card-primary shadow-sm"
                            >

                                <div
                                    class="card-header d-flex align-items-center"
                                >

                                    <h3 class="card-title font-weight-bold">
                                        Listado de Productos
                                    </h3>

                                    <div class="card-tools ml-auto">

                                        <a
                                            href="<?php echo $URL; ?>/productos/crear"
                                            class="btn btn-primary btn-sm"
                                            data-permission="products.create"
                                        >
                                            <i class="fas fa-plus mr-1"></i>
                                            Registrar Nuevo Producto
                                        </a>

                                    </div>

                                </div>

                                <div class="card-body">

                                    <table
                                        id="tbl_productos"
                                        class="table table-bordered table-striped table-hover responsive nowrap"
                                        width="100%"
                                    >

                                        <thead class="bg-dark text-white">

                                            <tr>

                                                <th
                                                    class="text-center"
                                                    style="width: 50px;"
                                                >
                                                    N°
                                                </th>

                                                <th>
                                                    Código
                                                </th>

                                                <th>
                                                    Nombre
                                                </th>

                                                <th>
                                                    Categoría
                                                </th>

                                                <th>
                                                    Unidad
                                                </th>

                                                <th>
                                                    Precio Compra
                                                </th>

                                                <th>
                                                    Precio Venta
                                                </th>

                                                <th class="text-center">
                                                    Estado
                                                </th>

                                                <th
                                                    class="text-center"
                                                    style="width: 135px;"
                                                >
                                                    Acciones
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody id="tablaProductosBody">
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

        <!-- Modal Ver Detalles del Producto -->
        <div
            class="modal fade"
            id="modalDetalleProducto"
            tabindex="-1"
            role="dialog"
            aria-labelledby="modalDetalleProductoLabel"
            aria-hidden="true"
        >

            <div
                class="modal-dialog modal-dialog-centered modal-xl"
                role="document"
            >

                <div class="modal-content">

                    <!-- Header -->
                    <div class="modal-header bg-info text-white">

                        <h5
                            class="modal-title font-weight-bold"
                            id="modalDetalleProductoLabel"
                        >
                            <i class="fas fa-box mr-2"></i>
                            Información Detallada del Producto
                        </h5>

                        <button
                            type="button"
                            class="close text-white"
                            data-dismiss="modal"
                            aria-label="Close"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>

                    </div>

                    <!-- Body -->
                    <div class="modal-body">

                        <!-- Loader -->
                        <div
                            id="product_modal_loader"
                            class="text-center py-5"
                        >

                            <div
                                class="spinner-border text-info"
                                role="status"
                                style="width: 3rem; height: 3rem;"
                            >
                                <span class="sr-only">
                                    Cargando...
                                </span>
                            </div>

                            <p
                                class="mt-2 text-muted font-weight-bold"
                            >
                                Obteniendo información del servidor...
                            </p>

                        </div>

                        <!-- Contenido -->
                        <div
                            id="product_modal_content"
                            style="display: none;"
                        >

                            <!-- ========================================= -->
                            <!-- INFORMACIÓN PRINCIPAL -->
                            <!-- ========================================= -->

                            <div class="row mb-4">

                                <!-- Producto -->
                                <div
                                    class="col-md-4 text-center border-right"
                                >

                                    <i
                                        class="fas fa-box-open fa-6x text-secondary mb-3"
                                    ></i>

                                    <h4
                                        class="font-weight-bold mb-1"
                                        id="detail_name"
                                    >
                                        ---
                                    </h4>

                                    <p class="text-muted mb-2">

                                        Código:

                                        <strong id="detail_code">
                                            ---
                                        </strong>

                                    </p>

                                    <div
                                        id="detail_status_badge"
                                        class="mt-2"
                                    >
                                        ---
                                    </div>

                                </div>

                                <!-- Identificación -->
                                <div class="col-md-8">

                                    <h6
                                        class="font-weight-bold text-info border-bottom pb-2 mb-3"
                                    >
                                        <i
                                            class="fas fa-info-circle mr-1"
                                        ></i>
                                        Información General
                                    </h6>

                                    <div class="row">

                                        <!-- Código -->
                                        <div
                                            class="col-sm-6 mb-3"
                                        >

                                            <label
                                                class="text-muted small mb-0"
                                            >
                                                <i
                                                    class="fas fa-barcode mr-1"
                                                ></i>
                                                Código
                                            </label>

                                            <p
                                                class="font-weight-bold text-dark mb-0"
                                                id="detail_product_code"
                                            >
                                                ---
                                            </p>

                                        </div>

                                        <!-- Código de barras -->
                                        <div
                                            class="col-sm-6 mb-3"
                                        >

                                            <label
                                                class="text-muted small mb-0"
                                            >
                                                <i
                                                    class="fas fa-barcode mr-1"
                                                ></i>
                                                Código de Barras
                                            </label>

                                            <p
                                                class="font-weight-bold text-dark mb-0"
                                                id="detail_barcode"
                                            >
                                                ---
                                            </p>

                                        </div>

                                        <!-- Categoría -->
                                        <div
                                            class="col-sm-6 mb-3"
                                        >

                                            <label
                                                class="text-muted small mb-0"
                                            >
                                                <i
                                                    class="fas fa-tags mr-1"
                                                ></i>
                                                Categoría
                                            </label>

                                            <p
                                                class="font-weight-bold text-dark mb-0"
                                                id="detail_category"
                                            >
                                                ---
                                            </p>

                                        </div>

                                        <!-- Unidad -->
                                        <div
                                            class="col-sm-6 mb-3"
                                        >

                                            <label
                                                class="text-muted small mb-0"
                                            >
                                                <i
                                                    class="fas fa-balance-scale mr-1"
                                                ></i>
                                                Unidad
                                            </label>

                                            <p
                                                class="font-weight-bold text-dark mb-0"
                                                id="detail_unit"
                                            >
                                                ---
                                            </p>

                                        </div>

                                        <!-- Descripción -->
                                        <div
                                            class="col-sm-12 mb-3"
                                        >

                                            <label
                                                class="text-muted small mb-0"
                                            >
                                                <i
                                                    class="fas fa-align-left mr-1"
                                                ></i>
                                                Descripción
                                            </label>

                                            <p
                                                class="font-weight-bold text-dark mb-0"
                                                id="detail_description"
                                            >
                                                ---
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            <!-- ========================================= -->
                            <!-- INFORMACIÓN COMERCIAL -->
                            <!-- ========================================= -->

                            <div
                                class="card card-outline card-primary mb-4"
                            >

                                <div class="card-header">

                                    <h3
                                        class="card-title font-weight-bold"
                                    >

                                        <i
                                            class="fas fa-dollar-sign mr-2"
                                        ></i>

                                        Información Comercial

                                    </h3>

                                </div>

                                <div class="card-body">

                                    <div class="row">

                                        <!-- Precio compra -->
                                        <div
                                            class="col-md-4 mb-3"
                                        >

                                            <div
                                                class="border rounded p-3 h-100"
                                            >

                                                <label
                                                    class="text-muted small mb-1"
                                                >
                                                    Precio de Compra
                                                </label>

                                                <h5
                                                    class="font-weight-bold mb-0"
                                                    id="detail_purchase_price"
                                                >
                                                    ---
                                                </h5>

                                            </div>

                                        </div>

                                        <!-- Precio venta -->
                                        <div
                                            class="col-md-4 mb-3"
                                        >

                                            <div
                                                class="border rounded p-3 h-100"
                                            >

                                                <label
                                                    class="text-muted small mb-1"
                                                >
                                                    Precio de Venta
                                                </label>

                                                <h5
                                                    class="font-weight-bold mb-0"
                                                    id="detail_sale_price"
                                                >
                                                    ---
                                                </h5>

                                            </div>

                                        </div>

                                        <!-- Ganancia -->
                                        <div
                                            class="col-md-4 mb-3"
                                        >

                                            <div
                                                class="border rounded p-3 h-100"
                                            >

                                                <label
                                                    class="text-muted small mb-1"
                                                >
                                                    Ganancia
                                                </label>

                                                <h5
                                                    class="font-weight-bold mb-0"
                                                    id="detail_profit_amount"
                                                >
                                                    ---
                                                </h5>

                                            </div>

                                        </div>

                                        <!-- Margen -->
                                        <div
                                            class="col-md-4 mb-3"
                                        >

                                            <div
                                                class="border rounded p-3 h-100"
                                            >

                                                <label
                                                    class="text-muted small mb-1"
                                                >
                                                    Margen de Ganancia
                                                </label>

                                                <h5
                                                    class="font-weight-bold mb-0"
                                                    id="detail_profit_margin_percentage"
                                                >
                                                    ---
                                                </h5>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            <!-- ========================================= -->
                            <!-- INFORMACIÓN DE INVENTARIO -->
                            <!-- ========================================= -->

                            <div
                                class="card card-outline card-warning mb-4"
                            >

                                <div class="card-header">

                                    <h3
                                        class="card-title font-weight-bold"
                                    >

                                        <i
                                            class="fas fa-warehouse mr-2"
                                        ></i>

                                        Información de Inventario

                                    </h3>

                                </div>

                                <div class="card-body">

                                    <div class="row">

                                        <!-- Stock -->
                                        <div
                                            class="col-md-4 mb-3"
                                        >

                                            <div
                                                class="border rounded p-3 h-100"
                                            >

                                                <label
                                                    class="text-muted small mb-1"
                                                >
                                                    Stock Actual
                                                </label>

                                                <h5
                                                    class="font-weight-bold mb-0"
                                                    id="detail_stock"
                                                >
                                                    ---
                                                </h5>

                                            </div>

                                        </div>

                                        <!-- Stock mínimo -->
                                        <div
                                            class="col-md-4 mb-3"
                                        >

                                            <div
                                                class="border rounded p-3 h-100"
                                            >

                                                <label
                                                    class="text-muted small mb-1"
                                                >
                                                    Stock Mínimo
                                                </label>

                                                <h5
                                                    class="font-weight-bold mb-0"
                                                    id="detail_minimum_stock"
                                                >
                                                    ---
                                                </h5>

                                            </div>

                                        </div>

                                        <!-- Stock máximo -->
                                        <div
                                            class="col-md-4 mb-3"
                                        >

                                            <div
                                                class="border rounded p-3 h-100"
                                            >

                                                <label
                                                    class="text-muted small mb-1"
                                                >
                                                    Stock Máximo
                                                </label>

                                                <h5
                                                    class="font-weight-bold mb-0"
                                                    id="detail_maximum_stock"
                                                >
                                                    ---
                                                </h5>

                                            </div>

                                        </div>

                                        <!-- Estado stock bajo -->
                                        <div
                                            class="col-md-6 mb-3"
                                        >

                                            <div
                                                class="border rounded p-3 h-100"
                                            >

                                                <label
                                                    class="text-muted small mb-1"
                                                >
                                                    Estado de Stock Mínimo
                                                </label>

                                                <div
                                                    id="detail_is_low_stock"
                                                >
                                                    ---
                                                </div>

                                            </div>

                                        </div>

                                        <!-- Estado sobrestock -->
                                        <div
                                            class="col-md-6 mb-3"
                                        >

                                            <div
                                                class="border rounded p-3 h-100"
                                            >

                                                <label
                                                    class="text-muted small mb-1"
                                                >
                                                    Estado de Stock Máximo
                                                </label>

                                                <div
                                                    id="detail_is_overstocked"
                                                >
                                                    ---
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            <!-- ========================================= -->
                            <!-- INFORMACIÓN DEL SISTEMA -->
                            <!-- ========================================= -->

                            <div
                                class="card card-outline card-secondary"
                            >

                                <div class="card-header">

                                    <h3
                                        class="card-title font-weight-bold"
                                    >

                                        <i
                                            class="fas fa-clock mr-2"
                                        ></i>

                                        Información del Sistema

                                    </h3>

                                </div>

                                <div class="card-body">

                                    <div class="row">

                                        <!-- ID -->
                                        <div
                                            class="col-md-4 mb-3"
                                        >

                                            <label
                                                class="text-muted small mb-0"
                                            >
                                                ID del Producto
                                            </label>

                                            <p
                                                class="font-weight-bold text-dark mb-0"
                                                id="detail_id_product"
                                            >
                                                ---
                                            </p>

                                        </div>

                                        <!-- Creado -->
                                        <div
                                            class="col-md-4 mb-3"
                                        >

                                            <label
                                                class="text-muted small mb-0"
                                            >
                                                Fecha de Creación
                                            </label>

                                            <p
                                                class="font-weight-bold text-dark mb-0"
                                                id="detail_created_at"
                                            >
                                                ---
                                            </p>

                                        </div>

                                        <!-- Actualizado -->
                                        <div
                                            class="col-md-4 mb-3"
                                        >

                                            <label
                                                class="text-muted small mb-0"
                                            >
                                                Última Actualización
                                            </label>

                                            <p
                                                class="font-weight-bold text-dark mb-0"
                                                id="detail_updated_at"
                                            >
                                                ---
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    <!-- Footer -->
                    <div class="modal-footer bg-light">

                        <button
                            type="button"
                            class="btn btn-secondary btn-sm"
                            data-dismiss="modal"
                        >
                            <i class="fas fa-times mr-1"></i>
                            Cerrar
                        </button>

                    </div>

                </div>

            </div>

        </div>

        <!-- Modal Editar Producto -->
        <div
            class="modal fade"
            id="modalEditarProducto"
            tabindex="-1"
            role="dialog"
            aria-labelledby="modalEditarProductoLabel"
            aria-hidden="true"
        >

            <div
                class="modal-dialog modal-dialog-centered modal-lg"
                role="document"
            >

                <div class="modal-content">

                    <div class="modal-header bg-warning text-dark">

                        <h5
                            class="modal-title font-weight-bold"
                            id="modalEditarProductoLabel"
                        >
                            <i class="fas fa-edit mr-2"></i>
                            Editar Producto
                        </h5>

                        <button
                            type="button"
                            class="close text-dark"
                            data-dismiss="modal"
                            aria-label="Close"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>

                    </div>

                    <form
                        id="formEditarProducto"
                        novalidate
                    >

                        <div class="modal-body">

                            <!-- Spinner -->
                            <div
                                id="edit_product_modal_loader"
                                class="text-center py-5"
                            >

                                <div
                                    class="spinner-border text-warning"
                                    role="status"
                                    style="width: 3rem; height: 3rem;"
                                >
                                    <span class="sr-only">
                                        Cargando...
                                    </span>
                                </div>

                                <p
                                    class="mt-2 text-muted font-weight-bold"
                                >
                                    Cargando información del producto...
                                </p>

                            </div>

                            <!-- Formulario -->
                            <div
                                id="edit_product_modal_content"
                                style="display: none;"
                            >

                                <input
                                    type="hidden"
                                    id="edit_product_id"
                                    name="id_product"
                                >

                                <div class="row">

                                    <div
                                        class="col-md-6 form-group mb-3"
                                    >

                                        <label
                                            for="edit_code"
                                            class="font-weight-bold small"
                                        >
                                            Código
                                            <span class="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            class="form-control"
                                            id="edit_code"
                                            name="code"
                                            required
                                            placeholder="Ej: PROD-001"
                                        >

                                    </div>

                                    <div
                                        class="col-md-6 form-group mb-3"
                                    >

                                        <label
                                            for="edit_barcode"
                                            class="font-weight-bold small"
                                        >
                                            Código de Barras
                                        </label>

                                        <input
                                            type="text"
                                            class="form-control"
                                            id="edit_barcode"
                                            name="barcode"
                                            placeholder="Ej: 7701234567890"
                                        >

                                    </div>

                                    <div
                                        class="col-md-12 form-group mb-3"
                                    >

                                        <label
                                            for="edit_name"
                                            class="font-weight-bold small"
                                        >
                                            Nombre
                                            <span class="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            class="form-control"
                                            id="edit_name"
                                            name="name"
                                            required
                                            placeholder="Ej: Producto de ejemplo"
                                        >

                                    </div>

                                    <div
                                        class="col-md-6 form-group mb-3"
                                    >

                                        <label
                                            for="edit_category"
                                            class="font-weight-bold small"
                                        >
                                            Categoría
                                            <span class="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <select
                                            class="form-control select2"
                                            id="edit_category"
                                            name="category"
                                            required
                                            style="width: 100%;"
                                        >
                                            <option value="">
                                                Seleccione una categoría
                                            </option>
                                        </select>

                                    </div>

                                    <div
                                        class="col-md-6 form-group mb-3"
                                    >

                                        <label
                                            for="edit_unit"
                                            class="font-weight-bold small"
                                        >
                                            Unidad
                                            <span class="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <select
                                            class="form-control"
                                            id="edit_unit"
                                            name="unit"
                                            required
                                        >
                                            <option value="">
                                                Seleccione una unidad
                                            </option>
                                        </select>

                                    </div>

                                    <div
                                        class="col-md-6 form-group mb-3"
                                    >

                                        <label
                                            for="edit_purchase_price"
                                            class="font-weight-bold small"
                                        >
                                            Precio de Compra
                                            <span class="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="number"
                                            class="form-control"
                                            id="edit_purchase_price"
                                            name="purchase_price"
                                            min="0"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                        >

                                    </div>

                                    <div
                                        class="col-md-6 form-group mb-3"
                                    >

                                        <label
                                            for="edit_sale_price"
                                            class="font-weight-bold small"
                                        >
                                            Precio de Venta
                                            <span class="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="number"
                                            class="form-control"
                                            id="edit_sale_price"
                                            name="sale_price"
                                            min="0"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                        >

                                    </div>

                                    <div
                                        class="col-md-12 form-group mb-3"
                                    >

                                        <label
                                            for="edit_description"
                                            class="font-weight-bold small"
                                        >
                                            Descripción
                                        </label>

                                        <textarea
                                            class="form-control"
                                            id="edit_description"
                                            name="description"
                                            rows="3"
                                            placeholder="Descripción del producto"
                                        ></textarea>

                                    </div>

                                    <div
                                        class="col-md-12 form-group mb-3"
                                    >

                                        <div
                                            class="custom-control custom-switch mt-2"
                                        >

                                            <input
                                                type="checkbox"
                                                class="custom-control-input"
                                                id="edit_is_active"
                                                name="is_active"
                                            >

                                            <label
                                                class="custom-control-label font-weight-bold"
                                                for="edit_is_active"
                                            >
                                                Producto Activo
                                            </label>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div class="modal-footer bg-light">

                            <button
                                type="button"
                                class="btn btn-secondary btn-sm"
                                data-dismiss="modal"
                            >
                                <i class="fas fa-times mr-1"></i>
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                id="btn_guardar_edicion"
                                class="btn btn-warning btn-sm font-weight-bold"
                            >
                                <i class="fas fa-save mr-1"></i>
                                Guardar Cambios
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>

        <?php

        require_once __DIR__ . '/../layouts/control-sidebar.php';
        require_once __DIR__ . '/../layouts/footer.php';

        ?>

    </div>

    <!-- Select2 JS -->
    <script
        src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/select2.full.min.js"
    ></script>

    <!-- Inicialización -->
    <script type="module">

        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import ProductoListController from
            "<?php echo $URL; ?>/public/assets/js/controllers/producto/listar.js";

        document.addEventListener("DOMContentLoaded", async () => {

            // Inicializar Select2 en el modal de edición
            $("#edit_category").select2({
                theme: "bootstrap4",
                dropdownParent: $("#modalEditarProducto"),
            });

            await App.bootstrap();

            ProductoListController.init();

        });

    </script>

</body>
