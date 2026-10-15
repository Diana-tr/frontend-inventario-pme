<?php

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';

if (
    strpos($host, 'localhost') !== false
    || strpos($host, '127.0.0.1') !== false
) {
    // Entorno local (XAMPP en subcarpeta /frontend-inventario-pme)
    $URL = 'http://' . $host . '/frontend-inventario-pme';
} else {
    // Entorno de producción (Hosting remoto como InfinityFree en la raíz del dominio)
    // Se deja vacío para que "$URL/public/..." resulte en "/public/..." sin generar doble barra (//)
    $URL = '';
}

