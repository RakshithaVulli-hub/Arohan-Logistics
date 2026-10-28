import React, { useState } from 'react';
import { Leaf, Menu, X } from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

interface NavbarProps {
  onOpenDemoPanel?: () => void;
  onOpenWalkthrough?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { 
    currentView, 
    setCurrentView, 
    activeRole, 
    setActiveRole, 
    isLanding, 
    setIsLanding 
  } = useColdChain();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (target: 'home' | 'farmer' | 'operator' | 'admin') => {
    setMobileMenuOpen(false);
    if (target === 'home') {
      setIsLanding(true);
      setCurrentView('landing');
    } else if (target === 'farmer') {
      setIsLanding(false);
      setActiveRole('farmer');
      setCurrentView('farmer_dashboard');
    } else if (target === 'operator') {
      setIsLanding(false);
      setActiveRole('operator');
      setCurrentView('operator_dashboard');
    } else if (target === 'admin') {
      setIsLanding(false);
      setActiveRole('admin');
      setCurrentView('admin_dashboard');
    }
  };

  const isHomeActive = isLanding || currentView === 'landing';
  const isFarmerActive = !isLanding && (
    activeRole === 'farmer' || 
    currentView.startsWith('farmer_') || 
    currentView === 'register_produce' || 
    currentView === 'my_batches' ||
    currentView === 'recommendation' ||
    currentView === 'tracking' ||
    currentView === 'farmer_tracking' ||
    currentView === 'market_intelligence' ||
    currentView === 'ai_predictions'
  );
  const isOperatorActive = !isLanding && (activeRole === 'operator' || currentView.startsWith('operator_') || currentView === 'iot');
  const isAdminActive = !isLanding && (activeRole === 'admin' || currentView.startsWith('admin_'));

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Brand: Logo + Name */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-900 transition-colors">
              <Leaf className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight font-display block leading-none">
                Arohan Logistics
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                Smart Agriculture Logistics
              </span>
            </div>
          </button>

          {/* Right Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isHomeActive
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('farmer')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isFarmerActive
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Farmer
            </button>

            <button
              onClick={() => handleNav('operator')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isOperatorActive
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Cold Storage
            </button>

            <button
              onClick={() => handleNav('admin')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAdminActive
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Admin Portal
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isHomeActive
                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('farmer')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isFarmerActive
                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Farmer
          </button>
          <button
            onClick={() => handleNav('operator')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isOperatorActive
                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Cold Storage
          </button>
          <button
            onClick={() => handleNav('admin')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isAdminActive
                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Admin Portal
          </button>
        </div>
      )}
    </header>
  );
};
