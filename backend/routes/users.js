const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const isUuid = x => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(x));
const haversine = `(6371 * acos(LEAST(1.0, GREATEST(-1.0, cos(radians($1)) * cos(radians(u.lat)) * cos(radians(u.lng) - radians($2)) + sin(radians($1)) * sin(radians(u.lat))))))`;

router.get('/nearby', authenticate, async (req, res) => {
  const radius = Number(req.query.radius || 25);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit || '20', 10) || 20));
  const page = Math.max(1, Number.parseInt(req.query.page || '1', 10) || 1);
  if (!Number.isFinite(radius) || radius < 1 || radius > 100) return res.status(400).json({ error: 'Radius must be between 1 and 100 kilometres' });
  const { lat, lng, city, id } = req.user;
  const hasLocation = lat != null && lng != null;
  const params = [hasLocation ? Number(lat) : null, hasLocation ? Number(lng) : null, radius, id, city || '', limit, (page - 1) * limit];
  try {
    const { rows } = await db.query(`
      SELECT u.id, u.name, u.company_name, u.industry, u.bio, u.headline,
             u.city, u.verification_status, u.role_title,
             CASE WHEN $1::numeric IS NOT NULL AND u.lat IS NOT NULL AND u.lng IS NOT NULL THEN ROUND((${haversine})::numeric, 1) ELSE NULL END AS distance_km,
             CASE WHEN c.id IS NOT NULL THEN 'connected'
                  WHEN sent.id IS NOT NULL THEN 'request_sent'
                  WHEN received.id IS NOT NULL THEN 'request_received'
                  ELSE 'none' END AS connection_status,
             COALESCE(sent.id::text, received.id::text) AS request_id
      FROM users u
      LEFT JOIN connections c ON (c.user_a_id=$4 AND c.user_b_id=u.id) OR (c.user_b_id=$4 AND c.user_a_id=u.id)
      LEFT JOIN connection_requests sent ON sent.sender_id=$4 AND sent.receiver_id=u.id AND sent.status='pending'
      LEFT JOIN connection_requests received ON received.receiver_id=$4 AND received.sender_id=u.id AND received.status='pending'
      WHERE u.id <> $4 AND u.is_active=true AND u.verification_status='approved' AND u.is_admin=false
        AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id=$4 AND b.blocked_id=u.id) OR (b.blocked_id=$4 AND b.blocker_id=u.id))
        AND (CASE WHEN $1::numeric IS NOT NULL AND u.lat IS NOT NULL AND u.lng IS NOT NULL THEN (${haversine}) <= $3
             ELSE LOWER(COALESCE(u.city,'')) = LOWER($5) AND LENGTH($5) > 0 END)
      ORDER BY distance_km ASC NULLS LAST, u.name ASC
      LIMIT $6 OFFSET $7`, params);
    res.json({ users: rows, page, limit });
  } catch (e) { console.error('Nearby members error:', e.message); res.status(500).json({ error: 'Unable to load members' }); }
});

router.get('/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;
  if (!isUuid(userId)) return res.status(400).json({ error: 'Invalid member ID' });
  try {
    const { rows } = await db.query(`
      SELECT u.id, u.name, u.company_name, u.industry, u.bio, u.headline,
             u.city, u.role_title, u.verification_status, u.year_founded,
             u.looking_for, u.company_size,
             CASE WHEN c.id IS NOT NULL THEN u.email ELSE NULL END AS email,
             CASE WHEN c.id IS NOT NULL THEN u.phone ELSE NULL END AS phone,
             CASE WHEN c.id IS NOT NULL THEN 'connected'
                  WHEN sent.id IS NOT NULL THEN 'request_sent'
                  WHEN received.id IS NOT NULL THEN 'request_received'
                  ELSE 'none' END AS connection_status
      FROM users u
      LEFT JOIN connections c ON (c.user_a_id=$1 AND c.user_b_id=u.id) OR (c.user_b_id=$1 AND c.user_a_id=u.id)
      LEFT JOIN connection_requests sent ON sent.sender_id=$1 AND sent.receiver_id=u.id AND sent.status='pending'
      LEFT JOIN connection_requests received ON received.receiver_id=$1 AND received.sender_id=u.id AND received.status='pending'
      WHERE u.id=$2 AND u.is_active=true AND u.verification_status='approved'
        AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=u.id) OR (b.blocked_id=$1 AND b.blocker_id=u.id))`, [req.user.id, userId]);
    if (!rows.length) return res.status(404).json({ error: 'Member not found' });
    res.json({ user: rows[0] });
  } catch (e) { console.error('Profile lookup error:', e.message); res.status(500).json({ error: 'Unable to load profile' }); }
});
module.exports = router;
