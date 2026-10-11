import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { calculateSimulationComparison } from '../../utils/calculations';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  dataSnippet?: {
    dailyAllowanceAfter?: number;
    cashAfter?: number;
    verdict?: 'Safe' | 'Proceed with Caution' | 'High Risk';
  };
}

export const PaisaPilotCoach: React.FC = () => {
  const {
    state,
    availableCash,
    remainingCommitments,
    dailyAllowance,
    totalSaved,
    projectedDay30Balance,
    financialHealth,
  } = useFinance();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `Hey ${state.userName}! I'm your PaisaPilot Decision Coach. I evaluate your financial dilemmas directly against your live ₹${state.totalBudget.toLocaleString('en-IN')} budget, ₹${remainingCommitments.toLocaleString('en-IN')} pending commitments, and ₹${dailyAllowance}/day safe allowance. Ask me if you can afford a purchase, whether to cancel a subscription, or how to reach your savings target!`,
    },
  ]);

  const QUICK_QUESTIONS = [
    'Can I afford ₹1,500 sneakers today?',
    'What happens if I spend ₹500 on weekend dining?',
    'Should I cancel one of my streaming subscriptions?',
    'How do I make sure I save ₹2,000 this month?',
    'What is my safest spending limit for today?',
  ];

  const handleEvaluateDilemma = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: queryText,
    };

    // Analyze query text for amounts
    const amountMatch = queryText.match(/₹?\s*(\d+[\d,]*)/);
    const extractedAmount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, ''), 10) : null;

    let responseText = '';
    let dataSnippet: Message['dataSnippet'] | undefined = undefined;

    const remainingDays = Math.max(1, 30 - state.currentDay + 1);

    if (queryText.toLowerCase().includes('subscription') || queryText.toLowerCase().includes('netflix') || queryText.toLowerCase().includes('spotify')) {
      const activeSubs = state.subscriptions.filter((s) => s.isActive && !s.isEssential);
      const subTotal = activeSubs.reduce((sum, s) => sum + s.monthlyPrice, 0);
      responseText = `You currently have ${activeSubs.length} optional subscriptions active (costing ₹${subTotal}/month). Pausing even one subscription (like Netflix at ₹149 or Spotify at ₹119) will immediately add +₹${Math.floor(149 / remainingDays)} to your daily allowance and reduce your 30-day fixed burden. If you aren't using them daily, pausing is an instant financial win!`;
    } else if (queryText.toLowerCase().includes('safest') || queryText.toLowerCase().includes('safely') || queryText.toLowerCase().includes('today')) {
      responseText = `Your exact safe daily spending limit today is ₹${dailyAllowance}. This accounts for your ₹${remainingCommitments.toLocaleString('en-IN')} in remaining commitments and reserves your planned savings. If you spend under ₹${dailyAllowance} today, your Day 30 forecast stays at ₹${projectedDay30Balance.toLocaleString('en-IN')}.`;
      dataSnippet = {
        dailyAllowanceAfter: dailyAllowance,
        cashAfter: availableCash,
        verdict: 'Safe',
      };
    } else if (queryText.toLowerCase().includes('save') || queryText.toLowerCase().includes('2000') || queryText.toLowerCase().includes('emergency')) {
      const needed = Math.max(0, 2000 - totalSaved);
      const surplus = availableCash - remainingCommitments;
      responseText = `You currently have ₹${totalSaved.toLocaleString('en-IN')} deposited in savings vaults out of your ₹2,000 goal. Your uncommitted cash surplus is ₹${surplus.toLocaleString('en-IN')}. ${
        surplus >= needed
          ? `Good news: you are fully on track to save the remaining ₹${needed.toLocaleString('en-IN')} as long as your daily spending doesn't exceed ₹${dailyAllowance}/day!`
          : `Heads up: at current pace, you might fall ₹${(needed - surplus).toLocaleString('en-IN')} short. To guarantee the ₹2,000 goal, try trimming non-essential shopping by ₹${Math.ceil((needed - surplus) / remainingDays)}/day.`
      }`;
    } else if (extractedAmount) {
      const sim = calculateSimulationComparison(state, {
        name: 'Proposed Purchase',
        amount: extractedAmount,
        category: 'Shopping',
        plannedDay: state.currentDay,
        isRecurring: false,
        isEssential: false,
      });

      const newAllowance = sim.simulated.dailyAllowance;
      const cashAfter = sim.simulated.availableCash;

      if (extractedAmount > availableCash) {
        responseText = `You cannot afford this ₹${extractedAmount.toLocaleString('en-IN')} purchase right now. Your current available cash is ₹${availableCash.toLocaleString('en-IN')}. Buying this would immediately overdraw your account or require borrowing.`;
        dataSnippet = {
          dailyAllowanceAfter: 0,
          cashAfter: 0,
          verdict: 'High Risk',
        };
      } else if (newAllowance < 50) {
        responseText = `Buying this for ₹${extractedAmount.toLocaleString('en-IN')} is high risk. It would squeeze your daily allowance from ₹${dailyAllowance}/day down to just ₹${newAllowance}/day for the next ${remainingDays} days. It would also leave you ₹${sim.simulated.savingsShortfall.toLocaleString('en-IN')} short of your emergency savings. We recommend waiting until Day 25 or finding a lower-cost option under ₹${Math.floor(extractedAmount / 2)}.`;
        dataSnippet = {
          dailyAllowanceAfter: newAllowance,
          cashAfter,
          verdict: 'High Risk',
        };
      } else if (newAllowance < 100) {
        responseText = `You can technically buy this for ₹${extractedAmount.toLocaleString('en-IN')}, but proceed with caution. Your safe daily spending allowance will drop from ₹${dailyAllowance}/day to ₹${newAllowance}/day. If you commit to cooking food at home rather than ordering out, you can absorb the cost.`;
        dataSnippet = {
          dailyAllowanceAfter: newAllowance,
          cashAfter,
          verdict: 'Proceed with Caution',
        };
      } else {
        responseText = `Yes, this ₹${extractedAmount.toLocaleString('en-IN')} purchase is within safe bounds! After buying it, you will still have ₹${cashAfter.toLocaleString('en-IN')} in available cash and a comfortable safe allowance of ₹${newAllowance}/day. All upcoming ₹${remainingCommitments.toLocaleString('en-IN')} commitments remain fully protected.`;
        dataSnippet = {
          dailyAllowanceAfter: newAllowance,
          cashAfter,
          verdict: 'Safe',
        };
      }
    } else {
      responseText = `Based on your Day ${state.currentDay} status: You have ₹${availableCash.toLocaleString('en-IN')} liquid cash and ₹${remainingCommitments.toLocaleString('en-IN')} reserved for upcoming commitments. Your safe allowance is ₹${dailyAllowance}/day. If you have a specific purchase in mind, mention the amount (e.g., 'Can I spend ₹800?') and I'll calculate the exact impact!`;
    }

    const assistantMsg: Message = {
      id: `asst_${Date.now()}`,
      sender: 'assistant',
      text: responseText,
      dataSnippet,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputQuery('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <span>Deterministic Financial Companion</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            PaisaPilot Decision Coach
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real mathematical guidance grounded in your live commitments, daily allowances, and savings targets.
          </p>
        </div>
      </div>

      {/* Quick Prompts Strip */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="text-xs font-semibold text-slate-600">Quick Judge & Student Prompts:</div>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleEvaluateDilemma(q)}
              className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-transparent rounded-lg transition-colors text-slate-700 text-left cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div 
        aria-live="polite" 
        aria-atomic="false"
        className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4 min-h-[380px] max-h-[520px] overflow-y-auto"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs" aria-hidden="true">
                PP
              </div>
            )}

            <div
              className={`max-w-xl p-4 rounded-xl text-xs leading-relaxed space-y-2.5 ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-br-none'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-none'
              }`}
            >
              <p>{m.text}</p>

              {m.dataSnippet && (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1 text-slate-700">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Verdict:</span>
                    <span
                      className={
                        m.dataSnippet.verdict === 'Safe'
                          ? 'text-emerald-700 font-bold'
                          : m.dataSnippet.verdict === 'Proceed with Caution'
                          ? 'text-amber-600 font-bold'
                          : 'text-rose-600 font-bold'
                      }
                    >
                      {m.dataSnippet.verdict}
                    </span>
                  </div>
                  {m.dataSnippet.dailyAllowanceAfter !== undefined && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Revised Allowance:</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        ₹{m.dataSnippet.dailyAllowanceAfter}/day
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
        <label htmlFor="coach-dilemma-input" className="sr-only">Ask Coach a financial dilemma</label>
        <input
          id="coach-dilemma-input"
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEvaluateDilemma(inputQuery);
          }}
          placeholder="Ask a question, e.g. 'Can I spend ₹900 on a smartwatch band?'"
          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          aria-label="Ask financial dilemma or question"
        />
        <button
          type="button"
          onClick={() => handleEvaluateDilemma(inputQuery)}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Submit question to coach"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Ask Coach</span>
        </button>
      </div>
    </div>
  );
};
