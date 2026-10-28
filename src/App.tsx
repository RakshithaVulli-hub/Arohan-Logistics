import React from 'react';
import { ColdChainProvider, useColdChain } from './context/ColdChainContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { RegisterProduce } from './components/farmer/RegisterProduce';
import { ColdStorageRecommendation } from './components/farmer/ColdStorageRecommendation';
import { TransportTracking } from './components/farmer/TransportTracking';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { AdminCommandCenter } from './components/admin/AdminCommandCenter';

const AppContent: React.FC = () => {
  const { currentView, isLanding } = useColdChain();

  // If homepage is active, render single clean header and new LandingPage
  if (isLanding || currentView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">
          <LandingPage />
        </main>
      </div>
    );
  }

  // Active dashboard view mapping
  const renderMainView = () => {
    switch (currentView) {
      // Farmer operations
      case 'farmer_dashboard':
      case 'my_batches':
      case 'market_intelligence':
      case 'ai_predictions':
        return <FarmerDashboard />;
      case 'register_produce':
        return <RegisterProduce />;
      case 'recommendation':
        return <ColdStorageRecommendation />;
      case 'tracking':
      case 'farmer_tracking':
        return <TransportTracking />;

      // Cold Storage operations
      case 'operator_dashboard':
      case 'operator_capacity':
      case 'operator_iot':
      case 'operator_tracking':
        return <OperatorDashboard />;

      // Admin operations
      case 'admin_dashboard':
      case 'admin_overview':
      case 'admin_database':
      case 'admin_logistics':
        return <AdminCommandCenter />;

      default:
        return <FarmerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Single Unified Header */}
      <Navbar />

      {/* Main Dashboard Container: Single Left Sidebar + Operation Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Exactly One Left Sidebar */}
        <Sidebar />

        {/* Selected Dashboard Operation Area */}
        <main className="flex-1 min-w-0 pb-16">
          {renderMainView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ColdChainProvider>
      <AppContent />
    </ColdChainProvider>
  );
}
