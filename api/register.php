<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
	json_response(['message' => 'Método no permitido'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? (string)$input['password'] : '';

if ($name === '' || $email === '' || $password === '') {
	json_response(['message' => 'Faltan campos requeridos'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	json_response(['message' => 'Correo inválido'], 400);
}

// Verificar si ya existe
$stmt = $mysqli->prepare('SELECT id FROM Usuarios WHERE correo = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
	$stmt->close();
	json_response(['message' => 'El correo ya está registrado'], 409);
}
$stmt->close();

$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $mysqli->prepare('INSERT INTO Usuarios (nombre, correo, `contraseña`) VALUES (?, ?, ?)');
$stmt->bind_param('sss', $name, $email, $hash);
if (!$stmt->execute()) {
	$stmt->close();
	json_response(['message' => 'Error al registrar usuario'], 500);
}
$userId = $stmt->insert_id;
$stmt->close();

$user = ['id' => $userId, 'name' => $name, 'email' => $email];
$_SESSION['user'] = $user;

json_response(['user' => $user]); 