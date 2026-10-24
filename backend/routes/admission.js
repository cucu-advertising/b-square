const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { evaluateAdmission } = require('../services/admission');
// A submitted URL, email address or registry number is not identity verification.
router.post('/evaluate', (req, res) => {
  const roleTitle = typeof req.body?.roleTitle === 'string' ? req.body.roleTitle.trim() : '';
  if (!roleTitle) return res.status(400).json({ error: 'Role title is required' });
  const estimate = evaluateAdmission({ roleTitle, companyWebsite: req.body?.companyWebsite || '', profileComplete: true });
  res.json({ ...estimate, status: 'manual_review', reasons: ['Independent identity and business review required'] });
});
router.put('/me', authenticate, async (req, res) => {
  const { roleTitle, workEmail, companyWebsite, registrationNumber, referralCode } = req.body || {};
  if (typeof roleTitle !== 'string' || !roleTitle.trim() || roleTitle.length > 200) return res.status(400).json({ error: 'Valid role title is required' });
  const score = evaluateAdmission({ roleTitle, companyWebsite, profileComplete: true }).score;
  try {
    const { rows } = await db.query(`UPDATE users SET role_title=$1, work_email=$2, company_website=$3, registration_number=$4, referral_code=$5, admission_score=$6, admission_status='manual_review', verification_status='pending' WHERE id=$7 RETURNING id,admission_status,verification_status`, [roleTitle.trim(), workEmail?.trim() || null, companyWebsite?.trim() || null, registrationNumber?.trim() || null, referralCode?.trim() || null, score, req.user.id]);
    res.json({ admission: { score, status: 'manual_review', reasons: ['Awaiting independent review'] }, user: rows[0] });
  } catch (e) { console.error('Admission error:', e.message); res.status(500).json({ error: 'Unable to save admission request' }); }
});
module.exports = router;
