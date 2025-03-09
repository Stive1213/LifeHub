<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost"); // Allow front-end
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'includes/db_connect.php';

$request_method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($path) {
    case '/LifeHub/api/auth':
        require 'routes/auth.php';
        break;
    case '/LifeHub/api/users':
        require 'routes/users.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
        break;
}
?>