<?php
require_once __DIR__ . '/../../../config/app.php';

// Detectar la ruta activa para resaltar el enlace correspondiente
$current_path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$current_path = str_replace('/frontend-inventario-pme', '', $current_path);
$current_path = '/' . trim($current_path, '/');

function is_active($path, $current) {
    if ($path === $current) return 'active';
    if ($path !== '/saas-admin/dashboard' && strpos($current, $path) === 0) return 'active';
    return '';
}
?>

<aside class="main-sidebar sidebar-dark-primary elevation-4">
    <!-- Brand Logo -->
    <a href="<?php echo $URL; ?>/saas-admin/dashboard" class="brand-link d-flex flex-column align-items-center justify-content-center text-center" style="background-color: #0F172A; height: 110px; padding: 10px;">
        <img src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo" class="elevation-2 mb-1" style="opacity: 1; width: 65px; height: 65px; object-fit: contain; background: white; border-radius: 50%; padding: 3px;">
        <span class="brand-text font-weight-bold text-white" style="font-size: 0.95rem; letter-spacing: 0.5px;">SaaS Control</span>
    </a>

    <!-- Sidebar -->
    <div class="sidebar">
        <!-- User Panel (Dinámico — se actualiza con JS) -->
        <div class="user-panel mt-3 pb-3 mb-3 d-flex">
            <div class="image">
                <div class="img-circle elevation-2 d-flex align-items-center justify-content-center" style="width: 34px; height: 34px; background: #EF4444; color: #fff; font-weight: 700;">
                    <i class="fas fa-user-shield"></i>
                </div>
            </div>
            <div class="info">
                <span id="saas-sidebar-username" class="d-block text-white font-weight-bold" style="font-size: 0.85rem;">Administrador</span>
                <span id="saas-sidebar-role" class="d-block text-muted" style="font-size: 0.7rem;">
                    <i class="fas fa-circle text-success mr-1" style="font-size: 0.5rem;"></i>Superadmin
                </span>
            </div>
        </div>

        <!-- Menú -->
        <nav class="mt-2">
            <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">

                <li class="nav-header">PLATAFORMA</li>

                <li class="nav-item">
                    <a href="<?php echo $URL; ?>/saas-admin/dashboard" class="nav-link <?php echo is_active('/saas-admin/dashboard', $current_path); ?>" data-sidebar-path="/saas-admin/dashboard">
                        <i class="nav-icon fas fa-chart-pie"></i>
                        <p>Dashboard Global</p>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="<?php echo $URL; ?>/saas-admin/tenants" class="nav-link <?php echo is_active('/saas-admin/tenants', $current_path); ?>" data-sidebar-path="/saas-admin/tenants">
                        <i class="nav-icon fas fa-building"></i>
                        <p>Empresas (Tenants)</p>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="<?php echo $URL; ?>/saas-admin/planes" class="nav-link <?php echo is_active('/saas-admin/planes', $current_path); ?>" data-sidebar-path="/saas-admin/planes">
                        <i class="nav-icon fas fa-layer-group"></i>
                        <p>Planes y Suscripciones</p>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="<?php echo $URL; ?>/saas-admin/versiones" class="nav-link <?php echo is_active('/saas-admin/versiones', $current_path); ?>" data-sidebar-path="/saas-admin/versiones">
                        <i class="nav-icon fas fa-code-branch"></i>
                        <p>Versiones</p>
                    </a>
                </li>

                <li class="nav-header">EQUIPO & SEGURIDAD</li>

                <li class="nav-item">
                    <a href="<?php echo $URL; ?>/saas-admin/equipo" class="nav-link <?php echo is_active('/saas-admin/equipo', $current_path); ?>" data-sidebar-path="/saas-admin/equipo">
                        <i class="nav-icon fas fa-users-cog"></i>
                        <p>Equipo Interno</p>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="<?php echo $URL; ?>/saas-admin/auditoria" class="nav-link <?php echo is_active('/saas-admin/auditoria', $current_path); ?>" data-sidebar-path="/saas-admin/auditoria">
                        <i class="nav-icon fas fa-history"></i>
                        <p>Auditoría Global</p>
                    </a>
                </li>

                <li class="nav-header">NAVEGACIÓN</li>

                <li class="nav-item">
                    <a href="<?php echo $URL; ?>/dashboard" class="nav-link text-warning" data-sidebar-path="/dashboard">
                        <i class="nav-icon fas fa-arrow-left"></i>
                        <p>Volver al ERP</p>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</aside>

<!-- Script para inyectar nombre y rol del usuario dinámicamente -->
<script type="module">
    import Storage from "<?php echo $URL; ?>/public/assets/js/storage/storage.js";

    document.addEventListener("DOMContentLoaded", () => {
        const user = Storage.getUser();
        if (user) {
            const usernameEl = document.getElementById("saas-sidebar-username");
            const roleEl = document.getElementById("saas-sidebar-role");
            if (usernameEl) {
                usernameEl.textContent = user.first_name
                    ? (user.first_name + " " + (user.last_name || "")).trim()
                    : user.username || "Administrador";
            }
            if (roleEl) {
                const roleName = user.is_superuser ? "Superadmin" : "Staff";
                roleEl.innerHTML = '<i class="fas fa-circle text-success mr-1" style="font-size: 0.5rem;"></i>' + roleName;
            }
        }
    });
</script>
