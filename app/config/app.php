<?php

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';

if (
    strpos($host, 'localhost') !== false
    || strpos($host, '127.0.0.1') !== false
) {
    $URL = 'http://' . $host . '/frontend-inventario-pme';
} else {
    $URL = '/';
}
