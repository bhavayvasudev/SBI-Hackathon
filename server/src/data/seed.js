import OnboardingRecord from '../models/OnboardingRecord.js';

const demoNames = [
  { name: 'Arjun Sharma', category: 'student', occupation: 'Student', income: 'Below ₹25,000', goals: 'Education savings' },
  { name: 'Priya Nair', category: 'salaried', occupation: 'Software Engineer', income: '₹50,000 - ₹1 Lakh', goals: 'Investment & FD' },
  { name: 'Ravi Mehta', category: 'business', occupation: 'Business Owner', income: 'Above ₹1 Lakh', goals: 'Business growth' },
  { name: 'Sneha Patel', category: 'salaried', occupation: 'Teacher', income: '₹25,000 - ₹50,000', goals: 'Emergency fund' },
  { name: 'Vikram Singh', category: 'business', occupation: 'Entrepreneur', income: 'Above ₹1 Lakh', goals: 'Business expansion' },
  { name: 'Anjali Reddy', category: 'student', occupation: 'College Student', income: 'Below ₹25,000', goals: 'Education loan' },
  { name: 'Karan Malhotra', category: 'salaried', occupation: 'Marketing Manager', income: '₹50,000 - ₹1 Lakh', goals: 'Home loan' },
  { name: 'Deepika Iyer', category: 'salaried', occupation: 'Doctor', income: 'Above ₹1 Lakh', goals: 'Investment' },
  { name: 'Rohit Gupta', category: 'business', occupation: 'Retailer', income: '₹25,000 - ₹50,000', goals: 'Working capital' },
  { name: 'Meera Joshi', category: 'student', occupation: 'Postgraduate Student', income: 'Below ₹25,000', goals: 'Savings' },
  { name: 'Aditya Kumar', category: 'salaried', occupation: 'Civil Engineer', income: '₹25,000 - ₹50,000', goals: 'Home loan' },
  { name: 'Pooja Bansal', category: 'salaried', occupation: 'HR Manager', income: '₹50,000 - ₹1 Lakh', goals: 'Investment' },
  { name: 'Suresh Tiwari', category: 'business', occupation: 'CA & Consultant', income: 'Above ₹1 Lakh', goals: 'Tax savings' },
  { name: 'Nisha Verma', category: 'student', occupation: 'Engineering Student', income: 'Below ₹25,000', goals: 'Education' },
  { name: 'Anand Pillai', category: 'salaried', occupation: 'Banker', income: '₹50,000 - ₹1 Lakh', goals: 'Retirement planning' },
];

const productMap = {
  student: ['SBI Student Savings Account', 'SBI Education Loan', 'YONO Digital Banking'],
  salaried: ['SBI Salary Account', 'SBI Fixed Deposit', 'SBI SimplyCLICK Credit Card'],
  business: ['SBI Current Account', 'SBI Business Loan', 'SBI Merchant Services'],
};

function randomAccountNumber() {
  return '3' + Math.floor(Math.random() * 9e11 + 1e11).toString().slice(0, 11);
}

function randomCustomerId() {
  return 'SBI' + Math.floor(Math.random() * 9e6 + 1e6);
}

function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d;
}

export async function seedAnalytics() {
  const count = await OnboardingRecord.countDocuments();
  if (count > 0) return;

  console.log('🌱 Seeding demo analytics data...');

  const records = demoNames.map((d, i) => ({
    sessionId: `demo-seed-${i}`,
    accountNumber: randomAccountNumber(),
    customerId: randomCustomerId(),
    ifscCode: 'SBIN0001234',
    branchName: 'HyperOne Digital Branch',
    profile: { name: d.name, age: 18 + Math.floor(Math.random() * 40), ...d },
    kycDocuments: { panVerified: true, aadhaarVerified: true, panNumber: `ABCDE${1000 + i}F`, aadhaarNumber: `XXXX-XXXX-${1000 + i}` },
    recommendedProducts: productMap[d.category],
    status: 'account_created',
    onboardingTime: 120 + Math.floor(Math.random() * 240),
    completedAt: randomDate(30),
  }));

  await OnboardingRecord.insertMany(records);
  console.log(`✅ Seeded ${records.length} demo onboarding records.`);
}
