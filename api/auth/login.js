
/**
 * api/auth/login.js
 * PFRE — Secure server-side login
 *
 * Required Vercel environment variables:
 * ADMIN_EMAIL
 * ADMIN_PASSWORD
 * SESSION_SECRET (at least 32 characters)
 */

import crypto from 'node:crypto';

const COOKIE_NAME = '__Host-pfre_session';
const SESSION_SECONDS = 12 * 60 * 60;

function safeEqual(a, b) {
  const first = Buffer.from(String(a));
  const second = Buffer.from(String(b));

  if (first.length !== second.length) {
    return false;
  }

  return crypto.timingSafeEqual(first, second);
}

function setSecurityHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
}

function createSignedSession(email, secret) {
  const payload = {
    email,
    role: 'owner',
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS
  };

  const encodedPayload = Buffer
    .from(JSON.stringify(payload))
    .toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export default async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.'
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (
    !adminEmail ||
    !adminPassword ||
    !sessionSecret ||
    sessionSecret.length < 32
  ) {
    return res.status(503).json({
      success: false,
      message: 'Server authentication is not configured.'
    });
  }

  let body = req.body;

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }

  const email = typeof body?.email === 'string'
    ? body.email.trim().toLowerCase()
    : '';

  const password = typeof body?.password === 'string'
    ? body.password
    : '';

  if (!email || !password || email.length > 254 || password.length > 1024) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid email and password.'
    });
  }

  const emailMatches = safeEqual(
    email,
    adminEmail.trim().toLowerCase()
  );

  const passwordMatches = safeEqual(password, adminPassword);

  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  const token = createSignedSession(email, sessionSecret);

  res.setHeader('Set-Cookie', [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${SESSION_SECONDS}`
  ].join('; '));

  return res.status(200).json({
    success: true,
    user: {
      name: 'PFRE Owner',
      email,
      role: 'super_admin',
      permissions: ['*']
    }
  });
}