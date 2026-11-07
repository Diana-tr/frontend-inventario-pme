<?php
/**
 * Archivo de rutas web del sistema
 * Aquí registramos las rutas accesibles desde la interfaz
 */

if (isset($router)) {
    // Módulo de Categorías
    $router->add('/categorias', 'app/views/categorias/index.php');
    
    // Módulo de Caja
    $router->add('/caja', 'app/views/caja/index.php');
    $router->add('/caja/resumen', 'app/views/caja/resumen.php');
    $router->add('/caja/historial', 'app/views/caja/historial.php');
    $router->add('/caja/crear', 'app/views/caja/crear.php');

    // Módulo de Finanzas y Tesorería
    $router->add('/finanzas', 'app/views/finanzas/index.php');
    $router->add('/finanzas/movimientos', 'app/views/finanzas/movimientos.php');
    $router->add('/finanzas/transferencias', 'app/views/finanzas/transferencias.php');
    $router->add('/finanzas/conciliaciones', 'app/views/finanzas/conciliaciones.php');

    // Módulo de Configuración y Versiones
    $router->add('/configuracion', 'app/views/configuracion/versiones.php');
    $router->add('/configuracion/versiones', 'app/views/configuracion/versiones.php');
}
