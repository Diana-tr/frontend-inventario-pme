<?php
// index.php (Raíz del proyecto - Front Controller)

require_once __DIR__ . '/app/config/app.php';

// Obtener la URI actual
$request_uri = $_SERVER['REQUEST_URI'] ?? '/';

// Determinar el base path
$base_path = '/frontend-inventario-pme';

// Remover el base_path de la URI si está presente
if (strpos($request_uri, $base_path) === 0) {
    $path = substr($request_uri, strlen($base_path));
} else {
    $path = $request_uri;
}

// Limpiar query params y slashes
$path = parse_url($path, PHP_URL_PATH);
$path = trim($path, '/');

// Enrutador básico
switch ($path) {
    case '':
    case 'login':
        require_once __DIR__ . '/app/views/auth/login.php';
        break;

    case 'dashboard':
        require_once __DIR__ . '/app/views/dashboard/index.php';
        break;

    case 'usuarios':
    case 'usuarios/listar':
        require_once __DIR__ . '/app/views/usuarios/listar.php';
        break;

    case 'usuarios/crear':
        require_once __DIR__ . '/app/views/usuarios/crear.php';
        break;

    case 'roles':
    case 'roles/listar':
        require_once __DIR__ . '/app/views/roles/listar.php';
        break;

    case 'roles/crear':
        require_once __DIR__ . '/app/views/roles/crear.php';
        break;

    // NUEVA RUTA PARA CATEGORÍAS
    case 'categorias':
        require_once __DIR__ . '/app/views/categorias/index.php';
        break;

    default:
        // Evitar procesar archivos estáticos o directos por error
        if (file_exists(__DIR__ . '/' . $path) && is_file(__DIR__ . '/' . $path)) {
            return false; 
        }
        
        http_response_code(404);
        echo "404 - Página no encontrada: " . htmlspecialchars($path);
        break;
}