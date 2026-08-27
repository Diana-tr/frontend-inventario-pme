<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/app.php';

// Incluimos la estructura de la plantilla para que mantenga el diseño, menú y colores
include_once("../layouts/head.php");
include_once("../layouts/navbar.php");
include_once("../layouts/sidebar.php");
?>

<main>
    <div class="container-fluid px-4 py-4">
        <!-- Encabezado y migas de pan -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="mt-2 text-dark fw-bold">Lista de Usuarios</h1>
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item"><a href="../dashboard/index.php">Dashboard</a></li>
                    <li class="breadcrumb-item active">Usuarios</li>
                </ol>
            </div>
            <div>
                <a href="crear.php" class="btn btn-primary">
                    <i class="fas fa-user-plus me-1"></i> Nuevo Usuario
                </a>
            </div>
        </div>

        <!-- Tarjeta que contiene la tabla de usuarios con diseño profesional -->
        <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white py-3">
                <h5 class="m-0 text-primary fw-semibold">
                    <i class="fas fa-table me-2"></i> Usuarios Registrados en el Sistema
                </h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table id="datatablesSimple" class="table table-striped table-bordered align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Correo Electrónico</th>
                                <th>Rol / Estado</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tablaUsuariosBody">
                            <tr>
                                <td colspan="5" class="text-center py-4 text-muted">Cargando usuarios...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</main>

<?php
// Incluimos el pie de página oficial de la plantilla
include_once("../layouts/footer.php");
?>