<?php

// Debugging aktivieren
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

error_log("Script gestartet"); // Log: Script wurde gestartet

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: content-type");

switch ($_SERVER['REQUEST_METHOD']) {
    case ("OPTIONS"): // Allow preflighting to take place.
        error_log("OPTIONS-Request erkannt"); // Log: OPTIONS-Request
        exit;

    case("POST"): // Send the email.
        error_log("POST-Request erkannt"); // Log: POST-Request

        header("Access-Control-Allow-Origin: *");

        // Prüfe, ob die POST-Daten als JSON gesendet werden
        $input = json_decode(file_get_contents('php://input'), true);
        error_log("Eingehende Daten: " . print_r($input, true));

        // E-Mail-Adresse aus den POST-Daten lesen und validieren
        if (isset($input['email'])) {
            $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                error_log("Ungültige E-Mail-Adresse: " . $email); // Log: Ungültige E-Mail
                echo json_encode(["status" => "error", "message" => "Ungültige E-Mail-Adresse."]);
                exit;
            }
            error_log("Empfänger-E-Mail: " . $email); // Log der validierten E-Mail-Adresse
        } else {
            error_log("E-Mail-Adresse wurde nicht übergeben."); // Log: Keine E-Mail-Adresse
            echo json_encode(["status" => "error", "message" => "Keine E-Mail-Adresse übergeben."]);
            exit;
        }

        // E-Mail-Adresse des Empfängers setzen
        $recipient = $email;

        // Betreff und Nachrichtentext festlegen
        $subject = "Passwort zurücksetzen";
        error_log("E-Mail Betreff: " . $subject); // Log des Betreffs

        // Beispiel für Token-Generierung
        $token = bin2hex(random_bytes(16));
        $resetLink = "https://herteux-webentwicklung.de/resetPW?token=" . urlencode($token);

        $message = "Hallo,<br><br>";
        $message .= "Um Ihr Passwort zurückzusetzen, klicken Sie bitte auf den folgenden Link:<br>";
        $message .= "<a href='" . $resetLink . "'>Passwort zurücksetzen</a><br><br>";
        $message .= "Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese Nachricht ignorieren.<br><br>";
        $message .= "Mit freundlichen Grüßen,<br>Ihr Team";

        error_log("E-Mail Nachricht: " . $message); // Log der Nachricht

        // E-Mail-Header setzen
        $headers   = array();
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=utf-8';
        $headers[] = "From: noreply@herteux-webentwicklung.de";
        error_log("E-Mail Header: " . implode("\r\n", $headers)); // Log der Header

        // E-Mail senden
        if (mail($recipient, $subject, $message, implode("\r\n", $headers))) {
            error_log("E-Mail erfolgreich gesendet an: " . $recipient); // Erfolg loggen
            echo json_encode(["status" => "success", "message" => "E-Mail wurde gesendet."]);
        } else {
            error_log("Fehler: E-Mail konnte nicht gesendet werden."); // Fehler loggen
            echo json_encode(["status" => "error", "message" => "E-Mail konnte nicht gesendet werden."]);
        }
        break;

    default: // Reject any non-POST or OPTIONS requests.
        error_log("Ungültige Anforderung erkannt."); // Log: Ungültige Anforderung
        header("Allow: POST", true, 405);
        exit;
}

?>
