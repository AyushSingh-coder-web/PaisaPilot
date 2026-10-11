import React, { useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  LayoutDashboard,
  SlidersHorizontal,
  PieChart,
  PiggyBank,
  CreditCard,
  AlertTriangle,
  ShieldCheck,
  Bot,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  isDesktopExpanded: boolean;
  onToggleDesktop: () => void;
  isMobileDrawerOpen: boolean;
  onCloseMobile: () => void;
  onOpenDemoScenarios?: () => void;
  onOpenGuidedTour?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  isDesktopExpanded,
  onToggleDesktop,
  isMobileDrawerOpen,
  onCloseMobile,
  onOpenDemoScenarios,
  onOpenGuidedTour,
}) => {
  const { availableCash, financialHealth, dailyAllowance } = useFinance();

  // Close mobile drawer on Escape key press and prevent body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileDrawerOpen) {
        onCloseMobile();
      }
    };

    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileDrawerOpen, onCloseMobile]);

  const navItems = [
    {
      id: 'overview',
      name: 'Overview',
      icon: LayoutDashboard,
      description: 'Main balances & safe spend',
    },
    {
      id: 'simulator',
      name: 'Spend Simulator',
      icon: SlidersHorizontal,
      description: 'Decision preview before buying',
      isSignature: true,
    },
    {
      id: 'planner',
      name: 'Budget Planner',
      icon: PieChart,
      description: 'Limits & allocations',
    },
    {
      id: 'savings',
      name: 'Savings Goals',
      icon: PiggyBank,
      description: 'Emergency & goal vaults',
    },
    {
      id: 'subscriptions',
      name: 'Subscriptions',
      icon: CreditCard,
      description: 'Recurring monthly spend',
    },
    {
      id: 'emergency',
      name: 'Emergency Lab',
      icon: AlertTriangle,
      description: 'Shock simulation & recovery',
    },
    {
      id: 'insights',
      name: 'Insights & Health',
      icon: ShieldCheck,
      description: 'Risk model & micro-learning',
    },
    {
      id: 'coach',
      name: 'PaisaPilot Coach',
      icon: Bot,
      description: 'Context-aware financial guide',
    },
  ];

  const renderNavContent = (isMobileView = false) => {
    const showLabels = isMobileView || isDesktopExpanded;

    return (
      <div className="flex flex-col h-full justify-between">
        {/* Navigation items list */}
        <nav 
          aria-label={isMobileView ? "Mobile Section Navigation" : "Desktop Section Navigation"}
          className="p-3 overflow-y-auto space-y-1 flex-1"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (isMobileView) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group relative cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-950 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${!showLabels ? 'justify-center' : ''}`}
                title={item.name}
                aria-label={item.name}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                  aria-hidden="true"
                />

                {showLabels && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate">{item.name}</span>
                      {item.isSignature && (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0 ml-1">
                          SIM
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate font-normal">
                      {item.description}
                    </p>
                  </div>
                )}
              </button>
            );
          })}

          {/* Mobile Drawer Only: Quick Access to Demo Scenarios & 2-Min Tour */}
          {isMobileView && (
            <div className="pt-3 mt-2 border-t border-slate-100 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
                Judge Review Tools
              </div>
              {onOpenDemoScenarios && (
                <button
                  type="button"
                  onClick={() => {
                    onCloseMobile();
                    onOpenDemoScenarios();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors text-left cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                  <span>Demo Scenarios</span>
                </button>
              )}
              {onOpenGuidedTour && (
                <button
                  type="button"
                  onClick={() => {
                    onCloseMobile();
                    onOpenGuidedTour();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors text-left cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Compass className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                  <span>2-Min Guided Tour</span>
                </button>
              )}
            </div>
          )}
        </nav>

        {/* Bottom Financial Snapshot Card */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60 shrink-0">
          {showLabels ? (
            <div className="space-y-2">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Available Cash</span>
                  <span className="font-semibold text-emerald-700 tabular-nums">
                    ₹{availableCash.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Safe Today</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    ₹{dailyAllowance}/day
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Health Score</span>
                  <span className="font-bold tabular-nums" style={{ color: financialHealth.statusColor }}>
                    {financialHealth.score}/100
                  </span>
                </div>
              </div>

              {!isMobileView && (
                <button
                  type="button"
                  onClick={onToggleDesktop}
                  className="w-full flex items-center justify-center gap-1.5 py-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 rounded-sm"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar width"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Collapse</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleDesktop}
              className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 rounded-sm"
              title="Expand sidebar"
              aria-label="Expand sidebar width"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Mobile & Narrow Tablet Drawer (Slide-in) */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-label="Mobile Navigation Menu"
        aria-modal="true"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl flex flex-col md:hidden transform transition-transform duration-200 ease-in-out ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
              ₹
            </div>
            <span className="text-base font-bold text-slate-900">PaisaPilot</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Close mobile navigation drawer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Navigation Content */}
        <div className="flex-1 overflow-hidden">
          {renderNavContent(true)}
        </div>
      </aside>

      {/* 2. Desktop Sticky Sidebar (Visible on md and up) */}
      <aside
        id="desktop-navigation-sidebar"
        className={`hidden md:flex sticky top-[57px] md:top-[61px] z-30 h-[calc(100vh-61px)] bg-white border-r border-slate-200 transition-all duration-200 flex-col shrink-0 ${
          isDesktopExpanded ? 'w-64' : 'w-[72px]'
        }`}
        aria-label="Main Navigation Sidebar"
      >
        {renderNavContent(false)}
      </aside>
    </>
  );
};
