<?php
if ($request_method === 'GET') {
    echo json_encode(["message" => "User endpoints coming soon"]);
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>