<?php
// FlowsLabs — Manejador de formulario de contacto
// Hostinger PHP Mail Handler — con protección anti-spam en capas

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: /");
    exit;
}

// ── Config anti-spam ─────────────────────────────────────
const MIN_FILL_SECONDS     = 3;      // un humano no llena el form en <3s
const MAX_FORM_AGE_SECONDS = 21600;  // 6h — descarta páginas cacheadas viejas
const RATE_LIMIT_WINDOW    = 60;     // seg. mínimos entre envíos de la misma IP
const RATE_LIMIT_DAILY_MAX = 5;      // envíos máx/día por IP
const ALLOWED_HOSTS        = ['flowslabssas.com', 'www.flowslabssas.com'];

// Los bots reciben una respuesta idéntica a la de un envío exitoso:
// así no saben que fueron bloqueados y no ajustan su ataque.
function silent_reject() {
    header("Location: /gracias.html");
    exit;
}

// Errores de validación reales sí se muestran — el usuario legítimo
// necesita saber que algo falló para poder corregirlo.
function visible_reject() {
    header("Location: /#contacto?error=1");
    exit;
}

// Almacén de rate-limit en archivo (sin dependencias externas).
// Vive en /.security, protegido por .htaccess (Deny from all).
function rate_limit_ok($ip) {
    $dir = __DIR__ . '/.security';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $file = $dir . '/ratelimit.json';
    $fp = @fopen($file, 'c+');
    if (!$fp) return true; // fail-open: un fallo de disco no debe tumbar leads reales

    flock($fp, LOCK_EX);
    $raw  = stream_get_contents($fp);
    $data = json_decode($raw, true);
    if (!is_array($data)) $data = [];
    $now = time();

    // Purga entradas de más de 24h para que el archivo no crezca indefinidamente
    foreach ($data as $k => $entry) {
        if ($now - $entry['last'] > 86400) unset($data[$k]);
    }

    $entry = $data[$ip] ?? ['count' => 0, 'first' => $now, 'last' => 0];

    $ok = true;
    if ($now - $entry['last'] < RATE_LIMIT_WINDOW) {
        $ok = false;
    } elseif ($now - $entry['first'] > 86400) {
        $entry = ['count' => 0, 'first' => $now, 'last' => 0]; // nueva ventana de 24h
    } elseif ($entry['count'] >= RATE_LIMIT_DAILY_MAX) {
        $ok = false;
    }

    if ($ok) {
        $entry['count']++;
        $entry['last'] = $now;
        $data[$ip] = $entry;
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data));
        fflush($fp);
    }

    flock($fp, LOCK_UN);
    fclose($fp);
    return $ok;
}

// ── 1. Honeypot ───────────────────────────────────────────
// Campo invisible para humanos; si viene lleno, es un bot.
if (!empty($_POST['website'])) {
    silent_reject();
}

// ── 2. Time-trap ──────────────────────────────────────────
// Rechaza envíos instantáneos (bots) o de páginas cacheadas muy viejas.
$formTs  = isset($_POST['form_ts']) ? ((int) $_POST['form_ts']) / 1000 : 0;
$elapsed = time() - $formTs;
if ($formTs <= 0 || $elapsed < MIN_FILL_SECONDS || $elapsed > MAX_FORM_AGE_SECONDS) {
    silent_reject();
}

// ── 3. Origen / Referer ──────────────────────────────────
// Bloquea POSTs directos al script que no vienen del sitio real.
$refHost = parse_url($_SERVER['HTTP_REFERER'] ?? '', PHP_URL_HOST);
if (!$refHost || !in_array($refHost, ALLOWED_HOSTS, true)) {
    silent_reject();
}

// ── 4. Rate limiting por IP ───────────────────────────────
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!rate_limit_ok($ip)) {
    silent_reject();
}

