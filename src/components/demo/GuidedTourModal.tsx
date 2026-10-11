import React, { useState, useEffect } from 'react';
import {
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  SlidersHorizontal,
  Wallet,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const TOUR_STEPS = [
    {
      step: 1,
      targetSection: 'overview',
      title: '1. Problem Statement & Baseline Budget',
      badge: 'Overview Screen',
      icon: Wallet,
      headline: 'A strictly reconciled ₹10,000 monthly challenge for Gen Z.',
      body: 'Young Indians managing ₹10,000 over 30 days frequently overspend because simple expense trackers only display total balance. PaisaPilot separates liquid cash from ₹3,000 in upcoming mandatory commitments (commute, mess, internet) and calculates a real dynamic Safe-to-Spend allowance.',
    },
    {
      step: 2,
      targetSection: 'simulator',
      title: '2. Signature Core Feature: Spend Simulator',
      badge: 'Spend Simulator',
      icon: SlidersHorizontal,
      headline: 'See consequences BEFORE you commit cash.',
      body: 'Instead of recording an expense after the money is gone, test it here first! Adjust the slider for ₹1,500 sneakers: watch your daily safe allowance recalculate in real-time, see whether your savings goal gets delayed, and inspect the Day 30 forecast before deciding to confirm or discard.',
    },
    {
      step: 3,
      targetSection: 'simulator',
      title: '3. Multi-Choice Trade-off Comparison',
      badge: '3-Way Comparison',
      icon: SlidersHorizontal,
      headline: 'Compare Option A vs Option B vs Delaying.',
      body: 'Financial decisions are rarely all-or-nothing. PaisaPilot lets you compare buying premium ₹1,500 sneakers against budget ₹700 sneakers or delaying to next month. No choice is labeled "wrong"—the interface clearly visualizes the trade-offs on daily flexibility.',
    },
    {
      step: 4,
      targetSection: 'emergency',
      title: '4. Unexpected Expense Lab',
      badge: 'Shock Testing',
      icon: AlertTriangle,
      headline: 'Stress-test your budget against real-life surprises.',
      body: 'What happens when a ₹2,000 clinic bill or ₹1,200 laptop repair strikes? The Emergency Lab instantly stress-tests your finances, identifies how many days you would run a deficit, and generates a realistic recovery plan (such as pausing subscriptions or adjusting food allocation).',
    },
    {
      step: 5,
      targetSection: 'insights',
      title: '5. Deterministic Risk & Financial Health',
      badge: 'Health & Risk',
      icon: ShieldCheck,
      headline: 'Math-grounded scoring without black-box confusion.',
      body: 'A transparent 0-100 Financial Health score calculated from liquidity ratio, coverage days, and commitment safety. Accompanied by interactive Gen Z micro-lessons that explain compound interest, subscription run-rates, and the logic of emergency funds.',
    },
  ];

  const activeStep = TOUR_STEPS[currentStep];
  const StepIcon = activeStep.icon;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onNavigateSection(TOUR_STEPS[next].targetSection);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onNavigateSection(TOUR_STEPS[prev].targetSection);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-modal-title"
      aria-describedby="tour-modal-desc"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm" aria-hidden="true">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 id="tour-modal-title" className="text-sm sm:text-base font-bold text-slate-900">
                2-Minute Hackathon Product Tour
              </h2>
              <p className="text-xs text-slate-500">
                Key differentiators and fintech design principles
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Close guided tour dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tour Step Content */}
        <div className="p-5 sm:p-6 space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50">
              <StepIcon className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              {activeStep.badge}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Step {currentStep + 1}/5
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {activeStep.headline}
          </h3>

          <p id="tour-modal-desc" className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {activeStep.body}
          </p>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 pt-2">
            {TOUR_STEPS.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => {
                  setCurrentStep(i);
                  onNavigateSection(TOUR_STEPS[i].targetSection);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  i === currentStep ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Jump to tour step ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none rounded-lg cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-2xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span>{currentStep === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
