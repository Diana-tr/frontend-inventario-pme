<?php
// Punto de entrada de compatibilidad para /saas-admin/login.php
$_SERVER['REQUEST_URI'] = '/frontend-inventario-pme/saas-admin/login';
require_once __DIR__ . '/../index.php';
