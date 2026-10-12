<?php
require_once __DIR__ . '/../../config/app.php';
?>

<!-- Navbar -->
<nav class="main-header navbar navbar-expand navbar-white navbar-light">
    <!-- Left navbar links -->
    <ul class="navbar-nav align-items-center">
        <li class="nav-item">
            <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
            <a href="<?php echo $URL; ?>/dashboard" class="nav-link">Inicio</a>
        </li>
    </ul>

    <!-- Indicador Global de Caja Centrado en el Navbar -->
    <ul class="navbar-nav mx-auto align-items-center d-none d-md-flex">
        <li class="nav-item">
            <a href="<?php echo $URL; ?>/caja" class="px-3 py-1 d-flex align-items-center shadow-sm text-decoration-none" title="Ir al módulo de Caja" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease;">
                <i class="fas fa-cash-register mr-2" style="color: #2563EB;"></i>
                <span id="navbar_caja_nombre" class="font-weight-bold text-dark mr-2">Caja: <span class="text-muted font-weight-normal">Cargando...</span></span>
                <span id="navbar_caja_estado_badge" class="badge px-2 py-1" style="background-color: #E2E8F0; color: #64748B; font-size: 0.65rem; border-radius: 10px;">Verificando</span>
            </a>
        </li>
    </ul>

    <!-- Right navbar links -->
    <ul class="navbar-nav ml-auto">
        <!-- Notifications Dropdown Menu -->
        <li class="nav-item dropdown">
            <a class="nav-link" data-toggle="dropdown" href="#">
                <i class="far fa-bell"></i>
                <span class="badge badge-warning navbar-badge">15</span>
            </a>
            <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                <span class="dropdown-item dropdown-header">15 Notifications</span>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
            </div>
        </li>

        <!-- User Dropdown Menu -->
        <li class="nav-item dropdown user-menu">
            <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                <div id="navbar-avatar-small" class="user-image img-circle elevation-2 d-inline-flex align-items-center justify-content-center" style="width: 1.8rem; height: 1.8rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-weight: 700; font-size: 0.75rem; letter-spacing: 0.5px; text-transform: uppercase;">
                    <span>--</span>
                </div>
                <span class="d-none d-md-inline" id="navbar-username">Cargando...</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                <!-- User Image Header -->
                <li class="user-header bg-primary d-flex flex-column align-items-center justify-content-center">
                    <div id="navbar-avatar-large" class="img-circle elevation-2 d-flex align-items-center justify-content-center mb-2" style="width: 90px; height: 90px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-weight: 700; font-size: 2.2rem; letter-spacing: 0.5px; text-transform: uppercase;">
                        <span>--</span>
                    </div>
                    <p>
                        <span id="navbar-fullname">Cargando...</span>
                        <small id="navbar-role">Rol no definido</small>
                    </p>
                </li>
                <!-- Menu Footer -->
                <li class="user-footer">
                    <a href="#" class="btn btn-default btn-flat">Perfil</a>
                    <a href="#" id="logout-btn" class="btn btn-danger btn-flat float-right text-white">
                        <i class="fas fa-sign-out-alt mr-1"></i> Cerrar Sesión
                    </a>
                </li>
            </ul>
        </li>

        <li class="nav-item">
            <a class="nav-link" data-widget="fullscreen" href="#" role="button">
                <i class="fas fa-expand-arrows-alt"></i>
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-widget="control-sidebar" data-controlsidebar-slide="true" href="#" role="button">
                <i class="fas fa-th-large"></i>
            </a>
        </li>
    </ul>
</nav>
<!-- /.navbar -->

<!-- Inicialización limpia mediante el controlador -->
<script type="module">
    import NavbarController from '<?php echo $URL; ?>/public/assets/js/controllers/auth/navbar_controller.js?v=2026';
    import LogoutController from '<?php echo $URL; ?>/public/assets/js/controllers/auth/logout_controller.js?v=2026';

    document.addEventListener('DOMContentLoaded', () => {
        NavbarController.init();
        LogoutController.init();
    });
</script>