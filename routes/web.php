<?php
/**
 * Archivo de rutas web del sistema
 * Aquí registramos las rutas accesibles desde la interfaz
 */

// Ruta para el Módulo de Categorías
if (isset($router)) {
    $router->add('/categorias', 'app/views/categorias/index.php');
}