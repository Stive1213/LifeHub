<?php
try {
    $db = new PDO('sqlite:' . __DIR__ . '/../db/lifehub.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    error_log("Database connected successfully"); // Debug
} catch (PDOException $e) {
    error_log("Connection failed: " . $e->getMessage());
    die(json_encode(["error" => "Database connection failed"]));
}
?>