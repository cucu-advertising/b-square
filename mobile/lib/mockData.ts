export type Business = {
  id: string;
  name: string;
  role: string;
  company: string;
  industry: string;
  distanceKm: number;
  founded: number;
  teamSize: string;
  lookingFor: string;
  canOffer: string;
  initials: string;
};

export const BUSINESSES: Business[] = [
  {
    id: 'kavya-reddy',
    name: 'Kavya Reddy',
    role: 'Founder, Reddy Interiors',
    company: 'Reddy Interiors',
    industry: 'Interior Design',
    distanceKm: 0.4,
    founded: 2019,
    teamSize: '4–10',
    lookingFor: 'Contractors / vendors for 3 upcoming projects',
    canOffer: 'Design consults, referral leads',
    initials: 'KR',
  },
  {
    id: 'arjun-mehta',
    name: 'Arjun Mehta',
    role: 'Co-founder, Spice Route Foods',
    company: 'Spice Route Foods',
    industry: 'F&B',
    distanceKm: 1.2,
    founded: 2021,
    teamSize: '11–25',
    lookingFor: 'Packaging designer',
    canOffer: 'Wholesale deals, pop-up kitchen space',
    initials: 'AM',
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    role: 'CEO, Loom & Thread',
    company: 'Loom & Thread',
    industry: 'Fashion',
    distanceKm: 2.1,
    founded: 2017,
    teamSize: '4–10',
    lookingFor: 'Performance marketer',
    canOffer: 'Styling collabs, influencer contacts',
    initials: 'PN',
  },
];

export type ConnectionRequest = {
  id: string;
  name: string;
  role: string;
  company: string;
  message: string;
  initials: string;
};

export const REQUESTS: ConnectionRequest[] = [
  {
    id: 'rohan-sharma',
    name: 'Rohan Sharma',
    role: 'Founder',
    company: 'PixelWorks Studio',
    message: 'Loved your recent project — would love to collaborate on a rebrand.',
    initials: 'RS',
  },
  {
    id: 'meera-varma',
    name: 'Meera Varma',
    role: 'Owner',
    company: 'Sprout Cafe',
    message: 'We are looking for local vendors — think we could work well together.',
    initials: 'MV',
  },
  {
    id: 'sameer-khan',
    name: 'Sameer Khan',
    role: 'Director',
    company: 'KRN Fabrication',
    message: 'Saw your profile nearby — keen to explore a supply partnership.',
    initials: 'SK',
  },
];

export type ChatPreview = {
  id: string;
  name: string;
  initials: string;
  online: boolean;
  timestamp: string;
  lastMessage: string;
  unread: number;
};

export const CHATS: ChatPreview[] = [
  {
    id: 'kavya-reddy',
    name: 'Kavya Reddy',
    initials: 'KR',
    online: true,
    timestamp: '09:41',
    lastMessage: 'Sounds great, let\u2019s set up a call this week to discuss the vendor list.',
    unread: 2,
  },
  {
    id: 'arjun-mehta',
    name: 'Arjun Mehta',
    initials: 'AM',
    online: false,
    timestamp: 'Yesterday',
    lastMessage: 'Thanks for the intro! Sending over our wholesale catalogue now.',
    unread: 0,
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    initials: 'PN',
    online: true,
    timestamp: 'Mon',
    lastMessage: 'Can you share the influencer contacts you mentioned?',
    unread: 1,
  },
];

export type SelfProfile = {
  name: string;
  role: string;
  company: string;
  connections: number;
  introsMade: number;
  trustScore: number;
  initials: string;
};

export const SELF_PROFILE: SelfProfile = {
  name: 'Arvind Rao',
  role: 'Founder',
  company: 'Cucu Advertising',
  connections: 128,
  introsMade: 9,
  trustScore: 4.9,
  initials: 'AR',
};

export const INDUSTRIES = ['Marketing', 'Real Estate', 'F&B', 'Fashion', 'D2C'];
