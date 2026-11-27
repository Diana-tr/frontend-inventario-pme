<?php
/**
 * ============================================================
 * Inventario PME - Configuración Global de la Aplicación (PHP)
 * ============================================================
 * Centraliza la detección de entorno, URL base, control de
 * errores y cabeceras de seguridad HTTP.
 */

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$isLocal = (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false);

// Versión centralizada de la aplicación para cache-busting determinista
$APP_VERSION = '1.15.3';

if ($isLocal) {
    // Entorno local (XAMPP en subcarpeta /frontend-inventario-pme)
    $URL = 'http://' . $host . '/frontend-inventario-pme';
    
    // Configuración de errores en desarrollo
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
} else {
    // Entorno de producción (Hosting remoto como InfinityFree en la raíz del dominio)
    // Se deja vacío para que "$URL/public/..." resulte en "/public/..." sin generar doble barra (//)
    $URL = '';

    // Configuración segura de errores en producción (CWE-209 Hardening)
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    ini_set('log_errors', '1');
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
}

// Inyección de Cabeceras HTTP de Seguridad (OWASP Hardening)
if (!headers_sent()) {
    header('X-Frame-Options: SAMEORIGIN');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
}
