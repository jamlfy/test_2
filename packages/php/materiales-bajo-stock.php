<?php
/**
 * Legacy Component - Materiales con bajo stock
 *
 * Consulta el backend NestJS para obtener materiales con stock bajo.
 * Uso: php materiales-bajo-stock.php
 * Respuesta: JSON array de { material: string, stock: number }
 */

$backendUrl = getenv('BACKEND_URL') ?: 'http://localhost:3000';
$apiUrl = $backendUrl . '/api/legacy/low-stock';

$authToken = getenv('AUTH_TOKEN') ?: '';

$options = [
    'http' => [
        'method' => 'GET',
        'header' => [
            'Accept: application/json',
            'Authorization: Bearer ' . $authToken,
        ],
        'timeout' => 10,
        'ignore_errors' => true,
    ],
];

$context = stream_context_create($options);
$response = @file_get_contents($apiUrl, false, $context);

if ($response === false) {
    http_response_code(503);
    echo json_encode([
        'error' => 'No se pudo conectar con el backend',
        'mensaje' => 'Verifique que el servicio backend esté corriendo en ' . $backendUrl,
    ]);
    exit;
}

$httpCode = 200;
if (isset($http_response_header)) {
    foreach ($http_response_header as $header) {
        if (stripos($header, 'HTTP/') === 0) {
            preg_match('/\d{3}/', $header, $matches);
            if (!empty($matches)) {
                $httpCode = (int) $matches[0];
            }
        }
    }
}

http_response_code($httpCode);
header('Content-Type: application/json');

if ($httpCode === 200) {
    $data = json_decode($response, true);
    $result = array_map(function ($item) {
        return [
            'material' => $item['code'] ?? $item['material'] ?? 'Unknown',
            'stock' => (int) ($item['stock'] ?? 0),
        ];
    }, $data);

    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} else {
    echo $response;
}
