<?php
require_once __DIR__ . '/../../../config/app.php';
?>

<link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/css/components/notifications.css?v=<?php echo $APP_VERSION; ?>">

<!-- Navbar SaaS Admin Exclusivo -->
<nav class="main-header navbar navbar-expand navbar-white navbar-light">
    <!-- Left navbar links -->
    <ul class="navbar-nav align-items-center">
        <li class="nav-item">
            <a class="nav-link" data-widget="pushmenu" href="#" role="button" title="Contraer / Expandir Menú"><i class="fas fa-bars"></i></a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
            <a href="<?php echo $URL; ?>/saas-admin/dashboard" class="nav-link font-weight-bold text-dark">
                <i class="fas fa-shield-alt text-primary mr-1"></i> SaaS Admin Panel
            </a>
        </li>
    </ul>

    <!-- Indicador Central Global -->
    <ul class="navbar-nav mx-auto align-items-center d-none d-md-flex">
        <li class="nav-item">
            <span class="px-3 py-1 d-flex align-items-center shadow-sm text-decoration-none" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 20px; font-size: 0.8rem;">
                <i class="fas fa-server mr-2 text-primary"></i>
                <span class="font-weight-bold text-dark mr-2">Entorno: <span class="text-primary font-weight-bold">Control Global</span></span>
                <span class="badge badge-primary px-2 py-1" style="font-size: 0.65rem; border-radius: 10px;">Multi-Tenant</span>
            </span>
        </li>
    </ul>

    <!-- Right navbar links -->
    <ul class="navbar-nav ml-auto align-items-center">
        <!-- Botón para ir al ERP de clientes -->
        <li class="nav-item mr-2">
            <a href="<?php echo $URL; ?>/dashboard" class="btn btn-sm btn-outline-warning font-weight-bold shadow-sm" style="border-radius: 20px; font-size: 0.78rem;">
                <i class="fas fa-external-link-alt mr-1"></i> Ir al ERP
            </a>
        </li>

        <!-- Notifications Dropdown Menu SaaS Admin -->
        <li class="nav-item dropdown mr-2" id="saas-navbar-notifications-item">
            <a class="nav-link notification-bell-btn" data-toggle="dropdown" href="#" id="saas-navbar-notifications-bell" title="Alertas y Notificaciones de Plataforma">
                <i class="far fa-bell text-dark"></i>
                <span class="badge badge-danger navbar-badge" id="saas-navbar-notifications-badge" style="display: none;">0</span>
            </a>
            <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right shadow border-0" id="saas-navbar-notifications-dropdown" style="min-width: 340px; border-radius: 12px; margin-top: 8px;">
                <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light" style="border-radius: 12px 12px 0 0;">
                    <span class="font-weight-bold text-dark small" id="saas-navbar-notifications-header">
                        <i class="fas fa-bell mr-1 text-danger"></i> Alertas de Sistema
                    </span>
                    <button type="button" class="btn btn-link btn-xs text-primary p-0 text-decoration-none btn-mark-all-read-dynamic" style="font-size: 0.75rem; font-weight: 600;">
                        Marcar todas leídas
                    </button>
                </div>
                <div id="saas-navbar-notifications-list" style="max-height: 280px; overflow-y: auto;">
                    <div class="text-center py-4 text-muted small">
                        <i class="fas fa-check-circle text-success mr-1"></i> No hay alertas pendientes.
                    </div>
                </div>
                <div class="dropdown-divider m-0"></div>
                <a href="#" class="dropdown-item dropdown-footer text-center py-2 text-primary font-weight-bold small btn-open-notif-center-dynamic">
                    <i class="fas fa-th-list mr-1"></i> Abrir Centro de Notificaciones
                </a>
            </div>
        </li>

        <!-- User Dropdown Menu -->
        <li class="nav-item dropdown user-menu">
            <a href="#" class="nav-link dropdown-toggle d-flex align-items-center" data-toggle="dropdown" aria-expanded="false">
                <div id="saas-navbar-avatar-small" class="user-image img-circle elevation-1 d-inline-flex align-items-center justify-content-center" style="width: 2rem; height: 2rem; background: #0F172A; color: #fff; font-weight: 700; font-size: 0.75rem; letter-spacing: 0.5px;">
                    <i class="fas fa-user-shield"></i>
                </div>
                <span class="d-none d-md-inline ml-2 font-weight-bold text-dark" id="saas-navbar-username">Administrador</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-lg dropdown-menu-right shadow border-0" style="border-radius: 12px; margin-top: 8px;">
                <!-- User Header -->
                <li class="user-header bg-dark d-flex flex-column align-items-center justify-content-center" style="border-radius: 12px 12px 0 0;">
                    <div class="img-circle elevation-2 d-flex align-items-center justify-content-center mb-2" style="width: 65px; height: 65px; background: #EF4444; color: #fff; font-weight: 700; font-size: 1.5rem;">
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <p class="text-white mb-0 font-weight-bold" id="saas-navbar-fullname">Administrador</p>
                    <small class="badge badge-danger mt-1" id="saas-navbar-role-badge">SUPERADMIN</small>
                </li>
                <!-- Menu Footer -->
                <li class="user-footer bg-light" style="border-radius: 0 0 12px 12px;">
                    <a href="<?php echo $URL; ?>/dashboard" class="btn btn-default btn-flat btn-sm">
                        <i class="fas fa-building mr-1"></i> Vista ERP
                    </a>
                    <a href="#" id="saas-logout-btn" class="btn btn-danger btn-flat btn-sm float-right text-white font-weight-bold">
                        <i class="fas fa-sign-out-alt mr-1"></i> Cerrar Sesión
                    </a>
                </li>
            </ul>
        </li>

        <li class="nav-item">
            <a class="nav-link" data-widget="fullscreen" href="#" role="button" title="Pantalla completa">
                <i class="fas fa-expand-arrows-alt"></i>
            </a>
        </li>
    </ul>
</nav>

<script type="module">
    import Storage from "<?php echo $URL; ?>/public/assets/js/storage/storage.js";
    import AuthService from "<?php echo $URL; ?>/public/assets/js/services/auth_service.js";
    import NotificationFeedController from "<?php echo $URL; ?>/public/assets/js/controllers/notifications/notification_feed_controller.js?v=<?php echo $APP_VERSION; ?>";

    document.addEventListener("DOMContentLoaded", () => {
        NotificationFeedController.init();

        const user = Storage.getUser();
        if (user) {
            const displayName = user.first_name
                ? `${user.first_name} ${user.last_name || ""}`.trim()
                : user.username || "Administrador";

            const nameEl = document.getElementById("saas-navbar-username");
            const fullEl = document.getElementById("saas-navbar-fullname");
            const roleEl = document.getElementById("saas-navbar-role-badge");

            if (nameEl) nameEl.textContent = displayName;
            if (fullEl) fullEl.textContent = displayName;
            if (roleEl) roleEl.textContent = user.is_superuser ? "SUPERADMIN" : "STAFF AUTORIZADO";
        }

        const logoutBtn = document.getElementById("saas-logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                logoutBtn.classList.add("disabled");
                logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Saliendo...';
                try {
                    await AuthService.logout();
                } catch (err) {
                    console.warn("[SAAS NAVBAR] Error en notificación de logout al backend:", err);
                } finally {
                    Storage.clear();
                    sessionStorage.clear();
                    window.location.replace("<?php echo $URL; ?>/saas-admin/login");
                }
            });
        }
    });
</script>
