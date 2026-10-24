const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const db = require("../db");
const { authenticate } = require("../middleware/auth");
const { evaluateAdmission } = require("../services/admission");

router.post(
  "/evaluate",
  [
    body("roleTitle").trim().notEmpty().withMessage("Current role is required"),
    body("verificationMethod")
      .isIn(["linkedin", "work_email", "registry", "referral"])
      .withMessage("Invalid verification method"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const {
      roleTitle,
      verificationMethod,
      linkedinUrl,
      workEmail,
      companyWebsite,
    } = req.body;

    const result = evaluateAdmission({
      roleTitle,
      linkedinVerified:
        verificationMethod === "linkedin" &&
        typeof linkedinUrl === "string" &&
        linkedinUrl.toLowerCase().includes("linkedin.com/"),
      workEmailVerified:
        verificationMethod === "work_email" &&
        typeof workEmail === "string" &&
        /@[^@]+\.[^@]+$/.test(workEmail.trim()),
      companyWebsite: companyWebsite?.trim() || null,
      registryVerified: verificationMethod === "registry",
      referralVerified: verificationMethod === "referral",
      profileComplete: true,
    });

    return res.json(result);
  }
);

router.put(
  "/me",
  authenticate,
  [
    body("roleTitle").trim().notEmpty(),
    body("verificationMethod").isIn(["linkedin", "work_email", "registry", "referral"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid admission data" });

    const {
      roleTitle,
      verificationMethod,
      workEmail,
      companyWebsite,
      registrationNumber,
      referralCode,
    } = req.body;

    const result = evaluateAdmission({
      roleTitle,
      linkedinVerified: verificationMethod === "linkedin",
      workEmailVerified:
        verificationMethod === "work_email" &&
        typeof workEmail === "string" &&
        /@[^@]+\.[^@]+$/.test(workEmail.trim()),
      companyWebsite: companyWebsite?.trim() || null,
      registryVerified: verificationMethod === "registry" && Boolean(registrationNumber?.trim()),
      referralVerified: verificationMethod === "referral" && Boolean(referralCode?.trim()),
      profileComplete: true,
    });

    // Self-declared URLs, emails, registry numbers and referrals are NOT proof.
    // Admission must remain pending until an authorized reviewer validates evidence.
    const verificationStatus = "pending";

    try {
      const { rows } = await db.query(
        `UPDATE users
         SET role_title=$1,
             work_email=$2,
             company_website=$3,
             registration_number=$4,
             referral_code=$5,
             admission_score=$6,
             admission_status=$7,
             verification_status=$8
         WHERE id=$9
         RETURNING id, role_title, work_email, company_website,
                   registration_number, referral_code, admission_score,
                   admission_status, verification_status`,
        [
          roleTitle.trim(),
          workEmail?.trim() || null,
          companyWebsite?.trim() || null,
          registrationNumber?.trim() || null,
          referralCode?.trim() || null,
          result.score,
          'manual_review',
          verificationStatus,
          req.user.id,
        ]
      );

      return res.json({ admission: { ...result, status: "manual_review", reasons: [...result.reasons, "Independent review required"] }, user: rows[0] });
    } catch (err) {
      console.error("Admission save error:", err.message);
      return res.status(500).json({ error: "Failed to save admission details" });
    }
  }
);

module.exports = router;
