<?php
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user'])) {
	json_response(['message' => 'No autorizado'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
	json_response(['message' => 'Método no permitido'], 405);
}

function ensureDefaultTank($mysqli, $userId) {
	$defaultName = 'Tanque Principal';
	$stmt = $mysqli->prepare('SELECT id FROM Tanques WHERE usuario_id = ? ORDER BY id LIMIT 1');
	$stmt->bind_param('i', $userId);
	$stmt->execute();
	$stmt->bind_result($tankId);
	if ($stmt->fetch()) {
		$stmt->close();
		return $tankId;
	}
	$stmt->close();
	$altura = 50.00; $ancho = 30.00;
	$stmt = $mysqli->prepare('INSERT INTO Tanques (nombre, altura, ancho, usuario_id) VALUES (?, ?, ?, ?)');
	$stmt->bind_param('sddi', $defaultName, $altura, $ancho, $userId);
	$stmt->execute();
	$newId = $stmt->insert_id;
	$stmt->close();
	return $newId;
}

$input = json_decode(file_get_contents('php://input'), true);
$nickname = isset($input['nickname']) ? trim($input['nickname']) : '';
$plantName = isset($input['plant_name']) ? trim($input['plant_name']) : '';
$scientificName = isset($input['scientific_name']) ? trim($input['scientific_name']) : '';

if ($nickname === '' && $plantName === '') {
	json_response(['message' => 'Faltan datos de la planta'], 400);
}

$nombre = $nickname !== '' ? $nickname : $plantName;
$tipoDePlanta = $plantName !== '' ? $plantName : ($scientificName !== '' ? $scientificName : 'Desconocida');
$fechaCuidado = date('Y-m-d');
$userId = intval($_SESSION['user']['id']);
$tanqueId = ensureDefaultTank($mysqli, $userId);

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