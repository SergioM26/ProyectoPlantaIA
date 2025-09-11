<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';
$DB_NAME = getenv('DB_NAME') ?: 'smart_garden';
$DB_PORT = intval(getenv('DB_PORT') ?: 3306);

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
if ($mysqli->connect_errno) {
	http_response_code(500);
	echo json_encode(['message' => 'Error de conexión a la base de datos']);
	exit;
}

$mysqli->set_charset('utf8mb4');

function json_response($data, $status = 200) {
	http_response_code($status);
	echo json_encode($data, JSON_UNESCAPED_UNICODE);
	exit;
} 