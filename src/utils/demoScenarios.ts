import { FinancialState } from '../types/finance';

export const INITIAL_STATE: FinancialState = {
  totalBudget: 10000,
  currentDay: 1,
  totalDays: 30,
  userName: 'Arjun',
  commitments: [
    {
      id: 'comm_transport',
      name: 'Monthly Metro & Bus Pass',
      amount: 800,
      category: 'Transport',
      dueDay: 5,
      isPaid: false,
      isEssential: true,
      notes: 'Essential daily commute to campus',
    },
    {
      id: 'comm_food',
      name: 'Mess & Essential Groceries',
      amount: 1200,
      category: 'Food',
      dueDay: 10,
      isPaid: false,
      isEssential: true,
      notes: 'Base nutritional food & mess fee',
    },
    {
      id: 'comm_phone',
      name: 'Phone & High-Speed Internet',
      amount: 300,
      category: 'Bills',
      dueDay: 15,
      isPaid: false,
      isEssential: true,
      notes: 'Mobile 5G plan + student broadband',
    },
    {
      id: 'comm_edu',
      name: 'Course Notes & Lab Supplies',
      amount: 700,
      category: 'Education',
      dueDay: 20,
      isPaid: false,
      isEssential: true,
      notes: 'Photocopies, lab manual, project kits',
    },
  ],
  subscriptions: [
    {
      id: 'sub_music',
      name: 'Spotify Premium Student',
      monthlyPrice: 119,
      dueDay: 8,
      category: 'Entertainment',
      isActive: true,
      isEssential: false,
      providerUrl: 'https://spotify.com',
    },
    {
      id: 'sub_video',
      name: 'Netflix Mobile Plan',
      monthlyPrice: 149,
      dueDay: 18,
      category: 'Entertainment',
      isActive: true,
      isEssential: false,
      providerUrl: 'https://netflix.com',
    },
    {
      id: 'sub_fitness',
      name: 'FitPass / Gym Student Pass',
      monthlyPrice: 199,
      dueDay: 25,
      category: 'Health',
      isActive: true,
      isEssential: false,
      providerUrl: 'https://cult.fit',
    },
  ],
  savingsGoals: [
    {
      id: 'goal_emergency',
      name: 'Emergency Buffer Vault',
      targetAmount: 2000,
      currentAmount: 0,
      targetDay: 30,
      priority: 'High',
      category: 'Safety',
      color: '#10b981',
    },
    {
      id: 'goal_headphones',
      name: 'ANC Wireless Headphones',
      targetAmount: 1500,
      currentAmount: 0,
      targetDay: 28,
      priority: 'Medium',
      category: 'Tech',
      color: '#3b82f6',
    },
    {
      id: 'goal_college',
      name: 'Semester Tech Festival Fund',
      targetAmount: 1000,
      currentAmount: 0,
      targetDay: 25,
      priority: 'Low',
      category: 'Campus',
      color: '#8b5cf6',
    },
  ],
  transactions: [],
  categoryBudgets: [
    { category: 'Food', allocated: 2500, iconName: 'Utensils' },
    { category: 'Transport', allocated: 1200, iconName: 'Bus' },
    { category: 'Shopping', allocated: 1500, iconName: 'ShoppingBag' },
    { category: 'Entertainment', allocated: 1000, iconName: 'Film' },
    { category: 'Education', allocated: 1000, iconName: 'GraduationCap' },
    { category: 'Bills', allocated: 1500, iconName: 'FileText' },
    { category: 'Health', allocated: 800, iconName: 'Activity' },
    { category: 'Other', allocated: 500, iconName: 'MoreHorizontal' },
  ],
  activeSimulation: null,
  comparisonSimulations: [],
};

export interface DemoScenarioPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  state: FinancialState;
}

