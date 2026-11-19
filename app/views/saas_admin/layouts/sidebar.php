<?php
require_once __DIR__ . '/../../../config/app.php';
?>

<aside class="main-sidebar sidebar-dark-primary elevation-4">
    <!-- Brand Logo -->
    <a href="<?php echo $URL; ?>/saas-admin/dashboard" class="brand-link d-flex flex-column align-items-center justify-content-center text-center" style="background-color: #0F172A; height: 110px; padding: 10px;">
        <img src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo" class="elevation-2 mb-1" style="opacity: 1; width: 65px; height: 65px; object-fit: contain; background: white; border-radius: 50%; padding: 3px;">
        <span class="brand-text font-weight-bold text-white" style="font-size: 0.95rem; letter-spacing: 0.5px;">SaaS Control</span>
    </a>

    <!-- Sidebar -->
    <div class="sidebar">
        <!-- User Panel -->
        <div class="user-panel mt-3 pb-3 mb-3 d-flex">
            <div class="image">
                <div class="img-circle elevation-2 d-flex align-items-center justify-content-center" style="width: 34px; height: 34px; background: #EF4444; color: #fff; font-weight: 700;">
                    <i class="fas fa-user-shield"></i>
                </div>
            </div>
            <div class="info">
                <a href="#" class="d-block">Superadmin</a>
            </div>
        </div>

        <!-- Menú -->
        <nav class="mt-2">
            <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">

                <li class="nav-item">
                    <a href="<?php echo $URL; ?>/saas-admin/dashboard" class="nav-link active">
                        <i class="nav-icon fas fa-chart-pie"></i>
                        <p>Dashboard Global</p>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="<?php echo $URL; ?>/saas-admin/tenants" class="nav-link">
                        <i class="nav-icon fas fa-building"></i>
                        <p>Empresas (Tenants)</p>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <i class="nav-icon fas fa-box-open"></i>
                        <p>Planes y Suscripciones</p>
                    </a>
                </li>

                <li class="nav-header">SEGURIDAD</li>

                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <i class="nav-icon fas fa-history"></i>
                        <p>Auditoría Global</p>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="<?php echo $URL; ?>/dashboard" class="nav-link text-warning">
                        <i class="nav-icon fas fa-arrow-left"></i>
                        <p>Volver al ERP</p>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</aside>
