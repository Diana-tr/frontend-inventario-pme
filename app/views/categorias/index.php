<?php
// Incluimos la configuración principal de la aplicación
require_once __DIR__ . '/../../config/app.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Inventario P.M.E | Módulo de Categorías</title>

    <!-- Google Font: Source Sans Pro -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/fontawesome-free/css/all.min.css">
    <!-- DataTables -->
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css">
    <!-- Theme style -->
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/dist/css/adminlte.min.css">
</head>
<body class="hold-transition sidebar-mini">
<div class="wrapper">

    <!-- Navbar Superior -->
    <?php include_once __DIR__ . '/../layouts/navbar.php'; ?>

    <!-- Barra Lateral -->
    <?php include_once __DIR__ . '/../layouts/sidebar.php'; ?>

    <!-- Content Wrapper -->
    <div class="content-wrapper">
        <!-- Content Header -->
        <section class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1><i class="fas fa-tags text-primary mr-2"></i> Gestión de Categorías</h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="<?php echo $URL; ?>/dashboard">Dashboard</a></li>
                            <li class="breadcrumb-item active">Categorías</li>
                        </ol>
                    </div>
                </div>
            </div>
        </section>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">

                <!-- Widgets de Estadísticas Superiores -->
                <div class="row">
                    <div class="col-lg-4 col-6">
                        <div class="small-box bg-info">
                            <div class="inner">
                                <h3 id="total-categorias">0</h3>
                                <p>Total de Categorías</p>
                            </div>
                            <div class="icon">
                                <i class="fas fa-tags"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 col-6">
                        <div class="small-box bg-success">
                            <div class="inner">
                                <h3 id="activas-categorias">0</h3>
                                <p>Categorías Activas</p>
                            </div>
                            <div class="icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 col-12">
                        <div class="small-box bg-warning">
                            <div class="inner">
                                <h3>Gestión</h3>
                                <p>Control de Inventario</p>
                            </div>
                            <div class="icon">
                                <i class="fas fa-boxes"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabla Principal -->
                <div class="card card-outline card-primary shadow-sm">
                    <div class="card-header d-flex align-items-center">
                        <h3 class="card-title font-weight-bold">Listado Registrado</h3>
                        <div class="card-tools ml-auto">
                            <button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#modal-crear-categoria">
                                <i class="fas fa-plus mr-1"></i> Nueva Categoría
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <table id="tabla-categorias" class="table table-bordered table-striped table-hover">
                            <thead>
                                <tr class="text-center">
                                    <th style="width: 10px;">#</th>
                                    <th>Código</th>
                                    <th>Icono</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Estado</th>
                                    <th style="width: 140px;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Fila 1 de Ejemplo -->
                                <tr>
                                    <td class="text-center">1</td>
                                    <td class="text-center"><code>CAT-ELEC</code></td>
                                    <td class="text-center"><i class="fas fa-laptop text-primary"></i></td>
                                    <td><b>Electrónica</b></td>
                                    <td>Dispositivos, componentes y accesorios electrónicos.</td>
                                    <td class="text-center"><span class="badge badge-success">Activo</span></td>
                                    <td class="text-center">
                                        <button class="btn btn-info btn-xs text-white" data-toggle="modal" data-target="#modal-ver-categoria" title="Ver Detalles"><i class="fas fa-eye"></i></button>
                                        <button class="btn btn-warning btn-xs text-white" title="Editar"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-danger btn-xs" title="Eliminar"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                                <!-- Fila 2 de Ejemplo -->
                                <tr>
                                    <td class="text-center">2</td>
                                    <td class="text-center"><code>CAT-HERR</code></td>
                                    <td class="text-center"><i class="fas fa-tools text-secondary"></i></td>
                                    <td><b>Herramientas</b></td>
                                    <td>Herramientas manuales y eléctricas para mantenimiento.</td>
                                    <td class="text-center"><span class="badge badge-success">Activo</span></td>
                                    <td class="text-center">
                                        <button class="btn btn-info btn-xs text-white" data-toggle="modal" data-target="#modal-ver-categoria" title="Ver Detalles"><i class="fas fa-eye"></i></button>
                                        <button class="btn btn-warning btn-xs text-white" title="Editar"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-danger btn-xs" title="Eliminar"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </section>
    </div>

    <!-- MODAL: CREAR NUEVA CATEGORÍA (CORREGIDO CON LOS ATRIBUTOS name) -->
    <div class="modal fade" id="modal-crear-categoria" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="modalLabel"><i class="fas fa-plus-circle mr-2"></i> Registrar Nueva Categoría</h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form id="form-crear-categoria">
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="codigo-categoria">Código Único <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control text-uppercase" id="codigo-categoria" name="codigo_categoria" placeholder="Ej. CAT-001" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="icono-categoria">Icono (FontAwesome)</label>
                                    <input type="text" class="form-control" id="icono-categoria" name="icono_categoria" placeholder="Ej. fas fa-laptop">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="nombre-categoria">Nombre de la Categoría <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="nombre-categoria" name="nombre_categoria" placeholder="Ej. Repuestos, Limpieza..." required>
                        </div>
                        <div class="form-group">
                            <label for="descripcion-categoria">Descripción</label>
                            <textarea class="form-control" id="descripcion-categoria" name="descripcion_categoria" rows="3" placeholder="Breve detalle de los productos que abarca..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="estado-categoria">Estado</label>
                            <select class="form-control" id="estado-categoria" name="estado_categoria">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-between">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save mr-1"></i> Guardar Categoría</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- MODAL: VER DETALLES DE CATEGORÍA -->
    <div class="modal fade" id="modal-ver-categoria" tabindex="-1" role="dialog" aria-labelledby="modalVerLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title" id="modalVerLabel"><i class="fas fa-info-circle mr-2"></i> Detalle de la Categoría</h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="font-weight-bold">Código:</label>
                                <p id="ver-codigo-categoria" class="form-control-static text-muted"><code>CAT-ELEC</code></p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="font-weight-bold">Icono:</label>
                                <p id="ver-icono-categoria" class="form-control-static text-muted"><i class="fas fa-laptop text-primary"></i> fas fa-laptop</p>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="font-weight-bold">Nombre de la Categoría:</label>
                        <p id="ver-nombre-categoria" class="form-control-static text-muted">Electrónica</p>
                    </div>
                    <div class="form-group">
                        <label class="font-weight-bold">Descripción:</label>
                        <p id="ver-descripcion-categoria" class="form-control-static text-muted">Dispositivos, componentes y accesorios electrónicos.</p>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="font-weight-bold">Estado:</label>
                                <p id="ver-estado-categoria" class="form-control-static"><span class="badge badge-success">Activo</span></p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label class="font-weight-bold">Fecha de Registro:</label>
                                <p id="ver-fecha-categoria" class="form-control-static text-muted">2026-09-02 10:00 AM</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Footer -->
    <footer class="main-footer">
        <div class="float-right d-none d-sm-inline">
            Versión 1.0.0
        </div>
        <strong>Copyright &copy; 2026 <a href="#">Inventario P.M.E</a>.</strong> Todos los derechos reservados.
    </footer>
</div>

<!-- REQUIRED SCRIPTS -->
<!-- jQuery -->
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/jquery/jquery.min.js"></script>
<!-- Bootstrap 4 -->
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<!-- AdminLTE App -->
<script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/dist/js/adminlte.min.js"></script>

<!-- Inicialización modular del controlador de Categorías -->
<script type="module">
    import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
    import CategoriasController from "<?php echo $URL; ?>/public/assets/js/controllers/categorias/categorias.js";

    document.addEventListener("DOMContentLoaded", async () => {
        await App.bootstrap();
        CategoriasController.init();
    });
</script>
</body>
</html>