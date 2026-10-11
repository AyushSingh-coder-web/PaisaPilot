import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import {
  AlertTriangle,
  Stethoscope,
  Laptop,
  Plane,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  RotateCcw,
} from 'lucide-react';
import { SimulationDecision } from '../../types/finance';
import { calculateSimulationComparison } from '../../utils/calculations';

interface EmergencyScenario {
  id: string;
  name: string;
  amount: number;
  icon: any;
  description: string;
  category: 'Health' | 'Bills' | 'Transport' | 'Other';
}

export const EmergencyLab: React.FC = () => {
  const {
    state,
    availableCash,
    dailyAllowance,
    projectedDay30Balance,
    financialHealth,
    financialRisk,
    essentialCoverageDays,
    totalSaved,
    addTransaction,
    toggleSubscription,
  } = useFinance();
  const { showToast } = useToast();

  const PRESETS: EmergencyScenario[] = [
    {
      id: 'em_medical',
      name: 'Urgent Medical Clinic & Pharmacy',
      amount: 2000,
      icon: Stethoscope,
      description: 'Acute fever, blood tests, and doctor prescription bill',
      category: 'Health',
    },
    {
      id: 'em_laptop',
      name: 'Laptop Display / Battery Repair',
      amount: 1200,
      icon: Laptop,
      description: 'Critical device repair for college submissions & projects',
      category: 'Bills',
    },
    {
      id: 'em_travel',
      name: 'Emergency Home Travel',
      amount: 1500,
      icon: Plane,
      description: 'Last-minute train / bus tickets for family requirement',
      category: 'Transport',
    },
    {
      id: 'em_family',
      name: 'Urgent Family Contribution',
      amount: 1000,
      icon: HeartHandshake,
      description: 'Shared family emergency need during mid-month',
      category: 'Other',
    },
  ];

  const [selectedPresetId, setSelectedPresetId] = useState<string>('em_medical');
  const [customAmount, setCustomAmount] = useState<number>(2000);
  const [customTitle, setCustomTitle] = useState<string>('Urgent Medical Clinic & Pharmacy');

  // Recovery Action Toggles (What-If Recovery Simulator)
  const [recoveryCutDiscretionary, setRecoveryCutDiscretionary] = useState(true);
  const [recoveryPauseSubs, setRecoveryPauseSubs] = useState(true);
  const [recoveryAdjustSavings, setRecoveryAdjustSavings] = useState(false);

  const activePreset = PRESETS.find((p) => p.id === selectedPresetId);

  const emergencyDecision: SimulationDecision = useMemo(() => {
    return {
      name: customTitle,
      amount: customAmount,
      category: activePreset ? (activePreset.category as any) : 'Health',
      plannedDay: state.currentDay,
      isRecurring: false,
      isEssential: true,
    };
  }, [customTitle, customAmount, activePreset, state.currentDay]);

  const shockComparison = useMemo(() => {
    return calculateSimulationComparison(state, emergencyDecision);
  }, [state, emergencyDecision]);

  // Calculate recovery leverage
  const optionalSubs = state.subscriptions.filter((s) => s.isActive && !s.isEssential);
  const optionalSubsSavings = optionalSubs.reduce((sum, s) => sum + s.monthlyPrice, 0);

  const discretionaryRecoveryPerDay = recoveryCutDiscretionary
    ? Math.round(shockComparison.simulated.dailyAllowance * 0.3)
    : 0;

  const totalMonthlyRecoveryShield = (recoveryPauseSubs ? optionalSubsSavings : 0) + (recoveryCutDiscretionary ? discretionaryRecoveryPerDay * Math.max(1, 30 - state.currentDay + 1) : 0);

  const handleSelectPreset = (p: EmergencyScenario) => {
    setSelectedPresetId(p.id);
    setCustomAmount(p.amount);
    setCustomTitle(p.name);
  };

  const handleApplyEmergencyAndRecovery = () => {
    // 1. Add emergency expense
    addTransaction({
      description: `Emergency: ${customTitle}`,
      amount: customAmount,
      category: activePreset ? (activePreset.category as any) : 'Health',
      day: state.currentDay,
      dateStr: `Day ${state.currentDay}`,
      type: 'expense',
      paymentMethod: 'UPI',
    });

    // 2. If recovery actions selected, apply them
    if (recoveryPauseSubs) {
      optionalSubs.forEach((s) => {
        toggleSubscription(s.id);
      });
    }

    showToast(`Emergency of ₹${customAmount.toLocaleString('en-IN')} recorded & recovery levers activated.`, 'warning');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
            <span>Resilience Testing Lab</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Unexpected Expense Shock Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Stress-test your financial model against sudden real-world shocks. Formulate an actionable recovery plan without falling into debt.
          </p>
        </div>
      </div>

      {/* Preset Emergency Chooser */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRESETS.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPresetId === p.id;

          return (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-rose-50/60 border-rose-500 shadow-xs ring-1 ring-rose-500/30'
                  : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  ₹{p.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-900 truncate">{p.name}</div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>
            </button>
          );
        })}
      </div>

      {/* Live Shock Impact Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 spans): Shock Consequence Card */}
        <div className="lg:col-span-6 p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Immediate Shock Consequence</span>
            </h2>
            <span className="text-xs font-bold text-rose-600 tabular-nums">
              -₹{customAmount.toLocaleString('en-IN')} Shock
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Liquid Cash Remaining:</span>
              <div className="flex items-center gap-3 font-semibold tabular-nums">
                <span className="text-slate-400">₹{availableCash.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <span className={shockComparison.simulated.availableCash < 1500 ? 'text-rose-600' : 'text-slate-900'}>
                  ₹{shockComparison.simulated.availableCash.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Safe Daily Allowance:</span>
              <div className="flex items-center gap-3 font-semibold tabular-nums">
                <span className="text-slate-400">₹{dailyAllowance}/day</span>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <span className={shockComparison.simulated.dailyAllowance < 60 ? 'text-rose-600' : 'text-slate-900'}>
                  ₹{shockComparison.simulated.dailyAllowance}/day
                </span>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Essential Expense Coverage:</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {shockComparison.simulated.essentialDaysCovered} days covered
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Risk Assessment:</span>
              <span className="font-bold text-rose-600">
                {shockComparison.simulated.riskBand} ({shockComparison.simulated.riskScore}/100)
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Savings Target Feasibility:</span>
              <span className={shockComparison.simulated.isSavingsFeasible ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                {shockComparison.simulated.isSavingsFeasible ? 'Preserved' : `₹${shockComparison.simulated.savingsShortfall.toLocaleString('en-IN')} Deficit`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (6 spans): Actionable Recovery Plan */}
        <div className="lg:col-span-6 p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Recommended Recovery Plan</span>
            </h2>
            <span className="text-xs font-bold text-emerald-700 tabular-nums">
              +₹{totalMonthlyRecoveryShield.toLocaleString('en-IN')} Shield
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Select multi-lever adjustments to absorb the shock over the remaining {Math.max(1, 30 - state.currentDay + 1)} days:
          </p>

          <div className="space-y-2.5">
            {/* Lever 1: Pause Subscriptions */}
            <label className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex items-start gap-3 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={recoveryPauseSubs}
                onChange={(e) => setRecoveryPauseSubs(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div className="text-xs flex-1">
                <div className="font-semibold text-slate-900 flex justify-between">
                  <span>Pause Optional Subscriptions</span>
                  <span className="text-emerald-700 font-bold tabular-nums">+₹{optionalSubsSavings}</span>
                </div>
                <div className="text-slate-500 mt-0.5">
                  Temporarily pause {optionalSubs.length} non-essential services (Spotify, Netflix) for the rest of this month.
                </div>
              </div>
            </label>

            {/* Lever 2: Discretionary Daily Diet */}
            <label className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex items-start gap-3 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={recoveryCutDiscretionary}
                onChange={(e) => setRecoveryCutDiscretionary(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div className="text-xs flex-1">
                <div className="font-semibold text-slate-900 flex justify-between">
                  <span>Trim Non-Essential Daily Outings by 30%</span>
                  <span className="text-emerald-700 font-bold tabular-nums">
                    +₹{discretionaryRecoveryPerDay * Math.max(1, 30 - state.currentDay + 1)}
                  </span>
                </div>
                <div className="text-slate-500 mt-0.5">
                  Cap food deliveries and casual cafes for the next {Math.max(1, 30 - state.currentDay + 1)} days.
                </div>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Restores safe allowance back to: <strong className="text-emerald-700 tabular-nums">
                ₹{Math.max(20, shockComparison.simulated.dailyAllowance + Math.floor(totalMonthlyRecoveryShield / Math.max(1, 30 - state.currentDay + 1)))}/day
              </strong>
            </div>

            <button
              type="button"
              onClick={handleApplyEmergencyAndRecovery}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs text-center cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              Apply Shock & Recovery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
