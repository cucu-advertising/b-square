const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const db = require('../db');

function firebaseAuth() {
  if (admin.apps.length === 0) admin.initializeApp({ credential: admin.credential.applicationDefault() });
  return admin.auth();
}

router.post('/session', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: 'draft-7', legacyHeaders: false }), async (req, res) => {
  const idToken = req.body?.idToken;
  if (typeof idToken !== 'string' || idToken.length < 100 || idToken.length > 12000) {
    return res.status(400).json({ error: 'A Firebase authentication token is required' });
  }
  let verified;
  try {
    verified = await firebaseAuth().verifyIdToken(idToken, true);
  } catch (err) {
    console.error('Firebase phone token verification failed:', err.code || err.message);
    return res.status(401).json({ error: 'Phone verification failed. Please request a new code.' });
  }
  const phone = verified.phone_number;
  const age = Date.now() / 1000 - Number(verified.auth_time);
  if (verified.firebase?.sign_in_provider !== 'phone' || !/^\+91[6-9]\d{9}$/.test(phone || '') ||
      !Number.isFinite(age) || age < -60 || age > 300) {
    return res.status(401).json({ error: 'Fresh phone authentication is required' });
  }
  try {
    const phone10 = phone.slice(3);
    const { rows } = await db.query(
      `SELECT id, name, email, phone, company_name, industry, headline, bio, city,
              verification_status, verification_notes, is_admin, is_active
       FROM users
       WHERE RIGHT(regexp_replace(phone, '[^0-9]', '', 'g'), 10) = $1
         AND length(regexp_replace(phone, '[^0-9]', '', 'g')) IN (10,12)
       LIMIT 3`, [phone10]
    );
    if (rows.length > 1) return res.status(409).json({ error: 'Multiple accounts use this number. Contact B Square support.' });
    const user = rows[0];
    if (!user || !user.is_active || user.is_admin) return res.status(403).json({ error: 'No eligible member account is linked to this phone.' });
    if (user.verification_status !== 'approved') return res.status(403).json({ error: 'Membership is awaiting approval.', code: 'PENDING_REVIEW' });
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) return res.status(503).json({ error: 'Authentication service unavailable' });
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
    await db.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);
    return res.json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error('Firebase phone session error:', err.message);
    return res.status(500).json({ error: 'Could not complete sign in' });
  }
});
module.exports = router;
