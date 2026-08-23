<?php
require_once __DIR__ . '/../../config/app.php';
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Software de Inventarios P.M.E. - Login</title>
    <!-- Agrega aquí el enlace a tus estilos CSS -->
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/css/main.css">
</head>

<body>

    <section class="login">

        <div class="login-left">

            <h2>Software de Inventarios P.M.E.</h2>
            <p>
                Plataforma para la gestión y control de inventarios,
                desarrollada para pequeñas y medianas empresas.
            </p>
        </div>

        <div class="login-right">
            <div class="login-container">
                <!-- Logo aquí -->
                <div class="brand-logo">
                    <img src="<?php echo $URL; ?>/public/assets/img/logo-pme.png" alt="Logo PME" class="login-logo-card">
                </div>

                <h1>Bienvenido</h1>
                <span>Inicie sesión para continuar</span>

                <form id=" loginForm">

                    <div class="form-group">
                        <label for="email">Correo Electronico</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Ingrese su Correo Electronico....."
                            required>
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Ingrese su Contraseña....."
                            required>
                    </div>

                    <button type="submit">
                        Iniciar sesión
                    </button>

                    </form>
                </div>
            </div>

    </section>

</body>

</html>
