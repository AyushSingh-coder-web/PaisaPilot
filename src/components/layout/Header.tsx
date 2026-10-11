import React, { useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { 
  Sparkles, 
  RotateCcw, 
  Menu, 
  Calendar,
  Compass,
} from 'lucide-react';
import userAvatar from '../../assets/images/avatar_genz_user_1791704897988.jpg';

interface HeaderProps {
  onOpenDemoScenarios: () => void;
  onOpenGuidedTour: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDemoScenarios,
  onOpenGuidedTour,
  onToggleSidebar,
  isSidebarOpen,
  activeSection,
  onNavigate,
}) => {
  const { state, resetToInitial, setCurrentDay } = useFinance();
  const { showToast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  // Close reset confirmation dialog on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showResetConfirm) {
        setShowResetConfirm(false);
      }
    };
    if (showResetConfirm) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResetConfirm]);

  const handleReset = () => {
    resetToInitial();
    setShowResetConfirm(false);
    showToast('State successfully reset to Day 1 baseline.', 'info');
  };

  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'planner', label: 'Budget' },
    { id: 'savings', label: 'Savings' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'emergency', label: 'Emergency Lab' },
  ];

  return (
    <>
      <header 
        role="banner"
        className="sticky top-0 z-40 w-full max-w-full flex items-center justify-between gap-2 px-2.5 sm:px-6 md:px-8 py-2.5 sm:py-3.5 bg-white border-b border-slate-200 box-border"
      >
        {/* Zone 1: Hamburger Menu Toggle & Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors shrink-0 cursor-pointer"
            aria-label={isSidebarOpen ? "Collapse navigation sidebar" : "Expand navigation sidebar"}
            aria-expanded={isSidebarOpen}
            aria-controls="mobile-navigation-drawer desktop-navigation-sidebar"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          
          <div 
            className="flex items-center gap-2 cursor-pointer select-none shrink-0" 
            onClick={() => onNavigate('overview')}
            title="PaisaPilot - Return to Overview"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate('overview');
              }
            }}
            aria-label="PaisaPilot Home"
          >
            {/* Logo Icon: ALWAYS visible on mobile & desktop */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-2xs shrink-0" aria-hidden="true">
              ₹
            </div>
            
            {/* Brand Text: HIDDEN ON MOBILE (< sm), visible on sm and up */}
            <div className="hidden sm:flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap leading-none">
                PaisaPilot
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-tight">
                Gen Z Finance Simulator
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Large Desktop Only >= xl) */}
        <nav aria-label="Desktop Primary" className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-xs lg:text-sm cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xs ${
                activeSection === link.id
                  ? 'border-emerald-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
              aria-current={activeSection === link.id ? 'page' : undefined}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Day Controller, Judge Demos & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Day Selector Pill (Interactive Controller) */}
          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
            <label htmlFor="challenge-day-select" className="hidden md:inline cursor-pointer">Day</label>
            <select
              id="challenge-day-select"
              value={state.currentDay}
              onChange={(e) => {
                const day = Number(e.target.value);
                setCurrentDay(day);
                showToast(`Simulation advanced to Day ${day} of 30.`, 'info');
              }}
              className="bg-transparent font-semibold text-slate-900 cursor-pointer focus:outline-hidden text-xs tabular-nums"
              aria-label="Select challenge day (1 to 30)"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}/30
                </option>
              ))}
            </select>
          </div>

          {/* Quick Guided Tour: Hidden on mobile (< md) */}
          <button
            type="button"
            onClick={onOpenGuidedTour}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Start 2-minute hackathon guided walkthrough"
            aria-label="Start 2-minute guided tour"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">2-Min Tour</span>
            <span className="lg:hidden">Tour</span>
          </button>

          {/* Hackathon Demo Scenarios Button: HIDDEN ON MOBILE (< sm), visible on desktop */}
          <button
            type="button"
            onClick={onOpenDemoScenarios}
            className="hidden sm:inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-100 border border-emerald-300 rounded-lg hover:bg-emerald-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Open hackathon judge test scenarios"
            aria-label="Open hackathon demo scenarios modal"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>Demo Scenarios</span>
          </button>

          {/* Reset Demo State Button */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0 cursor-pointer"
            title="Reset to Day 1 baseline"
            aria-label="Reset simulation to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          </button>

          {/* User Profile Avatar with Fallback */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-slate-200 ring-1 ring-slate-300/80 shrink-0">
              <img
                src={userAvatar}
                alt={`${state.userName}'s profile avatar`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="hidden xl:inline-block text-xs font-semibold text-slate-800">
              {state.userName}
            </span>
          </div>
        </div>
      </header>

      {/* Confirmation Modal for Resetting */}
      {showResetConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          aria-describedby="reset-modal-desc"
        >
          <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 id="reset-modal-title" className="text-base font-semibold text-slate-900">Reset Demo Data?</h3>
            <p id="reset-modal-desc" className="mt-2 text-sm text-slate-600">
              This will restore the original ₹10,000 Day 1 challenge scenario with initial ₹3,000 commitments and clear test transactions.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Reset to Day 1
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
