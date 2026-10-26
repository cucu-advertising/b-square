const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const isUuid = x => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(x));
router.use(authenticate);
router.get('/blocks', async (req, res) => {
  try { const { rows } = await db.query('SELECT u.id, u.name, u.company_name, u.industry FROM user_blocks b JOIN users u ON u.id=b.blocked_id WHERE b.blocker_id=$1 ORDER BY b.created_at DESC', [req.user.id]); res.json({ blocked: rows }); }
  catch { res.status(500).json({ error: 'Unable to list blocked users' }); }
});
router.post('/block/:userId', async (req, res) => {
  const userId = req.params.userId;
  if (!isUuid(userId) || userId === req.user.id) return res.status(400).json({ error: 'Invalid member' });
  const client = await db.pool.connect().catch(() => null);
  if (!client) return res.status(503).json({ error: 'Database unavailable' });
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT id FROM users WHERE id=$1', [userId]);
    if (!found.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Member not found' }); }
    await client.query('INSERT INTO user_blocks(blocker_id, blocked_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [req.user.id, userId]);
    await client.query('DELETE FROM connection_requests WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)', [req.user.id, userId]);
    await client.query('DELETE FROM connections WHERE (user_a_id=$1 AND user_b_id=$2) OR (user_a_id=$2 AND user_b_id=$1)', [req.user.id, userId]);
    await client.query('COMMIT'); res.json({ message: 'Member blocked' });
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); console.error('Block error:', e.message); res.status(500).json({ error: 'Unable to block member' }); }
  finally { client.release(); }
});
router.delete('/block/:userId', async (req, res) => {
  if (!isUuid(req.params.userId)) return res.status(400).json({ error: 'Invalid member' });
  try { await db.query('DELETE FROM user_blocks WHERE blocker_id=$1 AND blocked_id=$2', [req.user.id, req.params.userId]); res.json({ message: 'Member unblocked' }); }
  catch { res.status(500).json({ error: 'Unable to unblock member' }); }
});
router.post('/report/:userId', async (req, res) => {
  const { userId } = req.params; const { reason, details } = req.body;
  if (!isUuid(userId) || userId === req.user.id) return res.status(400).json({ error: 'Invalid member' });
  if (typeof reason !== 'string' || reason.trim().length < 5 || reason.length > 100) return res.status(400).json({ error: 'Provide a reason between 5 and 100 characters' });
  if (details != null && (typeof details !== 'string' || details.length > 2000)) return res.status(400).json({ error: 'Details too long' });
  try { await db.query('INSERT INTO user_reports(reporter_id,reported_user_id,reason,details) VALUES($1,$2,$3,$4)', [req.user.id, userId, reason.trim(), details?.trim() || null]); res.status(201).json({ message: 'Report submitted' }); }
  catch { res.status(500).json({ error: 'Unable to submit report' }); }
});
router.delete('/account', async (req, res) => {
  if (req.body?.confirmation !== 'DELETE') return res.status(400).json({ error: 'Confirm account deletion' });
  if (req.user.is_admin) return res.status(403).json({ error: 'Admin accounts require a separate deletion process' });
  const client = await db.pool.connect().catch(() => null);
  if (!client) return res.status(503).json({ error: 'Database unavailable' });
  try {
    await client.query('BEGIN');
    // `users` has ON DELETE CASCADE references for messages, connections, reports and tokens.
    const result = await client.query('DELETE FROM users WHERE id=$1 AND is_admin=false RETURNING id', [req.user.id]);
    if (!result.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Account not found' }); }
    await client.query('COMMIT'); res.json({ message: 'Account deleted' });
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); console.error('Delete error:', e.message); res.status(500).json({ error: 'Unable to delete account' }); }
  finally { client.release(); }
});
module.exports = router;
