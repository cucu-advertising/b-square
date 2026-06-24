const jwt = require("jsonwebtoken");
const db = require("../db");

const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ error: "No token provided" });
    const token = auth.split(" ")[1];
    let decoded;

try {
  decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("JWT VERIFIED:", decoded);
} catch (err) {
  console.log("VERIFY ERROR:", err.message);
  console.log("JWT_SECRET EXISTS:", !!process.env.JWT_SECRET);
  return res.status(401).json({ error: "Invalid token" });
}
    const { rows } = await db.query(
      `SELECT
  id,
  name,
  email,
  phone,
  industry,
  bio,

  company_name,
  headline,
  company_logo,
  profile_photo,
  share_slug,

  verification_type,
  verification_status,
  verification_notes,

  is_admin,
  lat,
  lng,
  city,
  is_active,

  onboarding_done,

  founder_name,
  looking_for,
  business_goal,
  company_size,
  revenue_range,
  business_interests,
  year_founded

FROM users
WHERE id = $1`,
      [decoded.userId]
    );
    if (!rows[0]) return res.status(401).json({ error: "User not found" });
    if (!rows[0].is_active) return res.status(403).json({ error: "Account deactivated" });
    if (!rows[0].is_admin && rows[0].verification_status === "pending")
      return res.status(403).json({ error: "Account pending verification", code: "PENDING_REVIEW" });
    if (!rows[0].is_admin && rows[0].verification_status === "rejected")
      return res.status(403).json({ error: `Verification rejected: ${rows[0].verification_notes || "Contact support"}`, code: "REJECTED" });
    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
    return res.status(401).json({ error: "Invalid token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user?.is_admin) return res.status(403).json({ error: "Admin access required" });
  next();
};

module.exports = { authenticate, requireAdmin };
