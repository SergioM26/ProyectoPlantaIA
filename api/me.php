<?php
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user'])) {
	json_response(['message' => 'No autorizado'], 401);
}

json_response(['user' => $_SESSION['user']]); 