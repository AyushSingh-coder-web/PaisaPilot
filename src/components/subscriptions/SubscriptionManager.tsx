import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import {
  CreditCard,
  Plus,
  Power,
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { Subscription, CategoryType } from '../../types/finance';

export const SubscriptionManager: React.FC = () => {
  const {
    state,
    toggleSubscription,
    addSubscription,
    deleteSubscription,
    dailyAllowance,
  } = useFinance();
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState('149');
  const [subDay, setSubDay] = useState('15');
  const [subCategory, setSubCategory] = useState<CategoryType>('Entertainment');
  const [isEssential, setIsEssential] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen]);

  // Active subscriptions calculation
  const activeSubs = state.subscriptions.filter((s) => s.isActive);
  const inactiveSubs = state.subscriptions.filter((s) => !s.isActive);

  // Remaining cost in this 30-day challenge
  const remainingCostThisMonth = activeSubs
    .filter((s) => s.dueDay >= state.currentDay)
    .reduce((sum, s) => sum + s.monthlyPrice, 0);

  // Annual total of active subscriptions
  const annualTotal = activeSubs.reduce((sum, s) => sum + s.monthlyPrice * 12, 0);

  // Potential savings if optional active subscriptions are paused
  const optionalActiveSubs = activeSubs.filter((s) => !s.isEssential);
  const potentialSavingsThisMonth = optionalActiveSubs
    .filter((s) => s.dueDay >= state.currentDay)
    .reduce((sum, s) => sum + s.monthlyPrice, 0);

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(subPrice);
    const day = Number(subDay);
    if (!subName.trim() || isNaN(price) || price <= 0) return;

    addSubscription({
      name: subName.trim(),
      monthlyPrice: Math.round(price),
      dueDay: Math.max(1, Math.min(30, day)),
      category: subCategory,
      isActive: true,
      isEssential,
    });

    showToast(`Added subscription "${subName.trim()}" (₹${Math.round(price)}/mo).`, 'success');
    setSubName('');
    setSubPrice('149');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <span>Recurring Obligations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Subscription Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit recurring micro-drains. Pausing an upcoming subscription immediately frees up cash in your daily allowance.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500">Remaining Due This Month</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            ₹{remainingCostThisMonth.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Upcoming due days ≥ Day {state.currentDay}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500">Annual Run-Rate Cost</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            ₹{annualTotal.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-slate-500">/year</span>
          </div>
          <div className="text-[11px] text-slate-500">Across {activeSubs.length} active recurring plans</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500">Cancel Optimization Leverage</div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            +₹{potentialSavingsThisMonth.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500">
            Free cash if optional upcoming services paused
          </div>
        </div>
      </div>

      {/* Insight Banner */}
      {potentialSavingsThisMonth > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong>Smart Subscription Insight:</strong> Cancelling or pausing your {optionalActiveSubs.length} optional subscriptions before their due day could immediately free up{' '}
            <strong className="underline">₹{potentialSavingsThisMonth.toLocaleString('en-IN')}</strong>, increasing your safe daily allowance by{' '}
            <strong>+₹{Math.floor(potentialSavingsThisMonth / Math.max(1, 30 - state.currentDay + 1))}/day</strong>.
          </div>
        </div>
      )}

      {/* Subscription Cards Grid */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Configured Subscriptions</h2>

        <div className="divide-y divide-slate-100">
          {state.subscriptions.map((sub) => {
            const isDuePassed = sub.dueDay < state.currentDay;

            return (
              <div
                key={sub.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      sub.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${sub.isActive ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                        {sub.name}
                      </span>
                      {sub.isEssential ? (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                          Essential
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-medium">
                          Optional
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Billed on Day {sub.dueDay} of month · {sub.category}
                      {isDuePassed && <span className="ml-1 text-slate-400">(Billed for this cycle)</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      ₹{sub.monthlyPrice}
                      <span className="text-[11px] font-normal text-slate-500">/mo</span>
                    </div>
                    <div className="text-[10px] text-slate-400 tabular-nums">
                      ₹{(sub.monthlyPrice * 12).toLocaleString('en-IN')}/yr
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSubscription(sub.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                        sub.isActive
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{sub.isActive ? 'Pause' : 'Reactivate'}</span>
                    </button>

                    <button
                      onClick={() => deleteSubscription(sub.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remove subscription entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Subscription Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-sub-modal-title"
          aria-describedby="add-sub-modal-desc"
        >
          <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 id="add-sub-modal-title" className="text-base font-semibold text-slate-900">Add Monthly Subscription</h3>
            <p id="add-sub-modal-desc" className="text-xs text-slate-500">
              Track recurring monthly expenses and their annual burn rate on your ₹10,000 budget.
            </p>

            <form onSubmit={handleAddSub} className="space-y-4">
              <div>
                <label htmlFor="sub-name-input" className="block text-xs font-medium text-slate-700 mb-1">
                  Service Name
                </label>
                <input
                  id="sub-name-input"
                  type="text"
                  required
                  placeholder="e.g. YouTube Premium, GitHub Pro"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sub-price-input" className="block text-xs font-medium text-slate-700 mb-1">
                    Monthly Price (₹)
                  </label>
                  <input
                    id="sub-price-input"
                    type="number"
                    min="1"
                    required
                    value={subPrice}
                    onChange={(e) => setSubPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
                  />
                </div>

                <div>
                  <label htmlFor="sub-day-input" className="block text-xs font-medium text-slate-700 mb-1">
                    Billing Day (1-30)
                  </label>
                  <input
                    id="sub-day-input"
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={subDay}
                    onChange={(e) => setSubDay(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sub-category-select" className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  id="sub-category-select"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value as CategoryType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills">Bills & Utilities</option>
                  <option value="Health">Health & Fitness</option>
                  <option value="Education">Education</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={isEssential}
                  onChange={(e) => setIsEssential(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span>Mandatory / Essential service</span>
              </label>

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
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-2xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
