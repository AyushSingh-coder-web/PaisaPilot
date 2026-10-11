import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CategoryType } from '../../types/finance';

export const BudgetPlanner: React.FC = () => {
  const {
    state,
    availableCash,
    actualSpent,
    updateCategoryBudget,
    updateTotalBudget,
  } = useFinance();
  const { showToast } = useToast();

  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [totalInput, setTotalInput] = useState(state.totalBudget.toString());

  // Calculate actual spending per category
  const actualByCategory = React.useMemo(() => {
    const map: Record<CategoryType, number> = {
      Food: 0,
      Transport: 0,
      Shopping: 0,
      Entertainment: 0,
      Education: 0,
      Bills: 0,
      Health: 0,
      Other: 0,
    };
    state.transactions
      .filter((t) => t.type === 'expense' && !t.isSimulated)
      .forEach((t) => {
        if (map[t.category] !== undefined) {
          map[t.category] += t.amount;
        }
      });
    return map;
  }, [state.transactions]);

  const totalAllocated = state.categoryBudgets.reduce((sum, b) => sum + b.allocated, 0);
  const unallocatedBudget = state.totalBudget - totalAllocated;

  const handleSaveTotalBudget = () => {
    const val = Number(totalInput);
    if (!isNaN(val) && val >= 1000) {
      updateTotalBudget(val);
      setIsEditingTotal(false);
      showToast(`Total budget set to ₹${val.toLocaleString('en-IN')}.`, 'success');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <span>Budget Control & Allocation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Monthly Budget Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Allocate limits across essential and discretionary categories to maintain spending discipline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEditingTotal ? (
            <div className="flex items-center gap-2">
              <label htmlFor="total-budget-edit-input" className="sr-only">Total Budget Amount</label>
              <input
                id="total-budget-edit-input"
                type="number"
                value={totalInput}
                onChange={(e) => setTotalInput(e.target.value)}
                className="w-28 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
                aria-label="Total monthly budget amount in rupees"
              />
              <button
                type="button"
                onClick={handleSaveTotalBudget}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTotal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Edit Total Budget (₹{state.totalBudget.toLocaleString('en-IN')})</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-xs text-slate-600 font-medium">Total Monthly Budget</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            ₹{state.totalBudget.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">Baseline funding for 30 days</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-xs text-slate-600 font-medium">Allocated to Categories</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            ₹{totalAllocated.toLocaleString('en-IN')}
          </div>
          <div className={`text-[11px] ${unallocatedBudget < 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
            {unallocatedBudget >= 0 ? `₹${unallocatedBudget.toLocaleString('en-IN')} unallocated` : `Overallocated by ₹${Math.abs(unallocatedBudget).toLocaleString('en-IN')}`}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-xs text-slate-600 font-medium">Total Actual Spending</div>
          <div className="text-2xl font-bold text-rose-600 tabular-nums">
            ₹{actualSpent.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            {Math.round((actualSpent / state.totalBudget) * 100)}% of total budget consumed
          </div>
        </div>
      </div>

      {/* Category Budget Allocation List */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Category Spending Limits</h2>
          <span className="text-xs text-slate-500">Adjust sliders to rebalance limits</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.categoryBudgets.map((cat) => {
            const spent = actualByCategory[cat.category] || 0;
            const percentSpent = cat.allocated > 0 ? Math.min(100, Math.round((spent / cat.allocated) * 100)) : 0;
            const isExceeded = spent > cat.allocated;
            const isWarning = percentSpent >= 80 && !isExceeded;

            return (
              <div
                key={cat.category}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-slate-800">{cat.category}</span>
                    <div className="text-[11px] text-slate-600">
                      Spent ₹{spent.toLocaleString('en-IN')} of ₹{cat.allocated.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="text-right">
                    {isExceeded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                        Exceeded
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                        80% Reached
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Within Limit
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div 
                  className="w-full bg-slate-200 h-2 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={percentSpent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${cat.category} budget consumption`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${percentSpent}%` }}
                  />
                </div>

                {/* Range Slider to Adjust Allocation */}
                <div className="pt-2 flex items-center gap-3">
                  <label htmlFor={`slider-${cat.category}`} className="sr-only">
                    {cat.category} allocation limit
                  </label>
                  <input
                    id={`slider-${cat.category}`}
                    type="range"
                    min="100"
                    max="4000"
                    step="50"
                    value={cat.allocated}
                    onChange={(e) => updateCategoryBudget(cat.category, Number(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={`Spending limit for ${cat.category}`}
                  />
                  <span className="text-xs font-semibold text-slate-800 tabular-nums w-16 text-right">
                    ₹{cat.allocated}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
