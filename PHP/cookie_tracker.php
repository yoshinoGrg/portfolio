<?php
// PHP Cookie Name and Location Tracker
$message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['name']) && isset($_POST['location'])) {
        $name = htmlspecialchars($_POST['name']);
        $location = htmlspecialchars($_POST['location']);

        // Set cookies to expire in 30 days
        setcookie("userName", $name, time() + (86400 * 30), "/");
        setcookie("userLocation", $location, time() + (86400 * 30), "/");

        // Reload to display cookie safely
        header("Location: " . $_SERVER['PHP_SELF']);
        exit();
    }
}

if (isset($_COOKIE['userName']) && isset($_COOKIE['userLocation'])) {
    $message = "Welcome back, " . htmlspecialchars($_COOKIE['userName']) . "! We see your location is set to: " . htmlspecialchars($_COOKIE['userLocation']) . ".";
} else {
    $message = "No cookie found. Please enter your name and location.";
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>PHP Cookie Tracker</title>
    <style>
        body { font-family: sans-serif; background: #0f0f13; color: #ccc8e8; margin: 50px; }
        .card { background: rgba(15, 15, 19, 0.7); padding: 30px; border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.05); }
        input { padding: 10px; margin: 10px 0; border-radius: 5px; border: none; }
        button { padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="card">
        <h2>PHP Cookie Tracker</h2>
        <p><?php echo $message; ?></p>
        
        <form method="POST" action="">
            <label>Name:</label><br>
            <input type="text" name="name" required><br>
            <label>Location:</label><br>
            <input type="text" name="location" required><br>
            <button type="submit">Save to Cookie</button>
        </form>
    </div>
</body>
</html>
