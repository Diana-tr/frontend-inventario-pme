<?php
// Incluir configuración general con la ruta correcta hacia la raíz
require_once __DIR__ . '/../../config/app.php';
?>

<!-- Content Wrapper. Contains page content -->
<div class="content-wrapper">
    <!-- Content Header (Page header) -->
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Lista de Usuarios</h1>
                </div>
                <div class="col-sm-6 text-right">
                    <a href="<?php echo $URL; ?>/app/views/usuarios/crear.php" class="btn btn-primary">
                        <i class="fas fa-user-plus"></i> Nuevo Usuario
                    </a>
                </div>
            </div>
        </div><!-- /.container-fluid -->
    </section>

    <!-- Main content -->
    <section class="content">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">
                    <div class="card shadow-sm">
                        <div class="card-header bg-dark text-white">
                            <h3 class="card-title">Usuarios Registrados en el Sistema</h3>
                        </div>
                        <!-- /.card-header -->
                        <div class="card-body">
                            <table id="tablaUsuarios" class="table table-bordered table-striped">
                               <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Correo Electrónico</th>
                                        <th>Rol / Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Los datos se cargarán dinámicamente mediante la API de Django -->
                                </tbody>
                            </table>
                        </div>
                        <!-- /.card-body -->
                    </div>
                    <!-- /.card -->
                </div>
                <!-- /.col -->
            </div>
            <!-- /.row -->
        </div>
        <!-- /.container-fluid -->
    </section>
    <!-- /.content -->
</div>

<!-- Importar dependencias de DataTables -->
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap4.min.css">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap4.min.js"></script>

<script>
    $(document).ready(function() {
        // Inicializar DataTables con conexión AJAX a tu backend de Django
        $('#tablaUsuarios').DataTable({
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
            },
            "ajax": {
                "url": "http://127.0.0.1:8000/api/v1/users/",
                "dataSrc": ""
            },
            "columns": [
                { "data": "id" },
                { "data": "nombre" },
                { "data": "email" },
                { "data": "rol" },
                { 
                    "data": null,
                    "render": function(data, type, row) {
                        return `<button class="btn btn-sm btn-info mr-1" title="Editar"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-danger" title="Eliminar"><i class="fas fa-trash"></i></button>`;
                    }
                }
            ]
        });
    });
</script>