
/**
 * api/auth/logout.js
 * PFRE — Secure logout endpoint
 */

const COOKIE_NAME = '__Host-pfre_session';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.'
    });
  }

  res.setHeader('Set-Cookie', [
    `${COOKIE_NAME}=`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ].join('; '));

  return res.status(200).json({
    success: true,
    message: 'You have been logged out.'
  });
}