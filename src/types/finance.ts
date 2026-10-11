export type CategoryType = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Entertainment' 
  | 'Education' 
  | 'Bills' 
  | 'Health' 
  | 'Other';

export interface FixedCommitment {
  id: string;
  name: string;
  amount: number;
  category: CategoryType;
  dueDay: number;
  isPaid: boolean;
  isEssential: boolean;
  notes?: string;
}

export interface Subscription {
  id: string;
  name: string;
  monthlyPrice: number;
  dueDay: number;
  category: CategoryType;
  isActive: boolean;
  isEssential: boolean;
  providerUrl?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDay: number;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: CategoryType;
  day: number;
  dateStr: string;
  type: 'expense' | 'savings_deposit' | 'savings_withdrawal';
  paymentMethod: 'UPI' | 'Card' | 'Cash' | 'NetBanking';
  isSimulated?: boolean;
  notes?: string;
}

export interface CategoryBudget {
  category: CategoryType;
  allocated: number;
  iconName: string;
}

export interface SimulationDecision {
  name: string;
  amount: number;
  category: CategoryType;
  plannedDay: number;
  isRecurring: boolean;
  recurrenceCount?: number;
  isEssential: boolean;
}

export interface RiskFactor {
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
  type: 'positive' | 'warning' | 'negative';
}

export interface FinancialHealthBreakdown {
  score: number; // 0-100
  status: 'Healthy' | 'Caution' | 'At Risk' | 'Critical';
  statusColor: string;
  commitmentCoverageScore: number; // 0-30
  savingsPaceScore: number; // 0-25
  spendingVelocityScore: number; // 0-25
  discretionaryBufferScore: number; // 0-20
  improvingFactors: string[];
  loweringFactors: string[];
  suggestedActions: string[];
}

export interface FinancialRiskAssessment {
  riskScore: number; // 0-100 (higher = riskier)
  riskBand: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  riskBandColor: string;
  primaryFactors: RiskFactor[];
  summaryText: string;
}

export interface DayForecastPoint {
  day: number;
  baselineBalance: number;
  simulatedBalance?: number;
  unpaidCommitmentsAtDay: number;
  dailyAllowance: number;
  isActual: boolean;
}

export interface FinancialState {
  totalBudget: number;
  currentDay: number;
  totalDays: number;
  commitments: FixedCommitment[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  transactions: Transaction[];
  categoryBudgets: CategoryBudget[];
  activeSimulation: SimulationDecision | null;
  comparisonSimulations: SimulationDecision[];
  userName: string;
}
