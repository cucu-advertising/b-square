const router = require("express").Router();
const db = require("../db");
const { authenticate } = require("../middleware/auth");

const EVENT_TYPES = ["sale", "launch", "webinar", "networking", "announcement", "other"];

// ─── LIST ALL EVENTS (visible to every logged-in user) ──────────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT e.id, e.title, e.description, e.event_type, e.event_date, e.location, e.created_at,
              u.id AS user_id, u.name AS business_name, u.industry, u.city,
              u.verification_type, u.verification_status
       FROM events e
       JOIN users u ON u.id = e.user_id
       ORDER BY e.event_date ASC, e.created_at DESC`
    );
    res.json({ events: rows });
  } catch (err) {
    console.error(err);
    if (err.code === "42P01") return res.status(500).json({ error: "Events table doesn't exist yet — restart the backend so it can auto-create it, then refresh." });
    res.status(500).json({ error: "Failed to load events" });
  }
});

// ─── CREATE EVENT ─────────────────────────────────────────────────────────────
router.post("/", authenticate, async (req, res) => {
  const { title, description, event_type, event_date, location } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
  if (!event_date) return res.status(400).json({ error: "Event date is required" });
  const type = EVENT_TYPES.includes(event_type) ? event_type : "other";

  try {
    const { rows } = await db.query(
      `INSERT INTO events (user_id, title, description, event_type, event_date, location)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, title, description, event_type, event_date, location, created_at`,
      [req.user.id, title.trim(), description?.trim() || null, type, event_date, location?.trim() || null]
    );
    res.status(201).json({
      message: "Event posted!",
      event: {
        ...rows[0],
        user_id: req.user.id,
        business_name: req.user.name,
        industry: req.user.industry,
        city: req.user.city,
        verification_type: req.user.verification_type,
        verification_status: req.user.verification_status,
      },
    });
  } catch (err) {
    console.error(err);
    if (err.code === "42P01") return res.status(500).json({ error: "Events table doesn't exist yet — restart the backend so it can auto-create it, then try again." });
    res.status(500).json({ error: "Failed to create event" });
  }
});

// ─── DELETE OWN EVENT ─────────────────────────────────────────────────────────
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { rows } = await db.query("DELETE FROM events WHERE id=$1 AND user_id=$2 RETURNING id", [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = router;
