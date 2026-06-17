const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../db");
const { authenticate } = require("../middleware/auth");

const generateTokens = (userId) => ({
  access: jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }),
  refresh: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }),
});

const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)", [userId, token, expiresAt]);
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
router.post("/register",
  [
    body("name").trim().notEmpty().withMessage("Full name is required"),
    body("businessName").trim().notEmpty().withMessage("Business name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("phone").notEmpty().withMessage("Phone number is required")
      .matches(/^[6-9]\d{9}$/).withMessage("Valid 10-digit Indian phone number required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("lat").isFloat({ min: -90, max: 90 }).withMessage("Valid latitude required"),
    body("lng").isFloat({ min: -180, max: 180 }).withMessage("Valid longitude required"),
    body("verificationType").isIn(["din", "linkedin", "succession"]).withMessage("Invalid verification type"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const {
      name, businessName, email, password, phone, city, lat, lng, industry, bio,
      verificationType, dinNumber, dinDirectorName, linkedinUrl,
      successionPrevDin, successionNewDin, successionDocNote,
    } = req.body;

    try {
      const existing = await db.query("SELECT id FROM users WHERE email = $1", [email]);
      if (existing.rows[0]) return res.status(409).json({ error: "An account with this email already exists" });

      if (verificationType === "din") {
        if (!dinNumber?.trim()) return res.status(400).json({ error: "DIN number is required" });
        if (!/^\d{8}$/.test(dinNumber.trim())) return res.status(400).json({ error: "DIN must be exactly 8 digits (e.g. 00123456)" });
        if (!dinDirectorName?.trim()) return res.status(400).json({ error: "Director name as registered with MCA is required" });
        const dinCheck = await db.query("SELECT id FROM users WHERE din_number = $1", [dinNumber.trim()]);
        if (dinCheck.rows[0]) return res.status(409).json({ error: "This DIN is already registered" });
      } else if (verificationType === "linkedin") {
        if (!linkedinUrl?.trim()) return res.status(400).json({ error: "LinkedIn profile URL is required" });
        if (!linkedinUrl.toLowerCase().includes("linkedin.com/in/"))
          return res.status(400).json({ error: "Must be a valid LinkedIn profile URL (linkedin.com/in/yourname)" });
      } else if (verificationType === "succession") {
        if (!successionDocNote?.trim()) return res.status(400).json({ error: "Please describe your succession document" });
        if (successionNewDin?.trim() && !/^\d{8}$/.test(successionNewDin.trim()))
          return res.status(400).json({ error: "New DIN must be 8 digits if provided" });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await db.query(
        `INSERT INTO users (
          name, email, password_hash, phone, industry, bio,
          verification_type, verification_status,
          din_number, din_director_name, linkedin_url,
          succession_prev_din, succession_new_din, succession_doc_note,
          lat, lng, city
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [
          businessName.trim(), email, passwordHash, phone.trim(),
          industry || null, bio?.trim() || null, verificationType,
          verificationType === "din" ? dinNumber.trim() : null,
          verificationType === "din" ? dinDirectorName.trim() : null,
          verificationType === "linkedin" ? linkedinUrl.trim() : null,
          successionPrevDin?.trim() || null,
          successionNewDin?.trim() || null,
          successionDocNote?.trim() || null,
          parseFloat(lat), parseFloat(lng), city,
        ]
      );

      return res.status(201).json({
        message: "Account submitted for review. You will be notified once approved (within 24 hours).",
        pendingReview: true,
        verificationType,
      });
    } catch (err) {
      console.error("Register error:", err.message, err.code);
      return res.status(500).json({ error: "Registration failed. Please try again." });
    }
  }
);

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
router.post("/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Valid email and password required" });
    const { email, password } = req.body;
    try {
      const { rows } = await db.query("SELECT * FROM users WHERE email = $1 AND is_active = true", [email]);
      if (!rows[0]) return res.status(401).json({ error: "Invalid email or password" });
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: "Invalid email or password" });
      if (!user.is_admin && user.verification_status === "pending")
        return res.status(403).json({ error: "Your account is pending review. We will notify you within 24 hours.", code: "PENDING_REVIEW" });
      if (!user.is_admin && user.verification_status === "rejected")
        return res.status(403).json({ error: `Verification rejected: ${user.verification_notes || "Contact support"}`, code: "REJECTED" });
      const { access, refresh } = generateTokens(user.id);
      await saveRefreshToken(user.id, refresh);
      return res.json({
        message: "Login successful",
        user: {
          id: user.id, name: user.name, email: user.email, phone: user.phone,
          company_name: user.company_name,
headline: user.headline,
company_logo: user.company_logo,
profile_photo: user.profile_photo,
share_slug: user.share_slug,
          industry: user.industry, bio: user.bio,
          verification_type: user.verification_type,
          verification_status: user.verification_status,
          is_admin: user.is_admin,
          lat: user.lat, lng: user.lng, city: user.city,
          onboarding_done: user.onboarding_done,
          founder_name: user.founder_name, looking_for: user.looking_for,
          business_goal: user.business_goal, company_size: user.company_size,
          revenue_range: user.revenue_range, business_interests: user.business_interests,
          year_founded: user.year_founded,
        },
        accessToken: access,
        refreshToken: refresh,
      });
    } catch (err) {
      console.error("Login error:", err.message);
      return res.status(500).json({ error: "Login failed. Please try again." });
    }
  }
);

// ─── REFRESH ──────────────────────────────────────────────────────────────────
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { rows } = await db.query(
      "SELECT * FROM refresh_tokens WHERE token=$1 AND user_id=$2 AND expires_at>NOW()",
      [refreshToken, decoded.userId]
    );
    if (!rows[0]) return res.status(401).json({ error: "Invalid or expired refresh token" });
    await db.query("DELETE FROM refresh_tokens WHERE token=$1", [refreshToken]);
    const { access, refresh } = generateTokens(decoded.userId);
    await saveRefreshToken(decoded.userId, refresh);
    return res.json({ accessToken: access, refreshToken: refresh });
  } catch { return res.status(401).json({ error: "Invalid refresh token" }); }
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
router.post("/logout", authenticate, async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await db.query("DELETE FROM refresh_tokens WHERE token=$1", [refreshToken]);
  return res.json({ message: "Logged out" });
});

// ─── GET ME ───────────────────────────────────────────────────────────────────
router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));

// ─── UPDATE LOCATION ──────────────────────────────────────────────────────────
router.put("/location", authenticate, async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: "lat and lng required" });
  try {
    await db.query("UPDATE users SET lat=$1, lng=$2 WHERE id=$3", [lat, lng, req.user.id]);
    return res.json({ message: "Location updated" });
  } catch { return res.status(500).json({ error: "Failed to update location" }); }
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
router.put("/me", authenticate,
  [body("name").optional().trim().notEmpty(), body("bio").optional().trim(), body("industry").optional().trim()],
  async (req, res) => {
    const { name, phone, bio, industry } = req.body;
    try {
      const { rows } = await db.query(
        `UPDATE users SET
          name=COALESCE($1,name), phone=COALESCE($2,phone),
          bio=COALESCE($3,bio), industry=COALESCE($4,industry)
         WHERE id=$5 RETURNING id,name,email,phone,industry,bio,verification_type,verification_status,lat,lng,city`,
        [name, phone, bio, industry, req.user.id]
      );
      return res.json({ user: rows[0] });
    } catch { return res.status(500).json({ error: "Update failed" }); }
  }
);

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
router.put("/change-password", authenticate,
  [body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 8 })],
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
      const { rows } = await db.query("SELECT password_hash FROM users WHERE id=$1", [req.user.id]);
      const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!match) return res.status(400).json({ error: "Current password is incorrect" });
      const hash = await bcrypt.hash(newPassword, 12);
      await db.query("UPDATE users SET password_hash=$1 WHERE id=$2", [hash, req.user.id]);
      await db.query("DELETE FROM refresh_tokens WHERE user_id=$1", [req.user.id]);
      return res.json({ message: "Password changed. Please log in again." });
    } catch { return res.status(500).json({ error: "Password change failed" }); }
  }
);

module.exports = router;

// ─── SAVE ONBOARDING ──────────────────────────────────────────────────────────
router.put("/onboarding", authenticate, async (req, res) => {
  const {
    founderName,
    lookingFor,
    businessGoal,
    companySize,
    revenueRange,
    businessInterests,
    yearFounded,

    companyName,
    headline,
    companyLogo,
    profilePhoto
  } = req.body;

  try {
    const shareSlug =
      companyName
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      req.user.id.slice(0, 6);

    await db.query(
      `UPDATE users SET
        founder_name=$1,
        looking_for=$2,
        business_goal=$3,
        company_size=$4,
        revenue_range=$5,
        business_interests=$6,
        year_founded=$7,

        company_name=$8,
        headline=$9,
        company_logo=$10,
        profile_photo=$11,
        share_slug=$12,

        onboarding_done=true

       WHERE id=$13`,
      [
        founderName || null,
        lookingFor || [],
        businessGoal || null,
        companySize || null,
        revenueRange || null,
        businessInterests || [],
        yearFounded || null,

        companyName || null,
        headline || "I'm a Member of BSquare",
        companyLogo || null,
        profilePhoto || null,
        shareSlug,

        req.user.id
      ]
    );

    return res.json({
      message: "Profile updated",
      onboardingDone: true
    });
  } catch (err) {
    console.error("Onboarding error:", err.message);
    return res.status(500).json({
      error: "Failed to save onboarding"
    });
  }
}); 

router.put("/profile-card", authenticate, async (req, res) => {
  const {
    companyName,
    headline,
    companyLogo,
    profilePhoto
  } = req.body;

  try {
    await db.query(
      `UPDATE users
       SET company_name=$1,
           headline=$2,
           company_logo=$3,
           profile_photo=$4
       WHERE id=$5`,
      [
        companyName || null,
        headline || null,
        companyLogo || null,
        profilePhoto || null,
        req.user.id
      ]
    );

    return res.json({
      message: "Business card updated"
    });

  } catch (err) {
    console.error("Profile card error:", err.message);

    return res.status(500).json({
      error: "Failed to update business card"
    });
  }
});
