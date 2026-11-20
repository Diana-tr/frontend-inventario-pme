<?php
require_once __DIR__ . '/../../config/app.php';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Acceso Exclusivo de Administración Global - Plataforma SaaS P.M.E.">
    <title>Acceso Administrativo SaaS - P.M.E.</title>

    <!-- Favicon Oficial -->
    <link rel="icon" type="image/png" href="<?php echo $URL; ?>/public/assets/img/logo-pme.png">

    <!-- Google Fonts: Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- FontAwesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- AdminLTE 3 / Bootstrap 4 Core Styles -->
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/dist/css/adminlte.min.css">

    <!-- SweetAlert2 Bootstrap 4 Theme -->
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/sweetalert2-theme-bootstrap-4/bootstrap-4.min.css">

    <!-- Estilos base y utilidades de formularios del ERP -->
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/css/main.css">

    <!-- Estilos exclusivos Enterprise SaaS Admin Login -->
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/css/components/saas_login.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/css/saas_admin/login.css?v=<?php echo time(); ?>">
</head>

<body class="layout--saas-auth">

    <div class="saas-login-wrapper">
        <div class="card saas-login-card">

            <!-- Encabezado de la tarjeta con branding y escudo -->
            <div class="saas-login-header">
                <div class="saas-badge-pill" role="status">
                    <i class="fas fa-shield-alt"></i>
                    <span>MODO ADMINISTRADOR</span>
                    <span class="saas-pulse-dot ml-1"></span>
                </div>

                <div class="saas-logo-container">
                    <img src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo PME" class="saas-brand-logo">
                </div>

                <h1 class="saas-title">Portal SaaS Admin</h1>
                <p class="saas-subtitle">Acceso restringido a personal autorizado</p>
            </div>

            <!-- Cuerpo del formulario -->
            <div class="saas-login-body">
                <div id="saas-login-alert" class="saas-alert saas-alert-danger" hidden></div>

                <form id="saasLoginForm" novalidate>
                    <!-- Campo: Correo o Usuario -->
                    <div class="form-group saas-form-group">
                        <label for="saas_email" class="saas-label">Correo administrativo / Usuario</label>
                        <div class="input-with-icon">
                            <i class="fas fa-user-shield input-icon"></i>
                            <input 
                                type="text" 
                                id="saas_email" 
                                name="email" 
                                class="form-control saas-input" 
                                placeholder="admin@saas.com" 
                                autocomplete="username" 
                                required
                            >
                        </div>
                    </div>

                    <!-- Campo: Contraseña -->
                    <div class="form-group saas-form-group">
                        <label for="saas_password" class="saas-label">Contraseña de acceso</label>
                        <div class="input-with-icon">
                            <i class="fas fa-lock input-icon"></i>
                            <input 
                                type="password" 
                                id="saas_password" 
                                name="password" 
                                class="form-control saas-input" 
                                placeholder="••••••••••••" 
                                autocomplete="current-password" 
                                required
                            >
                            <button type="button" class="saas-toggle-pass toggle-password" id="btn-toggle-saas-pass" aria-label="Mostrar u ocultar contraseña">
                                <i class="far fa-eye-slash"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Botón de acceso con resplandor -->
                    <button type="submit" id="saas-login-submit" class="btn btn-primary btn-block saas-btn-submit">
                        <span>Acceder a la Administración</span>
                        <i class="fas fa-arrow-right ml-2"></i>
                    </button>

                    <!-- Distintivo de seguridad SSL y auditoría -->
                    <div class="saas-security-note">
                        <i class="fas fa-lock"></i>
                        <span>Conexión encriptada SSL &bull; Monitoreo de auditoría activo</span>
                    </div>
                </form>
            </div>

            <!-- Pie de tarjeta con enlace al ERP -->
            <div class="saas-login-footer">
                <a href="<?php echo $URL; ?>/" class="saas-erp-link">
                    <i class="fas fa-arrow-left mr-1"></i> Ir al Acceso ERP Clientes
                </a>
                <span class="saas-footer-copy">P.M.E. SaaS Engine &copy; <?php echo date('Y'); ?></span>
            </div>

        </div>
    </div>

    <!-- SweetAlert2 Bundled -->
    <script src="<?php echo $URL; ?>/public/assets/vendor/AdminLTE-3.2.0/plugins/sweetalert2/sweetalert2.all.min.js"></script>

    <!-- Script de Inicialización ES6+ -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js?v=<?php echo time(); ?>";
        import SaasLoginController from "<?php echo $URL; ?>/public/assets/js/controllers/saas_admin/login_controller.js?v=<?php echo time(); ?>";

        document.addEventListener("DOMContentLoaded", async () => {
            const ok = await App.bootstrap();
            if (!ok) return;
            SaasLoginController.init();
        });
    </script>
</body>

</html>
