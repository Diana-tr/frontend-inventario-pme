<?php
require_once __DIR__ . '/../../config/app.php';
?>
<!-- Main Sidebar Container -->
<aside class="main-sidebar sidebar-dark-primary elevation-4">
    <!-- Brand Logo - Estilo Grande y Centrado -->
    <a href="<?php echo $URL; ?>/dashboard" class="brand-link d-flex flex-column align-items-center justify-content-center text-center" style="background-color: #1f2d3d; height: 110px; padding: 10px;">
        <img src="<?php echo $URL; ?>/public/assets/img/logo-sin-texto.png"
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
                <div id="sidebar-avatar"
                    class="img-circle elevation-2 d-flex align-items-center justify-content-center"
                    style="width: 34px; height: 34px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase; border-radius: 50%;">
                    <span>--</span>
                </div>
            </div>
            <div class="info">
                <a href="#" class="d-block" id="sidebar-username">Cargando...</a>
            </div>
        </div>

        <script>
            // Inyectar nombre y avatar con iniciales del usuario autenticado
            (function() {
                try {
                    const raw = localStorage.getItem("inventariopme_user");
                    if (!raw) return;

                    const user = JSON.parse(raw);

                    // ── Nombre para mostrar ──
                    const displayName = user.name || user.first_name || user.username || "Usuario";
                    const nameEl = document.getElementById("sidebar-username");
                    if (nameEl) nameEl.textContent = displayName;

                    // ── Iniciales para el avatar ──
                    let initials = "";

                    if (user.first_name && user.last_name) {
                        // Caso ideal: tiene nombre y apellido separados
                        initials = user.first_name.charAt(0) + user.last_name.charAt(0);
                    } else if (user.name) {
                        // Caso: tiene un campo 'name' con nombre completo
                        const parts = user.name.trim().split(/\s+/);
                        initials = parts[0].charAt(0);
                        if (parts.length > 1) {
                            initials += parts[parts.length - 1].charAt(0);
                        }
                    } else if (user.first_name) {
                        initials = user.first_name.substring(0, 2);
                    } else if (user.username) {
                        initials = user.username.substring(0, 2);
                    } else {
                        initials = "U";
                    }

                    const avatarEl = document.getElementById("sidebar-avatar");
                    if (avatarEl) {
                        avatarEl.querySelector("span").textContent = initials.toUpperCase();
                    }
                } catch (e) {
                    /* silenciar */
                }
            })();
        </script>

        <!-- ============================================================
             Sidebar Menu — Navegación Jerárquica
             Nivel 1: MÓDULO        → nav-header-module + nav-item-module
             Nivel 2: SUBMÓDULO     → nav-item con nav-treeview
             Nivel 3: FUNCIONALIDAD → nav-item con enlace directo
             ============================================================ -->
        <nav class="mt-2">
            <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">

                <!-- ============================================================
                     Dashboard (sin jerarquía — acceso directo)
                     ============================================================ -->
                <li class="nav-item" data-sidebar-module="dashboard">
                    <a href="<?php echo $URL; ?>/dashboard" class="nav-link" data-sidebar-path="/dashboard">
                        <i class="nav-icon fas fa-tachometer-alt"></i>
                        <p>Dashboard</p>
                    </a>
                </li>

                <!-- ============================================================
                     MÓDULO 1: Administración y Seguridad
                     ============================================================ -->
                <li class="nav-item nav-item-module" data-sidebar-module="admin-seguridad" data-permission-any="users.view,users.create,roles.view,roles.create,user_roles.view">
                    <a href="#" class="nav-link">
                        <i class="nav-icon fas fa-shield-alt"></i>
                        <p>
                            Admin. y Seguridad
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">

                        <!-- ── Submódulo: Usuarios ── -->
                        <li class="nav-item" data-permission-any="users.view,users.create">
                            <a href="#" class="nav-link">
                                <i class="nav-icon fas fa-users"></i>
                                <p>
                                    Usuarios
                                    <i class="right fas fa-angle-left"></i>
                                </p>
                            </a>
                            <ul class="nav nav-treeview">
                                <li class="nav-item" data-permission="users.view">
                                    <a href="<?php echo $URL; ?>/usuarios" class="nav-link" data-sidebar-path="/usuarios">
                                        <i class="nav-icon far fa-circle"></i>
                                        <p>Listar Usuarios</p>
                                    </a>
                                </li>
                                <li class="nav-item" data-permission="users.create">
                                    <a href="<?php echo $URL; ?>/usuarios/crear" class="nav-link" data-sidebar-path="/usuarios/crear">
                                        <i class="nav-icon far fa-circle"></i>
                                        <p>Crear Usuario</p>
                                    </a>
                                </li>
                            </ul>
                        </li>

                        <!-- ── Submódulo: Roles y Permisos ── -->
                        <li class="nav-item" data-permission-any="roles.view,roles.create,user_roles.view">
                            <a href="#" class="nav-link">
                                <i class="nav-icon fas fa-user-shield"></i>
                                <p>
                                    Roles y Permisos
                                    <i class="right fas fa-angle-left"></i>
                                </p>
                            </a>
                            <ul class="nav nav-treeview">
                                <li class="nav-item" data-permission="roles.view">
                                    <a href="<?php echo $URL; ?>/roles" class="nav-link" data-sidebar-path="/roles">
                                        <i class="nav-icon far fa-circle"></i>
                                        <p>Listar Roles</p>
                                    </a>
                                </li>
                                <li class="nav-item" data-permission="roles.create">
                                    <a href="<?php echo $URL; ?>/roles/crear" class="nav-link" data-sidebar-path="/roles/crear">
                                        <i class="nav-icon far fa-circle"></i>
                                        <p>Crear Rol</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>

                <!-- ============================================================
                     MÓDULO 2: Catálogo e Inventario
                     ============================================================ -->
                <li class="nav-item nav-item-module" data-sidebar-module="catalogo-inventario" data-permission-any="categories.view,categories.create,products.view,products.create">
                    <a href="#" class="nav-link">
                        <i class="nav-icon fas fa-boxes"></i>
                        <p>
                            Catálogo e Inventario
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item" data-permission-any="categories.view,categories.create">
                            <a href="#" class="nav-link">
                                <i class="nav-icon fas fa-tags"></i>
                                <p>
                                    Categorías y Marcas
                                    <i class="right fas fa-angle-left"></i>
                                </p>
                            </a>
                            <ul class="nav nav-treeview">
                                <li class="nav-item" data-permission="categories.view">
                                    <a href="<?php echo $URL; ?>/categorias" class="nav-link" data-sidebar-path="/categorias">
                                        <i class="nav-icon far fa-circle"></i>
                                        <p>Listar Categorías</p>
                                    </a>
                                </li>
                                <li class="nav-item" data-permission="categories.create">
                                    <a href="<?php echo $URL; ?>/categorias/crear" class="nav-link" data-sidebar-path="/categorias/crear">
                                        <i class="nav-icon far fa-circle"></i>
                                        <p>Crear Categoría</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>

                <!-- ============================================================
                     MÓDULO 4: Ventas y Facturación
                     ============================================================ -->
                <li class="nav-item nav-item-module" data-sidebar-module="ventas-facturacion" data-permission-any="customers.view,customers.create">
                    <a href="#" class="nav-link">
                        <i class="nav-icon fas fa-cash-register"></i>
                        <p>
                            Ventas y Facturación
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item" data-permission-any="customers.view,customers.create">
                            <a href="#" class="nav-link">
                                <i class="nav-icon fas fa-user-tie"></i>
                                <p>
                                    Clientes
                                    <i class="right fas fa-angle-left"></i>
                                </p>
                            </a>
                            <ul class="nav nav-treeview">
                                <li class="nav-item" data-permission="customers.view">
                                    <a href="<?php echo $URL; ?>/clientes" class="nav-link" data-sidebar-path="/clientes">
                                        <i class="nav-icon far fa-circle"></i>
                                        <p>Listar Clientes</p>
                                    </a>
                                </li>
                                <li class="nav-item" data-permission="customers.create">
                                    <a href="<?php echo $URL; ?>/clientes/crear" class="nav-link" data-sidebar-path="/clientes/crear">
                                        <i class="nav-icon far fa-circle"></i>
                                        <p>Crear Cliente</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>

            </ul>
        </nav>

        <script>
            /**
             * Sidebar Active State Manager (3 niveles)
             * Detecta la URL actual y resalta la funcionalidad, submódulo
             * y módulo padre correspondiente en la jerarquía.
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

                // Si no encontramos coincidencia exacta, buscar por prefijo
                if (!matchedLink) {
                    allLinks.forEach(link => {
                        const linkPath = link.getAttribute("data-sidebar-path").replace(/\/+$/, "");
                        if (linkPath !== "/dashboard" && currentPath.startsWith(linkPath)) {
                            matchedLink = link;
                        }
                    });
                }

                if (!matchedLink) return;

                // 2. Marcar la funcionalidad (Nivel 3) como activa
                matchedLink.classList.add("active");

                // 3. Recorrer hacia arriba y abrir todos los padres nav-item
                let parentItem = matchedLink.closest("li.nav-item");
                while (parentItem) {
                    // Buscar el contenedor <ul> padre de este <li>
                    const parentUl = parentItem.parentElement;
                    if (!parentUl || !parentUl.classList.contains("nav-treeview")) break;

                    // El <li> que contiene ese <ul> es el submódulo/módulo padre
                    const grandParentItem = parentUl.closest("li.nav-item");
                    if (!grandParentItem) break;

                    // Abrir el treeview padre
                    grandParentItem.classList.add("menu-open");
                    parentUl.style.display = "block"; // Asegurar que el ul sea visible
                    const parentLink = grandParentItem.querySelector(":scope > a.nav-link");
                    if (parentLink) {
                        parentLink.classList.add("active");
                    }

                    // Continuar subiendo en la jerarquía
                    parentItem = grandParentItem;
                }
            })();

            /**
             * Sidebar Permissions Manager (Fase 1 — Ocultamiento preventivo)
             * Oculta elementos con data-permission y data-permission-any
             * hasta que SecurityManager.processDomPermissions() los restaure.
             */
            (function() {
                try {
                    const elements = document.querySelectorAll("[data-permission]");
                    elements.forEach(el => {
                        el.style.display = "none";
                    });

                    const anyElements = document.querySelectorAll("[data-permission-any]");
                    anyElements.forEach(el => {
                        el.style.display = "none";
                    });
                } catch (e) {
                    console.error("Error ocultando elementos con permisos en sidebar:", e);
                }
            })();
        </script>
    </div>
</aside>
