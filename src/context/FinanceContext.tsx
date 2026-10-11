import React, { createContext, useContext, useEffect, useReducer, useMemo } from 'react';
import {
  FinancialState,
  Transaction,
  SimulationDecision,
  Subscription,
  CategoryType,
  SavingsGoal,
  FinancialHealthBreakdown,
  FinancialRiskAssessment,
  DayForecastPoint,
} from '../types/finance';
import { INITIAL_STATE, DEMO_SCENARIOS } from '../utils/demoScenarios';
import {
  calculateAvailableCash,
  calculateRemainingCommitments,
  calculateDailyAllowance,
  calculateSpentToday,
  calculateRemainingTodayAllowance,
  calculateProjectedDay30Balance,
  calculateEssentialCoverageDays,
  calculateFinancialHealth,
  calculateFinancialRisk,
  calculateSimulationComparison,
  generateSmartInsights,
  generate30DayForecast,
  calculateActualSpent,
  calculateTotalSaved,
} from '../utils/calculations';

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  | { type: 'EDIT_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_CURRENT_DAY'; payload: number }
  | { type: 'SET_SIMULATION'; payload: SimulationDecision | null }
  | { type: 'CLEAR_SIMULATION' }
  | { type: 'CONFIRM_SIMULATION' }
  | { type: 'TOGGLE_SUBSCRIPTION'; payload: string }
  | { type: 'ADD_SUBSCRIPTION'; payload: Omit<Subscription, 'id'> }
  | { type: 'DELETE_SUBSCRIPTION'; payload: string }
  | { type: 'TOGGLE_COMMITMENT_PAID'; payload: string }
  | { type: 'DEPOSIT_SAVINGS'; payload: { goalId: string; amount: number } }
  | { type: 'WITHDRAW_SAVINGS'; payload: { goalId: string; amount: number } }
  | { type: 'CREATE_SAVINGS_GOAL'; payload: Omit<SavingsGoal, 'id' | 'currentAmount'> }
  | { type: 'UPDATE_CATEGORY_BUDGET'; payload: { category: CategoryType; allocated: number } }
  | { type: 'UPDATE_TOTAL_BUDGET'; payload: number }
  | { type: 'LOAD_DEMO_SCENARIO'; payload: string }
  | { type: 'RESET_TO_INITIAL' }
  | { type: 'HYDRATE_STATE'; payload: FinancialState };

const STORAGE_KEY = 'paisapilot_financial_state_v1';

