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
define('DB_NAME', 'jadwal');

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
    case 'guru':
        handleTeacher($method, $id, $input);
        break;
    case 'jadwal':
        handleJadwal($method, $id, $input);
        break;
    default:
        sendResponse(404, ['error' => 'Endpoint not found']);
}


function handleTeacher($method, $id, $input)
{
    $conn = getConnection();

    switch ($method) {

        // GET data with jadwal relationship
        case 'GET':
            if ($id) {
                // Get single teacher WITH their jadwal
                $stmt = $conn->prepare("
                    SELECT g.*, 
                           GROUP_CONCAT(
                               CONCAT(j.mapel, '|', j.hari, '|', j.jam) 
                               SEPARATOR ';;'
                           ) as jadwal_list
                    FROM guru g
                    LEFT JOIN jadwalsekolah j ON g.nama_guru = j.guru
                    WHERE g.id = ?
                    GROUP BY g.id
                ");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($row = $result->fetch_assoc()) {
                    // Parse jadwal list into array
                    if ($row['jadwal_list']) {
                        $jadwal_items = explode(';;', $row['jadwal_list']);
                        $jadwal_array = [];
                        foreach ($jadwal_items as $item) {
                            $parts = explode('|', $item);
                            $jadwal_array[] = [
                                'mapel' => $parts[0],
                                'hari' => $parts[1],
                                'jam' => $parts[2]
                            ];
                        }
                        $row['jadwal'] = $jadwal_array;
                    } else {
                        $row['jadwal'] = [];
                    }
                    unset($row['jadwal_list']);

                    sendResponse(200, $row);
                } else {
                    sendResponse(404, ['error' => 'Teacher not found']);
                }
            } else {
                // Get all teachers WITH jadwal count
                $result = $conn->query("
                    SELECT g.*, 
                           COUNT(j.id_matkul) as total_jadwal
                    FROM guru g
                    LEFT JOIN jadwalsekolah j ON g.nama_guru = j.guru
                    GROUP BY g.id
                    ORDER BY g.id ASC
                ");
                $teachers = [];
                while ($row = $result->fetch_assoc()) {
                    $teachers[] = $row;
                }
                sendResponse(200, $teachers);
            }
            break;

        // POST - Add new teacher
        case 'POST':
            if (!isset($input['nama_guru']) || !isset($input['mata_pelajaran']) || !isset($input['no_telepon'])) {
                sendResponse(400, ['error' => 'Nama guru, mata pelajaran, and no telepon are required']);
            }

            $stmt = $conn->prepare("INSERT INTO guru (nama_guru, mata_pelajaran, no_telepon) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $input['nama_guru'], $input['mata_pelajaran'], $input['no_telepon']);

            if ($stmt->execute()) {
                sendResponse(201, [
                    'message' => 'Teacher inserted successfully!',
                    'id' => $conn->insert_id
                ]);
            } else {
                sendResponse(500, ['error' => 'Failed to insert teacher']);
            }
            break;

        // PUT - Update teacher
        case 'PUT':
            if (!$id) {
                sendResponse(400, ['error' => 'Teacher ID is required']);
            }

            $fields = [];
            $types = "";
            $values = [];

            if (isset($input['nama_guru'])) {
                $fields[] = "nama_guru = ?";
                $types .= "s";
                $values[] = $input['nama_guru'];
            }
            if (isset($input['mata_pelajaran'])) {
                $fields[] = "mata_pelajaran = ?";
                $types .= "s";
                $values[] = $input['mata_pelajaran'];
            }
            if (isset($input['no_telepon'])) {
                $fields[] = "no_telepon = ?";
                $types .= "s";
                $values[] = $input['no_telepon'];
            }

            if (empty($fields)) {
                sendResponse(400, ['error' => 'No fields to update']);
            }

            $values[] = $id;
            $types .= "i";

            $sql = "UPDATE guru SET " . implode(", ", $fields) . " WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$values);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    sendResponse(200, ['message' => 'Teacher updated successfully!']);
                } else {
                    sendResponse(404, ['error' => 'Teacher not found']);
                }
            } else {
                sendResponse(500, ['error' => 'Failed to update teacher']);
            }
            break;

        // DELETE teacher (with warning if has jadwal)
        case 'DELETE':
            if (!$id) {
                sendResponse(400, ['error' => 'Teacher ID is required']);
            }

            // Check if teacher has jadwal
            $check = $conn->prepare("
                SELECT COUNT(*) as jadwal_count, g.nama_guru
                FROM guru g
                LEFT JOIN jadwalsekolah j ON g.nama_guru = j.guru
                WHERE g.id = ?
                GROUP BY g.id
            ");
            $check->bind_param("i", $id);
            $check->execute();
            $result = $check->get_result();
            $data = $result->fetch_assoc();

            if (!$data) {
                sendResponse(404, ['error' => 'Teacher not found']);
            }

            if ($data['jadwal_count'] > 0) {
                sendResponse(400, [
                    'error' => 'Cannot delete teacher with existing jadwal',
                    'jadwal_count' => $data['jadwal_count'],
                    'message' => 'Please delete all jadwal for this teacher first'
                ]);
            }

            $stmt = $conn->prepare("DELETE FROM guru WHERE id = ?");
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    sendResponse(200, ['message' => 'Teacher deleted successfully!']);
                } else {
                    sendResponse(404, ['error' => 'Teacher not found']);
                }
            } else {
                sendResponse(500, ['error' => 'Failed to delete teacher']);
            }
            break;

        default:
            sendResponse(405, ['error' => 'Method not allowed']);
    }
}

