<?php
require_once __DIR__ . '../../../config/app.php';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Software de Inventarios P.M.E.</title>
    <!-- Importar FontAwesome para los iconos -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/css/main.css">
</head>

<body>

    <main class="login">

        <!-- ==========================================
             PANEL IZQUIERDO: Branding e Información
             ========================================== -->
        <section class="login-left">
            <div class="network-overlay"></div>
            <div class="left-content">
                <h1 class="main-title">Potencie su Negocio</h1>
                <h2>Plataforma de Inventarios P.M.E.</h2>
                <p>
                    Controle su stock en tiempo real y optimice sus
                    operaciones con eficiencia inteligente.
                </p>
                <ul class="feature-list">
                    <li><i class="fa-regular fa-eye"></i> Visibilidad Total</li>
                    <li><i class="fa-solid fa-chart-line"></i> Reportes Inteligentes</li>
                    <li><i class="fa-solid fa-server"></i> Control Centralizado</li>
                </ul>
            </div>
        </section>

        <!-- ==========================================
             PANEL DERECHO: Formulario de Login
             ========================================== -->
        <section class="login-right">
            <div class="login-container">

                <div class="brand-logo">
                    <img src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo PME" class="login-logo-card">
                </div>

                <h1 class="welcome-title">Bienvenido</h1>
                <p class="welcome-subtitle">Acceda a su Panel</p>

                <form id="loginForm" class="login-form">

                    <div class="form-group">
                        <label for="email">Correo electrónico</label>
                        <div class="input-with-icon">
                            <i class="fa-regular fa-envelope input-icon"></i>
                            <input type="email" id="email" name="email" placeholder="Ingrese su correo..." autocomplete="username" required aria-describedby="login-message">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <div class="input-with-icon">
                            <i class="fa-solid fa-lock input-icon"></i>
                            <input type="password" id="password" name="password" placeholder="Contraseña" autocomplete="current-password" required aria-describedby="login-message">

                            <!-- Botón para ver/ocultar contraseña -->
                            <button type="button" class="toggle-password" id="btn-toggle-pass" aria-label="Mostrar contraseña">
                                <i class="fa-regular fa-eye-slash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox" name="remember">
                            <span>Recordarme</span>
                        </label>
                        <a href="#" class="forgot-link">¿Olvidó su contraseña?</a>
                    </div>

                    <div id="login-message" role="alert" aria-live="polite" hidden></div>

                    <button type="submit" id="login-submit" class="btn-login">
                        Iniciar sesión
                    </button>

                </form>

                <div class="login-footer">
                    <p>Inventario P.M.E v1.0.0 • © 2026</p>
                    <a href="#" class="support-link">Soporte y Ayuda</a>
                </div>

            </div>
        </section>

    </main>

    <script type="module">
        import App from "<?php echo $URL; ?>/public/assets/js/core/app.js";
        import LoginController from "<?php echo $URL; ?>/public/assets/js/controllers/auth/login_controller.js";

        document.addEventListener("DOMContentLoaded", async () => {
            await App.bootstrap();
            LoginController.init();

            /* ========================================================
               FUNCIONALIDAD DE MOSTRAR/OCULTAR CONTRASEÑA
               ======================================================== */
            const togglePassBtn = document.getElementById('btn-toggle-pass');
            const passwordInput = document.getElementById('password');

            if (togglePassBtn && passwordInput) {
                togglePassBtn.addEventListener('click', function() {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);

                    const icon = this.querySelector('i');
                    if (type === 'text') {
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    } else {
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    }
                });
            }
        });
    </script>
</body>

</html>
