import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import {
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldAlert,
  X,
} from 'lucide-react';
import { SavingsGoal } from '../../types/finance';

export const SavingsGoals: React.FC = () => {
  const {
    state,
    availableCash,
    totalSaved,
    remainingCommitments,
    depositToSavings,
    withdrawFromSavings,
    createSavingsGoal,
  } = useFinance();
  const { showToast } = useToast();

  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isWithdrawMode, setIsWithdrawMode] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('1000');
  const [newGoalPriority, setNewGoalPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newGoalCategory, setNewGoalCategory] = useState('Personal');

  // Close modals on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (depositModalGoal) setDepositModalGoal(null);
        if (isCreateModalOpen) setIsCreateModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [depositModalGoal, isCreateModalOpen]);

  const handleDepositOrWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const amt = Number(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (isWithdrawMode) {
      withdrawFromSavings(depositModalGoal.id, amt);
      showToast(`Transferred ₹${amt.toLocaleString('en-IN')} from "${depositModalGoal.name}" back to cash.`, 'info');
    } else {
      depositToSavings(depositModalGoal.id, amt);
      showToast(`Deposited ₹${amt.toLocaleString('en-IN')} to "${depositModalGoal.name}".`, 'success');
    }

    setDepositModalGoal(null);
    setDepositAmount('');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(newGoalTarget);
    if (!newGoalName.trim() || isNaN(target) || target <= 0) return;

    createSavingsGoal({
      name: newGoalName.trim(),
      targetAmount: target,
      targetDay: 30,
      priority: newGoalPriority,
      category: newGoalCategory,
      color: '#10b981',
    });

    showToast(`Created savings goal "${newGoalName.trim()}" (₹${target.toLocaleString('en-IN')}).`, 'success');
    setNewGoalName('');
    setNewGoalTarget('1000');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <span>Locked Vaults & Future Security</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Savings Goals & Vaults
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Secure money in designated vaults. Deposited funds are protected from daily spending but count towards your net worth.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Vault</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500">Total Money Vaulted</div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            ₹{totalSaved.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">Safely locked across {state.savingsGoals.length} goals</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500">Total Savings Target</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            ₹{state.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">Cumulative 30-day objective</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500">Available to Allocate Now</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            ₹{availableCash.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">Liquid funds ready for deposit</div>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {state.savingsGoals.map((goal) => {
          const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remainingToTarget = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isComplete = goal.currentAmount >= goal.targetAmount;
          const daysLeft = Math.max(1, goal.targetDay - state.currentDay + 1);
          const dailyRequired = Math.ceil(remainingToTarget / daysLeft);

          // Feasibility check against surplus
          const surplus = availableCash - remainingCommitments;
          const isFeasible = surplus >= remainingToTarget;

          return (
            <div
              key={goal.id}
              className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {goal.category} · {goal.priority} Priority
                  </span>
                  {isComplete ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Funded
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Due Day {goal.targetDay}</span>
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">{goal.name}</h2>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">
                      ₹{goal.currentAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 tabular-nums">
                      of ₹{goal.targetAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 tabular-nums">
                    <span>{progressPercent}% locked</span>
                    <span>₹{remainingToTarget.toLocaleString('en-IN')} left</span>
                  </div>
                </div>

                {/* Feasibility Insight */}
                {!isComplete && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Pace Required:</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        ₹{dailyRequired}/day
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Goal Feasibility:</span>
                      <span className={`font-semibold ${isFeasible ? 'text-emerald-700' : 'text-amber-600'}`}>
                        {isFeasible ? 'Achievable' : 'Needs Spending Cut'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Deposit / Withdraw Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setDepositModalGoal(goal);
                    setIsWithdrawMode(false);
                    setDepositAmount(Math.min(remainingToTarget || 500, availableCash).toString());
                  }}
                  disabled={availableCash <= 0 || isComplete}
                  className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 rounded-lg transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>

                <button
                  onClick={() => {
                    setDepositModalGoal(goal);
                    setIsWithdrawMode(true);
                    setDepositAmount(Math.min(goal.currentAmount, 500).toString());
                  }}
                  disabled={goal.currentAmount <= 0}
                  className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit/Withdraw Modal */}
      {depositModalGoal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deposit-modal-title"
          aria-describedby="deposit-modal-desc"
        >
          <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 id="deposit-modal-title" className="text-base font-semibold text-slate-900">
              {isWithdrawMode ? 'Withdraw from Vault' : 'Deposit into Vault'}
            </h3>
            <p id="deposit-modal-desc" className="text-xs text-slate-500">
              {isWithdrawMode
                ? `Transfer funds from "${depositModalGoal.name}" back into your liquid spending cash.`
                : `Move unallocated cash into "${depositModalGoal.name}".`}
            </p>

            <form onSubmit={handleDepositOrWithdraw} className="space-y-4">
              <div>
                <label htmlFor="deposit-amount-input" className="block text-xs font-medium text-slate-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  id="deposit-amount-input"
                  type="number"
                  min="1"
                  max={isWithdrawMode ? depositModalGoal.currentAmount : availableCash}
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums font-bold"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>
                    {isWithdrawMode
                      ? `Max in vault: ₹${depositModalGoal.currentAmount.toLocaleString('en-IN')}`
                      : `Max available cash: ₹${availableCash.toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-2xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {isWithdrawMode ? 'Withdraw Funds' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {isCreateModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-goal-modal-title"
          aria-describedby="create-goal-modal-desc"
        >
          <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 id="create-goal-modal-title" className="text-base font-semibold text-slate-900">Create New Savings Goal</h3>
            <p id="create-goal-modal-desc" className="text-xs text-slate-500">
              Set a target to protect funds for specific plans or items.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label htmlFor="goal-name-input" className="block text-xs font-medium text-slate-700 mb-1">Goal Name</label>
                <input
                  id="goal-name-input"
                  type="text"
                  required
                  placeholder="e.g. New Watch, Goa Trip Advance"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-target-input" className="block text-xs font-medium text-slate-700 mb-1">Target Amount (₹)</label>
                  <input
                    id="goal-target-input"
                    type="number"
                    min="100"
                    required
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="goal-priority-select" className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    id="goal-priority-select"
                    value={newGoalPriority}
                    onChange={(e) => setNewGoalPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-2xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
