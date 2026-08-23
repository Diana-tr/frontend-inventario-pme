<?php
// index.php (Raíz del proyecto)

// Ejemplo basico de enrutador sencillo
$route = $_GET['route'] ?? 'login';

switch ($route) {
  case 'login':
    require_once __DIR__ . '/app/views/auth/login.php';
    break;

  case 'dashboard':
    // si existe sesión iniciada antes de cargar
    require_once __DIR__ . '/app/views/dashboard/index.php';
    break;

  default:
    http_response_code(404);
    echo "Página no encontrada";
    break;
}
