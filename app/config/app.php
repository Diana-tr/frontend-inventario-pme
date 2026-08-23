<?php

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';

if (strpos($host, 'localhost') !== false) {
    $URL = 'http://localhost/frontend-inventario-pme/';
} else {
    // Usamos '/' en producción para evitar problemas con la protección antibots de InfinityFree
    $URL = '/';
}