export const DEMO_SCENARIOS: DemoScenarioPreset[] = [
  {
    id: 'healthy',
    name: '1. Healthy Budget & Disciplined Pace',
    badge: 'Low Risk · Score 88',
    description: 'Day 10 of challenge. Transport & Mess commitments paid on time, ₹1,200 already safely deposited into Emergency Buffer, healthy daily allowance of ₹160/day.',
    state: {
      ...INITIAL_STATE,
      currentDay: 10,
      commitments: INITIAL_STATE.commitments.map((c) => ({
        ...c,
        isPaid: c.dueDay <= 10,
      })),
      savingsGoals: [
        { ...INITIAL_STATE.savingsGoals[0], currentAmount: 1200 },
        { ...INITIAL_STATE.savingsGoals[1], currentAmount: 300 },
        { ...INITIAL_STATE.savingsGoals[2], currentAmount: 0 },
      ],
      transactions: [
        { id: 'tx_h1', description: 'Metro pass recharge', amount: 800, category: 'Transport', day: 5, dateStr: 'Day 5', type: 'expense', paymentMethod: 'UPI' },
        { id: 'tx_h2', description: 'Mess fee first half', amount: 1200, category: 'Food', day: 10, dateStr: 'Day 10', type: 'expense', paymentMethod: 'UPI' },
        { id: 'tx_h3', description: 'Weekly groceries & fruit', amount: 350, category: 'Food', day: 4, dateStr: 'Day 4', type: 'expense', paymentMethod: 'UPI' },
        { id: 'tx_h4', description: 'Study stationery & printouts', amount: 120, category: 'Education', day: 7, dateStr: 'Day 7', type: 'expense', paymentMethod: 'Cash' },
        { id: 'tx_h5', description: 'Spotify student plan', amount: 119, category: 'Entertainment', day: 8, dateStr: 'Day 8', type: 'expense', paymentMethod: 'Card' },
      ],
    },
  },
  {
    id: 'overspending',
    name: '2. Impulse Overspending Crisis',
    badge: 'High Risk · Score 42',
    description: 'Day 12. Multiple weekend party expenses and shopping splurges have wiped out ₹4,400. Daily allowance is squeezed down to just ₹48/day, threatening essential bills.',
    state: {
      ...INITIAL_STATE,
      currentDay: 12,
      commitments: INITIAL_STATE.commitments.map((c) => ({
        ...c,
        isPaid: c.dueDay <= 10,
      })),
      savingsGoals: [
        { ...INITIAL_STATE.savingsGoals[0], currentAmount: 200 },
        { ...INITIAL_STATE.savingsGoals[1], currentAmount: 0 },
        { ...INITIAL_STATE.savingsGoals[2], currentAmount: 0 },
      ],
      transactions: [
        { id: 'tx_o1', description: 'Metro recharge', amount: 800, category: 'Transport', day: 5, dateStr: 'Day 5', type: 'expense', paymentMethod: 'UPI' },
        { id: 'tx_o2', description: 'Mess fee', amount: 1200, category: 'Food', day: 10, dateStr: 'Day 10', type: 'expense', paymentMethod: 'UPI' },
        { id: 'tx_o3', description: 'Weekend club & cafe outing', amount: 1650, category: 'Entertainment', day: 6, dateStr: 'Day 6', type: 'expense', paymentMethod: 'UPI' },
        { id: 'tx_o4', description: 'Sneakers impulse purchase', amount: 2200, category: 'Shopping', day: 9, dateStr: 'Day 9', type: 'expense', paymentMethod: 'Card' },
        { id: 'tx_o5', description: 'Late night burger delivery', amount: 480, category: 'Food', day: 11, dateStr: 'Day 11', type: 'expense', paymentMethod: 'UPI' },
      ],
    },
  },
  {
    id: 'emergency',
    name: '3. Sudden ₹2,000 Medical Shock',
    badge: 'Critical · Score 46',
    description: 'Day 14. An unforeseen ₹2,000 clinic & pharmacy bill hit. Demonstrates how the Spend Simulator & Emergency Lab can simulate recovery strategies without going broke.',
    state: {
      ...INITIAL_STATE,
      currentDay: 14,
      commitments: INITIAL_STATE.commitments.map((c) => ({
        ...c,
        isPaid: c.dueDay <= 10,
      })),
      savingsGoals: [
        { ...INITIAL_STATE.savingsGoals[0], currentAmount: 600 },
        { ...INITIAL_STATE.savingsGoals[1], currentAmount: 0 },
        { ...INITIAL_STATE.savingsGoals[2], currentAmount: 0 },
      ],
      transactions: [
        { id: 'tx_e1', description: 'Metro pass recharge', amount: 800, category: 'Transport', day: 5, dateStr: 'Day 5', type: 'expense', paymentMethod: 'UPI' },
        { id: 'tx_e2', description: 'Mess food bill', amount: 1200, category: 'Food', day: 10, dateStr: 'Day 10', type: 'expense', paymentMethod: 'UPI' },
        { id: 'tx_e3', description: 'Urgent dental clinic checkup', amount: 2000, category: 'Health', day: 13, dateStr: 'Day 13', type: 'expense', paymentMethod: 'UPI' },
        { id: 'tx_e4', description: 'Cafeteria meals', amount: 400, category: 'Food', day: 7, dateStr: 'Day 7', type: 'expense', paymentMethod: 'UPI' },
      ],
    },
  },
  {
    id: 'subscriptions',
    name: '4. Subscription Drain (Recurring Leak)',
    badge: 'Moderate Risk · 5 Active',
    description: 'Day 7. User accumulated 5 recurring subscriptions costing ₹765/month. Shows how pausing 2 optional subscriptions instantly restores ₹348 to the daily allowance.',
    state: {
      ...INITIAL_STATE,
      currentDay: 7,
      subscriptions: [
        ...INITIAL_STATE.subscriptions,
        {
          id: 'sub_prime',
          name: 'Amazon Prime Student',
          monthlyPrice: 149,
          dueDay: 14,
          category: 'Shopping',
          isActive: true,
          isEssential: false,
        },
        {
          id: 'sub_cloud',
          name: 'Cloud Storage 100GB',
          monthlyPrice: 150,
          dueDay: 22,
          category: 'Bills',
          isActive: true,
          isEssential: false,
        },
      ],
      transactions: [
        { id: 'tx_s1', description: 'Metro pass recharge', amount: 800, category: 'Transport', day: 5, dateStr: 'Day 5', type: 'expense', paymentMethod: 'UPI' },
      ],
    },
  },
  {
    id: 'savings_pressure',
    name: '5. Savings Goal Under Pressure',
    badge: 'Temptation Scenario',
    description: 'Day 8. User has ₹800 saved toward headphones, but is eyeing a ₹1,800 gaming keyboard. Perfect test for the Spend Simulator comparison mode.',
    state: {
      ...INITIAL_STATE,
      currentDay: 8,
      savingsGoals: [
        { ...INITIAL_STATE.savingsGoals[0], currentAmount: 800 },
        { ...INITIAL_STATE.savingsGoals[1], currentAmount: 700 },
        { ...INITIAL_STATE.savingsGoals[2], currentAmount: 0 },
      ],
      transactions: [
        { id: 'tx_p1', description: 'Metro pass recharge', amount: 800, category: 'Transport', day: 5, dateStr: 'Day 5', type: 'expense', paymentMethod: 'UPI' },
        { id: 'tx_p2', description: 'Weekly groceries', amount: 300, category: 'Food', day: 3, dateStr: 'Day 3', type: 'expense', paymentMethod: 'UPI' },
      ],
    },
  },
];
