<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/app.php';

include_once("../layouts/head.php");
include_once("../layouts/navbar.php");
include_once("../layouts/sidebar.php");
?>

<main>
    <div class="container-fluid px-4 py-4">
        <!-- Título y migas de pan -->
        <h1 class="mt-2 text-dark fw-bold">Registrar Nuevo Usuario</h1>
        <ol class="breadcrumb mb-4">
            <li class="breadcrumb-item"><a href="../dashboard/index.php">Dashboard</a></li>
            <li class="breadcrumb-item"><a href="listar.php">Usuarios</a></li>
            <li class="breadcrumb-item active">Crear</li>
        </ol>

        <!-- Tarjeta del formulario -->
        <div class="card shadow-sm border-0 mb-4" style="max-width: 700px;">
            <div class="card-header bg-white py-3">
                <h5 class="m-0 text-primary fw-semibold">
                    <i class="fas fa-user-plus me-2"></i> Formulario de Registro de Usuario
                </h5>
            </div>
            <div class="card-body p-4">
                <div id="alertMessage" class="alert" style="display: none;"></div>

                <form id="formCrearUsuario">
                    <div class="mb-3">
                        <label for="name" class="form-label fw-bold text-secondary">Nombre Completo:</label>
                        <input type="text" class="form-control" id="name" name="name" required placeholder="Ej. Diana Trujillo">
                    </div>

                    <div class="mb-3">
                        <label for="email" class="form-label fw-bold text-secondary">Correo electrónico:</label>
                        <input type="email" class="form-control" id="email" name="email" required placeholder="ejemplo@correo.com">
                    </div>

                    <div class="mb-4">
                        <label for="password" class="form-label fw-bold text-secondary">Contraseña:</label>
                        <input type="password" class="form-control" id="password" name="password" required placeholder="********">
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                        <a href="<?php echo $URL; ?>/app/views/usuarios/listar.php" class="text-decoration-none text-muted">← Volver a la lista</a>
                        <button type="submit" class="btn btn-primary px-4">
                            <i class="fas fa-save me-1"></i> Guardar Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</main>

<!-- Llamado al controlador modular ubicado en public/assets/js/controllers/usuario/crear.js -->
<script type="module" src="../../../public/assets/js/controllers/usuario/crear.js"></script>

<?php
include_once("../layouts/footer.php");
?>