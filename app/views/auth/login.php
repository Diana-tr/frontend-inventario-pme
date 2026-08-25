<?php

require_once __DIR__ . '../../../config/app.php';

?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Software de Inventarios P.M.E. - Login</title>

    <link
        rel="stylesheet"
        href="<?php echo $URL; ?>/public/assets/css/main.css">
</head>

<body>

    <main class="login">

        <section class="login-left">
            <h2>Software de Inventarios P.M.E.</h2>

            <p>
                Plataforma para la gestión y control de inventarios,
                desarrollada para pequeñas y medianas empresas.
            </p>
        </section>

        <section class="login-right">
            <div class="login-container">

                <div class="brand-logo">
                    <img
                        src="<?php echo $URL; ?>/public/assets/img/logo-pme.png"
                        alt="Logo PME"
                        class="login-logo-card">
                </div>

                <h1>Bienvenido</h1>

                <p>
                    Inicie sesión para continuar
                </p>

                <br>

                <form id="loginForm">

                    <div class="form-group">
                        <label for="email">
                            Correo electrónico
                        </label>

                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Ingrese su correo electrónico....."
                            autocomplete="username"
                            required
                            aria-describedby="login-message">
                    </div>

                    <div class="form-group">
                        <label for="password">
                            Contraseña
                        </label>

                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Ingrese su contraseña....."
                            autocomplete="current-password"
                            required
                            aria-describedby="login-message">
                    </div>

                    <div
                        id="login-message"
                        role="alert"
                        aria-live="polite"
                        hidden></div>

                    <button
                        type="submit"
                        id="login-submit">
                        Iniciar sesión
                    </button>

                </form>

            </div>
        </section>

    </main>
    <script
        type="module"
        src="<?php echo $URL; ?>/public/assets/js/core/app.js">
    </script>
</body>

</html>
