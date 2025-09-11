<?php
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user'])) {
	json_response(['message' => 'No autorizado'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_response(['message' => 'Método no permitido'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
$altura = isset($input['altura']) ? floatval($input['altura']) : 0.0;
$ancho = isset($input['ancho']) ? floatval($input['ancho']) : 0.0;

if ($nombre === '' || $altura <= 0 || $ancho <= 0) {
	json_response(['message' => 'Datos inválidos'], 400);
}

$userId = intval($_SESSION['user']['id']);

$stmt = $mysqli->prepare('INSERT INTO Tanques (nombre, altura, ancho, usuario_id) VALUES (?, ?, ?, ?)');
$stmt->bind_param('sddi', $nombre, $altura, $ancho, $userId);
if (!$stmt->execute()) {
	$error = $stmt->error;
	$stmt->close();
	json_response(['message' => 'Error al crear tanque', 'error' => $error], 500);
}
$id = $stmt->insert_id;
$stmt->close();

json_response(['id' => $id, 'nombre' => $nombre, 'altura' => $altura, 'ancho' => $ancho]);
?>