// ── Sanitizar entradas ──────────────────────────────────
function clean($val) {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$nombre   = clean($_POST["Nombre"]   ?? '');
$email    = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
$telefono = clean($_POST["Telefono"] ?? '');
$empresa  = clean($_POST["Empresa"]  ?? '');
$pais     = clean($_POST["Pais"]     ?? '');
$servicio = clean($_POST["Servicio"] ?? '');
$mensaje  = clean($_POST["Mensaje"]  ?? '');

// Validación básica
if (empty($nombre) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($mensaje)) {
    visible_reject();
}

// ── 5. Heurística anti-spam de contenido ─────────────────
// Mensajes de spam suelen venir cargados de links.
$linkCount = preg_match_all('/https?:\/\//i', $nombre . ' ' . $empresa . ' ' . $mensaje);
if ($linkCount >= 2) {
    silent_reject();
}

// ── Destinatario ────────────────────────────────────────
$to      = "flowslabssas@outlook.com";
$subject = "=?UTF-8?B?" . base64_encode("🚀 Nuevo lead FlowsLabs — $nombre") . "?=";

// ── Cuerpo del correo (HTML) ────────────────────────────
$body = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#F97316,#c2410c);padding:30px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">NUEVO LEAD — FLOWSLABS</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Formulario de contacto · flowslabssas.com</p>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td style="padding:32px 40px;">

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <span style="display:block;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Nombre</span>
                <span style="font-size:15px;color:#1a1a1a;font-weight:600;">' . $nombre . '</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <span style="display:block;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Correo electrónico</span>
                <span style="font-size:15px;color:#F97316;font-weight:600;">
                  <a href="mailto:' . $email . '" style="color:#F97316;text-decoration:none;">' . $email . '</a>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <span style="display:block;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Teléfono / WhatsApp</span>
                <span style="font-size:15px;color:#1a1a1a;font-weight:600;">' . ($telefono ?: '—') . '</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <span style="display:block;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Empresa</span>
                <span style="font-size:15px;color:#1a1a1a;font-weight:600;">' . ($empresa ?: '—') . '</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <span style="display:block;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">País</span>
                <span style="font-size:15px;color:#1a1a1a;font-weight:600;">' . ($pais ?: '—') . '</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <span style="display:block;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Servicio de interés</span>
                <span style="font-size:15px;color:#1a1a1a;font-weight:600;">' . ($servicio ?: '—') . '</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <span style="display:block;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Mensaje</span>
                <div style="background:#f9f9f9;border-left:3px solid #F97316;padding:14px 16px;border-radius:0 8px 8px 0;font-size:14px;color:#333;line-height:1.7;">' . nl2br($mensaje) . '</div>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="text-align:center;">
                <a href="mailto:' . $email . '" style="display:inline-block;background:#F97316;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:100px;text-decoration:none;">
                  Responder a ' . $nombre . '
                </a>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9f9f9;padding:16px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;font-size:11px;color:#aaa;">FlowsLabs SAS · flowslabssas.com · Bogotá, Colombia</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>';

// ── Headers ────────────────────────────────────────────
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: FlowsLabs <noreply@flowslabssas.com>\r\n";
$headers .= "Reply-To: $nombre <$email>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// ── Enviar ─────────────────────────────────────────────
$sent = mail($to, $subject, $body, $headers);

// ── Auto-respuesta al cliente ──────────────────────────
$autoSubject = "=?UTF-8?B?" . base64_encode("Recibimos tu mensaje — FlowsLabs") . "?=";
$autoBody = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:linear-gradient(135deg,#F97316,#c2410c);padding:30px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:20px;">Hola, ' . $nombre . ' 👋</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 40px;color:#ffffff;">
          <p style="font-size:15px;line-height:1.7;color:rgba(255,255,255,0.8);">
            Recibimos tu mensaje correctamente. Nuestro equipo lo revisará y te contactará en menos de <strong style="color:#F97316">24 horas</strong> con una propuesta personalizada para tu proyecto.
          </p>
          <p style="font-size:14px;color:rgba(255,255,255,0.5);margin-top:20px;">
            Mientras tanto, puedes explorar más sobre nuestros servicios en<br>
            <a href="https://flowslabssas.com" style="color:#F97316;">flowslabssas.com</a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">FlowsLabs SAS · Bogotá, Colombia</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>';

$autoHeaders  = "MIME-Version: 1.0\r\n";
$autoHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
$autoHeaders .= "From: FlowsLabs <noreply@flowslabssas.com>\r\n";
mail($email, $autoSubject, $autoBody, $autoHeaders);

// ── Redirigir ──────────────────────────────────────────
header("Location: /gracias.html");
exit;
?>
