import React, { useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { DEMO_SCENARIOS } from '../../utils/demoScenarios';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface DemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

export const DemoScenariosModal: React.FC<DemoScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
}) => {
  const { loadDemoScenario } = useFinance();
  const { showToast } = useToast();

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

  const handleApply = (id: string, name: string) => {
    loadDemoScenario(id);
    onSelectScenario(id);
    onClose();
    showToast(`Loaded dataset: "${name}"`, 'success');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="judge-scenarios-title"
      aria-describedby="judge-scenarios-desc"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm" aria-hidden="true">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="judge-scenarios-title" className="text-base font-bold text-slate-900">
                Hackathon Judge Demo Scenarios
              </h2>
              <p id="judge-scenarios-desc" className="text-xs text-slate-500">
                Instantly populate realistic simulation states to test the mathematical models
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Close demo scenarios dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scenarios List */}
        <div className="p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
          {DEMO_SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              className="pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {scenario.name}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {scenario.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleApply(scenario.id, scenario.name)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center shadow-xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label={`Load scenario ${scenario.name}`}
              >
                <span>Load Dataset</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Loading a preset sets up real interconnected state. You can reset anytime back to Day 1 using the reset icon in the top header.
        </div>
      </div>
    </div>
  );
};
