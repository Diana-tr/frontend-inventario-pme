<?php
require_once __DIR__ . '/../../config/app.php';
?>
<!-- Main Sidebar Container -->
<aside class="main-sidebar sidebar-dark-primary elevation-4">
    <!-- Brand Logo - Estilo Grande y Centrado -->
    <a href="<?php echo $URL; ?>/app/views/dashboard/index.php" class="brand-link d-flex flex-column align-items-center justify-content-center text-center" style="background-color: #1f2d3d; height: 110px; padding: 10px;">
        <img src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" 
             alt="Logo inventario PME" 
             class="elevation-2 mb-1" 
             style="opacity: 1; width: 65px; height: 65px; object-fit: contain; background: white; border-radius: 50%; padding: 3px;">
        <span class="brand-text font-weight-bold text-white" style="font-size: 0.95rem; letter-spacing: 0.5px;">Software P.M.E</span>
    </a>

    <!-- Sidebar -->
    <div class="sidebar">
        <!-- Sidebar user panel -->
        <div class="user-panel mt-3 pb-3 mb-3 d-flex">
            <div class="image">
                <img src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/dist/img/user2-160x160.jpg" class="img-circle elevation-2" alt="User Image">
            </div>
            <div class="info">
                <a href="#" class="d-block">Alexander Pierce</a>
            </div>
        </div>

        <!-- Sidebar Menu -->
        <nav class="mt-2">
            <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                <!-- Dashboard -->
                <li class="nav-item menu-open">
                    <a href="<?php echo $URL; ?>/app/views/dashboard/index.php" class="nav-link active">
                        <i class="nav-icon fas fa-tachometer-alt"></i>
                        <p>
                            Dashboard
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                </li>

                <!-- Módulo de Usuarios -->
                <li class="nav-item menu-open">
                    <a href="#" class="nav-link active">
                        <i class="nav-icon fas fa-user"></i>
                        <p>
                            Usuarios
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item">
                            <a href="javascript:void(0);" onclick="location.href='<?php echo $URL; ?>/app/views/usuarios/listar.php';" class="nav-link">
                                <i class="nav-icon fas fa-users"></i>
                                <p>Ver Usuarios</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="javascript:void(0);" onclick="location.href='<?php echo $URL; ?>/app/views/usuarios/crear.php';" class="nav-link">
                                <i class="nav-icon fas fa-user-plus"></i>
                                <p>Crear Usuarios</p>
                            </a>
                        </li>
                    </ul>
                </li>

                <!-- Separador visual opcional -->
                <li class="nav-header border-top border-secondary my-2"></li>

                <!-- Módulo de Cerrar Sesión -->
                <li class="nav-item px-2">
                    <a href="#" id="logout-btn" class="nav-link btn btn-danger text-white text-left shadow-sm">
                        <i class="nav-icon fas fa-sign-out-alt mr-2"></i>
                        <p class="d-inline">Cerrar Sesión</p>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</aside>