<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/app.php';
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Software de Inventarios P.M.E. - Crear Usuario</title>
    <link rel="stylesheet" href="<?php echo $URL; ?>/public/assets/css/main.css">
    <style>
        .form-container { max-width: 600px; margin-top: 20px; background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input { width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
        .btn-primary { background: #0056b3; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-primary:hover { background: #004085; }
        .alert { padding: 10px; margin-bottom: 15px; border-radius: 4px; display: none; }
        .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .alert-danger { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <main class="container mt-5" style="padding: 20px;">
        <h1>Registrar Nuevo Usuario</h1>
        <hr>
        
        <div class="form-container">
            <div id="alertMessage" class="alert"></div>

            <form id="formCrearUsuario">
                <div class="form-group">
                    <label for="name">Nombre:</label>
                    <input type="text" id="name" name="name" required placeholder="Ej. Diana Trujillo">
                </div>

                <div class="form-group">
                    <label for="email">Correo electrónico:</label>
                    <input type="email" id="email" name="email" required placeholder="ejemplo@correo.com">
                </div>

                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required placeholder="********">
                </div>

                <button type="submit" class="btn-primary">Guardar Usuario</button>
            </form>
        </div>
        
        <div class="mt-3" style="margin-top: 20px;">
            <a href="<?php echo $URL; ?>/app/views/usuarios/listar.php">← Volver a la lista</a>
        </div>
    </main>

    <script>
        const API_URL = "http://127.0.0.1:8000/api/v1/users/";

        document.getElementById('formCrearUsuario').addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const alertBox = document.getElementById('alertMessage');

            // Mapeamos a los campos que probablemente espera tu backend de Django (ajusta si es necesario)
            const payload = {
                name: name,
                email: email,
                password: password
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok) {
                    alertBox.className = 'alert alert-success';
                    alertBox.textContent = '¡Usuario creado exitosamente! Redirigindo...';
                    alertBox.style.display = 'block';
                    
                    setTimeout(() => {
                        window.location.href = '<?php echo $URL; ?>/app/views/usuarios/listar.php';
                    }, 1500);
                } else {
                    alertBox.className = 'alert alert-danger';
                    alertBox.textContent = 'Error al crear usuario: ' + JSON.stringify(data);
                    alertBox.style.display = 'block';
                }
            } catch (error) {
                console.error('Error de red:', error);
                alertBox.className = 'alert alert-danger';
                alertBox.textContent = 'Error de conexión con el servidor backend de Django.';
                alertBox.style.display = 'block';
            }
        });
    </script>
</body>
</html>