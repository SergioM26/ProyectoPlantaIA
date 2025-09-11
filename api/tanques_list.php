<?php
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user'])) {
	json_response(['message' => 'No autorizado'], 401);
}

$userId = intval($_SESSION['user']['id']);

$stmt = $mysqli->prepare('SELECT id, nombre, altura, ancho FROM Tanques WHERE usuario_id = ? ORDER BY id DESC');
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();
$tanques = [];
while ($row = $result->fetch_assoc()) {
	$tanques[] = [
		'id' => intval($row['id']),
		'nombre' => $row['nombre'],
		'altura' => floatval($row['altura']),
		'ancho' => floatval($row['ancho'])
	];
}
$stmt->close();

json_response(['tanques' => $tanques]);
?>

