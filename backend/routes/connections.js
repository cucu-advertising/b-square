const router = require("express").Router();
const db = require("../db");
const { authenticate } = require("../middleware/auth");

// helper: send system message to both users when connected
const sendConnectionMessage = async (userAId, userBId) => {
  try {
    const { rows } = await db.query(
      "SELECT id, name, email, phone FROM users WHERE id = ANY($1)",
      [[userAId, userBId]]
    );
    const userA = rows.find(u => u.id === userAId);
    const userB = rows.find(u => u.id === userBId);
    if (!userA || !userB) return;

    const msgForB = `🎉 You are now connected with ${userA.name}!\n📧 Email: ${userA.email}\n📱 Phone: ${userA.phone}`;
    const msgForA = `🎉 You are now connected with ${userB.name}!\n📧 Email: ${userB.email}\n📱 Phone: ${userB.phone}`;

    await db.query(
      "INSERT INTO messages (sender_id, receiver_id, content, is_system) VALUES ($1,$2,$3,true)",
      [userAId, userBId, msgForB]
    );
    await db.query(
      "INSERT INTO messages (sender_id, receiver_id, content, is_system) VALUES ($1,$2,$3,true)",
      [userBId, userAId, msgForA]
    );
  } catch (err) {
    console.error("sendConnectionMessage error:", err.message);
  }
};

