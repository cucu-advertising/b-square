const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !/^Bearer\s+\S+$/.test(header)) return res.status(401).json({ error: 'Missing authentication token' });
  try {
    const { userId } = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const { rows } = await db.query(`SELECT id, name, email, phone, industry, bio,
      company_name, headline, company_logo, profile_photo, share_slug, verification_type,
      verification_status, verification_notes, role_title, is_admin, lat, lng, city,
      is_active, onboarding_done, founder_name, looking_for, business_goal,
      company_size, revenue_range, business_interests, year_founded FROM users WHERE id=$1`, [userId]);
    const user = rows[0];
    if (!user || !user.is_active) return res.status(401).json({ error: 'Session no longer valid' });
    if (!user.is_admin && user.verification_status !== 'approved') return res.status(403).json({ error: 'Membership is not approved', code: 'PENDING_REVIEW' });
    req.user = user; next();
  } catch (e) { return res.status(401).json({ error: e.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid authentication token', code: e.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : undefined }); }
};
const requireAdmin = (req,res,next) => req.user?.is_admin ? next() : res.status(403).json({ error: 'Admin access required' });
module.exports = { authenticate, requireAdmin };
