import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const InsightsAndHealth: React.FC = () => {
  const {
    financialHealth,
    financialRisk,
    smartInsights,
    availableCash,
    remainingCommitments,
    dailyAllowance,
  } = useFinance();

  // Accordion state for micro-learning modules
  const [openLessonIndex, setOpenLessonIndex] = useState<number | null>(0);

  const MICRO_LESSONS = [
    {
      title: 'What is a "Daily Safe-to-Spend Allowance"?',
      summary: 'Why dividing your remaining bank balance by 30 days is a dangerous mistake.',
      content:
        'If you have ₹7,000 on Day 10 with 20 days left, you might think you can spend ₹350/day. But if you have ₹3,000 in upcoming rent or mess fees and a ₹1,000 savings target, you only have ₹3,000 in uncommitted money. Dividing ₹3,000 by 20 days gives your true Safe-to-Spend allowance: ₹150/day. PaisaPilot prevents you from spending money that is secretly spoken for.',
    },
    {
      title: 'How does recurring spending (subscriptions) drain you silently?',
      summary: 'The difference between a ₹149 coffee and a ₹149 subscription.',
      content:
        'A one-time ₹150 snack only impacts today. But an active ₹149 monthly subscription is a contractual drain of ₹1,788 each year. In a ₹10,000 monthly budget, holding 4 subscriptions totaling ₹600 silently locks 6% of your entire monthly income before you even buy food or travel.',
    },
    {
      title: 'What is an Emergency Buffer, and why ₹2,000?',
      summary: 'The difference between budgeting and living on the financial edge.',
      content:
        'For college students and young earners in India, an unexpected clinic fee, phone screen crack, or urgent travel ticket typically costs between ₹1,000 and ₹2,500. Having ₹2,000 in a locked savings vault means an emergency is just an inconvenience, not a crisis that forces you to borrow money or skip meals.',
    },
    {
      title: 'Why simulation beats expense tracking',
      summary: 'Expense trackers show you yesterday. Decision simulators protect tomorrow.',
      content:
        'Traditional budget apps show you a chart of money you have already spent. By the time you see the red bar, it is too late. PaisaPilot acts as your pre-flight check: simulate the purchase first, see your Day 30 forecast drop, and decide if the trade-off is worth it.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
          <span>Mathematical Diagnostic Engine</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Insights & Financial Health
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Transparent, deterministic scoring models explaining the exact arithmetic behind your budget stability.
        </p>
      </div>

      {/* Top 2 Score Diagnostic Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Financial Health Score (0-100) */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Financial Health Index
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Composite Health: {financialHealth.score}/100
              </h2>
            </div>
            <div
              className="px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider"
              style={{ backgroundColor: `${financialHealth.statusColor}15`, color: financialHealth.statusColor }}
            >
              {financialHealth.status}
            </div>
          </div>

          {/* Component Score Bars */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Commitment Coverage (Max 30 pts)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {financialHealth.commitmentCoverageScore}/30
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${(financialHealth.commitmentCoverageScore / 30) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Savings Feasibility (Max 25 pts)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {financialHealth.savingsPaceScore}/25
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(financialHealth.savingsPaceScore / 25) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Spending Velocity Discipline (Max 25 pts)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {financialHealth.spendingVelocityScore}/25
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(financialHealth.spendingVelocityScore / 25) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Discretionary Flexibility Buffer (Max 20 pts)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {financialHealth.discretionaryBufferScore}/20
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(financialHealth.discretionaryBufferScore / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="font-semibold text-slate-800">Key Health Factors:</div>
            {financialHealth.improvingFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))}
            {financialHealth.loweringFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Financial Risk Engine (0-100, Higher = Higher Risk) */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Risk Vulnerability Model
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Risk Score: {financialRisk.riskScore}/100
              </h2>
            </div>
            <div
              className="px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider"
              style={{ backgroundColor: `${financialRisk.riskBandColor}15`, color: financialRisk.riskBandColor }}
            >
              {financialRisk.riskBand}
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            {financialRisk.summaryText}
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="text-xs font-semibold text-slate-800">Contributing Risk Drivers:</div>
            {financialRisk.primaryFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-start gap-2.5 text-xs"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    factor.type === 'positive'
                      ? 'bg-emerald-500'
                      : factor.type === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
                <div>
                  <div className="font-semibold text-slate-800">{factor.title}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{factor.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Smart Insights */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Real-Time Behavioral Insights</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smartInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{insight.title}</span>
                  {insight.metricValue && (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded tabular-nums">
                      {insight.metricValue}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Learning Micro-Modules (Gen Z friendly) */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Gen Z Personal Finance Micro-Mastery</span>
          </h2>
          <span className="text-xs text-slate-500">Contextual mental models</span>
        </div>

        <div className="space-y-2.5">
          {MICRO_LESSONS.map((lesson, idx) => {
            const isOpen = openLessonIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-lg border border-slate-200/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  id={`lesson-header-${idx}`}
                  aria-expanded={isOpen}
                  aria-controls={`lesson-panel-${idx}`}
                  onClick={() => setOpenLessonIndex(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{lesson.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{lesson.summary}</div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  )}
                </button>

                {isOpen && (
                  <div 
                    id={`lesson-panel-${idx}`}
                    role="region"
                    aria-labelledby={`lesson-header-${idx}`}
                    className="p-3.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 leading-relaxed"
                  >
                    {lesson.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
