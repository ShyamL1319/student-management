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
