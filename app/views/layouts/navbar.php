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
    <ul class="navbar-nav ml-auto align-items-center">
        <!-- Notifications Dropdown Menu (Campanita Oficial P.M.E.) -->
        <li class="nav-item dropdown" id="navbar-notifications-item">
            <a class="nav-link" data-toggle="dropdown" href="#" id="navbar-notifications-bell" title="Notificaciones de versiones y novedades">
                <i class="far fa-bell"></i>
                <span class="badge badge-warning navbar-badge" id="navbar-notifications-badge" style="display: none;">0</span>
            </a>
            <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right shadow-sm border-0" id="navbar-notifications-dropdown" style="min-width: 320px; border-radius: 12px;">
                <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light" style="border-radius: 12px 12px 0 0;">
                    <span class="font-weight-bold text-dark small" id="navbar-notifications-header">
                        <i class="fas fa-bell mr-1 text-primary"></i> Notificaciones
                    </span>
                    <button type="button" class="btn btn-link btn-xs text-primary p-0 text-decoration-none" id="navbar-notifications-mark-all" style="font-size: 0.75rem; font-weight: 600;">
                        Marcar todas leídas
                    </button>
                </div>
                <div id="navbar-notifications-list" style="max-height: 280px; overflow-y: auto;">
                    <div class="text-center py-4 text-muted small" id="navbar-notifications-empty">
                        <i class="fas fa-check-circle text-success mr-1"></i> No hay notificaciones pendientes.
                    </div>
                </div>
                <div class="dropdown-divider m-0"></div>
                <a href="<?php echo $URL; ?>/configuracion" class="dropdown-item dropdown-footer text-center py-2 text-primary font-weight-bold small">
                    <i class="fas fa-history mr-1"></i> Ver historial de versiones
                </a>
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