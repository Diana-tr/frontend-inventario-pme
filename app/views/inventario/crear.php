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
                                <i class="fas fa-warehouse mr-2"></i>
                                Gestión de Inventario
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
                                    <a href="<?php echo $URL; ?>/inventario">
                                        Inventario
                                    </a>
                                </li>

                                <li class="breadcrumb-item active">
                                    Configurar Inventario
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
                                        <i class="fas fa-cog mr-1"></i>
                                        Configuración Inicial de Inventario
                                    </h3>
                                </div>

                                <!-- Card Body / Formulario -->
                                <div class="card-body">

                                    <form
                                        id="form_crear_inventario"
                                        novalidate
                                    >

                                        <!-- Sección de Datos Principales -->
                                        <h5 class="mb-3 text-primary border-bottom pb-2">
                                            <i class="fas fa-info-circle mr-1"></i>
                                            Datos del Producto
                                        </h5>

                                        <div class="row">

                                            <!-- Producto -->
                                            <div class="col-md-12">
                                                <div class="form-group">
                                                    <label for="product">
                                                        Producto 
                                                        <span class="text-danger">*</span>
                                                    </label>

                                                    <select
                                                        class="form-control select2"
                                                        id="product"
                                                        name="product"
                                                        style="width: 100%;"
                                                        required
                                                    >
                                                        <option value="">
                                                            Cargando productos...
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>

                                        </div>

                                        <!-- Sección de Niveles de Stock -->
                                        <h5 class="mt-4 mb-3 text-primary border-bottom pb-2">
                                            <i class="fas fa-layer-group mr-1"></i>
                                            Niveles de Existencia
                                        </h5>

                                        <div class="row">

                                            <!-- Stock Actual -->
                                            <div class="col-md-4">
                                                <div class="form-group">
                                                    <label for="current_stock">
                                                        Existencia Actual 
                                                        <span class="text-danger">*</span>
                                                    </label>
                                                    
                                                    <input
                                                        type="number"
                                                        class="form-control"
                                                        id="current_stock"
                                                        name="current_stock"
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    >
                                                </div>
                                            </div>

                                            <!-- Stock Mínimo -->
                                            <div class="col-md-4">
                                                <div class="form-group">
                                                    <label for="minimum_stock">
                                                        Existencia Mínima 
                                                        <span class="text-danger">*</span>
                                                    </label>
                                                    
                                                    <input
                                                        type="number"
                                                        class="form-control"
                                                        id="minimum_stock"
                                                        name="minimum_stock"
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    >
                                                    <small class="text-muted">Umbral de alerta de bajo inventario.</small>
                                                </div>
                                            </div>

                                            <!-- Stock Máximo -->
                                            <div class="col-md-4">
                                                <div class="form-group">
                                                    <label for="maximum_stock">
                                                        Existencia Máxima
                                                    </label>
                                                    
                                                    <input
                                                        type="number"
                                                        class="form-control"
                                                        id="maximum_stock"
                                                        name="maximum_stock"
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                    >
                                                    <small class="text-muted">Opcional. Umbral de sobrestock.</small>
                                                </div>
                                            </div>

                                        </div>

                                        <!-- Botones de Acción -->
                                        <div class="mt-4 pt-3 border-top d-flex justify-content-between">
                                            
                                            <a
                                                href="<?php echo $URL; ?>/inventario"
                                                class="btn btn-secondary"
                                            >
                                                <i class="fas fa-times mr-1"></i>
                                                Cancelar
                                            </a>

                                            <button
                                                type="submit"
                                                class="btn btn-primary"
                                                id="btn_guardar_inventario"
                                            >
                                                <i class="fas fa-save mr-1"></i>
                                                Registrar Configuración
                                            </button>

                                        </div>

                                    </form>

                                </div>
                                <!-- /.card-body -->

                            </div>
                            <!-- /.card -->

                        </div>
                    </div>
                </div>

            </section>
            <!-- /.content -->

        </div>
        <!-- /.content-wrapper -->

        <?php require_once __DIR__ . '/../layouts/footer.php'; ?>

    </div>
    <!-- ./wrapper -->

    <!-- No requiere scripts.php -->

    <!-- Select2 JS -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/select2/js/select2.full.min.js"></script>

    <!-- Inicialización del Controlador (Modular) -->
    <script type="module">
        import App from '<?php echo $URL; ?>/public/assets/js/core/app.js';
        import CrearInventarioController from '<?php echo $URL; ?>/public/assets/js/controllers/inventario/crear.js';
        import SecurityManager from '<?php echo $URL; ?>/public/assets/js/core/security.js';

        document.addEventListener('DOMContentLoaded', async () => {
            // Inicializar Select2 con el tema de Bootstrap 4
            $('.select2').select2({
                theme: 'bootstrap4',
                language: {
                    noResults: function () {
                        return "No se encontraron resultados";
                    }
                }
            });

            await App.bootstrap();
            await CrearInventarioController.init();
        });
    </script>
</body>
</html>
