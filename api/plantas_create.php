<?php
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user'])) {
	json_response(['message' => 'No autorizado'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
	json_response(['message' => 'Método no permitido'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$nickname = isset($input['nickname']) ? trim($input['nickname']) : '';
$plantName = isset($input['plant_name']) ? trim($input['plant_name']) : '';
$scientificName = isset($input['scientific_name']) ? trim($input['scientific_name']) : '';
$tanqueId = isset($input['tanque_id']) ? intval($input['tanque_id']) : null;

if ($nickname === '' && $plantName === '') {
	json_response(['message' => 'Faltan datos de la planta'], 400);
}

$nombre = $nickname !== '' ? $nickname : $plantName;
$tipoDePlanta = $plantName !== '' ? $plantName : ($scientificName !== '' ? $scientificName : 'Desconocida');
$fechaCuidado = date('Y-m-d');
$userId = intval($_SESSION['user']['id']);

// Validar tanque si viene proporcionado y pertenece al usuario
if ($tanqueId !== null) {
	$stmt = $mysqli->prepare('SELECT 1 FROM Tanques WHERE id = ? AND usuario_id = ?');
	$stmt->bind_param('ii', $tanqueId, $userId);
	$stmt->execute();
	$exists = $stmt->get_result()->num_rows > 0;
	$stmt->close();
	if (!$exists) {
		json_response(['message' => 'Tanque inválido'], 400);
	}
}

$stmt = $mysqli->prepare('INSERT INTO Plantas (nombre, tipo_de_planta, fecha_cuidado, tanque_id) VALUES (?, ?, ?, ?)');
$stmt->bind_param('sssi', $nombre, $tipoDePlanta, $fechaCuidado, $tanqueId);
if (!$stmt->execute()) {
	$error = $stmt->error;
	$stmt->close();
	json_response(['message' => 'Error al guardar la planta', 'error' => $error], 500);
}
$newId = $stmt->insert_id;
$stmt->close();

json_response(['id' => $newId, 'nombre' => $nombre, 'tipo_de_planta' => $tipoDePlanta, 'fecha_cuidado' => $fechaCuidado, 'tanque_id' => $tanqueId]);