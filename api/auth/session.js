
/**
 * api/auth/session.js
 * PFRE — Verify the signed authentication cookie
 */

import crypto from 'node:crypto';

const COOKIE_NAME = '__Host-pfre_session';

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');

    if (separator < 0) continue;

    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (key === name) return value;
  }

  return null;
}

function safeEqual(a, b) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  return first.length === second.length &&
    crypto.timingSafeEqual(first, second);
}

function verifySession(token, secret) {
  if (!token || !secret || secret.length < 32) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, suppliedSignature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  if (!safeEqual(suppliedSignature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    );

    if (
      !payload ||
      typeof payload.email !== 'string' ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= Math.floor(Date.now() / 1000) ||
      !['owner', 'admin'].includes(payload.role)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.'
    });
  }

  const secret = process.env.SESSION_SECRET;
  const token = getCookie(req, COOKIE_NAME);
  const session = verifySession(token, secret);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Your session is invalid or has expired.'
    });
  }

  return res.status(200).json({
    success: true,
    user: {
      email: session.email,
      name: session.role === 'owner' ? 'PFRE Owner' : session.email,
      role: session.role === 'owner' ? 'super_admin' : 'admin',
      permissions: session.role === 'owner' ? ['*'] : []
    }
  });
}