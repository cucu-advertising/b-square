export type AdmissionStatus = 'approved' | 'manual_review' | 'more_verification';

export type AdmissionInput = {
  roleTitle: string;
  linkedInVerified?: boolean;
  workEmailVerified?: boolean;
  companyWebsite?: string;
  businessRegistryVerified?: boolean;
  memberReferralVerified?: boolean;
  profileComplete?: boolean;
};

export type AdmissionResult = {
  score: number;
  status: AdmissionStatus;
  reasons: string[];
};

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

export function isLeadershipRole(roleTitle: string) {
  return LEADERSHIP_PATTERNS.some((pattern) => pattern.test(roleTitle.trim()));
}

export function evaluateAdmission(input: AdmissionInput): AdmissionResult {
  let score = 0;
  const reasons: string[] = [];

  if (isLeadershipRole(input.roleTitle)) {
    score += 20;
    reasons.push('Leadership role matched');
  }

  if (input.linkedInVerified) {
    score += 15;
    reasons.push('LinkedIn identity verified');
  }

  if (input.workEmailVerified) {
    score += 20;
    reasons.push('Company-domain email verified');
  }

  if (input.companyWebsite?.trim()) {
    score += 10;
    reasons.push('Company website provided');
  }

  if (input.businessRegistryVerified) {
    score += 20;
    reasons.push('Business registry verified');
  }

  if (input.memberReferralVerified) {
    score += 10;
    reasons.push('Verified member referral');
  }

  if (input.profileComplete) {
    score += 5;
    reasons.push('Professional profile complete');
  }

  const capped = Math.min(score, 100);

  if (capped >= 80) return { score: capped, status: 'approved', reasons };
  if (capped >= 55) return { score: capped, status: 'manual_review', reasons };
  return { score: capped, status: 'more_verification', reasons };
}
