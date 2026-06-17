// One-time seed script: creates ~8 approved "bot" businesses around Hyderabad
// so you have data to test Nearby cards, the satellite map, connections, and chat.
//
// Usage:
//   cd backend
//   node seed-bots.js
//
// Safe to re-run — uses ON CONFLICT(email) DO NOTHING, so existing bots are skipped.
//
// All bots share the password:  Test@1234

require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");

const PASSWORD = "Test@1234";

// Spread around central Hyderabad (17.385, 78.4867) within ~1-8km
const BOTS = [
  {
    name: "Priya Tech Solutions", email: "priya.tech@bsquare.test",
    phone: "9810000001", industry: "IT Services", city: "Hyderabad",
    lat: 17.4045, lng: 78.4956,
    bio: "Custom software for SMEs — React, Node.js and cloud-native solutions. 40+ clients across India.",
    founder_name: "Priya Sharma", business_goal: "clients",
    looking_for: ["Tech Companies", "Startups", "Investors"],
    business_interests: ["B2B Sales", "SaaS Partnerships", "Tech Outsourcing"],
    company_size: "11-50", revenue_range: "₹1-5Cr", year_founded: "2017",
    verification_type: "din", din_number: "10000001", din_director_name: "Priya Sharma",
  },
  {
    name: "Arjun Foods & Co.", email: "arjun.foods@bsquare.test",
    phone: "9810000002", industry: "Food & Beverages", city: "Hyderabad",
    lat: 17.4239, lng: 78.4738,
    bio: "Wholesale snacks & packaged foods distributor serving Telangana retailers since 2012.",
    founder_name: "Arjun Reddy", business_goal: "distribution",
    looking_for: ["Retailers", "Distributors", "Exporters"],
    business_interests: ["Product Distribution", "Import/Export"],
    company_size: "51-200", revenue_range: "₹5-20Cr", year_founded: "2012",
    verification_type: "din", din_number: "10000002", din_director_name: "Arjun Reddy",
  },
  {
    name: "Sai Logistics", email: "sai.logistics@bsquare.test",
    phone: "9810000003", industry: "Logistics & Transport", city: "Hyderabad",
    lat: 17.3398, lng: 78.5210,
    bio: "Fleet of 60+ vehicles covering last-mile and intercity freight across South India.",
    founder_name: "Sai Kumar", business_goal: "partnership",
    looking_for: ["Manufacturers", "Retailers", "Exporters"],
    business_interests: ["B2B Sales", "Joint Ventures"],
    company_size: "51-200", revenue_range: "₹5-20Cr", year_founded: "2009",
    verification_type: "linkedin", linkedin_url: "https://linkedin.com/in/saikumar-logistics",
  },
  {
    name: "Kumar Pharma", email: "kumar.pharma@bsquare.test",
    phone: "9810000004", industry: "Pharmaceuticals", city: "Hyderabad",
    lat: 17.3326, lng: 78.4458,
    bio: "Licensed pharmaceutical distributor — generics, OTC and specialty medicines.",
    founder_name: "Kiran Kumar", business_goal: "vendors",
    looking_for: ["Manufacturers", "Distributors", "Government Bodies"],
    business_interests: ["Raw Materials", "Contract Manufacturing"],
    company_size: "11-50", revenue_range: "₹1-5Cr", year_founded: "2015",
    verification_type: "din", din_number: "10000004", din_director_name: "Kiran Kumar",
  },
  {
    name: "Meena Textiles", email: "meena.textiles@bsquare.test",
    phone: "9810000005", industry: "Textiles & Garments", city: "Hyderabad",
    lat: 17.4480, lng: 78.5050,
    bio: "Cotton & linen fabric manufacturing with an in-house export desk.",
    founder_name: "Meena Iyer", business_goal: "distribution",
    looking_for: ["Exporters", "Retailers", "Franchises"],
    business_interests: ["Import/Export", "Franchise Expansion"],
    company_size: "201-500", revenue_range: "₹20Cr+", year_founded: "2005",
    verification_type: "linkedin", linkedin_url: "https://linkedin.com/in/meenaiyer-textiles",
  },
  {
    name: "Sharma Realty", email: "sharma.realty@bsquare.test",
    phone: "9810000006", industry: "Real Estate", city: "Hyderabad",
    lat: 17.3145, lng: 78.4623,
    bio: "Commercial & residential real estate brokerage operating across HITEC City and Gachibowli.",
    founder_name: "Rohan Sharma", business_goal: "investment",
    looking_for: ["Investors", "Service Providers"],
    business_interests: ["Financial Services", "Marketing & PR"],
    company_size: "1-10", revenue_range: "₹50L-1Cr", year_founded: "2019",
    verification_type: "din", din_number: "10000006", din_director_name: "Rohan Sharma",
  },
  {
    name: "Reddy Manufacturing", email: "reddy.mfg@bsquare.test",
    phone: "9810000007", industry: "Manufacturing", city: "Hyderabad",
    lat: 17.4380, lng: 78.4450,
    bio: "Precision sheet-metal and CNC machined components for automotive & industrial clients.",
    founder_name: "Lakshmi Reddy", business_goal: "clients",
    looking_for: ["Manufacturers", "Tech Companies", "Exporters"],
    business_interests: ["Contract Manufacturing", "B2B Sales"],
    company_size: "51-200", revenue_range: "₹5-20Cr", year_founded: "2011",
    verification_type: "din", din_number: "10000007", din_director_name: "Lakshmi Reddy",
  },
  {
    name: "Verma Finance", email: "verma.finance@bsquare.test",
    phone: "9810000008", industry: "Finance & Banking", city: "Hyderabad",
    lat: 17.3654, lng: 78.5380,
    bio: "Boutique advisory for SME loans, working-capital lines and early-stage funding.",
    founder_name: "Anjali Verma", business_goal: "networking",
    looking_for: ["Startups", "Investors", "Service Providers"],
    business_interests: ["Financial Services", "Joint Ventures"],
    company_size: "1-10", revenue_range: "₹50L-1Cr", year_founded: "2021",
    verification_type: "linkedin", linkedin_url: "https://linkedin.com/in/anjaliverma-finance",
  },
];

