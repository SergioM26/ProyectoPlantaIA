<?php
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user'])) {
	json_response(['message' => 'No autorizado'], 401);
}

$userId = intval($_SESSION['user']['id']);

// Asegurar tanque por defecto y obtener su id
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

$defaultTankId = ensureDefaultTank($mysqli, $userId);

// Listar plantas del usuario por sus tanques
$stmt = $mysqli->prepare('SELECT p.id, p.nombre, p.tipo_de_planta, p.fecha_cuidado FROM Plantas p WHERE p.tanque_id IN (SELECT id FROM Tanques WHERE usuario_id = ?) ORDER BY p.id DESC');
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();
$plants = [];
while ($row = $result->fetch_assoc()) {
	$plants[] = [
		'id' => intval($row['id']),
		'nombre' => $row['nombre'],
		'tipo_de_planta' => $row['tipo_de_planta'],
		'fecha_cuidado' => $row['fecha_cuidado']
	];
}
$stmt->close();

json_response(['plants' => $plants, 'tank_id' => $defaultTankId]); 