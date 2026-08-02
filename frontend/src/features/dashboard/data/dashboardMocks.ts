export const MOCK_FINANCIAL_TRENDS = [
  { month: 'Jan', collected: 125000, projected: 140000 },
  { month: 'Feb', collected: 138000, projected: 140000 },
  { month: 'Mar', collected: 155000, projected: 150000 },
  { month: 'Apr', collected: 142000, projected: 160000 },
  { month: 'May', collected: 168000, projected: 165000 },
  { month: 'Jun', collected: 185000, projected: 180000 },
];

export const MOCK_ACADEMIC_STATS = [
  { subject: 'Mathematics', average: 78, passRate: 94 },
  { subject: 'Science', average: 82, passRate: 97 },
  { subject: 'English', average: 85, passRate: 99 },
  { subject: 'Social Studies', average: 80, passRate: 96 },
  { subject: 'Computer Science', average: 88, passRate: 100 },
];

export const MOCK_LEAVE_REQUESTS = [
  { id: 'LV-101', name: 'Robert Vance', role: 'Teacher (Math)', type: 'Sick Leave', duration: '2 Days (Jun 8-9)', reason: 'Dental surgery appointment', docAttached: true },
  { id: 'LV-102', name: 'Janice Geller', role: 'Staff (Admins)', type: 'Casual Leave', duration: '1 Day (Jun 12)', reason: 'Family engagement ceremony', docAttached: false },
  { id: 'LV-103', name: 'Dr. Sarah Jenkins', role: 'Teacher (Biology)', type: 'Sick Leave', duration: '3 Days (Jun 15-17)', reason: 'Severe throat inflammation', docAttached: true },
];

export const MOCK_WAIVER_REQUESTS = [
  { id: 'WV-501', student: 'Ryan Cook', grade: 'Grade 9-A', request: '50% Waiver', type: 'Need-based Scholarship', annualIncome: '$32,000', rationale: 'Single-parent household with medical expenses' },
  { id: 'WV-502', student: 'Emma Watson', grade: 'Grade 10-C', request: '100% Waiver', type: 'Merit-based Excellence', annualIncome: '$75,000', rationale: 'National Mathematical Olympiad Gold Medalist' },
];

export const MOCK_ADMISSION_APPLICATIONS = [
  { id: 'AD-901', name: 'Tyler Durden', grade: 'Grade 11-B', score: '92%', status: 'Document Verified' },
  { id: 'AD-902', name: 'Marla Singer', grade: 'Grade 9-A', score: '88%', status: 'Interview Scheduled' },
  { id: 'AD-903', name: 'Robert Paulson', grade: 'Grade 12-A', score: '74%', status: 'Under Review' },
];

export const MOCK_CORRECTIONS = [
  { id: 'CR-301', name: 'Leo Rivera', class: 'Grade 6-B', field: 'Attendance Correction', original: 'Absent (Jun 4)', correction: 'Present', reason: 'Field trip attendance delay' },
  { id: 'CR-302', name: 'David Miller', class: 'Grade 8-A', field: 'Mark correction (Quiz 2)', original: '14/20', correction: '18/20', reason: 'Recount error in laboratory report marks' },
];

export const MOCK_PLATFORM_REVENUE = [
  { month: 'Jan', mrr: 45000, arr: 540000 },
  { month: 'Feb', mrr: 52000, arr: 624000 },
  { month: 'Mar', mrr: 68000, arr: 816000 },
  { month: 'Apr', mrr: 75000, arr: 900000 },
  { month: 'May', mrr: 86000, arr: 1032000 },
  { month: 'Jun', mrr: 98000, arr: 1176000 },
];

export const MOCK_INFRA_METRICS = [
  { time: '10:00', cpu: 32, memory: 58, network: 120 },
  { time: '10:05', cpu: 45, memory: 59, network: 145 },
  { time: '10:10', cpu: 78, memory: 62, network: 280 },
  { time: '10:15', cpu: 55, memory: 61, network: 190 },
  { time: '10:20', cpu: 42, memory: 60, network: 165 },
  { time: '10:25', cpu: 38, memory: 60, network: 130 },
];

export const MOCK_SCHOOLS = [
  { id: 'SCH-001', name: 'Hogwarts Magic Academy', domain: 'hogwarts.edtech.com', plan: 'Enterprise', users: 1240, storage: '184 GB', status: 'Active', health: 'Healthy' },
  { id: 'SCH-002', name: 'Xavier Mutant School', domain: 'xmansion.org', plan: 'Premium', users: 380, storage: '45 GB', status: 'Active', health: 'Healthy' },
  { id: 'SCH-003', name: 'Springfield Elementary', domain: 'springfield.edtech.com', plan: 'Standard', users: 850, storage: '92 GB', status: 'Trial', health: 'Warning' },
  { id: 'SCH-004', name: 'Sunnydale High School', domain: 'sunnydale.edtech.com', plan: 'Standard', users: 140, storage: '12 GB', status: 'Suspended', health: 'Critical' },
];

export const MOCK_SUBSCRIPTION_PLANS = [
  { id: 'PLN-01', name: 'Standard SaaS', price: '$199/mo', billing: 'Monthly', storage: '50 GB', status: 'Active' },
  { id: 'PLN-02', name: 'Premium School', price: '$1,999/yr', billing: 'Annual', storage: '250 GB', status: 'Active' },
  { id: 'PLN-03', name: 'Enterprise Custom', price: 'Contract', billing: 'Custom', storage: '1 TB+', status: 'Active' },
];

export const MOCK_SECURITY_THREATS = [
  { time: '2 mins ago', event: 'Brute-force lockout triggered', ip: '198.51.100.42', user: 'admin@sunnydale.edu', status: 'Blocked' },
  { time: '14 mins ago', event: 'Suspicious API token usage', ip: '203.0.113.118', user: 'system-hook-stripe', status: 'Flagged' },
  { time: '1 hour ago', event: 'Multiple failed MFA challenges', ip: '185.190.140.9', user: 'treasurer@springfield.edu', status: 'Resolved' },
];

export const MOCK_AUDIT_LOGS = [
  { id: 'AUD-901', user: 'SuperAdmin (shyamlal)', action: 'Suspended school Sunnydale High', target: 'SCH-004', time: 'Today, 10:14 AM' },
  { id: 'AUD-902', user: 'Billing Bot', action: 'Stripe webhook payment invoice_paid successful', target: 'TNT-001', time: 'Today, 08:00 AM' },
  { id: 'AUD-903', user: 'SuperAdmin (shyamlal)', action: 'Upgraded Hogwarts to Enterprise custom', target: 'SCH-001', time: 'Yesterday, 04:30 PM' },
];
