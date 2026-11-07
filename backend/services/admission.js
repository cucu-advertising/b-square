const LEADERSHIP_PATTERNS = [
  /\bfounder\b/i,
  /\bco[- ]?founder\b/i,
  /\bowner\b/i,
  /\bpartner\b/i,
  /\bchief\b/i,
  /\bceo\b/i,
  /\bcfo\b/i,
  /\bcto\b/i,
  /\bcoo\b/i,
  /\bcmo\b/i,
  /\bmanaging director\b/i,
  /\bdirector\b/i,
  /\bvice president\b/i,
  /\bvp\b/i,
  /\bhead of\b/i,
  /\bpresident\b/i,
  /\binvestor\b/i,
  /\bprincipal\b/i,
];

function isLeadershipRole(title = '') {
  return LEADERSHIP_PATTERNS.some((pattern) => pattern.test(String(title).trim()));
}

function evaluateAdmission(input = {}) {
  let score = 0;
  const reasons = [];

  if (isLeadershipRole(input.roleTitle)) {
    score += 20;
    reasons.push('Leadership role matched');
  }
  if (input.linkedinVerified) {
    score += 15;
    reasons.push('LinkedIn identity verified');
  }
  if (input.workEmailVerified) {
    score += 20;
    reasons.push('Company-domain email verified');
  }
  if (input.companyWebsite) {
    score += 10;
    reasons.push('Company website provided');
  }
  if (input.registryVerified) {
    score += 20;
    reasons.push('Business registry verified');
  }
  if (input.referralVerified) {
    score += 10;
    reasons.push('Verified member referral');
  }
  if (input.profileComplete) {
    score += 5;
    reasons.push('Professional profile complete');
  }

  score = Math.min(score, 100);

  const status = score >= 80 ? 'approved' : score >= 55 ? 'manual_review' : 'more_verification';
  return { score, status, reasons };
}

module.exports = { evaluateAdmission, isLeadershipRole };
