<?php
// Incluimos la configuración principal subiendo 2 niveles desde app/controllers/categorias/ hasta app/config/app.php
require_once __DIR__ . '/../../config/app.php'; 

// Aseguramos que la respuesta devuelta al navegador sea siempre en formato JSON
header('Content-Type: application/json; charset=utf-8');

// Unificación automática de la variable de conexión por si en app.php se llama diferente ($conn, $conexion, etc.)
if (!isset($pdo)) {
    if (isset($conn)) {
        $pdo = $conn;
    } elseif (isset($conexion)) {
        $pdo = $conexion;
    } elseif (isset($db)) {
        $pdo = $db;
    }
}

// Verificamos estrictamente que la petición se haya hecho por el método POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Capturamos y limpiamos los datos enviados por el FormData de JavaScript
    $nombre = trim($_POST['nombre'] ?? $_POST['nombre_categoria'] ?? '');
    $descripcion = trim($_POST['descripcion'] ?? $_POST['descripcion_categoria'] ?? '');
    $estado = intval($_POST['estado'] ?? $_POST['estado_categoria'] ?? 1);

    // Validaciones básicas obligatorias en el servidor
    if (empty($nombre)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'El nombre de la categoría es obligatorio.'
        ]);
        exit;
    }

    try {
        // Validamos que la variable de conexión PDO exista y esté disponible
        if (!isset($pdo) || !($pdo instanceof PDO)) {
            throw new Exception("La conexión a la base de datos no está inicializada correctamente en app/config/app.php.");
        }

        // Preparamos la sentencia SQL adaptada a las columnas de tu tabla en Supabase (PostgreSQL)
        $sql = "INSERT INTO categorias (name, description, is_active, created_at) 
                VALUES (:name, :description, :is_active, NOW())";
        
        $stmt = $pdo->prepare($sql);
        
        // Ejecutamos la consulta pasando los parámetros correctos hacia Supabase
        $resultado = $stmt->execute([
            ':name'         => $nombre,
            ':description'  => $descripcion,
            ':is_active'    => $estado
        ]);

        if ($resultado) {
            echo json_encode([
                'status' => 'success',
                'message' => '¡Categoría guardada exitosamente en Supabase!'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'No se pudo registrar la categoría en la base de datos.'
            ]);
        }

    } catch (PDOException $e) {
        // Código 23505 (o 23000) en PostgreSQL maneja duplicados en campos con restricción UNIQUE
        if ($e->getCode() == '23000' || $e->getCode() == '23505') {
            echo json_encode([
                'status' => 'error',
                'message' => 'El nombre de la categoría ya se encuentra registrado.'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error de base de datos en Supabase: ' . $e->getMessage()
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Método no permitido.'
    ]);
}