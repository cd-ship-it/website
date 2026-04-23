<?php
/**
 * Contact form handler for static Astro site (SiteGround / any PHP host with mail()).
 *
 * Deploy: lives next to your built site as /api/contact.php (copied from `public/api/`).
 * Configure MAIL_TO and MAIL_FROM below (From should be an address on your domain for deliverability).
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

// ─── Edit for your church / SiteGround mailbox ─────────────────────────────
const MAIL_TO = 'cd@crosspointchurchsv.org';
/** Use an address @ your site domain (SiteGround and most hosts require this for PHP mail). */
const MAIL_FROM = 'noreply@crosspointchurchsv.org';
const MAIL_FROM_NAME = 'Website Contact Form';

// ─── Google reCAPTCHA v3 ───────────────────────────────────────────────────
// Paste your v3 SECRET key here (from https://www.google.com/recaptcha/admin).
// Leave '' to skip verification (dev only — spam will not be blocked).
const RECAPTCHA_SECRET = '6LcUzMYsAAAAAF4_M0OBEhanfiMo0pE90BOwxIO_';
/** Minimum score (0.0–1.0) to accept. 0.5 is Google's default. */
const RECAPTCHA_MIN_SCORE = 0.5;
/** Expected `action` name sent by the client; must match the one in contact.astro. */
const RECAPTCHA_EXPECTED_ACTION = 'contact';

// Honeypot: leave empty in real submissions; bots often fill hidden fields.
$honeypot = isset($_POST['website']) ? trim((string) $_POST['website']) : '';
if ($honeypot !== '') {
  echo json_encode(['ok' => true]);
  exit;
}

// reCAPTCHA v3 verification (skipped when RECAPTCHA_SECRET is empty).
if (RECAPTCHA_SECRET !== '') {
  $token = isset($_POST['g-recaptcha-response'])
    ? trim((string) $_POST['g-recaptcha-response'])
    : '';
  if ($token === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing reCAPTCHA token. Please refresh and try again.']);
    exit;
  }

  $verifyPayload = http_build_query([
    'secret' => RECAPTCHA_SECRET,
    'response' => $token,
    'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
  ]);

  $verifyRaw = null;
  if (function_exists('curl_init')) {
    $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
    curl_setopt_array($ch, [
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => $verifyPayload,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 10,
    ]);
    $verifyRaw = curl_exec($ch);
    curl_close($ch);
  } else {
    $context = stream_context_create([
      'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => $verifyPayload,
        'timeout' => 10,
      ],
    ]);
    $verifyRaw = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
  }

  $verify = is_string($verifyRaw) ? json_decode($verifyRaw, true) : null;
  $success = is_array($verify) && !empty($verify['success']);
  $score = is_array($verify) && isset($verify['score']) ? (float) $verify['score'] : 0.0;
  $action = is_array($verify) && isset($verify['action']) ? (string) $verify['action'] : '';

  if (!$success || $score < RECAPTCHA_MIN_SCORE || $action !== RECAPTCHA_EXPECTED_ACTION) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'reCAPTCHA verification failed. Please try again.']);
    exit;
  }
}

$name = isset($_POST['name']) ? trim((string) $_POST['name']) : '';
$email = isset($_POST['email']) ? trim((string) $_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim((string) $_POST['phone']) : '';
$subject = isset($_POST['subject']) ? trim((string) $_POST['subject']) : '';
$message = isset($_POST['message']) ? trim((string) $_POST['message']) : '';

if ($name === '' || $email === '' || $subject === '' || $message === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Please fill in all required fields.']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Please enter a valid email address.']);
  exit;
}

// Prevent header injection in user-supplied fields used in mail headers.
$safeName = str_replace(["\r", "\n"], '', $name);
$safeSubject = str_replace(["\r", "\n"], '', $subject);

$body = "New message from the website contact form\n\n";
$body .= "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= 'Phone: ' . ($phone !== '' ? $phone : '(not provided)') . "\n";
$body .= "Subject: {$subject}\n\n";
$body .= "Message:\n{$message}\n";

$encodedFromName = function_exists('mb_encode_mimeheader')
  ? mb_encode_mimeheader(MAIL_FROM_NAME, 'UTF-8')
  : MAIL_FROM_NAME;

$headers = [
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'From: ' . $encodedFromName . ' <' . MAIL_FROM . '>',
  'Reply-To: ' . $safeName . ' <' . $email . '>',
  'X-Mailer: PHP/' . PHP_VERSION,
];

$mailSubject = '[Website] ' . $safeSubject;

$sent = @mail(MAIL_TO, $mailSubject, $body, implode("\r\n", $headers));

if (!$sent) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Could not send message. Please try again or email us directly.']);
  exit;
}

echo json_encode(['ok' => true]);
