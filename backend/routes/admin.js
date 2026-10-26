const router = require("express").Router();
const db = require("../db");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { sendApprovalEmail, sendRejectionEmail } = require("../services/email");

router.use(authenticate, requireAdmin);

router.get("/stats", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE verification_status='pending' AND is_admin=false) AS pending,
        COUNT(*) FILTER (WHERE verification_status='approved' AND is_admin=false) AS approved,
        COUNT(*) FILTER (WHERE verification_status='rejected') AS rejected,
        COUNT(*) FILTER (WHERE is_admin=false) AS total_users,
        COUNT(*) FILTER (WHERE verification_status='approved' AND created_at > NOW()-INTERVAL '24 hours' AND is_admin=false) AS approved_today
      FROM users
    `);
    return res.json(rows[0]);
  } catch (err) { return res.status(500).json({ error: "Failed to fetch stats" }); }
});

router.get("/pending", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, name, email, phone, industry, city,
        verification_type, verification_status, verification_notes,
        din_number, din_director_name, linkedin_url,
        succession_prev_din, succession_new_din, succession_doc_note,
        founder_name, role_title, work_email, company_website,
        registration_number, referral_code, admission_score, admission_status, created_at
      FROM users
      WHERE verification_status='pending' AND is_admin=false
      ORDER BY created_at ASC
    `);
    return res.json({ users: rows });
  } catch (err) { return res.status(500).json({ error: "Failed to fetch pending" }); }
});

router.get("/users", async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let where = "WHERE is_admin=false"; const params = [];
    if (status) { params.push(status); where += ` AND verification_status=$${params.length}`; }
    params.push(parseInt(limit), offset);
    const { rows } = await db.query(
      `SELECT id, name, email, phone, industry, city,
        verification_type, verification_status, verification_notes,
        din_number, din_director_name, linkedin_url, founder_name,
        role_title, work_email, company_website, registration_number,
        referral_code, admission_score, admission_status, created_at
       FROM users ${where}
       ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    return res.json({ users: rows });
  } catch (err) { return res.status(500).json({ error: "Failed to fetch users" }); }
});

router.put("/users/:userId/approve", async (req, res) => {
  const { userId } = req.params;
  const { notes } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE users SET verification_status='approved', verification_notes=$1 WHERE id=$2 AND is_admin=false RETURNING id,name,email,phone,city,industry,verification_type,founder_name",
      [notes || "Verified and approved by admin", userId]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    // Send approval email (non-blocking)
    sendApprovalEmail(rows[0]).catch(err => console.error("Email error:", err.message));
    return res.json({ message: `${rows[0].name} approved successfully`, user: rows[0] });
  } catch (err) { return res.status(500).json({ error: "Failed to approve" }); }
});

router.put("/users/:userId/reject", async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  if (!reason?.trim()) return res.status(400).json({ error: "Rejection reason is required" });
  try {
    const { rows } = await db.query(
      "UPDATE users SET verification_status='rejected', verification_notes=$1 WHERE id=$2 AND is_admin=false RETURNING id,name,email,founder_name",
      [reason.trim(), userId]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    // Send rejection email (non-blocking)
    sendRejectionEmail(rows[0], reason.trim()).catch(err => console.error("Email error:", err.message));
    return res.json({ message: `${rows[0].name} rejected`, user: rows[0] });
  } catch (err) { return res.status(500).json({ error: "Failed to reject" }); }
});

router.put("/users/:userId/deactivate", async (req, res) => {
  const { userId } = req.params;
  try {
    await db.query("UPDATE users SET is_active=false WHERE id=$1 AND is_admin=false", [userId]);
    return res.json({ message: "User deactivated" });
  } catch (err) { return res.status(500).json({ error: "Failed to deactivate" }); }
});

router.get('/reports', async (req, res) => {
  try {
    const { rows } = await db.query("SELECT r.id,r.reason,r.details,r.status,r.created_at,r.reporter_id,reporter.name AS reporter_name,r.reported_user_id,reported.name AS reported_name FROM user_reports r LEFT JOIN users reporter ON reporter.id=r.reporter_id LEFT JOIN users reported ON reported.id=r.reported_user_id ORDER BY CASE WHEN r.status='open' THEN 0 ELSE 1 END,r.created_at DESC LIMIT 200");
    res.json({ reports: rows });
  } catch { res.status(500).json({ error:'Could not load reports' }); }
});
router.put('/reports/:id/resolve', async (req,res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) return res.status(400).json({ error:'Invalid report ID' });
  try { const {rows} = await db.query("UPDATE user_reports SET status='resolved' WHERE id=$1 RETURNING id",[req.params.id]);
    return rows.length ? res.json({message:'Report resolved'}) : res.status(404).json({error:'Report not found'});
  } catch { return res.status(500).json({error:'Could not resolve report'}); }
});
module.exports = router;
