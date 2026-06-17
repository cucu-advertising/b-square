require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const db = require("./db");

const app = express();
app.use(helmet());
app.set("trust proxy", 1);
  app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://astonishing-arithmetic-d290b1.netlify.app"
  ],
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/connections", require("./routes/connections"));
app.use("/api/events", require("./routes/events"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/admin", require("./routes/admin"));

app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ error: "Internal server error" }); });

// ─── STARTUP MIGRATION (idempotent) ──────────────────────────────────────────
// Creates the events table on boot if it doesn't exist yet, so no manual SQL
// step is required after deploying this feature.
async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      event_type VARCHAR(20) NOT NULL DEFAULT 'other',
      event_date TIMESTAMPTZ NOT NULL,
      location VARCHAR(200),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date)`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id)`);
}

const PORT = process.env.PORT || 5000;
ensureSchema()
  .then(() => console.log("✓ events table ready"))
  .catch(err => console.error("⚠ Startup schema check failed (events feature may not work):", err.message))
  .finally(() => app.listen(PORT, () => console.log(`B Square API running on port ${PORT}`)));

module.exports = app;
