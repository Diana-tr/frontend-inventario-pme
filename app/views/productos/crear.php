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

        <!-- Navbar y Sidebar -->
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
                                <i class="fas fa-box mr-2"></i>
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

                                <li class="breadcrumb-item">
                                    <a href="index.php">
                                        Productos
                                    </a>
                                </li>

                                <li class="breadcrumb-item active">
                                    Crear Producto
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

                        <div class="col-md-12">

                            <div class="card card-primary shadow-sm">

                                <!-- Card Header -->
                                <div class="card-header">

                                    <h3 class="card-title">
                                        <i class="fas fa-box mr-1"></i>
                                        Formulario de Producto
                                    </h3>

                                </div>

                                <!-- Formulario -->
                                <form
                                    id="form_crear_producto"
                                    action="#"
                                    method="POST"
                                    autocomplete="off"
                                >

                                    <div class="card-body">

                                        <div class="row">

                                            <!-- Código -->
                                            <div class="col-md-6 form-group">

                                                <label for="code">
                                                    Código
                                                    <span class="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <div class="input-group mb-3">

                                                    <div
                                                        class="input-group-prepend"
                                                    >
                                                        <span
                                                            class="input-group-text"
                                                        >
                                                            <i
                                                                class="fas fa-barcode"
                                                            ></i>
                                                        </span>
                                                    </div>

                                                    <input
                                                        type="text"
                                                        name="code"
                                                        id="code"
                                                        class="form-control"
                                                        placeholder="Ej. PROD-001"
                                                        required
                                                    >

                                                </div>

                                            </div>

                                            <!-- Código de Barras -->
                                            <div class="col-md-6 form-group">

                                                <label for="barcode">
                                                    Código de barras
                                                </label>

                                                <div class="input-group mb-3">

                                                    <div
                                                        class="input-group-prepend"
                                                    >
                                                        <span
                                                            class="input-group-text"
                                                        >
                                                            <i
                                                                class="fas fa-barcode"
                                                            ></i>
                                                        </span>
                                                    </div>

                                                    <input
                                                        type="text"
                                                        name="barcode"
                                                        id="barcode"
                                                        class="form-control"
                                                        placeholder="Ej. 7701234567890"
                                                    >

                                                </div>

                                            </div>

                                            <!-- Nombre -->
                                            <div class="col-md-6 form-group">

                                                <label for="name">
                                                    Nombre
                                                    <span class="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <div class="input-group mb-3">

                                                    <div
                                                        class="input-group-prepend"
                                                    >
                                                        <span
                                                            class="input-group-text"
                                                        >
                                                            <i
                                                                class="fas fa-box-open"
                                                            ></i>
                                                        </span>
                                                    </div>

                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="name"
                                                        class="form-control"
                                                        placeholder="Ej. Martillo"
                                                        required
                                                    >

                                                </div>

                                            </div>

                                            <!-- Categoría -->
                                            <div class="col-md-6 form-group">

                                                <label for="category">
                                                    Categoría
                                                    <span class="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <div class="select2-primary">

                                                    <select
                                                        class="select2"
                                                        id="category"
                                                        name="category"
                                                        data-placeholder="Seleccionar categoría"
                                                        data-dropdown-css-class="select2-primary"
                                                        style="width: 100%;"
                                                        required
                                                    >

                                                        <option
                                                            value=""
                                                        >
                                                            Seleccionar
                                                            categoría
                                                        </option>

                                                        <!--
                                                            Las categorías
                                                            serán cargadas
                                                            dinámicamente
                                                            desde Django.
                                                        -->

                                                    </select>

                                                </div>

                                            </div>

                                            <!-- Unidad de Medida -->
                                            <div class="col-md-6 form-group">

                                                <label for="unit">
                                                    Unidad de medida
                                                    <span class="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <div class="select2-primary">

                                                    <select
                                                        class="select2"
                                                        id="unit"
                                                        name="unit"
                                                        data-placeholder="Seleccionar unidad de medida"
                                                        data-dropdown-css-class="select2-primary"
                                                        style="width: 100%;"
                                                        required
                                                    >

                                                        <option
                                                            value=""
                                                        >
                                                            Seleccionar
                                                            unidad de medida
                                                        </option>

                                                        <!--
                                                            Las unidades
                                                            serán cargadas
                                                            por
                                                            CrearProductoController.
                                                        -->

                                                    </select>

                                                </div>

                                            </div>

                                            <!-- Precio de Compra -->
                                            <div class="col-md-6 form-group">

                                                <label for="purchase_price">
                                                    Precio de compra
                                                    <span class="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <div class="input-group mb-3">

                                                    <div
                                                        class="input-group-prepend"
                                                    >
                                                        <span
                                                            class="input-group-text"
                                                        >
                                                            <i
                                                                class="fas fa-dollar-sign"
                                                            ></i>
                                                        </span>
                                                    </div>

                                                    <input
                                                        type="number"
                                                        name="purchase_price"
                                                        id="purchase_price"
                                                        class="form-control"
                                                        placeholder="Ej. 25000"
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    >

                                                </div>

                                            </div>

                                            <!-- Precio de Venta -->
                                            <div class="col-md-6 form-group">

                                                <label for="sale_price">
                                                    Precio de venta
                                                    <span class="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <div class="input-group mb-3">

                                                    <div
                                                        class="input-group-prepend"
                                                    >
                                                        <span
                                                            class="input-group-text"
                                                        >
                                                            <i
                                                                class="fas fa-dollar-sign"
                                                            ></i>
                                                        </span>
                                                    </div>

                                                    <input
                                                        type="number"
                                                        name="sale_price"
                                                        id="sale_price"
                                                        class="form-control"
                                                        placeholder="Ej. 35000"
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    >

                                                </div>

                                            </div>

                                            <!-- Descripción -->
                                            <div class="col-md-12 form-group">

                                                <label for="description">
                                                    Descripción
                                                </label>

                                                <div class="input-group mb-3">

                                                    <div
                                                        class="input-group-prepend"
                                                    >
                                                        <span
                                                            class="input-group-text"
                                                        >
                                                            <i
                                                                class="fas fa-align-left"
                                                            ></i>
                                                        </span>
                                                    </div>

                                                    <textarea
                                                        name="description"
                                                        id="description"
                                                        class="form-control"
                                                        rows="4"
                                                        placeholder="Descripción del producto"
                                                    ></textarea>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    <!-- Card Footer -->
                                    <div
                                        class="card-footer d-flex justify-content-end"
                                    >

                                        <a
                                            href="index.php"
                                            class="btn btn-secondary mr-2"
                                        >
                                            <i
                                                class="fas fa-times-circle mr-1"
                                            ></i>
                                            Cancelar
                                        </a>

                                        <button
                                            type="submit"
                                            class="btn btn-primary"
                                        >
                                            <i
                                                class="fas fa-save mr-1"
                                            ></i>
                                            Guardar Producto
                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

        </div>

        <!-- Control Sidebar y Footer -->
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

        import App from
            "<?php echo $URL; ?>/public/assets/js/core/app.js";

        import CrearProductoController from
            "<?php echo $URL; ?>/public/assets/js/controllers/producto/crear.js";

        document.addEventListener(
            "DOMContentLoaded",
            async () => {

                // Inicializar Select2.
                $(".select2").select2({
                    theme: "bootstrap4",
                });

                // Inicializar aplicación.
                await App.bootstrap();

                // Inicializar controlador.
                await CrearProductoController.init();
            },
        );

    </script>

</body>

</html>