(async () => {
  console.log("Seeding bot businesses...\n");
  const hash = await bcrypt.hash(PASSWORD, 12);

  for (const b of BOTS) {
    try {
      const result = await db.query(
        `INSERT INTO users (
          name, email, password_hash, phone, industry, bio,
          verification_type, verification_status,
          din_number, din_director_name, linkedin_url,
          lat, lng, city, is_active, onboarding_done,
          founder_name, looking_for, business_goal, company_size,
          revenue_range, business_interests, year_founded
        ) VALUES (
          $1,$2,$3,$4,$5,$6,
          $7,'approved',
          $8,$9,$10,
          $11,$12,$13, true, true,
          $14,$15,$16,$17,
          $18,$19,$20
        )
        ON CONFLICT (email) DO NOTHING
        RETURNING id`,
        [
          b.name, b.email, hash, b.phone, b.industry, b.bio,
          b.verification_type,
          b.din_number || null, b.din_director_name || null, b.linkedin_url || null,
          b.lat, b.lng, b.city,
          b.founder_name, b.looking_for, b.business_goal, b.company_size,
          b.revenue_range, b.business_interests, b.year_founded,
        ]
      );
      if (result.rows[0]) console.log(`  ✅ Created: ${b.name}  (${b.email})`);
      else console.log(`  ⏭  Skipped (already exists): ${b.email}`);
    } catch (err) {
      console.error(`  ❌ ${b.email}:`, err.message);
    }
  }

  console.log("\nDone! All bots use password:  " + PASSWORD);
  console.log("They are pre-approved and pre-onboarded — log in as any of them to test from the other side.\n");
  process.exit(0);
})();
