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
const MAIL_TO = 'office@yourchurch.org';
/** Use an address @ your site domain (SiteGround and most hosts require this for PHP mail). */
const MAIL_FROM = 'noreply@yourchurch.org';
const MAIL_FROM_NAME = 'Website Contact Form';

// Honeypot: leave empty in real submissions; bots often fill hidden fields.
$honeypot = isset($_POST['website']) ? trim((string) $_POST['website']) : '';
if ($honeypot !== '') {
  echo json_encode(['ok' => true]);
  exit;
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
