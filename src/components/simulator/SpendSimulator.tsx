import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import {
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Layers,
  HelpCircle,
  TrendingDown,
  Calendar,
  Wallet,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { CategoryType, SimulationDecision } from '../../types/finance';
import { calculateSimulationComparison } from '../../utils/calculations';

interface SpendSimulatorProps {
  onCommitSuccess?: () => void;
}

export const SpendSimulator: React.FC<SpendSimulatorProps> = ({ onCommitSuccess }) => {
  const {
    state,
    availableCash,
    dailyAllowance,
    projectedDay30Balance,
    financialHealth,
    financialRisk,
    essentialCoverageDays,
    setSimulation,
    clearSimulation,
    confirmSimulation,
  } = useFinance();

  // Mode: Single Simulator vs Multi-Option Comparison
  const [mode, setMode] = useState<'single' | 'compare'>('single');

  // Single Simulation Form State
  const [name, setName] = useState('New Sneakers');
  const [amount, setAmount] = useState(1500);
  const [category, setCategory] = useState<CategoryType>('Shopping');
  const [plannedDay, setPlannedDay] = useState(state.currentDay);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceCount, setRecurrenceCount] = useState(2);
  const [isEssential, setIsEssential] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Preset Scenarios
  const PRESET_DECISIONS: Array<{
    name: string;
    amount: number;
    category: CategoryType;
    isEssential: boolean;
    description: string;
  }> = [
    {
      name: 'Trendy Sneakers',
      amount: 1500,
      category: 'Shopping',
      isEssential: false,
      description: 'Impulsive footwear purchase',
    },
    {
      name: 'Weekend Cafe & Outing',
      amount: 600,
      category: 'Entertainment',
      isEssential: false,
      description: 'Dinner with campus friends',
    },
    {
      name: 'Swiggy Gourmet Delivery',
      amount: 350,
      category: 'Food',
      isEssential: false,
      description: 'Late night comfort food',
    },
    {
      name: 'Mechanical Keyboard / Gadget',
      amount: 2500,
      category: 'Shopping',
      isEssential: false,
      description: 'Desk setup upgrade',
    },
    {
      name: 'Emergency Pharmacy & Clinic',
      amount: 2000,
      category: 'Health',
      isEssential: true,
      description: 'Unplanned medical emergency',
    },
    {
      name: 'Weekly Meal Prep Boost',
      amount: 300,
      category: 'Food',
      isEssential: true,
      description: 'Extra groceries for exams',
    },
  ];

  // Active decision object
  const currentDecision: SimulationDecision = useMemo(
    () => ({
      name,
      amount: Math.max(0, amount),
      category,
      plannedDay,
      isRecurring,
      recurrenceCount: isRecurring ? recurrenceCount : 1,
      isEssential,
    }),
    [name, amount, category, plannedDay, isRecurring, recurrenceCount, isEssential]
  );

  // Compute live comparison
  const comparison = useMemo(() => {
    return calculateSimulationComparison(state, currentDecision);
  }, [state, currentDecision]);

  // Sync to global context so dashboard charts react immediately!
  React.useEffect(() => {
    setSimulation(currentDecision);
    return () => {
      // Don't auto-clear if leaving page unless explicitly discarded
    };
  }, [currentDecision, setSimulation]);

  const { showToast } = useToast();

  // Close confirmation modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConfirmModal) {
        setShowConfirmModal(false);
      }
    };
    if (showConfirmModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfirmModal]);

  const handleApplyPreset = (preset: typeof PRESET_DECISIONS[0]) => {
    setName(preset.name);
    setAmount(preset.amount);
    setCategory(preset.category);
    setIsEssential(preset.isEssential);
    setIsRecurring(false);
    showToast(`Loaded preset: ${preset.name}`, 'info');
  };

  const handleConfirmDecision = () => {
    confirmSimulation();
    setShowConfirmModal(false);
    showToast(`Committed ₹${amount.toLocaleString('en-IN')} expense for "${name}".`, 'success');
    if (onCommitSuccess) onCommitSuccess();
  };

  const handleDiscard = () => {
    clearSimulation();
    setName('New Sneakers');
    setAmount(1500);
    showToast('Simulation cleared.', 'info');
  };

  // Multi-Option Comparison presets
  const [optionA, setOptionA] = useState<SimulationDecision>({
    name: 'Option A: Buy ₹1,500 Sneakers',
    amount: 1500,
    category: 'Shopping',
    plannedDay: state.currentDay,
    isRecurring: false,
    isEssential: false,
  });

  const [optionB, setOptionB] = useState<SimulationDecision>({
    name: 'Option B: Budget ₹700 Sneakers',
    amount: 700,
    category: 'Shopping',
    plannedDay: state.currentDay,
    isRecurring: false,
    isEssential: false,
  });

  const [optionC, setOptionC] = useState<SimulationDecision>({
    name: 'Option C: Delay to Next Month (₹0)',
    amount: 0,
    category: 'Shopping',
    plannedDay: state.currentDay,
    isRecurring: false,
    isEssential: false,
  });

  const comparisonA = useMemo(() => calculateSimulationComparison(state, optionA), [state, optionA]);
  const comparisonB = useMemo(() => calculateSimulationComparison(state, optionB), [state, optionB]);
  const comparisonC = useMemo(() => calculateSimulationComparison(state, optionC), [state, optionC]);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <span>PaisaPilot Core Innovation</span>
            <span>·</span>
            <span>Zero Commitment Risk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Spend Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Preview how a purchase changes your daily safe allowance, Day 30 balance, and savings goals <em className="text-slate-700 not-italic font-medium">before</em> you spend.
          </p>
        </div>

        {/* Segmented Control: Single vs Multi-Option Compare */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setMode('single')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'single'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Simulator
          </button>
          <button
            onClick={() => setMode('compare')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'compare'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3-Way Comparison
          </button>
        </div>
      </div>

      {mode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 spans): Simulator Controls & Presets */}
          <div className="lg:col-span-5 space-y-5">
            {/* Quick Presets Strip */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Quick Scenario Presets</span>
                <span className="text-[11px] text-emerald-700 font-semibold">1-Click Test</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_DECISIONS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 text-left border border-slate-200/80 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors group"
                  >
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-950 truncate">
                      {preset.name}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span>{preset.category}</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        ₹{preset.amount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Interactive Controls */}
            <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Custom Decision Parameters</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Decision or Purchase Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Concert ticket, Air Jordan sneakers"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Amount</span>
                    <span className="font-bold text-slate-900 tabular-nums text-sm">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max={Math.max(5000, availableCash)}
                    step="50"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 tabular-nums">
                    <span>₹50</span>
                    <span>₹1,500</span>
                    <span>₹3,000</span>
                    <span>₹{Math.max(5000, availableCash)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as CategoryType)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Shopping">Shopping</option>
                      <option value="Food">Food</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Transport">Transport</option>
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                      <option value="Bills">Bills</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Planned Day
                    </label>
                    <select
                      value={plannedDay}
                      onChange={(e) => setPlannedDay(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {Array.from({ length: 30 - state.currentDay + 1 }, (_, i) => state.currentDay + i).map((d) => (
                        <option key={d} value={d}>
                          Day {d} {d === state.currentDay ? '(Today)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Recurrence & Essential Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span>Repeats weekly in this 30-day challenge</span>
                  </label>

                  {isRecurring && (
                    <div className="pl-6 text-[11px] text-slate-500">
                      Total commitment over remaining days: ₹{(amount * recurrenceCount).toLocaleString('en-IN')}
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={isEssential}
                      onChange={(e) => setIsEssential(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span>Classified as Essential Need (vs Discretionary Want)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 spans): Live Simulation Impact & Before/After */}
          <div className="lg:col-span-7 space-y-5">
            {/* Simulation Header Banner */}
            <div className="p-5 bg-slate-900 text-white rounded-xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                    Live Impact Projection
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Hypothetical decision · Not charged yet
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <div className="text-[11px] text-slate-400">Simulated Cash</div>
                  <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                    ₹{comparison.simulated.availableCash.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-rose-400 tabular-nums">
                    -₹{comparison.decision.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400">Safe Daily Allowance</div>
                  <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                    ₹{comparison.simulated.dailyAllowance}
                    <span className="text-xs font-normal text-slate-400">/day</span>
                  </div>
                  <div className={`text-[10px] tabular-nums ${comparison.deltas.dailyAllowanceDelta < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {comparison.deltas.dailyAllowanceDelta >= 0 ? '+' : ''}₹{comparison.deltas.dailyAllowanceDelta}/day
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400">Health Score</div>
                  <div className="text-xl font-bold tabular-nums mt-0.5" style={{ color: comparison.simulated.healthScore >= 70 ? '#34d399' : '#f87171' }}>
                    {comparison.simulated.healthScore}/100
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {comparison.deltas.healthDelta} pts
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400">Day 30 Forecast</div>
                  <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                    ₹{comparison.simulated.projectedDay30Balance.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Net after savings
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Before vs After Comparison Card */}
            <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Before vs. After Consequences</h2>

              <div className="divide-y divide-slate-100 text-xs">
                {/* Row 1: Available Liquidity */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                  <div>
                    <div className="font-semibold text-slate-800">Liquid Cash Balance</div>
                    <div className="text-slate-500 text-[11px]">Immediate in-hand cash after purchase</div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto text-right">
                    <div>
                      <div className="text-slate-500 tabular-nums">₹{comparison.baseline.availableCash.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400">Baseline</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 tabular-nums">
                        ₹{comparison.simulated.availableCash.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-rose-600 font-semibold">-₹{comparison.decision.amount}</div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Daily Allowance */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                  <div>
                    <div className="font-semibold text-slate-800">Safe Daily Allowance</div>
                    <div className="text-slate-500 text-[11px]">Discretionary limit to reach Day 30 safely</div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto text-right">
                    <div>
                      <div className="text-slate-500 tabular-nums">₹{comparison.baseline.dailyAllowance}/day</div>
                      <div className="text-[10px] text-slate-400">Baseline</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 tabular-nums">
                        ₹{comparison.simulated.dailyAllowance}/day
                      </div>
                      <div className={`text-[10px] font-semibold ${comparison.deltas.dailyAllowanceDelta < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {comparison.deltas.dailyAllowanceDelta} ₹/day
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Savings Target Impact */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                  <div>
                    <div className="font-semibold text-slate-800">Primary Savings Feasibility</div>
                    <div className="text-slate-500 text-[11px]">Can ₹2,000 emergency buffer still be funded?</div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-auto text-right">
                    {comparison.simulated.isSavingsFeasible ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Achievable</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>Shortfall ₹{comparison.simulated.savingsShortfall.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 4: Essential Needs Coverage */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                  <div>
                    <div className="font-semibold text-slate-800">Essential Expense Coverage</div>
                    <div className="text-slate-500 text-[11px]">Days of mandatory groceries & transit covered</div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-auto text-right">
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {comparison.simulated.essentialDaysCovered} days
                    </span>
                  </div>
                </div>

                {/* Row 5: Risk Level */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                  <div>
                    <div className="font-semibold text-slate-800">Financial Risk Assessment</div>
                    <div className="text-slate-500 text-[11px]">Probability of budget stress before Day 30</div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="font-semibold" style={{ color: comparison.simulated.riskBand === 'Low Risk' ? '#16a34a' : comparison.simulated.riskBand === 'Moderate Risk' ? '#d97706' : '#dc2626' }}>
                      {comparison.simulated.riskBand}
                    </span>
                    <span className="text-slate-400">({comparison.simulated.riskScore}/100)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Keep Exploring vs Confirm Decision */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleDiscard}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Keep Exploring (Discard)</span>
                </button>

                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Decision (Commit ₹{amount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Multi-Option Comparison View (Option A vs Option B vs Option C) */
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <strong>Simulation Comparison Mode:</strong> Compare 3 alternative paths side-by-side to understand trade-offs before deciding. No decision is wrong—each path creates a different financial future.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Option A */}
            <div className="p-5 bg-white rounded-xl border-2 border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Choice 1</span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">₹{optionA.amount}</span>
                </div>
                <input
                  type="text"
                  value={optionA.name}
                  onChange={(e) => setOptionA({ ...optionA, name: e.target.value })}
                  className="w-full text-sm font-semibold text-slate-900 border-b border-slate-200 pb-1 focus:outline-none"
                />
                <div className="text-xs text-slate-500">
                  Amount: ₹
                  <input
                    type="number"
                    value={optionA.amount}
                    onChange={(e) => setOptionA({ ...optionA, amount: Number(e.target.value) })}
                    className="w-20 font-bold text-slate-900 border-b border-slate-300 ml-1 px-1"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Cash:</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      ₹{comparisonA.simulated.availableCash.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Safe Daily Allowance:</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      ₹{comparisonA.simulated.dailyAllowance}/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Health Score:</span>
                    <span className="font-bold tabular-nums" style={{ color: comparisonA.simulated.healthScore >= 70 ? '#16a34a' : '#d97706' }}>
                      {comparisonA.simulated.healthScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Savings Feasible:</span>
                    <span className={comparisonA.simulated.isSavingsFeasible ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                      {comparisonA.simulated.isSavingsFeasible ? 'Yes' : 'Squeezed'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSimulation(optionA);
                  confirmSimulation();
                }}
                className="w-full py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Choose Option A
              </button>
            </div>

            {/* Option B */}
            <div className="p-5 bg-white rounded-xl border-2 border-emerald-500 shadow-sm space-y-4 flex flex-col justify-between relative">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                Balanced Trade-off
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Choice 2</span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">₹{optionB.amount}</span>
                </div>
                <input
                  type="text"
                  value={optionB.name}
                  onChange={(e) => setOptionB({ ...optionB, name: e.target.value })}
                  className="w-full text-sm font-semibold text-slate-900 border-b border-slate-200 pb-1 focus:outline-none"
                />
                <div className="text-xs text-slate-500">
                  Amount: ₹
                  <input
                    type="number"
                    value={optionB.amount}
                    onChange={(e) => setOptionB({ ...optionB, amount: Number(e.target.value) })}
                    className="w-20 font-bold text-slate-900 border-b border-slate-300 ml-1 px-1"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Cash:</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      ₹{comparisonB.simulated.availableCash.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Safe Daily Allowance:</span>
                    <span className="font-semibold tabular-nums text-emerald-700 font-bold">
                      ₹{comparisonB.simulated.dailyAllowance}/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Health Score:</span>
                    <span className="font-bold tabular-nums" style={{ color: comparisonB.simulated.healthScore >= 70 ? '#16a34a' : '#d97706' }}>
                      {comparisonB.simulated.healthScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Savings Feasible:</span>
                    <span className="text-emerald-700 font-semibold">100% Achievable</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSimulation(optionB);
                  confirmSimulation();
                }}
                className="w-full py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
              >
                Choose Option B
              </button>
            </div>

            {/* Option C */}
            <div className="p-5 bg-white rounded-xl border-2 border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Choice 3</span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">₹{optionC.amount}</span>
                </div>
                <input
                  type="text"
                  value={optionC.name}
                  onChange={(e) => setOptionC({ ...optionC, name: e.target.value })}
                  className="w-full text-sm font-semibold text-slate-900 border-b border-slate-200 pb-1 focus:outline-none"
                />
                <div className="text-xs text-slate-500">
                  Amount: ₹
                  <input
                    type="number"
                    value={optionC.amount}
                    onChange={(e) => setOptionC({ ...optionC, amount: Number(e.target.value) })}
                    className="w-20 font-bold text-slate-900 border-b border-slate-300 ml-1 px-1"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Cash:</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      ₹{comparisonC.simulated.availableCash.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Safe Daily Allowance:</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      ₹{comparisonC.simulated.dailyAllowance}/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Health Score:</span>
                    <span className="font-bold tabular-nums text-emerald-700">
                      {comparisonC.simulated.healthScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Savings Feasible:</span>
                    <span className="text-emerald-700 font-semibold">Max Surplus</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  clearSimulation();
                  setMode('single');
                }}
                className="w-full py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Delay Purchase (Save Money)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-decision-title"
          aria-describedby="confirm-decision-desc"
        >
          <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 id="confirm-decision-title" className="text-base font-semibold text-slate-900">Confirm Real Financial Move</h3>
            <p id="confirm-decision-desc" className="text-xs text-slate-600">
              Are you sure you want to commit <strong>₹{amount.toLocaleString('en-IN')}</strong> for <strong>{name}</strong>?
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Available cash will become:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{(availableCash - amount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Daily allowance will shift to:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{comparison.simulated.dailyAllowance}/day
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-2xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Yes, Commit Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
