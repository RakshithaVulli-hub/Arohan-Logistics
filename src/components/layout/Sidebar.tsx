import React from 'react';
import { 
  PlusCircle, 
  Search, 
  Truck, 
  Boxes, 
  Activity, 
  Database, 
  Radio, 
  ArrowLeft,
  Building2,
  ShieldCheck,
  Leaf,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

export const Sidebar: React.FC = () => {
  const { 
    activeRole, 
    currentView, 
    setCurrentView, 
    setIsLanding 
  } = useColdChain();

  const handleBackToHome = () => {
    setIsLanding(true);
    setCurrentView('landing');
  };

  // Derive effective role based on currentView to guarantee correct sidebar items
  const effectiveRole = 
    currentView.startsWith('operator_') || currentView === 'iot' ? 'operator' :
    currentView.startsWith('admin_') ? 'admin' :
    currentView.startsWith('farmer_') || 
    currentView === 'register_produce' || 
    currentView === 'my_batches' || 
    currentView === 'recommendation' || 
    currentView === 'tracking' || 
    currentView === 'farmer_tracking' || 
    currentView === 'market_intelligence' || 
    currentView === 'ai_predictions' ? 'farmer' :
    activeRole;

  return (
    <aside className="w-full md:w-64 bg-white border border-slate-200 rounded-xl flex flex-col shrink-0 md:sticky md:top-20 shadow-xs select-none p-3 space-y-4">
      
      {/* Role / Module Header */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Active Portal
          </span>
          <span className={`w-2 h-2 rounded-full ${
            effectiveRole === 'farmer' ? 'bg-emerald-600' :
            effectiveRole === 'operator' ? 'bg-slate-800' : 'bg-blue-600'
          }`} />
        </div>
        <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          {effectiveRole === 'farmer' && (
            <button 
              onClick={() => setCurrentView('farmer_dashboard')}
              className={`transition-colors flex items-center justify-between w-full text-left font-display cursor-pointer p-1 rounded-md ${
                currentView === 'farmer_dashboard' || currentView === 'dashboard'
                  ? 'bg-emerald-100/70 text-emerald-950 font-bold'
                  : 'hover:text-emerald-800 text-slate-800'
              }`}
              title="View Farmer Portal Overview"
            >
              <div className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-700" />
                <span>Farmer Portal</span>
              </div>
              {(currentView === 'farmer_dashboard' || currentView === 'dashboard') && (
                <span className="text-[10px] bg-emerald-800 text-white font-sans font-semibold px-1.5 py-0.5 rounded">
                  Overview
                </span>
              )}
            </button>
          )}
          {effectiveRole === 'operator' && (
            <button 
              onClick={() => setCurrentView('operator_dashboard')}
              className={`transition-colors flex items-center justify-between w-full text-left font-display cursor-pointer p-1 rounded-md ${
                currentView === 'operator_dashboard'
                  ? 'bg-slate-200/80 text-slate-950 font-bold'
                  : 'hover:text-slate-950 text-slate-800'
              }`}
              title="View Cold Storage Overview"
            >
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-700" />
                <span>Cold Storage</span>
              </div>
              {currentView === 'operator_dashboard' && (
                <span className="text-[10px] bg-slate-800 text-white font-sans font-semibold px-1.5 py-0.5 rounded">
                  Overview
                </span>
              )}
            </button>
          )}
          {effectiveRole === 'admin' && (
            <button 
              onClick={() => setCurrentView('admin_dashboard')}
              className={`transition-colors flex items-center justify-between w-full text-left font-display cursor-pointer p-1 rounded-md ${
                currentView === 'admin_dashboard' || currentView === 'admin_overview'
                  ? 'bg-blue-100/70 text-blue-950 font-bold'
                  : 'hover:text-blue-900 text-slate-800'
              }`}
              title="View Admin Portal Overview"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Admin Portal</span>
              </div>
              {(currentView === 'admin_dashboard' || currentView === 'admin_overview') && (
                <span className="text-[10px] bg-blue-700 text-white font-sans font-semibold px-1.5 py-0.5 rounded">
                  Overview
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Operations Navigation */}
      <nav className="space-y-1">
        
        {/* FARMER PORTAL SIDEBAR: Operation-specific actions */}
        {effectiveRole === 'farmer' && (
          <>
            <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Farmer Actions
            </div>

            <SidebarItem
              icon={<PlusCircle className="w-4 h-4" />}
              label="Register Produce"
              isActive={currentView === 'register_produce'}
              onClick={() => setCurrentView('register_produce')}
            />

            <SidebarItem
              icon={<Boxes className="w-4 h-4" />}
              label="My Harvest Batches & Storage"
              isActive={currentView === 'my_batches'}
              onClick={() => setCurrentView('my_batches')}
            />

            <SidebarItem
              icon={<Search className="w-4 h-4" />}
              label="Find Cold Storage"
              isActive={currentView === 'recommendation'}
              onClick={() => setCurrentView('recommendation')}
            />

            <SidebarItem
              icon={<Truck className="w-4 h-4" />}
              label="Track My Transport"
              isActive={currentView === 'tracking' || currentView === 'farmer_tracking'}
              onClick={() => setCurrentView('tracking')}
            />

            <SidebarItem
              icon={<TrendingUp className="w-4 h-4" />}
              label="Market Prices"
              isActive={currentView === 'market_intelligence'}
              onClick={() => setCurrentView('market_intelligence')}
            />

            <SidebarItem
              icon={<Sparkles className="w-4 h-4" />}
              label="Produce Quality & Freshness"
              isActive={currentView === 'ai_predictions'}
              onClick={() => setCurrentView('ai_predictions')}
            />
          </>
        )}

        {/* COLD STORAGE PORTAL SIDEBAR: Operation-specific actions */}
        {effectiveRole === 'operator' && (
          <>
            <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Cold Storage Actions
            </div>

            <SidebarItem
              icon={<Boxes className="w-4 h-4" />}
              label="Storage Capacity"
              isActive={currentView === 'operator_capacity'}
              onClick={() => setCurrentView('operator_capacity')}
            />

            <SidebarItem
              icon={<Activity className="w-4 h-4" />}
              label="Temperature & Humidity"
              isActive={currentView === 'operator_iot' || currentView === 'iot'}
              onClick={() => setCurrentView('operator_iot')}
            />

            <SidebarItem
              icon={<Truck className="w-4 h-4" />}
              label="Transport Tracking"
              isActive={currentView === 'operator_tracking'}
              onClick={() => setCurrentView('operator_tracking')}
            />
          </>
        )}

        {/* ADMIN PORTAL SIDEBAR: Operation-specific actions */}
        {effectiveRole === 'admin' && (
          <>
            <div className="px-2 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Admin Actions
            </div>

            <SidebarItem
              icon={<Database className="w-4 h-4" />}
              label="Records & Information"
              isActive={currentView === 'admin_database'}
              onClick={() => setCurrentView('admin_database')}
            />

            <SidebarItem
              icon={<Radio className="w-4 h-4" />}
              label="Bookings & Fleet"
              isActive={currentView === 'admin_logistics'}
              onClick={() => setCurrentView('admin_logistics')}
            />
          </>
        )}

      </nav>

      {/* Return to Home Action */}
      <div className="pt-3 border-t border-slate-100">
        <button
          onClick={handleBackToHome}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

    </aside>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isActive,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
        isActive
          ? 'bg-emerald-800 text-white font-semibold shadow-xs'
          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <span className={isActive ? 'text-white' : 'text-slate-500'}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
};
