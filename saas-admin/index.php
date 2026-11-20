<?php
// Punto de entrada de respaldo para /saas-admin/
if (!isset($_SERVER['REQUEST_URI']) || $_SERVER['REQUEST_URI'] === '' || substr($_SERVER['REQUEST_URI'], -1) === '/') {
    $_SERVER['REQUEST_URI'] = '/frontend-inventario-pme/saas-admin';
}
require_once __DIR__ . '/../index.php';