function financeReducer(state: FinancialState, action: Action): FinancialState {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return action.payload;

    case 'ADD_TRANSACTION': {
      const newTx: Transaction = {
        ...action.payload,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      return {
        ...state,
        transactions: [newTx, ...state.transactions],
      };
    }

    case 'EDIT_TRANSACTION': {
      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.id === action.payload.id ? action.payload : tx
        ),
      };
    }

    case 'DELETE_TRANSACTION': {
      return {
        ...state,
        transactions: state.transactions.filter((tx) => tx.id !== action.payload),
      };
    }

    case 'SET_CURRENT_DAY': {
      const day = Math.max(1, Math.min(state.totalDays, action.payload));
      return {
        ...state,
        currentDay: day,
      };
    }

    case 'SET_SIMULATION': {
      return {
        ...state,
        activeSimulation: action.payload,
      };
    }

    case 'CLEAR_SIMULATION': {
      return {
        ...state,
        activeSimulation: null,
      };
    }

    case 'CONFIRM_SIMULATION': {
      if (!state.activeSimulation) return state;
      const sim = state.activeSimulation;
      const newTx: Transaction = {
        id: `tx_conf_${Date.now()}`,
        description: sim.name,
        amount: sim.amount,
        category: sim.category,
        day: sim.plannedDay,
        dateStr: `Day ${sim.plannedDay}`,
        type: 'expense',
        paymentMethod: 'UPI',
        notes: sim.isRecurring ? 'Confirmed from simulator (recurring)' : 'Confirmed from simulator',
      };
      return {
        ...state,
        transactions: [newTx, ...state.transactions],
        activeSimulation: null,
      };
    }

    case 'TOGGLE_SUBSCRIPTION': {
      return {
        ...state,
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === action.payload ? { ...sub, isActive: !sub.isActive } : sub
        ),
      };
    }

    case 'ADD_SUBSCRIPTION': {
      const newSub: Subscription = {
        ...action.payload,
        id: `sub_${Date.now()}`,
      };
      return {
        ...state,
        subscriptions: [...state.subscriptions, newSub],
      };
    }

    case 'DELETE_SUBSCRIPTION': {
      return {
        ...state,
        subscriptions: state.subscriptions.filter((sub) => sub.id !== action.payload),
      };
    }

    case 'TOGGLE_COMMITMENT_PAID': {
      return {
        ...state,
        commitments: state.commitments.map((c) =>
          c.id === action.payload ? { ...c, isPaid: !c.isPaid } : c
        ),
      };
    }

    case 'DEPOSIT_SAVINGS': {
      const { goalId, amount } = action.payload;
      const available = calculateAvailableCash(state);
      const actualDeposit = Math.min(amount, available);
      if (actualDeposit <= 0) return state;

      // Add audit transaction
      const depositTx: Transaction = {
        id: `tx_sav_${Date.now()}`,
        description: `Deposit to ${state.savingsGoals.find((g) => g.id === goalId)?.name || 'Savings'}`,
        amount: actualDeposit,
        category: 'Other',
        day: state.currentDay,
        dateStr: `Day ${state.currentDay}`,
        type: 'savings_deposit',
        paymentMethod: 'UPI',
      };

      return {
        ...state,
        transactions: [depositTx, ...state.transactions],
        savingsGoals: state.savingsGoals.map((g) =>
          g.id === goalId ? { ...g, currentAmount: g.currentAmount + actualDeposit } : g
        ),
      };
    }

    case 'WITHDRAW_SAVINGS': {
      const { goalId, amount } = action.payload;
      const targetGoal = state.savingsGoals.find((g) => g.id === goalId);
      if (!targetGoal || targetGoal.currentAmount <= 0) return state;
      const actualWithdraw = Math.min(amount, targetGoal.currentAmount);

      const withdrawTx: Transaction = {
        id: `tx_wth_${Date.now()}`,
        description: `Withdrawal from ${targetGoal.name}`,
        amount: actualWithdraw,
        category: 'Other',
        day: state.currentDay,
        dateStr: `Day ${state.currentDay}`,
        type: 'savings_withdrawal',
        paymentMethod: 'UPI',
      };

      return {
        ...state,
        transactions: [withdrawTx, ...state.transactions],
        savingsGoals: state.savingsGoals.map((g) =>
          g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - actualWithdraw) } : g
        ),
      };
    }

    case 'CREATE_SAVINGS_GOAL': {
      const newGoal: SavingsGoal = {
        ...action.payload,
        id: `goal_${Date.now()}`,
        currentAmount: 0,
      };
      return {
        ...state,
        savingsGoals: [...state.savingsGoals, newGoal],
      };
    }

    case 'UPDATE_CATEGORY_BUDGET': {
      const { category, allocated } = action.payload;
      return {
        ...state,
        categoryBudgets: state.categoryBudgets.map((b) =>
          b.category === category ? { ...b, allocated: Math.max(0, allocated) } : b
        ),
      };
    }

    case 'UPDATE_TOTAL_BUDGET': {
      return {
        ...state,
        totalBudget: Math.max(1000, action.payload),
      };
    }

    case 'LOAD_DEMO_SCENARIO': {
      const found = DEMO_SCENARIOS.find((s) => s.id === action.payload);
      if (found) {
        return {
          ...found.state,
          activeSimulation: null,
        };
      }
      return state;
    }

    case 'RESET_TO_INITIAL': {
      return INITIAL_STATE;
    }

    default:
      return state;
  }
}

