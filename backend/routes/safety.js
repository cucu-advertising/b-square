const router = require("express").Router();
const db = require("../db");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.post("/block/:userId", async (req, res) => {
  const { userId } = req.params;
  if (userId === req.user.id) return res.status(400).json({ error: "You cannot block yourself" });

  try {
    await db.query(
      `INSERT INTO user_blocks (blocker_id, blocked_id)
       VALUES ($1, $2)
       ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
      [req.user.id, userId]
    );

    await db.query(
      `DELETE FROM connection_requests
       WHERE (sender_id=$1 AND receiver_id=$2)
          OR (sender_id=$2 AND receiver_id=$1)`,
      [req.user.id, userId]
    );

    return res.json({ message: "User blocked" });
  } catch (err) {
    console.error("Block user error:", err.message);
    return res.status(500).json({ error: "Failed to block user" });
  }
});

router.delete("/block/:userId", async (req, res) => {
  try {
    await db.query(
      "DELETE FROM user_blocks WHERE blocker_id=$1 AND blocked_id=$2",
      [req.user.id, req.params.userId]
    );
    return res.json({ message: "User unblocked" });
  } catch {
    return res.status(500).json({ error: "Failed to unblock user" });
  }
});

router.post("/report/:userId", async (req, res) => {
  const { reason, details } = req.body;
  const { userId } = req.params;

  if (userId === req.user.id) return res.status(400).json({ error: "You cannot report yourself" });
  if (!reason?.trim()) return res.status(400).json({ error: "A report reason is required" });

  try {
    await db.query(
      `INSERT INTO user_reports (reporter_id, reported_user_id, reason, details)
       VALUES ($1,$2,$3,$4)`,
      [req.user.id, userId, reason.trim(), details?.trim() || null]
    );
    return res.status(201).json({ message: "Report submitted for review" });
  } catch (err) {
    console.error("Report user error:", err.message);
    return res.status(500).json({ error: "Failed to submit report" });
  }
});

router.delete("/account", async (req, res) => {
  const { confirmation } = req.body;
  if (confirmation !== "DELETE") {
    return res.status(400).json({ error: 'Type "DELETE" to confirm account deletion' });
  }

  try {
    await db.query("BEGIN");
    await db.query("DELETE FROM refresh_tokens WHERE user_id=$1", [req.user.id]);
    await db.query("DELETE FROM users WHERE id=$1 AND is_admin=false", [req.user.id]);
    await db.query("COMMIT");
    return res.json({ message: "Your Bsquare account and associated account data have been deleted." });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Delete account error:", err.message);
    return res.status(500).json({ error: "Failed to delete account" });
  }
});

module.exports = router;
