const PRODUCTS = {
  student: [
    {
      id: 'student-savings',
      name: 'SBI Student Savings Account',
      type: 'account',
      icon: '🎓',
      description: 'Zero-balance account built for students with digital-first features',
      features: ['Zero minimum balance', 'Free RuPay debit card', 'UPI & YONO access', 'Mobile banking 24/7'],
      highlight: '2.70% p.a. interest',
      tag: 'Most Popular',
      tagColor: 'indigo',
      suitabilityScore: 98,
    },
    {
      id: 'education-loan',
      name: 'SBI Education Loan',
      type: 'loan',
      icon: '📚',
      description: 'Finance your dreams — study in India or abroad with flexible repayment',
      features: ['Up to ₹1.5 Cr for abroad', 'No collateral up to ₹7.5L', 'Tax benefit under 80E', 'Repayment after course'],
      highlight: 'From 8.15% p.a.',
      tag: 'Best Value',
      tagColor: 'emerald',
      suitabilityScore: 92,
    },
    {
      id: 'yono-digital',
      name: 'YONO Digital Banking Suite',
      type: 'digital',
      icon: '📱',
      description: 'India\'s most powerful banking super-app — all services in one place',
      features: ['UPI payments', 'Cardless ATM withdrawals', 'Investment platform', 'Shopping & travel'],
      highlight: 'Free with account',
      tag: 'Free',
      tagColor: 'purple',
      suitabilityScore: 95,
    },
  ],
  salaried: [
    {
      id: 'salary-account',
      name: 'SBI Salary Account',
      type: 'account',
      icon: '💼',
      description: 'Premium account with exclusive salary benefits and insurance cover',
      features: ['Zero balance requirement', '₹20L accident insurance', 'Premium debit card', 'Overdraft up to 2x salary'],
      highlight: '2.70% p.a. + perks',
      tag: 'Recommended',
      tagColor: 'indigo',
      suitabilityScore: 99,
    },
    {
      id: 'fixed-deposit',
      name: 'SBI Fixed Deposit',
      type: 'investment',
      icon: '📈',
      description: 'Grow your savings with guaranteed, high-yield fixed returns',
      features: ['Up to 7.10% interest', 'Flexible 7 days–10 years', 'Loan against FD', 'Auto-renewal option'],
      highlight: 'Up to 7.10% p.a.',
      tag: 'High Returns',
      tagColor: 'emerald',
      suitabilityScore: 90,
    },
    {
      id: 'simply-click-card',
      name: 'SBI SimplyCLICK Credit Card',
      type: 'card',
      icon: '💳',
      description: 'Earn rewards on every purchase — online shopping, dining, and more',
      features: ['10x points on Amazon', 'Annual fee waiver on ₹1L spend', 'Movie discounts', 'Fuel surcharge waiver'],
      highlight: '10x Reward Points',
      tag: 'Best Rewards',
      tagColor: 'amber',
      suitabilityScore: 87,
    },
  ],
  business: [
    {
      id: 'current-account',
      name: 'SBI Business Current Account',
      type: 'account',
      icon: '🏢',
      description: 'High-velocity account built for the speed of your business',
      features: ['High transaction limits', 'Free 100 NEFT/RTGS/month', 'Dedicated relationship manager', 'Trade finance access'],
      highlight: 'Tailored for business',
      tag: 'Business Essential',
      tagColor: 'indigo',
      suitabilityScore: 98,
    },
    {
      id: 'business-loan',
      name: 'SBI Business Loan',
      type: 'loan',
      icon: '💰',
      description: 'Fuel your business growth with fast, flexible working capital',
      features: ['Up to ₹5 Crore', 'Minimal documentation', 'Quick 3-day disbursement', 'Flexible EMI options'],
      highlight: 'From 10.20% p.a.',
      tag: 'Fast Approval',
      tagColor: 'emerald',
      suitabilityScore: 93,
    },
    {
      id: 'merchant-services',
      name: 'SBI Merchant Payment Suite',
      type: 'payment',
      icon: '🏪',
      description: 'Accept payments everywhere — POS, QR, online, and UPI',
      features: ['POS & QR code payments', 'Next-day settlements', 'SBI ePay gateway', 'Dedicated merchant helpline'],
      highlight: 'Zero setup fee',
      tag: '0% Setup Fee',
      tagColor: 'purple',
      suitabilityScore: 91,
    },
  ],
};

export function getRecommendations(category) {
  return PRODUCTS[category] || PRODUCTS.salaried;
}

export function categorizeProfile(profile) {
  const { age, occupation, category } = profile;
  if (category) return category;

  const occ = (occupation || '').toLowerCase();
  if (
    occ.includes('student') ||
    occ.includes('college') ||
    occ.includes('university') ||
    (age && age < 24 && !occ.includes('engineer') && !occ.includes('doctor'))
  ) return 'student';

  if (
    occ.includes('business') ||
    occ.includes('entrepreneur') ||
    occ.includes('owner') ||
    occ.includes('self') ||
    occ.includes('freelance') ||
    occ.includes('consultant')
  ) return 'business';

  return 'salaried';
}
