export type BusinessProfile = {
  id: string;
  name: string;
  role: string;
  business: string;
  industry: string;
  distance: string;
  founded: string;
  teamSize: string;
  lookingFor: string;
  canOffer: string;
  initials: string;
};

export const NEARBY_BUSINESSES: BusinessProfile[] = [
  {
    id: 'kavya-reddy',
    name: 'Kavya Reddy',
    role: 'Founder',
    business: 'Reddy Interiors',
    industry: 'Interior Design',
    distance: '0.4 km',
    founded: '2019',
    teamSize: '4–10',
    lookingFor: 'Contractors and vendors for 3 upcoming residential projects',
    canOffer: 'Design consults, referral leads to premium clients',
    initials: 'KR',
  },
  {
    id: 'arjun-mehta',
    name: 'Arjun Mehta',
    role: 'Co-founder',
    business: 'Spice Route Foods',
    industry: 'F&B',
    distance: '1.2 km',
    founded: '2021',
    teamSize: '11–25',
    lookingFor: 'Packaging designer for new product line',
    canOffer: 'Wholesale deals, pop-up kitchen space in Secunderabad',
    initials: 'AM',
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    role: 'CEO',
    business: 'Loom & Thread',
    industry: 'Fashion',
    distance: '2.1 km',
    founded: '2017',
    teamSize: '4–10',
    lookingFor: 'Performance marketer for D2C growth',
    canOffer: 'Styling collabs, influencer contacts in South India',
    initials: 'PN',
  },
];

export type ConnectionRequest = {
  id: string;
  name: string;
  role: string;
  business: string;
  message: string;
  initials: string;
};

export const INITIAL_REQUESTS: ConnectionRequest[] = [
  {
    id: 'rohan-sharma',
    name: 'Rohan Sharma',
    role: 'Creative Director',
    business: 'PixelWorks Studio',
    message: 'Love your portfolio — would love to explore a collab on our next brand launch.',
    initials: 'RS',
  },
  {
    id: 'meera-varma',
    name: 'Meera Varma',
    role: 'Founder',
    business: 'Sprout Cafe',
    message: 'We host monthly founder breakfasts — would be great to have you join.',
    initials: 'MV',
  },
  {
    id: 'sameer-khan',
    name: 'Sameer Khan',
    role: 'Managing Partner',
    business: 'KRN Fabrication',
    message: 'Looking for a creative agency partner for our industrial rebrand.',
    initials: 'SK',
  },
];

export type ChatPreview = {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
};

export const CHAT_PREVIEWS: ChatPreview[] = [
  {
    id: 'chat-1',
    name: 'Kavya Reddy',
    initials: 'KR',
    lastMessage: 'Sounds great — let me share the project brief.',
    timestamp: '2:14 PM',
    unread: 2,
    online: true,
  },
  {
    id: 'chat-2',
    name: 'Arjun Mehta',
    initials: 'AM',
    lastMessage: 'Can we schedule a tasting session next week?',
    timestamp: '11:30 AM',
    unread: 0,
    online: true,
  },
  {
    id: 'chat-3',
    name: 'Priya Nair',
    initials: 'PN',
    lastMessage: 'Thanks for the intro to your stylist contact!',
    timestamp: 'Yesterday',
    unread: 0,
    online: false,
  },
  {
    id: 'chat-4',
    name: 'Rohan Sharma',
    initials: 'RS',
    lastMessage: 'Sent over the mood board — let me know your thoughts.',
    timestamp: 'Mon',
    unread: 1,
    online: false,
  },
];

export const SELF_PROFILE = {
  name: 'Arvind Rao',
  role: 'Founder',
  business: 'Cucu Advertising',
  initials: 'AR',
  connections: 128,
  introsMade: 9,
  trustScore: 4.9,
  networkingRadius: '5 km',
  activeHours: '9 AM – 7 PM',
};

export const INDUSTRIES = ['Marketing', 'Real Estate', 'F&B', 'Fashion', 'D2C'] as const;

export const LOCATION_LABEL = 'SECUNDERABAD';
export const NEARBY_COUNT_TODAY = 14;
