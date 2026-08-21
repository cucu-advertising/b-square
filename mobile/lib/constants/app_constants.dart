class AppConstants {
  static const supportEmail = 'support@bsquare.app';

  static const cities = <String, List<double>>{
    'Hyderabad': [17.385, 78.4867],
    'Mumbai': [19.076, 72.8777],
    'Delhi': [28.6139, 77.209],
    'Bangalore': [12.9716, 77.5946],
    'Chennai': [13.0827, 80.2707],
    'Pune': [18.5204, 73.8567],
    'Ahmedabad': [23.0225, 72.5714],
    'Kolkata': [22.5726, 88.3639],
    'Jaipur': [26.9124, 75.7873],
    'Surat': [21.1702, 72.8311],
  };

  static const industries = [
    'IT Services',
    'Textiles & Garments',
    'Food & Beverages',
    'Pharmaceuticals',
    'Logistics & Transport',
    'Manufacturing',
    'Real Estate',
    'Finance & Banking',
    'Healthcare',
    'Education',
    'Retail & Wholesale',
    'Construction',
    'Agriculture',
    'Chemicals',
    'Automotive',
    'Other',
  ];

  static const connectWith = [
    'Manufacturers',
    'Logistics Firms',
    'Retailers',
    'Tech Companies',
    'Investors',
    'Distributors',
    'Service Providers',
    'Exporters',
    'Importers',
    'Franchises',
    'Government Bodies',
    'Startups',
    'Others',
  ];

  static const interests = [
    'B2B Sales',
    'Digital Transformation',
    'SaaS Partnerships',
    'Tech Outsourcing',
    'Import/Export',
    'Franchise Expansion',
    'Joint Ventures',
    'Product Distribution',
    'Raw Materials',
    'Contract Manufacturing',
    'Financial Services',
    'Marketing & PR',
  ];

  static const companySizes = ['1–10', '11–50', '51–200', '201–500', '500+'];

  static const revenueRanges = [
    'Below ₹50L',
    '₹50L - ₹5Cr',
    '₹5Cr - ₹25Cr',
    '₹25Cr - ₹50Cr',
    '₹50Cr - ₹100Cr',
    'Above ₹100Cr',
  ];

  static const businessGoals = [
    (
      value: 'clients',
      label: 'Find new clients / customers',
      subtitle: 'Expand your customer base',
    ),
    (
      value: 'vendors',
      label: 'Find vendors / suppliers',
      subtitle: 'Source materials or services',
    ),
    (
      value: 'partnership',
      label: 'Form partnerships',
      subtitle: 'Joint ventures and collaborations',
    ),
    (
      value: 'investment',
      label: 'Raise investment / funding',
      subtitle: 'Connect with investors',
    ),
    (
      value: 'distribution',
      label: 'Expand distribution network',
      subtitle: 'Reach new markets',
    ),
    (
      value: 'networking',
      label: 'General networking',
      subtitle: 'Build industry relationships',
    ),
  ];

  static List<String> get foundedYears {
    final currentYear = DateTime.now().year;
    return List.generate(50, (index) => '${currentYear - index}');
  }
}

enum VerificationType { din, linkedin, succession }
