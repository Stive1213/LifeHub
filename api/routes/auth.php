<?php
session_start();

if ($request_method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['action'])) {
        switch ($data['action']) {
            case 'signup':
                $username = $data['username'] ?? '';
                $email = $data['email'] ?? '';
                $password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);

                try {
                    $stmt = $db->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
                    $stmt->execute([$username, $email, $password]);
                    http_response_code(201);
                    echo json_encode(["message" => "User created"]);
                } catch (PDOException $e) {
                    http_response_code(400);
                    echo json_encode(["error" => "Username or email taken"]);
                }
                break;

            case 'login':
                $username = $data['username'] ?? '';
                $password = $data['password'] ?? '';

                $stmt = $db->prepare("SELECT id, password FROM users WHERE username = ?");
                $stmt->execute([$username]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($user && password_verify($password, $user['password'])) {
                    $_SESSION['user_id'] = $user['id'];
                    echo json_encode(["message" => "Login successful", "user_id" => $user['id']]);
                } else {
                    http_response_code(401);
                    echo json_encode(["error" => "Invalid credentials"]);
                }
                break;

            case 'logout':
                session_destroy();
                echo json_encode(["message" => "Logged out"]);
                break;

            default:
                http_response_code(400);
                echo json_encode(["error" => "Invalid action"]);
        }
    }
} elseif ($request_method === 'GET' && isset($_GET['check'])) {
    echo json_encode(["logged_in" => isset($_SESSION['user_id'])]);
}
?>