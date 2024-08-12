<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: content-type");

switch ($_SERVER['REQUEST_METHOD']) {
    case ("OPTIONS"): //Allow preflighting to take place.
        exit;

    case("POST"): //Send the email;
        header("Access-Control-Allow-Origin: *");

        // E-Mail-Adresse aus den POST-Daten lesen
        $email = $_POST['email'];

        // E-Mail-Adresse des Empfängers setzen
        $recipient = $email;

        // Betreff und Nachrichtentext festlegen
        $subject = "Passwort zurücksetzen";

        // Hier solltest du einen eindeutigen Token generieren und in der Datenbank speichern.
        // Beispiel: $token = generateResetToken($email);

        $message = "Hallo,<br><br>";
        $message .= "Um Ihr Passwort zurückzusetzen, klicken Sie bitte auf den folgenden Link:<br>";
        $message .= "<a href='https://example.com/resetPW?token=UNIQUE_TOKEN_HERE'>Passwort zurücksetzen</a><br><br>";
        $message .= "Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese Nachricht ignorieren.<br><br>";
        $message .= "Mit freundlichen Grüßen,<br>Ihr Team";

        // E-Mail-Header setzen
        $headers   = array();
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=utf-8';
        $headers[] = "From: noreply@herteux-webentwicklung.de";

        // E-Mail senden
        if (mail($recipient, $subject, $message, implode("\r\n", $headers))) {
            echo json_encode(["status" => "success", "message" => "E-Mail wurde gesendet."]);
        } else {
            echo json_encode(["status" => "error", "message" => "E-Mail konnte nicht gesendet werden."]);
        }
        break;

    default: //Reject any non POST or OPTIONS requests.
        header("Allow: POST", true, 405);
        exit;
}

?>