// ─── SEND REQUEST ──────────────────────────────────────────────────────────────
router.post("/request/:targetId", authenticate, async (req, res) => {
  const { targetId } = req.params;
  const senderId = req.user.id;

  if (senderId === targetId)
    return res.status(400).json({ error: "You cannot send a request to yourself" });

  try {
    // 1. Target must exist and be approved
    const { rows: target } = await db.query(
      "SELECT id FROM users WHERE id=$1 AND is_active=true AND verification_status='approved' AND is_admin=false",
      [targetId]
    );
    if (!target[0]) return res.status(404).json({ error: "User not found or not verified" });

    // 2. Already connected?
    const { rows: conn } = await db.query(
      "SELECT id FROM connections WHERE (user_a_id=$1 AND user_b_id=$2) OR (user_a_id=$2 AND user_b_id=$1)",
      [senderId, targetId]
    );
    if (conn[0]) return res.status(409).json({ error: "You are already connected with this user" });

    // 3. Check existing request in either direction
    const { rows: existing } = await db.query(
      "SELECT id, status, sender_id, receiver_id FROM connection_requests WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)",
      [senderId, targetId]
    );

    if (existing[0]) {
      const req_row = existing[0];

      if (req_row.status === "pending") {
        // Other person already sent a request → auto accept
        if (req_row.sender_id === targetId) {
          await db.query("UPDATE connection_requests SET status='accepted', updated_at=NOW() WHERE id=$1", [req_row.id]);
          const a = senderId < targetId ? senderId : targetId;
          const b = senderId < targetId ? targetId : senderId;
          await db.query("INSERT INTO connections (user_a_id, user_b_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [a, b]);
          await sendConnectionMessage(senderId, targetId);
          return res.json({ message: "Connected! They had already sent you a request.", status: "connected" });
        }
        return res.status(409).json({ error: "Connection request already sent. Waiting for their response." });
      }

      // For any other status (declined, cancelled, accepted) → delete old row and create fresh
      await db.query("DELETE FROM connection_requests WHERE id=$1", [req_row.id]);
    }

    // 4. Fresh request
    await db.query(
      "INSERT INTO connection_requests (sender_id, receiver_id, status) VALUES ($1,$2,'pending')",
      [senderId, targetId]
    );
    return res.status(201).json({ message: "Connection request sent successfully", status: "pending" });

  } catch (err) {
    console.error("Send request error:", err.message, err.code, err.detail);
    return res.status(500).json({ error: "Failed to send request. Please try again." });
  }
});

// ─── ACCEPT REQUEST ────────────────────────────────────────────────────────────
router.put("/request/:requestId/accept", authenticate, async (req, res) => {
  const { requestId } = req.params;
  try {
    const { rows } = await db.query(
      "SELECT * FROM connection_requests WHERE id=$1 AND receiver_id=$2 AND status='pending'",
      [requestId, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Request not found or already handled" });

    const { sender_id, receiver_id } = rows[0];
    await db.query("UPDATE connection_requests SET status='accepted', updated_at=NOW() WHERE id=$1", [requestId]);

    const a = sender_id < receiver_id ? sender_id : receiver_id;
    const b = sender_id < receiver_id ? receiver_id : sender_id;
    await db.query("INSERT INTO connections (user_a_id, user_b_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [a, b]);

    await sendConnectionMessage(sender_id, receiver_id);

    return res.json({ message: "Connection accepted! Contact details have been shared." });
  } catch (err) {
    console.error("Accept error:", err.message);
    return res.status(500).json({ error: "Failed to accept request" });
  }
});

// ─── DECLINE REQUEST ───────────────────────────────────────────────────────────
router.put("/request/:requestId/decline", authenticate, async (req, res) => {
  const { requestId } = req.params;
  try {
    const { rows } = await db.query(
      "DELETE FROM connection_requests WHERE id=$1 AND receiver_id=$2 AND status='pending' RETURNING id",
      [requestId, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Request not found" });
    return res.json({ message: "Request declined" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to decline request" });
  }
});

// ─── CANCEL SENT REQUEST ───────────────────────────────────────────────────────
router.delete("/request/:requestId", authenticate, async (req, res) => {
  const { requestId } = req.params;
  try {
    const { rows } = await db.query(
      "DELETE FROM connection_requests WHERE id=$1 AND sender_id=$2 AND status='pending' RETURNING id",
      [requestId, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Request not found or already handled" });
    return res.json({ message: "Request cancelled" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to cancel request" });
  }
});

// ─── REMOVE CONNECTION ─────────────────────────────────────────────────────────
router.delete("/:targetId", authenticate, async (req, res) => {
  const { targetId } = req.params;
  try {
    // Remove the connection
    const { rows } = await db.query(
      "DELETE FROM connections WHERE (user_a_id=$1 AND user_b_id=$2) OR (user_a_id=$2 AND user_b_id=$1) RETURNING id",
      [req.user.id, targetId]
    );
    if (!rows[0]) return res.status(404).json({ error: "Connection not found" });

    // Fully delete old request so they can send fresh request later
    await db.query(
      "DELETE FROM connection_requests WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)",
      [req.user.id, targetId]
    );

    return res.json({ message: "Connection removed. You can reconnect anytime." });
  } catch (err) {
    console.error("Remove connection error:", err.message);
    return res.status(500).json({ error: "Failed to remove connection" });
  }
});

// ─── LIST MY CONNECTIONS ───────────────────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, u.industry, u.bio, u.city, u.lat, u.lng,
        u.verification_type, u.verification_status, c.created_at AS connected_since
       FROM connections c
       JOIN users u ON u.id = CASE WHEN c.user_a_id=$1 THEN c.user_b_id ELSE c.user_a_id END
       WHERE (c.user_a_id=$1 OR c.user_b_id=$1) AND u.is_active=true
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    return res.json({ connections: rows });
  } catch (err) {
    console.error("List connections error:", err.message);
    return res.status(500).json({ error: "Failed to fetch connections" });
  }
});

// ─── RECEIVED REQUESTS ─────────────────────────────────────────────────────────
router.get("/requests/received", authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT cr.id AS request_id, cr.created_at, u.id, u.name, u.industry, u.bio, u.city, u.verification_type
       FROM connection_requests cr
       JOIN users u ON u.id = cr.sender_id
       WHERE cr.receiver_id=$1 AND cr.status='pending' AND u.is_active=true
       ORDER BY cr.created_at DESC`,
      [req.user.id]
    );
    return res.json({ requests: rows });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// ─── SENT REQUESTS ─────────────────────────────────────────────────────────────
router.get("/requests/sent", authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT cr.id AS request_id, cr.created_at, u.id, u.name, u.industry, u.bio, u.city, u.verification_type
       FROM connection_requests cr
       JOIN users u ON u.id = cr.receiver_id
       WHERE cr.sender_id=$1 AND cr.status='pending' AND u.is_active=true
       ORDER BY cr.created_at DESC`,
      [req.user.id]
    );
    return res.json({ requests: rows });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch sent requests" });
  }
});

module.exports = router;
