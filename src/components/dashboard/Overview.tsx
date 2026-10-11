import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import {
  Wallet,
  Calendar,
  AlertCircle,
  TrendingDown,
  Plus,
  Trash2,
  SlidersHorizontal,
  Info,
  Clock,
  ShieldCheck,
  Zap,
  Download,
  FileSpreadsheet,
  FileCode,
  Check,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { CategoryType } from '../../types/finance';
import { exportReportCSV, exportReportJSON } from '../../utils/exportReport';

const CATEGORY_COLORS: Record<CategoryType, string> = {
  Food: '#f59e0b',
  Transport: '#0284c7',
  Shopping: '#ec4899',
  Entertainment: '#8b5cf6',
  Education: '#10b981',
  Bills: '#64748b',
  Health: '#ef4444',
  Other: '#94a3b8',
};

interface OverviewProps {
  onNavigateToSimulator: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigateToSimulator }) => {
  const {
    state,
    availableCash,
    actualSpent,
    totalSaved,
    remainingCommitments,
    dailyAllowance,
    spentToday,
    remainingTodayAllowance,
    projectedDay30Balance,
    financialHealth,
    financialRisk,
    forecastPoints,
    addTransaction,
    deleteTransaction,
  } = useFinance();
  const { showToast } = useToast();

  // Add Transaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryType>('Food');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'UPI' | 'Card' | 'Cash' | 'NetBanking'>('UPI');
  const [addTxError, setAddTxError] = useState<string | null>(null);

  // Export Report Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
        if (isExportModalOpen) setIsExportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, isExportModalOpen]);

  // Handle Add Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setAddTxError(null);
    const amountNum = parseFloat(newAmount);
    if (!newTitle.trim()) {
      setAddTxError('Please enter a description or vendor name.');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setAddTxError('Please enter a valid positive expense amount.');
      return;
    }
    if (amountNum > availableCash) {
      setAddTxError(`Amount exceeds available liquid cash (₹${availableCash.toLocaleString('en-IN')}).`);
      return;
    }

    const roundedAmount = Math.round(amountNum);
    addTransaction({
      description: newTitle.trim(),
      amount: roundedAmount,
      category: newCategory,
      day: state.currentDay,
      dateStr: `Day ${state.currentDay}`,
      type: 'expense',
      paymentMethod: newPaymentMethod,
    });

    showToast(`Recorded ₹${roundedAmount.toLocaleString('en-IN')} expense for "${newTitle.trim()}".`, 'success');
    setNewTitle('');
    setNewAmount('');
    setAddTxError(null);
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    exportReportCSV(state);
    setExportFeedback('CSV report downloaded successfully!');
    showToast('Downloaded CSV financial audit report.', 'success');
    setTimeout(() => {
      setExportFeedback(null);
      setIsExportModalOpen(false);
    }, 1500);
  };

  const handleExportJSON = () => {
    exportReportJSON(state);
    setExportFeedback('JSON audit report downloaded successfully!');
    showToast('Downloaded JSON full state audit file.', 'success');
    setTimeout(() => {
      setExportFeedback(null);
      setIsExportModalOpen(false);
    }, 1500);
  };

  // Spending by Category calculation
  const categorySpendingData = useMemo(() => {
    const map: Record<string, number> = {};
    state.transactions
      .filter((t) => t.type === 'expense' && !t.isSimulated)
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    const items = Object.entries(map).map(([category, value]) => ({
      name: category,
      value,
      color: CATEGORY_COLORS[category as CategoryType] || '#94a3b8',
    }));

    if (items.length === 0) {
      return [
        { name: 'Unspent Budget', value: availableCash, color: '#e2e8f0' },
      ];
    }
    return items;
  }, [state.transactions, availableCash]);

  // Daily Meter Percentage
  const dailyProgressPercent = dailyAllowance > 0
    ? Math.min(100, Math.round((spentToday / dailyAllowance) * 100))
    : 100;

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* 
        ========================================================================
        RECONFIGURED AVAILABLE LIQUID CASH CARD (SECTION 4 OF DESIGN BRIEF)
        - Clean responsive grid / flex layout
        - Left section: Challenge kicker, prominent balance, commitments & savings
        - Right section: Add Expense, Test Purchase, Export Report
        - Perfectly responsive: Desktop (2 cols), Tablet (wrap), Mobile (stacked)
        ========================================================================
      */}
      <div className="p-5 sm:p-6 lg:p-7 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl shadow-sm border border-emerald-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-8">
          {/* Left Section: Financial Information */}
          <div className="space-y-2 min-w-0 flex-1">
            {/* Challenge Kicker & Day Indicator */}
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
              <span className="tracking-wide uppercase text-[11px] font-semibold text-emerald-400">
                30-Day Budget Challenge
              </span>
              <span aria-hidden="true" className="text-emerald-500">·</span>
              <span className="bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums">
                Day {state.currentDay} of {state.totalDays}
              </span>
            </div>

            {/* Prominent Balance Headline */}
            <div className="pt-0.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                <span className="tabular-nums">₹{availableCash.toLocaleString('en-IN')}</span>
                <span className="text-emerald-100/90 font-semibold text-lg sm:text-2xl lg:text-3xl ml-2 inline-block">
                  Available Liquid Cash
                </span>
              </h1>
            </div>

            {/* Reserved Commitments and Savings Subtext */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>Reserved for Commitments:</span>
                <strong className="text-white tabular-nums font-semibold">
                  ₹{remainingCommitments.toLocaleString('en-IN')}
                </strong>
              </div>
              <span aria-hidden="true" className="text-slate-500 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Vaulted in Savings:</span>
                <strong className="text-white tabular-nums font-semibold">
                  ₹{totalSaved.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          </div>

          {/* Right Section: Action Controls (Aligned, wrap-friendly, touch-optimized) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors shadow-2xs whitespace-nowrap min-h-[42px] cursor-pointer"
              title="Record an actual expense"
            >
              <Plus className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Add Expense</span>
            </button>

            <button
              onClick={onNavigateToSimulator}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-2xs whitespace-nowrap min-h-[42px] cursor-pointer"
              title="Simulate consequences before spending"
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>Test a Purchase</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-emerald-200 bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400/50 rounded-xl transition-colors whitespace-nowrap min-h-[42px] cursor-pointer"
              title="Export monthly financial audit report (CSV / JSON)"
            >
              <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 4 Core Stat Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available vs Total */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Available to Spend</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              ₹{availableCash.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span>Total budget: ₹{state.totalBudget.toLocaleString('en-IN')}</span>
              <span>·</span>
              <span className="text-rose-600 tabular-nums font-semibold">Spent: ₹{actualSpent.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Unallocated liquid cash after vault deposits & expenses.
          </div>
        </div>

        {/* Card 2: Safe Daily Allowance */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Safe-to-Spend Today</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              ₹{dailyAllowance}
              <span className="text-xs font-normal text-slate-500">/day</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span>Spent today: ₹{spentToday}</span>
              <span>·</span>
              <span className="font-semibold text-emerald-700 tabular-nums">Left: ₹{remainingTodayAllowance}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  dailyProgressPercent >= 100
                    ? 'bg-rose-500'
                    : dailyProgressPercent > 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Reserved Commitments */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Reserved Commitments</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              ₹{remainingCommitments.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span>Essential food & bills</span>
              <span>·</span>
              <span>{state.commitments.filter(c => !c.isPaid).length} items</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Protected from discretionary spending to prevent defaults.
          </div>
        </div>

        {/* Card 4: Financial Health & Risk */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Health & Risk Index</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums" style={{ color: financialHealth.statusColor }}>
                {financialHealth.score}/100
              </span>
              <span className="text-xs font-semibold" style={{ color: financialHealth.statusColor }}>
                {financialHealth.status}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span>Risk: <strong style={{ color: financialRisk.riskBandColor }}>{financialRisk.riskBand}</strong></span>
              <span>·</span>
              <span className="tabular-nums">({financialRisk.riskScore}/100)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            {financialHealth.improvingFactors[0] || 'Commitments safely backed by liquidity.'}
          </div>
        </div>
      </div>

      {/* Main Two-Column Row: 30-Day Forecast Chart + Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): 30-Day Balance Forecast Chart */}
        <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">30-Day Balance Trajectory</h2>
              <p className="text-xs text-slate-500">
                Projected cash balance at current safe pace vs upcoming commitments
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-600 rounded"></span>
                <span className="text-slate-600 font-medium">Baseline Plan</span>
              </div>
              {state.activeSimulation && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-500 rounded border border-dashed"></span>
                  <span className="text-amber-700 font-semibold">Simulated Decision</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="simulatedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `D${v}`}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <RechartsTooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Projected Balance']}
                  labelFormatter={(label) => `Challenge Day ${label}`}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="baselineBalance"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#baselineGradient)"
                  name="Baseline"
                />
                {state.activeSimulation && (
                  <Area
                    type="monotone"
                    dataKey="simulatedBalance"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#simulatedGradient)"
                    name="Simulated"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Forecast Day 30 Balance: <strong className="text-slate-900 font-semibold tabular-nums">₹{projectedDay30Balance.toLocaleString('en-IN')}</strong></span>
            <span>Includes ₹{totalSaved.toLocaleString('en-IN')} vaulted in savings</span>
          </div>
        </div>

        {/* Right Column (1 span): Spending Breakdown Donut */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Spending Breakdown</h2>
              <span className="text-xs text-slate-500 tabular-nums font-semibold">₹{actualSpent.toLocaleString('en-IN')} spent</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Expenses categorized across your budget limits
            </p>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categorySpendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend / Category breakdown list */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100 max-h-36 overflow-y-auto">
            {categorySpendingData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 tabular-nums">
                  ₹{item.value.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Commitments & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Fixed Commitments (1 span) */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Pending Commitments</h2>
            <span className="text-xs text-slate-500 tabular-nums font-semibold">₹{remainingCommitments.toLocaleString('en-IN')} due</span>
          </div>

          <div className="space-y-2.5">
            {state.commitments
              .filter((c) => !c.isPaid && c.dueDay >= state.currentDay)
              .map((comm) => (
                <div
                  key={comm.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="text-xs font-semibold text-slate-800 truncate">{comm.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Due Day {comm.dueDay} · {comm.category}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      ₹{comm.amount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-amber-600 font-medium">Reserved</span>
                  </div>
                </div>
              ))}

            {state.commitments.filter((c) => !c.isPaid && c.dueDay >= state.currentDay).length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                All fixed commitments for this month have been marked paid!
              </div>
            )}
          </div>
        </div>

        {/* Right: Transactions Log (2 spans) */}
        <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Transactions</h2>
              <p className="text-xs text-slate-500">Recorded expenses and savings vault movements</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </button>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            {state.transactions.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-700">No transactions recorded yet</p>
                <p className="text-xs text-slate-500">
                  Log your first expense or test a purchase in the Spend Simulator.
                </p>
              </div>
            ) : (
              <div className="min-w-[500px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Day</th>
                      <th className="py-2 px-3">Payment</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {state.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {tx.description}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-1.5"
                            style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#94a3b8' }}
                          />
                          {tx.category}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">Day {tx.day}</td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{tx.paymentMethod}</td>
                        <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                          {tx.type === 'savings_deposit' ? (
                            <span className="text-blue-600">+₹{tx.amount.toLocaleString('en-IN')} (Saved)</span>
                          ) : tx.type === 'savings_withdrawal' ? (
                            <span className="text-emerald-600">₹{tx.amount.toLocaleString('en-IN')} (Returned)</span>
                          ) : (
                            <span>-₹{tx.amount.toLocaleString('en-IN')}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              deleteTransaction(tx.id);
                              showToast(`Removed "${tx.description}" transaction.`, 'info');
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors rounded-sm cursor-pointer"
                            title="Delete transaction"
                            aria-label={`Delete transaction ${tx.description}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Monthly Report Modal */}
      {isExportModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
          aria-describedby="export-modal-desc"
        >
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center" aria-hidden="true">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="export-modal-title" className="text-base font-bold text-slate-900">Export Monthly Report</h3>
                  <p className="text-xs text-slate-500">Day {state.currentDay} Challenge Financial Audit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
                aria-label="Close export report dialog"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <p id="export-modal-desc" className="text-xs text-slate-600 leading-relaxed">
              Download your current financial state, executive summary, commitments, subscriptions, and transaction ledger formatted for hackathon judge evaluation.
            </p>

            {exportFeedback && (
              <div role="status" aria-live="polite" className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{exportFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-3.5 border border-slate-200 hover:border-emerald-500 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-all text-left group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                    CSV
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                  Spreadsheet CSV
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Compatible with Microsoft Excel, Google Sheets, Numbers.
                </p>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="p-3.5 border border-slate-200 hover:border-blue-500 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-all text-left group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <FileCode className="w-5 h-5 text-blue-700" aria-hidden="true" />
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded uppercase">
                    JSON
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-950">
                  Full Audit JSON
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Complete state payload with all calculated indices & arrays.
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-expense-modal-title"
          aria-describedby="add-expense-modal-desc"
        >
          <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 id="add-expense-modal-title" className="text-base font-semibold text-slate-900">Log Real Expense</h3>
            <p id="add-expense-modal-desc" className="text-xs text-slate-500 mt-1">
              Deducts from available liquid cash and recalculates your daily safe-to-spend allowance in real time.
            </p>

            {addTxError && (
              <div role="alert" className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
                <span>{addTxError}</span>
              </div>
            )}

            <form onSubmit={handleAddTransaction} className="mt-4 space-y-4">
              <div>
                <label htmlFor="expense-title-input" className="block text-xs font-medium text-slate-700 mb-1">
                  Description / Item
                </label>
                <input
                  id="expense-title-input"
                  type="text"
                  required
                  placeholder="e.g. Swiggy lunch, College textbook"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (addTxError) setAddTxError(null);
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="expense-amount-input" className="block text-xs font-medium text-slate-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    id="expense-amount-input"
                    type="number"
                    min="1"
                    max={availableCash}
                    required
                    placeholder="350"
                    value={newAmount}
                    onChange={(e) => {
                      setNewAmount(e.target.value);
                      if (addTxError) setAddTxError(null);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="expense-category-select" className="block text-xs font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    id="expense-category-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Education">Education</option>
                    <option value="Bills">Bills</option>
                    <option value="Health">Health</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="expense-payment-method-select" className="block text-xs font-medium text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  id="expense-payment-method-select"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe)</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="NetBanking">Net Banking</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-2xs"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
