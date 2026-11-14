const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const isUuid = x => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(x));
async function canMessage(a, b) {
  const { rows } = await db.query(`SELECT 1 FROM connections c WHERE ((c.user_a_id=$1 AND c.user_b_id=$2) OR (c.user_b_id=$1 AND c.user_a_id=$2)) AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=$2) OR (b.blocker_id=$2 AND b.blocked_id=$1))`, [a,b]);
  return rows.length > 0;
}
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(`
      WITH eligible AS (
        SELECT u.id AS other_id, u.name AS other_name, u.industry AS other_industry
        FROM connections c JOIN users u ON u.id = CASE WHEN c.user_a_id=$1 THEN c.user_b_id ELSE c.user_a_id END
        WHERE (c.user_a_id=$1 OR c.user_b_id=$1) AND u.is_active=true
          AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=u.id) OR (b.blocked_id=$1 AND b.blocker_id=u.id))
      )
      SELECT e.other_id, e.other_name, e.other_industry, last_msg.content AS last_message,
             last_msg.created_at AS last_message_at, COALESCE(unread.cnt,0)::integer AS unread_count
      FROM eligible e
      JOIN LATERAL (SELECT content,created_at FROM messages WHERE (sender_id=$1 AND receiver_id=e.other_id) OR (sender_id=e.other_id AND receiver_id=$1) ORDER BY created_at DESC LIMIT 1) last_msg ON true
      LEFT JOIN LATERAL (SELECT COUNT(*) AS cnt FROM messages WHERE sender_id=e.other_id AND receiver_id=$1 AND read=false) unread ON true
      ORDER BY last_msg.created_at DESC`, [req.user.id]);
    res.json({ conversations: rows });
  } catch (e) { console.error('Conversation list error:', e.message); res.status(500).json({ error: 'Unable to load conversations' }); }
});
router.get('/:targetId', authenticate, async (req, res) => {
  if (!isUuid(req.params.targetId)) return res.status(400).json({ error: 'Invalid member ID' });
  try {
    if (!await canMessage(req.user.id, req.params.targetId)) return res.status(403).json({ error: 'You must be connected to view these messages' });
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit,10) || 50));
    const offset = Math.max(0, (Math.max(1, parseInt(req.query.page,10) || 1) - 1) * limit);
    await db.query('UPDATE messages SET read=true WHERE sender_id=$1 AND receiver_id=$2 AND read=false', [req.params.targetId, req.user.id]);
    const { rows } = await db.query(`SELECT m.* FROM messages m WHERE (m.sender_id=$1 AND m.receiver_id=$2) OR (m.sender_id=$2 AND m.receiver_id=$1) ORDER BY m.created_at DESC LIMIT $3 OFFSET $4`, [req.user.id, req.params.targetId, limit, offset]);
    res.json({ messages: rows.reverse() });
  } catch (e) { console.error('Messages error:', e.message); res.status(500).json({ error: 'Unable to load conversation' }); }
});
router.post('/:targetId', authenticate, async (req, res) => {
  const content = req.body?.content;
  if (!isUuid(req.params.targetId) || req.params.targetId === req.user.id) return res.status(400).json({ error: 'Invalid recipient' });
  if (typeof content !== 'string' || !content.trim() || content.length > 2000) return res.status(400).json({ error: 'Message must contain 1-2000 characters' });
  try {
    if (!await canMessage(req.user.id, req.params.targetId)) return res.status(403).json({ error: 'You must be connected to message this member' });
    const { rows } = await db.query('INSERT INTO messages(sender_id,receiver_id,content) VALUES($1,$2,$3) RETURNING *', [req.user.id, req.params.targetId, content.trim()]);
    res.status(201).json({ message: rows[0] });
  } catch (e) { console.error('Send error:', e.message); res.status(500).json({ error: 'Unable to send message' }); }
});
module.exports = router;
