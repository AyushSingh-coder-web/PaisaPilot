import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Overview } from './components/dashboard/Overview';
import { SpendSimulator } from './components/simulator/SpendSimulator';
import { BudgetPlanner } from './components/budget/BudgetPlanner';
import { SavingsGoals } from './components/savings/SavingsGoals';
import { SubscriptionManager } from './components/subscriptions/SubscriptionManager';
import { EmergencyLab } from './components/emergencies/EmergencyLab';
import { InsightsAndHealth } from './components/insights/InsightsAndHealth';
import { PaisaPilotCoach } from './components/coach/PaisaPilotCoach';
import { DemoScenariosModal } from './components/demo/DemoScenariosModal';
import { GuidedTourModal } from './components/demo/GuidedTourModal';

function MainApp() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileDrawerOpen((prev) => !prev);
    } else {
      setIsDesktopExpanded((prev) => !prev);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview onNavigateToSimulator={() => setActiveSection('simulator')} />;
      case 'simulator':
        return <SpendSimulator onCommitSuccess={() => setActiveSection('overview')} />;
      case 'planner':
        return <BudgetPlanner />;
      case 'savings':
        return <SavingsGoals />;
      case 'subscriptions':
        return <SubscriptionManager />;
      case 'emergency':
        return <EmergencyLab />;
      case 'insights':
        return <InsightsAndHealth />;
      case 'coach':
        return <PaisaPilotCoach />;
      default:
        return <Overview onNavigateToSimulator={() => setActiveSection('simulator')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Skip to Main Content Link for Keyboard and Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-700 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-white font-semibold text-xs"
      >
        Skip to main content
      </a>

      {/* Top Header */}
      <Header
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onOpenDemoScenarios={() => setIsDemoModalOpen(true)}
        onOpenGuidedTour={() => setIsTourModalOpen(true)}
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isDesktopExpanded || isMobileDrawerOpen}
      />

      {/* Main Workspace: Sticky/Drawer Sidebar + Scrollable Content */}
      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar */}
        <Sidebar
          activeSection={activeSection}
          onNavigate={setActiveSection}
          isDesktopExpanded={isDesktopExpanded}
          onToggleDesktop={() => setIsDesktopExpanded((prev) => !prev)}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
          onOpenDemoScenarios={() => setIsDemoModalOpen(true)}
          onOpenGuidedTour={() => setIsTourModalOpen(true)}
        />

        {/* Dynamic Main Viewport */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-3 sm:px-6 md:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full min-w-0 outline-hidden"
        >
          {renderSection()}
        </main>
      </div>

      {/* Demo Scenarios Modal for Hackathon Judges */}
      <DemoScenariosModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectScenario={() => {
          setActiveSection('overview');
        }}
      />

      {/* 2-Minute Guided Tour Modal */}
      <GuidedTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onNavigateSection={setActiveSection}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FinanceProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </FinanceProvider>
    </ErrorBoundary>
  );
}
