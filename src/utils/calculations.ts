import {
  FinancialState,
  SimulationDecision,
  FinancialHealthBreakdown,
  FinancialRiskAssessment,
  RiskFactor,
  DayForecastPoint,
  CategoryType,
} from '../types/finance';

export const INITIAL_BUDGET = 10000;
export const TOTAL_CHALLENGE_DAYS = 30;

/**
 * Returns total actual expenses confirmed to date.
 */
export function calculateActualSpent(state: FinancialState): number {
  return state.transactions
    .filter((t) => t.type === 'expense' && !t.isSimulated)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Returns total cash currently deposited into savings goals.
 */
export function calculateTotalSaved(state: FinancialState): number {
  return state.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
}

/**
 * Returns primary savings target (default ₹2,000 emergency fund or primary goal target).
 */
export function calculatePrimarySavingsTarget(state: FinancialState): number {
  const emergencyGoal = state.savingsGoals.find((g) => g.name.toLowerCase().includes('emergency'));
  return emergencyGoal ? emergencyGoal.targetAmount : 2000;
}

/**
 * Available liquid cash in hand/bank right now:
 * Starting budget - Actual spent - Money deposited into savings vaults.
 */
export function calculateAvailableCash(state: FinancialState): number {
  const actualSpent = calculateActualSpent(state);
  const totalSaved = calculateTotalSaved(state);
  return Math.max(0, state.totalBudget - actualSpent - totalSaved);
}

/**
 * Calculate unpaid fixed commitments that are scheduled on or after currentDay.
 */
export function calculateRemainingCommitments(state: FinancialState): number {
  // 1. Fixed commitments not yet marked paid and due >= currentDay
  const unpaidFixed = state.commitments
    .filter((c) => !c.isPaid && c.dueDay >= state.currentDay)
    .reduce((sum, c) => sum + c.amount, 0);

  // 2. Active subscriptions whose dueDay is >= currentDay in this 30-day window
  const unpaidSubscriptions = state.subscriptions
    .filter((s) => s.isActive && s.dueDay >= state.currentDay)
    .reduce((sum, s) => sum + s.monthlyPrice, 0);

  return unpaidFixed + unpaidSubscriptions;
}

/**
 * Calculate only essential remaining commitments (essential food, bills, health, transit).
 */
export function calculateEssentialCommitments(state: FinancialState): number {
  const essentialFixed = state.commitments
    .filter((c) => !c.isPaid && c.dueDay >= state.currentDay && c.isEssential)
    .reduce((sum, c) => sum + c.amount, 0);

  const essentialSubs = state.subscriptions
    .filter((s) => s.isActive && s.dueDay >= state.currentDay && s.isEssential)
    .reduce((sum, s) => sum + s.monthlyPrice, 0);

  return essentialFixed + essentialSubs;
}

/**
 * Remaining challenge days including currentDay.
 */
export function calculateRemainingDays(state: FinancialState): number {
  return Math.max(1, state.totalDays - state.currentDay + 1);
}

/**
 * Unfunded portion of the primary savings goal (₹2,000 target by default).
 */
export function calculateUnfundedSavings(state: FinancialState): number {
  const target = calculatePrimarySavingsTarget(state);
  const currentSaved = calculateTotalSaved(state);
  return Math.max(0, target - currentSaved);
}

/**
 * Discretionary spending pool:
 * Available Cash - Remaining Commitments - Unfunded Savings Target.
 */
export function calculateDiscretionaryPool(state: FinancialState): number {
  const available = calculateAvailableCash(state);
  const commitments = calculateRemainingCommitments(state);
  const unfundedSavings = calculateUnfundedSavings(state);
  return Math.max(0, available - commitments - unfundedSavings);
}

/**
 * Dynamic Daily Safe-to-Spend Allowance:
 * Discretionary pool divided evenly across the remaining days.
 */
export function calculateDailyAllowance(state: FinancialState): number {
  const pool = calculateDiscretionaryPool(state);
  const remainingDays = calculateRemainingDays(state);
  return Math.floor(pool / remainingDays);
}

/**
 * Actual spending incurred on the current day.
 */
export function calculateSpentToday(state: FinancialState): number {
  return state.transactions
    .filter((t) => t.day === state.currentDay && t.type === 'expense' && !t.isSimulated)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Remaining allowance left for today.
 */
export function calculateRemainingTodayAllowance(state: FinancialState): number {
  const dailyAllowance = calculateDailyAllowance(state);
  const spentToday = calculateSpentToday(state);
  return Math.max(0, dailyAllowance - spentToday);
}

/**
 * Projected end-of-month (Day 30) balance:
 * If the user adheres to the safe daily allowance:
 * Balance on Day 30 = Current Available Cash - Remaining Commitments - (Daily Allowance * Remaining Days) + Total Saved
 * By definition, this preserves the planned savings.
 */
export function calculateProjectedDay30Balance(state: FinancialState): number {
  const available = calculateAvailableCash(state);
  const commitments = calculateRemainingCommitments(state);
  const unfundedSavings = calculateUnfundedSavings(state);
  const totalSaved = calculateTotalSaved(state);
  
  // What will remain in liquid cash if daily allowance is spent strictly:
  const projectedLiquid = Math.max(0, available - commitments - (calculateDailyAllowance(state) * calculateRemainingDays(state)));
  // Total funds preserved at Day 30 (Liquid + Locked Savings):
  return projectedLiquid + totalSaved + (unfundedSavings > 0 && available >= commitments + unfundedSavings ? unfundedSavings : 0);
}

/**
 * Days of essential expenses covered by current available cash.
 */
export function calculateEssentialCoverageDays(state: FinancialState): number {
  const available = calculateAvailableCash(state);
  const essentialRemaining = calculateEssentialCommitments(state);
  const remainingDays = calculateRemainingDays(state);

  if (essentialRemaining === 0) return remainingDays;
  const avgEssentialDaily = essentialRemaining / remainingDays;
  if (avgEssentialDaily <= 0) return remainingDays;
  
  const daysCovered = Math.floor(available / avgEssentialDaily);
  return Math.min(remainingDays, Math.max(0, daysCovered));
}

/**
 * Total subscription commitment over the remaining 30 days.
 */
export function calculateActiveSubscriptionCost(state: FinancialState): number {
  return state.subscriptions
    .filter((s) => s.isActive && s.dueDay >= state.currentDay)
    .reduce((sum, s) => sum + s.monthlyPrice, 0);
}

/**
 * Total annual estimated cost of all active subscriptions.
 */
export function calculateAnnualSubscriptionCost(state: FinancialState): number {
  return state.subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.monthlyPrice * 12, 0);
}

/**
 * Comprehensive Deterministic Financial Health Score (0-100).
 */
export function calculateFinancialHealth(state: FinancialState): FinancialHealthBreakdown {
  const available = calculateAvailableCash(state);
  const commitments = calculateRemainingCommitments(state);
  const primaryTarget = calculatePrimarySavingsTarget(state);
  const actualSaved = calculateTotalSaved(state);
  const remainingDays = calculateRemainingDays(state);
  const actualSpent = calculateActualSpent(state);
  const dailyAllowance = calculateDailyAllowance(state);

  // 1. Commitment Coverage (30 pts max)
  let commitmentScore = 30;
  if (commitments > 0) {
    const ratio = available / commitments;
    if (ratio >= 1.5) commitmentScore = 30;
    else if (ratio >= 1.0) commitmentScore = 25;
    else if (ratio >= 0.7) commitmentScore = 15;
    else if (ratio >= 0.4) commitmentScore = 8;
    else commitmentScore = 2;
  }

  // 2. Savings Pace Score (25 pts max)
  // Expected savings by day N: (primaryTarget / 30) * state.currentDay
  let savingsPaceScore = 25;
  const targetSoFar = (primaryTarget / 30) * state.currentDay;
  if (actualSaved >= targetSoFar && actualSaved > 0) {
    savingsPaceScore = 25;
  } else if (actualSaved >= targetSoFar * 0.7) {
    savingsPaceScore = 20;
  } else {
    // Can remaining cash cover unfunded target?
    const shortfall = Math.max(0, primaryTarget - actualSaved);
    if (available - commitments >= shortfall) {
      savingsPaceScore = 18;
    } else if (available - commitments >= shortfall * 0.5) {
      savingsPaceScore = 12;
    } else {
      savingsPaceScore = 5;
    }
  }

  // 3. Spending Velocity Score (25 pts max)
  // Day 1 to currentDay spending pace
  let spendingVelocityScore = 25;
  const daysPassed = Math.max(1, state.currentDay - 1);
  const spendPerDayPassed = actualSpent / daysPassed;
  const idealDailyBudget = state.totalBudget / state.totalDays; // ₹333/day

  if (state.currentDay === 1 && actualSpent === 0) {
    spendingVelocityScore = 25;
  } else if (spendPerDayPassed <= idealDailyBudget) {
    spendingVelocityScore = 25;
  } else if (spendPerDayPassed <= idealDailyBudget * 1.3) {
    spendingVelocityScore = 18;
  } else if (spendPerDayPassed <= idealDailyBudget * 1.7) {
    spendingVelocityScore = 10;
  } else {
    spendingVelocityScore = 4;
  }

  // 4. Discretionary Buffer Score (20 pts max)
  let discretionaryBufferScore = 20;
  if (dailyAllowance >= 150) {
    discretionaryBufferScore = 20;
  } else if (dailyAllowance >= 100) {
    discretionaryBufferScore = 16;
  } else if (dailyAllowance >= 50) {
    discretionaryBufferScore = 11;
  } else if (dailyAllowance >= 20) {
    discretionaryBufferScore = 6;
  } else {
    discretionaryBufferScore = 2;
  }

  const totalScore = Math.min(100, Math.max(0, commitmentScore + savingsPaceScore + spendingVelocityScore + discretionaryBufferScore));

  let status: 'Healthy' | 'Caution' | 'At Risk' | 'Critical' = 'Healthy';
  let statusColor = '#16a34a'; // Emerald
  if (totalScore >= 80) {
    status = 'Healthy';
    statusColor = '#16a34a';
  } else if (totalScore >= 60) {
    status = 'Caution';
    statusColor = '#d97706'; // Amber
  } else if (totalScore >= 40) {
    status = 'At Risk';
    statusColor = '#ea580c'; // Orange
  } else {
    status = 'Critical';
    statusColor = '#dc2626'; // Red
  }

  const improvingFactors: string[] = [];
  const loweringFactors: string[] = [];
  const suggestedActions: string[] = [];

  if (available >= commitments + 1000) {
    improvingFactors.push(`₹${commitments.toLocaleString('en-IN')} in remaining commitments is fully safeguarded by available cash.`);
  } else {
    loweringFactors.push(`Cash buffer is tight against ₹${commitments.toLocaleString('en-IN')} upcoming obligations.`);
    suggestedActions.push(`Prioritize paying essential food and transport commitments before any discretionary shopping.`);
  }

  if (dailyAllowance >= 100) {
    improvingFactors.push(`Healthy safe-to-spend allowance of ₹${dailyAllowance}/day gives day-to-day flexibility.`);
  } else {
    loweringFactors.push(`Safe-to-spend allowance is restricted to ₹${dailyAllowance}/day.`);
    suggestedActions.push(`Cap daily outings under ₹${Math.max(50, dailyAllowance)} to avoid cutting into the savings goal.`);
  }

  if (actualSaved >= primaryTarget) {
    improvingFactors.push(`Primary savings target of ₹${primaryTarget.toLocaleString('en-IN')} is 100% secured!`);
  } else if (available - commitments < calculateUnfundedSavings(state)) {
    loweringFactors.push(`Projected surplus may not fully meet your ₹${primaryTarget.toLocaleString('en-IN')} savings target.`);
    suggestedActions.push(`Consider pausing unused streaming subscriptions or reducing dining out this week.`);
  }

  return {
    score: totalScore,
    status,
    statusColor,
    commitmentCoverageScore: commitmentScore,
    savingsPaceScore,
    spendingVelocityScore,
    discretionaryBufferScore,
    improvingFactors,
    loweringFactors,
    suggestedActions,
  };
}

/**
 * Deterministic Financial Risk Engine (0-100, higher = higher risk).
 */
export function calculateFinancialRisk(state: FinancialState): FinancialRiskAssessment {
  const available = calculateAvailableCash(state);
  const commitments = calculateRemainingCommitments(state);
  const primaryTarget = calculatePrimarySavingsTarget(state);
  const totalSaved = calculateTotalSaved(state);
  const dailyAllowance = calculateDailyAllowance(state);
  const activeSubsCost = calculateActiveSubscriptionCost(state);
  const remainingDays = calculateRemainingDays(state);

  const primaryFactors: RiskFactor[] = [];
  let riskScore = 0;

  // Factor 1: Commitment Solvency (up to 35 pts)
  if (available < commitments) {
    const deficit = commitments - available;
    riskScore += 35;
    primaryFactors.push({
      title: 'Commitment Deficit',
      impact: 'High',
      type: 'negative',
      description: `Available cash (₹${available.toLocaleString('en-IN')}) is ₹${deficit.toLocaleString('en-IN')} below remaining commitments.`,
    });
  } else if (available < commitments * 1.25) {
    riskScore += 20;
    primaryFactors.push({
      title: 'Thin Commitment Buffer',
      impact: 'Medium',
      type: 'warning',
      description: `Available cash is within 25% of pending fixed commitments (₹${commitments.toLocaleString('en-IN')}).`,
    });
  } else {
    riskScore += 2;
    primaryFactors.push({
      title: 'Commitments Covered',
      impact: 'Low',
      type: 'positive',
      description: `All pending commitments (₹${commitments.toLocaleString('en-IN')}) are backed by available liquid funds.`,
    });
  }

  // Factor 2: Daily Allowance Pinch (up to 30 pts)
  if (dailyAllowance <= 0) {
    riskScore += 30;
    primaryFactors.push({
      title: 'Zero Daily Allowance',
      impact: 'High',
      type: 'negative',
      description: `Any discretionary spending will breach essential commitments or savings targets.`,
    });
  } else if (dailyAllowance < 60) {
    riskScore += 20;
    primaryFactors.push({
      title: 'Constrained Daily Spending',
      impact: 'High',
      type: 'warning',
      description: `Safe daily allowance is under ₹60/day across the next ${remainingDays} days.`,
    });
  } else if (dailyAllowance < 120) {
    riskScore += 10;
    primaryFactors.push({
      title: 'Moderate Daily Cushion',
      impact: 'Medium',
      type: 'warning',
      description: `Daily allowance is ₹${dailyAllowance}/day; avoid multi-item impulsive spending.`,
    });
  } else {
    riskScore += 2;
    primaryFactors.push({
      title: 'Comfortable Daily Allowance',
      impact: 'Low',
      type: 'positive',
      description: `Safe allowance of ₹${dailyAllowance}/day allows relaxed day-to-day decisions.`,
    });
  }

  // Factor 3: Savings Target Feasibility (up to 20 pts)
  const unfunded = Math.max(0, primaryTarget - totalSaved);
  const surplus = available - commitments;
  if (surplus < 0) {
    riskScore += 20;
    primaryFactors.push({
      title: 'Savings Goal Unreachable at Current Pace',
      impact: 'High',
      type: 'negative',
      description: `Fixed commitments consume all liquid funds, leaving zero room for ₹${primaryTarget.toLocaleString('en-IN')} savings.`,
    });
  } else if (surplus < unfunded) {
    riskScore += 12;
    primaryFactors.push({
      title: 'Savings Goal At Risk',
      impact: 'Medium',
      type: 'warning',
      description: `Surplus (₹${surplus.toLocaleString('en-IN')}) will fall ₹${(unfunded - surplus).toLocaleString('en-IN')} short of the target.`,
    });
  } else {
    riskScore += 1;
    primaryFactors.push({
      title: 'Savings Target On Track',
      impact: 'Low',
      type: 'positive',
      description: `Sufficient projected surplus exists to reach the ₹${primaryTarget.toLocaleString('en-IN')} target.`,
    });
  }

  // Factor 4: Subscription Drain Burden (up to 15 pts)
  if (activeSubsCost >= 450) {
    riskScore += 12;
    primaryFactors.push({
      title: 'Heavy Subscription Drain',
      impact: 'Medium',
      type: 'warning',
      description: `₹${activeSubsCost.toLocaleString('en-IN')} is locked into active subscriptions this month.`,
    });
  } else if (activeSubsCost > 0) {
    riskScore += 4;
  }

  const finalScore = Math.min(100, Math.max(0, riskScore));

  let riskBand: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk' = 'Low Risk';
  let riskBandColor = '#16a34a';
  if (finalScore <= 24) {
    riskBand = 'Low Risk';
    riskBandColor = '#16a34a';
  } else if (finalScore <= 49) {
    riskBand = 'Moderate Risk';
    riskBandColor = '#d97706';
  } else if (finalScore <= 74) {
    riskBand = 'High Risk';
    riskBandColor = '#ea580c';
  } else {
    riskBand = 'Critical Risk';
    riskBandColor = '#dc2626';
  }

  let summaryText = '';
  if (finalScore <= 24) {
    summaryText = 'Your finances are well-calibrated. All commitments and your savings goal are safely on track.';
  } else if (finalScore <= 49) {
    summaryText = 'Pace is stable but discretionary spending needs careful management to preserve your target savings.';
  } else if (finalScore <= 74) {
    summaryText = 'Your projected balance is falling because discretionary spending is above the pace needed to cover commitments.';
  } else {
    summaryText = 'High financial stress! Immediate corrective action required to prevent defaulting on essential commitments.';
  }

  return {
    riskScore: finalScore,
    riskBand,
    riskBandColor,
    primaryFactors,
    summaryText,
  };
}

/**
 * Generate 30-Day balance forecast data points for baseline and optional simulation.
 */
export function generate30DayForecast(
  state: FinancialState,
  simulation: SimulationDecision | null = null
): DayForecastPoint[] {
  const points: DayForecastPoint[] = [];
  const currentAvailable = calculateAvailableCash(state);
  const baselineDailyAllowance = calculateDailyAllowance(state);

  // Simulated metrics if applicable
  const simulatedState = simulation ? applySimulationToState(state, simulation) : null;
  const simulatedDailyAllowance = simulatedState ? calculateDailyAllowance(simulatedState) : baselineDailyAllowance;

  let runningBaseline = currentAvailable;
  let runningSimulated = simulation ? calculateAvailableCash(simulatedState!) : currentAvailable;

  for (let day = 1; day <= state.totalDays; day++) {
    const isActual = day <= state.currentDay;

    // Check fixed commitments due on this day
    const commitmentsDueToday = state.commitments
      .filter((c) => c.dueDay === day && (day >= state.currentDay ? !c.isPaid : true))
      .reduce((sum, c) => sum + c.amount, 0);

    const subsDueToday = state.subscriptions
      .filter((s) => s.isActive && s.dueDay === day)
      .reduce((sum, s) => sum + s.monthlyPrice, 0);

    const totalDueToday = commitmentsDueToday + subsDueToday;

    if (day < state.currentDay) {
      // Historical approximation based on starting budget minus actual transactions up to that day
      const spentUpToDay = state.transactions
        .filter((t) => t.day <= day && t.type === 'expense' && !t.isSimulated)
        .reduce((sum, t) => sum + t.amount, 0);
      const savedUpToDay = state.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
      const historicalBal = Math.max(0, state.totalBudget - spentUpToDay - (day === state.currentDay ? savedUpToDay : 0));
      
      points.push({
        day,
        baselineBalance: historicalBal,
        simulatedBalance: simulation ? historicalBal : undefined,
        unpaidCommitmentsAtDay: 0,
        dailyAllowance: baselineDailyAllowance,
        isActual: true,
      });
    } else if (day === state.currentDay) {
      points.push({
        day,
        baselineBalance: runningBaseline,
        simulatedBalance: simulation ? runningSimulated : undefined,
        unpaidCommitmentsAtDay: totalDueToday,
        dailyAllowance: baselineDailyAllowance,
        isActual: true,
      });
    } else {
      // Projected future days
      // Baseline drops by scheduled commitments + daily allowance
      runningBaseline = Math.max(0, runningBaseline - totalDueToday - baselineDailyAllowance);
      
      // Simulated drops by scheduled commitments + simulated daily allowance
      let simExpenseToday = 0;
      if (simulation && simulation.plannedDay === day) {
        simExpenseToday += simulation.amount;
      }
      runningSimulated = Math.max(0, runningSimulated - totalDueToday - simulatedDailyAllowance - simExpenseToday);

      points.push({
        day,
        baselineBalance: Math.round(runningBaseline),
        simulatedBalance: simulation ? Math.round(runningSimulated) : undefined,
        unpaidCommitmentsAtDay: totalDueToday,
        dailyAllowance: simulation ? simulatedDailyAllowance : baselineDailyAllowance,
        isActual: false,
      });
    }
  }

  return points;
}

/**
 * Creates a hypothetical cloned FinancialState reflecting a proposed simulation decision
 * without mutating or persisting anything in the real state.
 */
export function applySimulationToState(
  state: FinancialState,
  decision: SimulationDecision
): FinancialState {
  const simulatedTx: import('../types/finance').Transaction = {
    id: 'sim_tx_preview',
    description: decision.name,
    amount: decision.amount,
    category: decision.category,
    day: decision.plannedDay,
    dateStr: `Day ${decision.plannedDay}`,
    type: 'expense',
    paymentMethod: 'UPI',
    isSimulated: true,
  };

  // If recurring, also model recurring commitments if needed
  let updatedCommitments = [...state.commitments];
  if (decision.isRecurring && decision.recurrenceCount && decision.recurrenceCount > 1) {
    // Add additional recurring occurrences
    for (let i = 1; i < decision.recurrenceCount; i++) {
      const nextDay = Math.min(state.totalDays, decision.plannedDay + i * 7);
      if (nextDay <= state.totalDays) {
        updatedCommitments.push({
          id: `sim_recurring_${i}`,
          name: `${decision.name} (Repeat #${i + 1})`,
          amount: decision.amount,
          category: decision.category,
          dueDay: nextDay,
          isPaid: false,
          isEssential: decision.isEssential,
        });
      }
    }
  }

  return {
    ...state,
    commitments: updatedCommitments,
    transactions: [...state.transactions, simulatedTx],
  };
}

/**
 * Compare an active simulation against the current baseline.
 */
export function calculateSimulationComparison(
  state: FinancialState,
  decision: SimulationDecision
) {
  const baselineAvailable = calculateAvailableCash(state);
  const baselineAllowance = calculateDailyAllowance(state);
  const baselineProjectedDay30 = calculateProjectedDay30Balance(state);
  const baselineHealth = calculateFinancialHealth(state);
  const baselineRisk = calculateFinancialRisk(state);
  const baselineCoverage = calculateEssentialCoverageDays(state);
  const primaryTarget = calculatePrimarySavingsTarget(state);
  const totalSaved = calculateTotalSaved(state);
  const unfundedSavings = Math.max(0, primaryTarget - totalSaved);

  const simulatedState = applySimulationToState(state, decision);
  const simulatedAvailable = calculateAvailableCash(simulatedState);
  const simulatedAllowance = calculateDailyAllowance(simulatedState);
  const simulatedProjectedDay30 = calculateProjectedDay30Balance(simulatedState);
  const simulatedHealth = calculateFinancialHealth(simulatedState);
  const simulatedRisk = calculateFinancialRisk(simulatedState);
  const simulatedCoverage = calculateEssentialCoverageDays(simulatedState);

  const commitments = calculateRemainingCommitments(simulatedState);
  const surplusAfterDecision = simulatedAvailable - commitments;
  const isSavingsFeasible = surplusAfterDecision >= unfundedSavings;
  const savingsShortfall = Math.max(0, unfundedSavings - Math.max(0, surplusAfterDecision));

  return {
    decision,
    baseline: {
      availableCash: baselineAvailable,
      dailyAllowance: baselineAllowance,
      projectedDay30Balance: baselineProjectedDay30,
      healthScore: baselineHealth.score,
      healthStatus: baselineHealth.status,
      riskScore: baselineRisk.riskScore,
      riskBand: baselineRisk.riskBand,
      essentialDaysCovered: baselineCoverage,
    },
    simulated: {
      availableCash: simulatedAvailable,
      dailyAllowance: simulatedAllowance,
      projectedDay30Balance: simulatedProjectedDay30,
      healthScore: simulatedHealth.score,
      healthStatus: simulatedHealth.status,
      riskScore: simulatedRisk.riskScore,
      riskBand: simulatedRisk.riskBand,
      essentialDaysCovered: simulatedCoverage,
      isSavingsFeasible,
      savingsShortfall,
    },
    deltas: {
      cashDelta: -decision.amount,
      dailyAllowanceDelta: simulatedAllowance - baselineAllowance,
      projectedDay30Delta: simulatedProjectedDay30 - baselineProjectedDay30,
      healthDelta: simulatedHealth.score - baselineHealth.score,
      riskDelta: simulatedRisk.riskScore - baselineRisk.riskScore,
      coverageDelta: simulatedCoverage - baselineCoverage,
    },
  };
}

/**
 * Generate intelligent rule-based financial insights.
 */
export function generateSmartInsights(state: FinancialState): {
  id: string;
  type: 'positive' | 'warning' | 'tip' | 'urgent';
  title: string;
  message: string;
  metricLabel?: string;
  metricValue?: string;
  actionText?: string;
}[] {
  const insights: Array<{
    id: string;
    type: 'positive' | 'warning' | 'tip' | 'urgent';
    title: string;
    message: string;
    metricLabel?: string;
    metricValue?: string;
    actionText?: string;
  }> = [];

  const available = calculateAvailableCash(state);
  const commitments = calculateRemainingCommitments(state);
  const dailyAllowance = calculateDailyAllowance(state);
  const actualSpent = calculateActualSpent(state);
  const totalSaved = calculateTotalSaved(state);
  const primaryTarget = calculatePrimarySavingsTarget(state);
  const remainingDays = calculateRemainingDays(state);
  const activeSubs = state.subscriptions.filter((s) => s.isActive);
  const activeSubsMonthly = activeSubs.reduce((sum, s) => sum + s.monthlyPrice, 0);

  // 1. Safe-to-Spend Today Insight
  insights.push({
    id: 'insight_safe_today',
    type: dailyAllowance >= 100 ? 'positive' : 'warning',
    title: 'Daily Spending Discipline',
    message: `You can safely spend ₹${dailyAllowance} today while maintaining your ₹${primaryTarget.toLocaleString('en-IN')} savings plan and covering all ₹${commitments.toLocaleString('en-IN')} essential commitments.`,
    metricLabel: 'Safe Allowance',
    metricValue: `₹${dailyAllowance}/day`,
  });

  // 2. Spending Pace Check
  const expectedPaceSpent = (state.totalBudget / 30) * Math.max(1, state.currentDay - 1);
  if (actualSpent > expectedPaceSpent * 1.3 && state.currentDay > 1) {
    const discretionarySpent = state.transactions
      .filter((t) => t.type === 'expense' && !t.isSimulated && (t.category === 'Shopping' || t.category === 'Entertainment'))
      .reduce((sum, t) => sum + t.amount, 0);
    insights.push({
      id: 'insight_pace_warning',
      type: 'warning',
      title: 'Pace Acceleration Detected',
      message: `You have spent ₹${actualSpent.toLocaleString('en-IN')} in the first ${state.currentDay} days. Non-essential categories account for ₹${discretionarySpent.toLocaleString('en-IN')}.`,
      metricLabel: 'Burn Pace',
      metricValue: `${Math.round((actualSpent / expectedPaceSpent) * 100)}% of pace`,
    });
  }

  // 3. Subscription Load Insight
  if (activeSubs.length > 0) {
    insights.push({
      id: 'insight_subscriptions',
      type: activeSubsMonthly > 400 ? 'warning' : 'tip',
      title: 'Subscription Load',
      message: `Your ${activeSubs.length} active subscriptions account for ₹${activeSubsMonthly}/month in recurring commitments (₹${(activeSubsMonthly * 12).toLocaleString('en-IN')}/year).`,
      metricLabel: 'Annual Cost',
      metricValue: `₹${(activeSubsMonthly * 12).toLocaleString('en-IN')}`,
    });
  }

  // 4. Savings Progress
  const unfunded = Math.max(0, primaryTarget - totalSaved);
  if (totalSaved >= primaryTarget) {
    insights.push({
      id: 'insight_savings_done',
      type: 'positive',
      title: 'Savings Goal Unlocked',
      message: `Congratulations! Your emergency buffer target of ₹${primaryTarget.toLocaleString('en-IN')} is fully funded and safe in your vault.`,
      metricLabel: 'Saved',
      metricValue: `₹${totalSaved.toLocaleString('en-IN')}`,
    });
  } else if (available - commitments < unfunded) {
    insights.push({
      id: 'insight_savings_pressure',
      type: 'urgent',
      title: 'Savings Target Under Pressure',
      message: `Your current discretionary pace could leave you ₹${(unfunded - Math.max(0, available - commitments)).toLocaleString('en-IN')} short of your ₹${primaryTarget.toLocaleString('en-IN')} savings target on Day 30.`,
      metricLabel: 'Projected Gap',
      metricValue: `₹${(unfunded - Math.max(0, available - commitments)).toLocaleString('en-IN')}`,
    });
  }

  // 5. Small optimization tip
  insights.push({
    id: 'insight_micro_cut',
    type: 'tip',
    title: 'Small Cut, Big Leverage',
    message: `Reducing food delivery by ₹100 per week preserves ₹400 over 4 weeks, boosting your daily safe allowance by +₹${Math.floor(400 / remainingDays)}/day.`,
    metricLabel: '4-Week Gain',
    metricValue: '+₹400',
  });

  return insights;
}
