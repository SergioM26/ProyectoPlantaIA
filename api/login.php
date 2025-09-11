<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
	json_response(['message' => 'Método no permitido'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? (string)$input['password'] : '';

if ($email === '' || $password === '') {
	json_response(['message' => 'Faltan credenciales'], 400);
}

$stmt = $mysqli->prepare('SELECT id, nombre, correo, `contraseña` FROM Usuarios WHERE correo = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$userRow = $result->fetch_assoc();
$stmt->close();

if (!$userRow) {
	json_response(['message' => 'Credenciales inválidas'], 401);
}

if (!password_verify($password, $userRow['contraseña'])) {
	json_response(['message' => 'Credenciales inválidas'], 401);
}

$user = ['id' => intval($userRow['id']), 'name' => $userRow['nombre'], 'email' => $userRow['correo']];
$_SESSION['user'] = $user;

json_response(['user' => $user]); 