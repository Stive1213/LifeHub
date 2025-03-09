<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'includes/db_connect.php';

$request_method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
error_log("Requested path: " . $path);

// Extract endpoint after /api/
$path_parts = explode('/api/', $path);
$endpoint = isset($path_parts[1]) ? $path_parts[1] : '';
error_log("Endpoint: " . $endpoint);

switch ($endpoint) {
    case 'auth':
        require 'routes/auth.php';
        break;
    case 'users':
        require 'routes/users.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found", "endpoint" => $endpoint]);
        break;
}
?>