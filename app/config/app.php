<?php

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';

if (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false) {
    // Si estamos en local (con puerto 8000 u otro), apuntamos a la raíz del servidor local
    $URL = 'http://' . $host . '/';
} else {
    // Usamos '/' en producción para evitar problemas con la protección antibots de InfinityFree
    $URL = '/';
}
