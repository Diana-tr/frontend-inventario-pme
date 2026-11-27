<?php
require_once __DIR__ . '/../../config/app.php';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Portal de inicio de sesión - Software de Inventarios P.M.E. ERP Empresarial Multi-Empresa">
    <title>Iniciar Sesión - Software de Inventarios P.M.E.</title>
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="<?php echo $URL; ?>/public/assets/img/logo-pme.png">
    <!-- Google Fonts: Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- FontAwesome para iconografía -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Estilos principales del ERP -->
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/css/main.css">
</head>

<body class="layout--auth">

    <main class="login">

        <!-- ==========================================
             PANEL IZQUIERDO: Branding ERP Corporativo
             ========================================== -->
        <section class="login-left" aria-label="Información y beneficios del ERP">
            <div class="network-overlay" aria-hidden="true"></div>
            <div class="left-content">
                
                <header class="left-header">
                    <div class="brand-pill" role="status" aria-label="Estado de la plataforma">
                        <span class="pulse-dot" aria-hidden="true"></span>
                        <span>ERP EMPRESARIAL • MULTI-EMPRESA</span>
                    </div>

                    <h1 class="main-title">
                        Control Total de su <span class="highlight-gradient">Inventario</span>
                    </h1>

                    <p class="hero-subtitle">
                        Optimice sus operaciones en tiempo real con trazabilidad integral, control de stock y alta eficiencia operativa.
                    </p>
                </header>

                <ul class="feature-cards" aria-label="Características destacadas de la plataforma">
                    <li class="feature-card">
                        <div class="feature-icon-wrapper" aria-hidden="true">
                            <i class="fa-regular fa-eye"></i>
                        </div>
                        <div class="feature-info">
                            <h2 class="feature-title">Visibilidad en Tiempo Real</h2>
                            <p class="feature-desc">Monitoreo continuo de existencias, movimientos y alertas de reabastecimiento.</p>
                        </div>
                    </li>

                    <li class="feature-card">
                        <div class="feature-icon-wrapper" aria-hidden="true">
                            <i class="fa-solid fa-chart-line"></i>
                        </div>
                        <div class="feature-info">
                            <h2 class="feature-title">Métricas & Analítica Avanzada</h2>
                            <p class="feature-desc">Reportes de rotación, balances de inventario y exportación inmediata.</p>
                        </div>
                    </li>

                    <li class="feature-card">
                        <div class="feature-icon-wrapper" aria-hidden="true">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <div class="feature-info">
                            <h2 class="feature-title">Seguridad y Aislamiento de Datos</h2>
                            <p class="feature-desc">Protección estricta de la información de su empresa con arquitectura en la nube.</p>
                        </div>
                    </li>
                </ul>

                <footer class="security-status" aria-label="Garantía de seguridad">
                    <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                    <span>Conexión Segura • Datos Cifrados de Extremo a Extremo</span>
                </footer>

            </div>
        </section>

        <!-- ==========================================
             PANEL DERECHO: Tarjeta de Acceso
             ========================================== -->
        <section class="login-right" aria-label="Formulario de inicio de sesión">
            <div class="login-container">

                <header class="login-card-header">
                    <div class="brand-logo">
                        <img src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo Software de Inventarios P.M.E." class="login-logo-card">
                    </div>

                    <h2 class="welcome-title">Bienvenido</h2>
                    <p class="welcome-subtitle">Acceda a su Panel de Control</p>
                </header>

                <form id="loginForm" class="login-form" method="POST" action="#" novalidate>

                    <div class="form-group">
                        <label for="email" id="lbl-email">Correo electrónico</label>
                        <div class="input-with-icon">
                            <i class="fa-regular fa-envelope input-icon" aria-hidden="true"></i>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                class="form-control-custom"
                                placeholder="nombre@empresa.com" 
                                autocomplete="email" 
                                required 
                                aria-required="true"
                                aria-labelledby="lbl-email"
                                aria-describedby="login-message"
                            >
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="password" id="lbl-password">Contraseña</label>
                        <div class="input-with-icon">
                            <i class="fa-solid fa-lock input-icon" aria-hidden="true"></i>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                class="form-control-custom"
                                placeholder="••••••••••••" 
                                autocomplete="current-password" 
                                required 
                                aria-required="true"
                                aria-labelledby="lbl-password"
                                aria-describedby="login-message"
                            >

                            <!-- Botón accesible para ver/ocultar contraseña -->
                            <button 
                                type="button" 
                                class="toggle-password" 
                                id="btn-toggle-pass" 
                                aria-label="Mostrar contraseña"
                                aria-controls="password"
                                aria-pressed="false"
                            >
                                <i class="fa-regular fa-eye-slash" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>

                    <div class="form-options">
                        <label class="remember-me" for="remember">
                            <input 
                                type="checkbox" 
                                name="remember" 
                                id="remember"
                                aria-label="Recordar correo en este dispositivo"
                            >
                            <span>Recordarme</span>
                        </label>
                        <a href="#" class="forgot-link">¿Olvidó su contraseña?</a>
                    </div>

                    <!-- Mensaje accesible para alertas de validación -->
                    <div id="login-message" role="alert" aria-live="polite" hidden></div>

                    <!-- Botón de autenticación con estado de carga -->
                    <button type="submit" id="login-submit" class="btn-login" aria-busy="false">
                        <span>Iniciar sesión</span>
                        <i class="fa-solid fa-arrow-right-to-bracket" aria-hidden="true"></i>
                    </button>

                </form>

                <footer class="login-footer">
                    <p>Inventario P.M.E <span id="app-version-login" class="app-version-display">v1.15.0</span> • &copy; <?php echo date('Y'); ?></p>
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                        <a href="#" class="support-link"><i class="fa-regular fa-circle-question" aria-hidden="true"></i> Soporte y Ayuda</a>
                        <a href="<?php echo $URL; ?>/saas-admin" class="support-link" style="opacity: 0.75; font-size: 0.75rem;" title="Portal exclusivo para personal administrativo">
                            <i class="fa-solid fa-shield-halved mr-1" aria-hidden="true"></i> Acceso administrativo SaaS
                        </a>
                    </div>
                </footer>

            </div>
        </section>

    </main>

    <!-- Módulos de la aplicación -->
    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import LoginController from "<?php echo $URL; ?>/public/assets/js/controllers/auth/login_controller.js";

        document.addEventListener("DOMContentLoaded", async () => {
            const ok = await App.bootstrap();
            if (!ok) return;
            LoginController.init();

            /* ========================================================
               FUNCIONALIDAD ACCESIBLE DE MOSTRAR/OCULTAR CONTRASEÑA
               ======================================================== */
            const togglePassBtn = document.getElementById('btn-toggle-pass');
            const passwordInput = document.getElementById('password');

            if (togglePassBtn && passwordInput) {
                togglePassBtn.addEventListener('click', function() {
                    const isPassword = passwordInput.getAttribute('type') === 'password';
                    const newType = isPassword ? 'text' : 'password';
                    passwordInput.setAttribute('type', newType);

                    // Actualizar atributos de accesibilidad
                    this.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
                    this.setAttribute('aria-pressed', String(isPassword));

                    // Actualizar iconografía
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('fa-eye', isPassword);
                        icon.classList.toggle('fa-eye-slash', !isPassword);
                    }
                });
            }
        });
    </script>
</body>

</html>
