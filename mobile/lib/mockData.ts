export type BusinessProfile = {
  id: string;
  name: string;
  role: string;
  business: string;
  industry: string;
  distanceKm: number;
  founded: number;
  teamSize: string;
  lookingFor: string;
  canOffer: string;
  verified: boolean;
};

export type ConnectionRequest = {
  id: string;
  name: string;
  role: string;
  business: string;
  message: string;
  verified: boolean;
};

export type ChatItem = {
  id: string;
  name: string;
  online: boolean;
  timestamp: string;
  preview: string;
  unread: number;
  verified: boolean;
};

export type SelfProfile = {
  name: string;
  role: string;
  business: string;
  connections: number;
  introsMade: number;
  trustScore: number;
};

export const PROFILES: BusinessProfile[] = [
  {
    id: 'kavya',
    name: 'Kavya Reddy',
    role: 'Founder, Reddy Interiors',
    business: 'Reddy Interiors',
    industry: 'Interior Design',
    distanceKm: 0.4,
    founded: 2019,
    teamSize: '4–10',
    lookingFor: 'Contractors / vendors for 3 active projects',
    canOffer: 'Design consults, referral leads',
    verified: true,
  },
  {
    id: 'arjun',
    name: 'Arjun Mehta',
    role: 'Co-founder, Spice Route Foods',
    business: 'Spice Route Foods',
    industry: 'F&B',
    distanceKm: 1.2,
    founded: 2021,
    teamSize: '11–25',
    lookingFor: 'Packaging designer',
    canOffer: 'Wholesale deals, pop-up kitchen space',
    verified: true,
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    role: 'CEO, Loom & Thread',
    business: 'Loom & Thread',
    industry: 'Fashion',
    distanceKm: 2.1,
    founded: 2017,
    teamSize: '4–10',
    lookingFor: 'Performance marketer',
    canOffer: 'Styling collabs, influencer contacts',
    verified: true,
  },
];

export const INITIAL_REQUESTS: ConnectionRequest[] = [
  {
    id: 'rohan',
    name: 'Rohan Sharma',
    role: 'PixelWorks Studio',
    business: 'PixelWorks Studio',
    message: 'Loved your last campaign — would love to swap notes on retainers.',
    verified: true,
  },
  {
    id: 'meera',
    name: 'Meera Varma',
    role: 'Sprout Cafe',
    business: 'Sprout Cafe',
    message: 'We could co-host a weekend pop-up. Coffee on me?',
    verified: true,
  },
  {
    id: 'sameer',
    name: 'Sameer Khan',
    role: 'KRN Fabrication',
    business: 'KRN Fabrication',
    message: 'Have fabrication capacity if any of your builds need metalwork.',
    verified: false,
  },
];

export const CHATS: ChatItem[] = [
  {
    id: 'kavya',
    name: 'Kavya Reddy',
    online: true,
    timestamp: '09:24',
    preview: 'Perfect, I’ll send the vendor shortlist over tonight.',
    unread: 2,
    verified: true,
  },
  {
    id: 'arjun',
    name: 'Arjun Mehta',
    online: true,
    timestamp: '08:11',
    preview: 'The pop-up kitchen is free next Thursday if you want it.',
    unread: 0,
    verified: true,
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    online: false,
    timestamp: 'Yesterday',
    preview: 'Let’s line up the influencer intros this week.',
    unread: 1,
    verified: true,
  },
  {
    id: 'rohan',
    name: 'Rohan Sharma',
    online: false,
    timestamp: 'Mon',
    preview: 'Sounds good — sending a calendar invite.',
    unread: 0,
    verified: true,
  },
];

export const SELF: SelfProfile = {
  name: 'Arvind Rao',
  role: 'Founder, Cucu Advertising',
  business: 'Cucu Advertising',
  connections: 128,
  introsMade: 9,
  trustScore: 4.9,
};

/** Utility for avatar-initial circles. */
export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
