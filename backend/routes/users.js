const router = require("express").Router();
const db = require("../db");
const { authenticate } = require("../middleware/auth");

const HAVERSINE = `(6371 * acos(LEAST(1.0, cos(radians($1)) * cos(radians(u.lat)) * cos(radians(u.lng) - radians($2)) + sin(radians($1)) * sin(radians(u.lat)))))`;

router.get("/nearby", authenticate, async (req, res) => {
  const { radius = 10, industry, page = 1, limit = 20 } = req.query;
  const { lat, lng, id: currentId } = req.user;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  if (!lat || !lng) return res.status(400).json({ error: "Your location is not set. Please allow location access." });
  try {
    const params = [lat, lng, parseFloat(radius), currentId];
    let filterSQL = "";
    if (industry) { params.push(`%${industry.toLowerCase()}%`); filterSQL = ` AND LOWER(u.industry) LIKE $${params.length}`; }
    const sql = `
      SELECT
  u.id,
  u.name,
  u.company_name,
  u.company_logo,
  u.profile_photo,
  u.headline,
  u.share_slug,
  u.industry,
  u.bio,
  u.city,
  u.lat,
  u.lng,
        u.verification_type, u.verification_status,
        u.founder_name, u.looking_for, u.business_goal, u.company_size,
        u.revenue_range, u.business_interests, u.year_founded,
        ROUND(CAST(${HAVERSINE} AS numeric), 1) AS distance_km,
        CASE
          WHEN c.id IS NOT NULL THEN 'connected'
          WHEN cr_sent.id IS NOT NULL THEN 'request_sent'
          WHEN cr_recv.id IS NOT NULL THEN 'request_received'
          ELSE 'none'
        END AS connection_status,
        CASE WHEN cr_sent.id IS NOT NULL THEN cr_sent.id::text
             WHEN cr_recv.id IS NOT NULL THEN cr_recv.id::text
             ELSE NULL END AS request_id
      FROM users u
      LEFT JOIN connections c ON (c.user_a_id=$4 AND c.user_b_id=u.id) OR (c.user_b_id=$4 AND c.user_a_id=u.id)
      LEFT JOIN connection_requests cr_sent ON cr_sent.sender_id=$4 AND cr_sent.receiver_id=u.id AND cr_sent.status='pending'
      LEFT JOIN connection_requests cr_recv ON cr_recv.receiver_id=$4 AND cr_recv.sender_id=u.id AND cr_recv.status='pending'
      WHERE u.id != $4 AND u.is_active=true AND u.verification_status='approved' AND u.is_admin=false
        AND ${HAVERSINE} <= $3 ${filterSQL}
      ORDER BY distance_km ASC LIMIT ${parseInt(limit)} OFFSET ${offset}`;
    const { rows } = await db.query(sql, params);
    return res.json({ users: rows, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error("Nearby error:", err.message);
    return res.status(500).json({ error: "Failed to fetch nearby users" });
  }
});

router.get("/:userId", authenticate, async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT SELECT
  u.id,
  u.name,
  u.company_name,
  u.company_logo,
  u.profile_photo,
  u.headline,
  u.share_slug,
  u.industry,
  u.bio,
  u.city,
  u.verification_type,
        u.founder_name, u.looking_for, u.business_goal, u.company_size,
        u.revenue_range, u.business_interests, u.year_founded, u.created_at,
        CASE WHEN c.id IS NOT NULL THEN true ELSE false END AS is_connected,
        CASE WHEN c.id IS NOT NULL THEN u.email ELSE NULL END AS email,
        CASE WHEN c.id IS NOT NULL THEN u.phone ELSE NULL END AS phone
       FROM users u
       LEFT JOIN connections c ON (c.user_a_id=$1 AND c.user_b_id=u.id) OR (c.user_b_id=$1 AND c.user_a_id=u.id)
       WHERE u.id=$2 AND u.is_active=true`,
      [req.user.id, userId]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    return res.json({ user: rows[0] });
  } catch (err) { return res.status(500).json({ error: "Failed to fetch user" }); }
});

module.exports = router;
