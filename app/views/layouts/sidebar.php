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
                <a href="#" class="d-block" id="sidebar-username">Cargando...</a>
            </div>
        </div>

        <script>
            // Inyectar nombre del usuario autenticado desde Storage
            (function() {
                try {
                    const raw = localStorage.getItem("inventariopme_user");
                    if (raw) {
                        const user = JSON.parse(raw);
                        const name = user.name || user.first_name || user.username || "Usuario";
                        const el = document.getElementById("sidebar-username");
                        if (el) el.textContent = name;
                    }
                } catch (e) {
                    /* silenciar */
                }
            })();
        </script>

        <!-- Sidebar Menu -->
        <nav class="mt-2">
            <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                <!-- Dashboard -->
                <li class="nav-item" data-sidebar-module="dashboard">
                    <a href="<?php echo $URL; ?>/dashboard" class="nav-link" data-sidebar-path="/dashboard">
                        <i class="nav-icon fas fa-tachometer-alt"></i>
                        <p>Dashboard</p>
                    </a>
                </li>

                <!-- Módulo de Usuarios -->
                <li class="nav-item" data-sidebar-module="usuarios">
                    <a href="#" class="nav-link">
                        <i class="nav-icon fas fa-address-card"></i>
                        <p>
                            Usuarios
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item">
                            <a href="<?php echo $URL; ?>/usuarios" class="nav-link" data-sidebar-path="/usuarios">
                                <i class="nav-icon fas fa-users"></i>
                                <p>Ver Usuarios</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="<?php echo $URL; ?>/usuarios/crear" class="nav-link" data-sidebar-path="/usuarios/crear">
                                <i class="nav-icon fas fa-user-plus"></i>
                                <p>Crear Usuarios</p>
                            </a>
                        </li>
                    </ul>
                </li>

                <!-- Separador visual -->
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

        <script>
            /**
             * Sidebar Active State Manager
             * Detecta la URL actual y resalta el módulo y submódulo correspondiente.
             */
            (function() {
                const basePath = "/frontend-inventario-pme";
                const currentPath = window.location.pathname.replace(basePath, "").replace(/\/+$/, "") || "/dashboard";

                // 1. Buscar el enlace exacto que coincida con la ruta actual
                const allLinks = document.querySelectorAll(".nav-sidebar a[data-sidebar-path]");
                let matchedLink = null;

                allLinks.forEach(link => {
                    const linkPath = link.getAttribute("data-sidebar-path").replace(/\/+$/, "");
                    if (currentPath === linkPath) {
                        matchedLink = link;
                    }
                });

                // Si no encontramos coincidencia exacta, buscar por prefijo (ej: /usuarios/editar → /usuarios)
                if (!matchedLink) {
                    allLinks.forEach(link => {
                        const linkPath = link.getAttribute("data-sidebar-path").replace(/\/+$/, "");
                        if (linkPath !== "/dashboard" && currentPath.startsWith(linkPath)) {
                            matchedLink = link;
                        }
                    });
                }

                if (!matchedLink) return;

                // 2. Marcar el submódulo como activo
                matchedLink.classList.add("active");

                // 3. Abrir el módulo padre (si es un treeview)
                const parentLi = matchedLink.closest("li.nav-item[data-sidebar-module]");
                if (parentLi) {
                    parentLi.classList.add("menu-open");
                    const parentLink = parentLi.querySelector(":scope > a.nav-link");
                    if (parentLink) {
                        parentLink.classList.add("active");
                    }
                }
            })();
        </script>
    </div>
</aside>
