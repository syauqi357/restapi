<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'galondb');

// Database connection
function getConnection()
{
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        sendResponse(500, ['error' => 'Database connection failed: ' . $conn->connect_error]);
    }
    return $conn;
}

// Send JSON response
function sendResponse($code, $data)
{
    http_response_code($code);
    echo json_encode($data);
    exit();
}

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$request = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

// Get JSON input for POST/PUT
$input = json_decode(file_get_contents('php://input'), true);

// Router
switch ($request) {
    case 'products':
        handleProducts($method, $id, $input);
        break;
    case 'transactions':
        handleTransactions($method, $id, $input);
        break;
    default:
        sendResponse(404, ['error' => 'Endpoint not found']);
}

// ============ PRODUCTS HANDLERS ============
function handleProducts($method, $id, $input)
{
    $conn = getConnection();

    switch ($method) {

        // get data
        case 'GET':
            if ($id) {
                // Get single product
                $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($row = $result->fetch_assoc()) {
                    sendResponse(200, $row);
                } else {
                    sendResponse(404, ['error' => 'Product not found']);
                }
            } else {
                // Get all products
                $result = $conn->query("SELECT * FROM products ORDER BY id DESC");
                $products = [];
                while ($row = $result->fetch_assoc()) {
                    $products[] = $row;
                }
                sendResponse(200, $products);
            }
            break;
        // post or add data
        case 'POST':
            // Create new product
            if (!isset($input['name']) || !isset($input['price'])) {
                sendResponse(400, ['error' => 'Name and price are required']);
            }

            $stmt = $conn->prepare("INSERT INTO products (name, price) VALUES (?, ?)");
            $stmt->bind_param("sd", $input['name'], $input['price']);

            if ($stmt->execute()) {
                sendResponse(201, [
                    'message' => 'Product created successfully',
                    'id' => $conn->insert_id
                ]);
            } else {
                sendResponse(500, ['error' => 'Failed to create product']);
            }
            break;

        // edit data
        case 'PUT':
            // Update product
            if (!$id) {
                sendResponse(400, ['error' => 'Product ID is required']);
            }

            $fields = [];
            $types = "";
            $values = [];

            if (isset($input['name'])) {
                $fields[] = "name = ?";
                $types .= "s";
                $values[] = $input['name'];
            }
            if (isset($input['price'])) {
                $fields[] = "price = ?";
                $types .= "d";
                $values[] = $input['price'];
            }

            if (empty($fields)) {
                sendResponse(400, ['error' => 'No fields to update']);
            }

            $values[] = $id;
            $types .= "i";

            $sql = "UPDATE products SET " . implode(", ", $fields) . " WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$values);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    sendResponse(200, ['message' => 'Product updated successfully']);
                } else {
                    sendResponse(404, ['error' => 'Product not found']);
                }
            } else {
                sendResponse(500, ['error' => 'Failed to update product']);
            }
            break;

        // delete method
        case 'DELETE':
            // Delete product
            if (!$id) {
                sendResponse(400, ['error' => 'Product ID is required']);
            }

            $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    sendResponse(200, ['message' => 'Product deleted successfully']);
                } else {
                    sendResponse(404, ['error' => 'Product not found']);
                }
            } else {
                sendResponse(500, ['error' => 'Failed to delete product']);
            }
            break;

        default:
            sendResponse(405, ['error' => 'Method not allowed']);
    }
}

// ============ TRANSACTIONS HANDLERS ============
function handleTransactions($method, $id, $input)
{
    $conn = getConnection();

    switch ($method) {
        case 'GET':
            if ($id) {
                // Get single transaction with product details
                $stmt = $conn->prepare("
                    SELECT t.*, p.name as product_name, p.price as product_price 
                    FROM transactions t 
                    LEFT JOIN products p ON t.product_id = p.id 
                    WHERE t.id = ?
                ");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($row = $result->fetch_assoc()) {
                    sendResponse(200, $row);
                } else {
                    sendResponse(404, ['error' => 'Transaction not found']);
                }
            } else {
                // Get all transactions with product details
                $result = $conn->query("
                    SELECT t.*, p.name as product_name, p.price as product_price 
                    FROM transactions t 
                    LEFT JOIN products p ON t.product_id = p.id 
                    ORDER BY t.id DESC
                ");
                $transactions = [];
                while ($row = $result->fetch_assoc()) {
                    $transactions[] = $row;
                }
                sendResponse(200, $transactions);
            }
            break;

        case 'POST':
            // Create new transaction
            if (!isset($input['product_id']) || !isset($input['quantity'])) {
                sendResponse(400, ['error' => 'Product ID and quantity are required']);
            }

            $stmt = $conn->prepare("INSERT INTO transactions (product_id, quantity) VALUES (?, ?)");
            $stmt->bind_param("ii", $input['product_id'], $input['quantity']);

            if ($stmt->execute()) {
                sendResponse(201, [
                    'message' => 'Transaction created successfully',
                    'id' => $conn->insert_id
                ]);
            } else {
                sendResponse(500, ['error' => 'Failed to create transaction']);
            }
            break;

        case 'PUT':
            // Update transaction
            if (!$id) {
                sendResponse(400, ['error' => 'Transaction ID is required']);
            }

            $fields = [];
            $types = "";
            $values = [];

            if (isset($input['product_id'])) {
                $fields[] = "product_id = ?";
                $types .= "i";
                $values[] = $input['product_id'];
            }
            if (isset($input['quantity'])) {
                $fields[] = "quantity = ?";
                $types .= "i";
                $values[] = $input['quantity'];
            }

            if (empty($fields)) {
                sendResponse(400, ['error' => 'No fields to update']);
            }

            $values[] = $id;
            $types .= "i";

            $sql = "UPDATE transactions SET " . implode(", ", $fields) . " WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$values);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    sendResponse(200, ['message' => 'Transaction updated successfully']);
                } else {
                    sendResponse(404, ['error' => 'Transaction not found']);
                }
            } else {
                sendResponse(500, ['error' => 'Failed to update transaction']);
            }
            break;

        case 'DELETE':
            // Delete transaction
            if (!$id) {
                sendResponse(400, ['error' => 'Transaction ID is required']);
            }

            $stmt = $conn->prepare("DELETE FROM transactions WHERE id = ?");
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    sendResponse(200, ['message' => 'Transaction deleted successfully']);
                } else {
                    sendResponse(404, ['error' => 'Transaction not found']);
                }
            } else {
                sendResponse(500, ['error' => 'Failed to delete transaction']);
            }
            break;

        default:
            sendResponse(405, ['error' => 'Method not allowed']);
    }
}