interface FinanceContextType {
  state: FinancialState;
  availableCash: number;
  actualSpent: number;
  totalSaved: number;
  remainingCommitments: number;
  dailyAllowance: number;
  spentToday: number;
  remainingTodayAllowance: number;
  projectedDay30Balance: number;
  essentialCoverageDays: number;
  financialHealth: FinancialHealthBreakdown;
  financialRisk: FinancialRiskAssessment;
  activeSimulationComparison: ReturnType<typeof calculateSimulationComparison> | null;
  smartInsights: ReturnType<typeof generateSmartInsights>;
  forecastPoints: DayForecastPoint[];
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setCurrentDay: (day: number) => void;
  setSimulation: (decision: SimulationDecision | null) => void;
  clearSimulation: () => void;
  confirmSimulation: () => void;
  toggleSubscription: (id: string) => void;
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  deleteSubscription: (id: string) => void;
  toggleCommitmentPaid: (id: string) => void;
  depositToSavings: (goalId: string, amount: number) => void;
  withdrawFromSavings: (goalId: string, amount: number) => void;
  createSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  updateCategoryBudget: (category: CategoryType, allocated: number) => void;
  updateTotalBudget: (newBudget: number) => void;
  loadDemoScenario: (scenarioId: string) => void;
  resetToInitial: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

function validateAndHydrateState(raw: unknown): FinancialState {
  if (!raw || typeof raw !== 'object') {
    return INITIAL_STATE;
  }
  const obj = raw as Partial<FinancialState>;

  // Check required numerical properties
  if (typeof obj.totalBudget !== 'number' || isNaN(obj.totalBudget) || obj.totalBudget <= 0) {
    return INITIAL_STATE;
  }

  const totalDays = typeof obj.totalDays === 'number' && obj.totalDays > 0 ? obj.totalDays : INITIAL_STATE.totalDays;
  const currentDay = typeof obj.currentDay === 'number' && obj.currentDay >= 1 && obj.currentDay <= totalDays
    ? obj.currentDay
    : INITIAL_STATE.currentDay;

  // Validate array fields
  const transactions = Array.isArray(obj.transactions) ? obj.transactions : INITIAL_STATE.transactions;
  const commitments = Array.isArray(obj.commitments) ? obj.commitments : INITIAL_STATE.commitments;
  const subscriptions = Array.isArray(obj.subscriptions) ? obj.subscriptions : INITIAL_STATE.subscriptions;
  const savingsGoals = Array.isArray(obj.savingsGoals) ? obj.savingsGoals : INITIAL_STATE.savingsGoals;
  const categoryBudgets = Array.isArray(obj.categoryBudgets) ? obj.categoryBudgets : INITIAL_STATE.categoryBudgets;

  return {
    ...INITIAL_STATE,
    ...obj,
    userName: typeof obj.userName === 'string' && obj.userName.trim() ? obj.userName : INITIAL_STATE.userName,
    totalBudget: obj.totalBudget,
    totalDays,
    currentDay,
    transactions,
    commitments,
    subscriptions,
    savingsGoals,
    categoryBudgets,
    activeSimulation: null, // Clear transient simulation previews on reload
  };
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, INITIAL_STATE, () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return validateAndHydrateState(parsed);
      }
    } catch {
      // Fallback safely to initial state
    }
    return INITIAL_STATE;
  });

  // Sync to LocalStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  // Derived financial values
  const availableCash = useMemo(() => calculateAvailableCash(state), [state]);
  const actualSpent = useMemo(() => calculateActualSpent(state), [state]);
  const totalSaved = useMemo(() => calculateTotalSaved(state), [state]);
  const remainingCommitments = useMemo(() => calculateRemainingCommitments(state), [state]);
  const dailyAllowance = useMemo(() => calculateDailyAllowance(state), [state]);
  const spentToday = useMemo(() => calculateSpentToday(state), [state]);
  const remainingTodayAllowance = useMemo(() => calculateRemainingTodayAllowance(state), [state]);
  const projectedDay30Balance = useMemo(() => calculateProjectedDay30Balance(state), [state]);
  const essentialCoverageDays = useMemo(() => calculateEssentialCoverageDays(state), [state]);
  const financialHealth = useMemo(() => calculateFinancialHealth(state), [state]);
  const financialRisk = useMemo(() => calculateFinancialRisk(state), [state]);
  const smartInsights = useMemo(() => generateSmartInsights(state), [state]);

  const activeSimulationComparison = useMemo(() => {
    if (!state.activeSimulation) return null;
    return calculateSimulationComparison(state, state.activeSimulation);
  }, [state]);

  const forecastPoints = useMemo(() => {
    return generate30DayForecast(state, state.activeSimulation);
  }, [state]);

  const value: FinanceContextType = {
    state,
    availableCash,
    actualSpent,
    totalSaved,
    remainingCommitments,
    dailyAllowance,
    spentToday,
    remainingTodayAllowance,
    projectedDay30Balance,
    essentialCoverageDays,
    financialHealth,
    financialRisk,
    activeSimulationComparison,
    smartInsights,
    forecastPoints,
    addTransaction: (tx) => dispatch({ type: 'ADD_TRANSACTION', payload: tx }),
    editTransaction: (tx) => dispatch({ type: 'EDIT_TRANSACTION', payload: tx }),
    deleteTransaction: (id) => dispatch({ type: 'DELETE_TRANSACTION', payload: id }),
    setCurrentDay: (day) => dispatch({ type: 'SET_CURRENT_DAY', payload: day }),
    setSimulation: (decision) => dispatch({ type: 'SET_SIMULATION', payload: decision }),
    clearSimulation: () => dispatch({ type: 'CLEAR_SIMULATION' }),
    confirmSimulation: () => dispatch({ type: 'CONFIRM_SIMULATION' }),
    toggleSubscription: (id) => dispatch({ type: 'TOGGLE_SUBSCRIPTION', payload: id }),
    addSubscription: (sub) => dispatch({ type: 'ADD_SUBSCRIPTION', payload: sub }),
    deleteSubscription: (id) => dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id }),
    toggleCommitmentPaid: (id) => dispatch({ type: 'TOGGLE_COMMITMENT_PAID', payload: id }),
    depositToSavings: (goalId, amount) => dispatch({ type: 'DEPOSIT_SAVINGS', payload: { goalId, amount } }),
    withdrawFromSavings: (goalId, amount) => dispatch({ type: 'WITHDRAW_SAVINGS', payload: { goalId, amount } }),
    createSavingsGoal: (goal) => dispatch({ type: 'CREATE_SAVINGS_GOAL', payload: goal }),
    updateCategoryBudget: (category, allocated) => dispatch({ type: 'UPDATE_CATEGORY_BUDGET', payload: { category, allocated } }),
    updateTotalBudget: (newBudget) => dispatch({ type: 'UPDATE_TOTAL_BUDGET', payload: newBudget }),
    loadDemoScenario: (scenarioId) => dispatch({ type: 'LOAD_DEMO_SCENARIO', payload: scenarioId }),
    resetToInitial: () => dispatch({ type: 'RESET_TO_INITIAL' }),
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