// ============ TRANSACTIONS HANDLERS ============
function handleJadwal($method, $id, $input)
{
    $conn = getConnection();

    switch ($method) {
        case 'GET':
            if ($id) {
                // Get single jadwal WITH teacher info
                $stmt = $conn->prepare("
                    SELECT j.*, 
                           g.mata_pelajaran as guru_mapel,
                           g.no_telepon as guru_telepon
                    FROM jadwalsekolah j
                    LEFT JOIN guru g ON j.guru = g.nama_guru
                    WHERE j.id_matkul = ?
                ");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($row = $result->fetch_assoc()) {
                    sendResponse(200, $row);
                } else {
                    sendResponse(404, ['error' => 'Jadwal not found']);
                }
            } else {
                // Get all jadwal WITH teacher info
                $result = $conn->query("
                    SELECT j.*, 
                           g.mata_pelajaran as guru_mapel,
                           g.no_telepon as guru_telepon
                    FROM jadwalsekolah j
                    LEFT JOIN guru g ON j.guru = g.nama_guru
                    ORDER BY j.hari ASC, j.jam ASC
                ");
                $jadwal = [];
                while ($row = $result->fetch_assoc()) {
                    $jadwal[] = $row;
                }
                sendResponse(200, $jadwal);
            }
            break;

        case 'POST':
            // Validate required fields
            if (!isset($input['guru']) || !isset($input['mapel']) || !isset($input['hari']) || !isset($input['jam'])) {
                sendResponse(400, ['error' => 'Guru, Mapel, Hari, and Jam are required']);
            }

            // Check if teacher exists
            $check = $conn->prepare("SELECT id FROM guru WHERE nama_guru = ?");
            $check->bind_param("s", $input['guru']);
            $check->execute();
            $result = $check->get_result();

            if ($result->num_rows == 0) {
                sendResponse(400, [
                    'error' => 'Teacher not found',
                    'message' => 'Please add the teacher first before creating jadwal'
                ]);
            }

            $stmt = $conn->prepare("
                INSERT INTO jadwalsekolah (id_matkul, guru, mapel, hari, jam) 
                VALUES (?, ?, ?, ?, ?)
            ");

            $id_matkul = isset($input['id_matkul']) ? $input['id_matkul'] : null;

            $stmt->bind_param(
                "issss",
                $id_matkul,
                $input['guru'],
                $input['mapel'],
                $input['hari'],
                $input['jam']
            );

            if ($stmt->execute()) {
                sendResponse(201, [
                    'message' => 'Jadwal created successfully! 🎓',
                    'id_matkul' => $id_matkul ?: $conn->insert_id
                ]);
            } else {
                sendResponse(500, ['error' => 'Failed to create jadwal']);
            }
            break;

        case 'PUT':
            if (!$id) {
                sendResponse(400, ['error' => 'ID Matkul is required']);
            }

            $fields = [];
            $types = "";
            $values = [];

            if (isset($input['guru'])) {
                // Validate teacher exists
                $check = $conn->prepare("SELECT id FROM guru WHERE nama_guru = ?");
                $check->bind_param("s", $input['guru']);
                $check->execute();
                $result = $check->get_result();

                if ($result->num_rows == 0) {
                    sendResponse(400, ['error' => 'Teacher not found']);
                }

                $fields[] = "guru = ?";
                $types .= "s";
                $values[] = $input['guru'];
            }
            if (isset($input['mapel'])) {
                $fields[] = "mapel = ?";
                $types .= "s";
                $values[] = $input['mapel'];
            }
            if (isset($input['hari'])) {
                $fields[] = "hari = ?";
                $types .= "s";
                $values[] = $input['hari'];
            }
            if (isset($input['jam'])) {
                $fields[] = "jam = ?";
                $types .= "s";
                $values[] = $input['jam'];
            }

            if (empty($fields)) {
                sendResponse(400, ['error' => 'No fields to update']);
            }

            $values[] = $id;
            $types .= "i";

            $sql = "UPDATE jadwalsekolah SET " . implode(", ", $fields) . " WHERE id_matkul = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$values);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    sendResponse(200, ['message' => 'Jadwal updated successfully!']);
                } else {
                    sendResponse(404, ['error' => 'Jadwal not found']);
                }
            } else {
                sendResponse(500, ['error' => 'Failed to update jadwal']);
            }
            break;

        case 'DELETE':
            if (!$id) {
                sendResponse(400, ['error' => 'ID Matkul is required']);
            }

            $stmt = $conn->prepare("DELETE FROM jadwalsekolah WHERE id_matkul = ?");
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    sendResponse(200, ['message' => 'Jadwal deleted successfully!']);
                } else {
                    sendResponse(404, ['error' => 'Jadwal not found']);
                }
            } else {
                sendResponse(500, ['error' => 'Failed to delete jadwal']);
            }
            break;

        default:
            sendResponse(405, ['error' => 'Method not allowed']);
    }
}
