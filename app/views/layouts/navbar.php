<!-- Navbar -->
<nav class="main-header navbar navbar-expand navbar-white navbar-light">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
        <li class="nav-item">
            <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
            <a href="index3.html" class="nav-link">Home</a>
        </li>
    </ul>

    <!-- Right navbar links -->
    <ul class="navbar-nav ml-auto">
        <!-- Navbar Search -->
        <li class="nav-item">
            <a class="nav-link" data-widget="navbar-search" href="#" role="button">
                <i class="fas fa-search"></i>
            </a>
            <div class="navbar-search-block">
                <form class="form-inline">
                    <div class="input-group input-group-sm">
                        <input class="form-control form-control-navbar" type="search" placeholder="Search" aria-label="Search">
                        <div class="input-group-append">
                            <button class="btn btn-navbar" type="submit">
                                <i class="fas fa-search"></i>
                            </button>
                            <button class="btn btn-navbar" type="button" data-widget="navbar-search">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </li>


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
    </ul>
</nav>
<!-- /.navbar -->

<script>
    // Inyectar nombre y avatar con iniciales en el Navbar
    (function() {
        try {
            const raw = localStorage.getItem("inventariopme_user");
            if (!raw) return;

            const user = JSON.parse(raw);

            // 1. Obtener Nombre para mostrar
            const displayName = user.name || user.first_name || user.username || "Usuario";
            
            // 2. Obtener Iniciales
            let initials = "";
            if (user.first_name && user.last_name) {
                initials = user.first_name.charAt(0) + user.last_name.charAt(0);
            } else if (user.name) {
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
            initials = initials.toUpperCase();

            // 3. Inyectar datos en el DOM
            const nbUsername = document.getElementById("navbar-username");
            if (nbUsername) nbUsername.textContent = displayName;

            const nbFullname = document.getElementById("navbar-fullname");
            if (nbFullname) nbFullname.textContent = displayName;

            // Inyectar rol si existe en el objeto (ej. user.role o usando el nombre del usuario temporalmente)
            const nbRole = document.getElementById("navbar-role");
            if (nbRole) {
                // Si el backend envía un rol en el login, se usaría aquí. Por ahora estático o fallback:
                nbRole.textContent = "Administrador"; // Ajustar si el usuario tiene una propiedad rol
            }

            // Inyectar iniciales en avatar pequeño y grande
            const avatarSmall = document.getElementById("navbar-avatar-small");
            if (avatarSmall) avatarSmall.querySelector("span").textContent = initials;

            const avatarLarge = document.getElementById("navbar-avatar-large");
            if (avatarLarge) avatarLarge.querySelector("span").textContent = initials;

        } catch (e) {
            console.error("Error cargando perfil en navbar", e);
        }
    })();
</script>
