import React from 'react';
import { 
  Leaf, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  ClipboardList,
  Compass,
  Activity,
  Truck
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import { ImageCarousel } from './ImageCarousel';

export const LandingPage: React.FC = () => {
  const { setActiveRole, setCurrentView, setIsLanding } = useColdChain();

  const navigateToRole = (role: 'farmer' | 'operator' | 'admin') => {
    setIsLanding(false);
    setActiveRole(role);
    if (role === 'farmer') setCurrentView('farmer_dashboard');
    else if (role === 'operator') setCurrentView('operator_dashboard');
    else if (role === 'admin') setCurrentView('admin_dashboard');
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
      
      {/* 1. Large Auto-Sliding Image Carousel Banner (Top of Homepage) */}
      <ImageCarousel />

      {/* 2. Welcome Section & Brand Identity (Clean text, No duplicate CTA buttons) */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <div className="max-w-3xl mx-auto space-y-3">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Best Logistics in India
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
              Welcome to Arohan Logistics
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal pt-1">
              Connecting farmers, cold storage facilities, and transport services through one smart logistics platform to help preserve fresh produce and reduce post-harvest losses.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        
        {/* 3. Three Service Cards (Farmer Services, Cold Storage, Administration) */}
        <section aria-label="Services">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Farmer Services */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-emerald-300 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <Leaf className="w-5 h-5 text-emerald-700" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  1. Farmer Services
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Register harvested produce, discover suitable cold storage facilities, and track transportation.
                </p>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => navigateToRole('farmer')}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Open Farmer Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Cold Storage Management */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-400 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-slate-700" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  2. Cold Storage Management
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Manage storage capacity, monitor environmental conditions, and coordinate produce handling and transport.
                </p>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => navigateToRole('operator')}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Open Cold Storage Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Administration */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-blue-300 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-blue-700" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  3. Administration
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Monitor platform activity, review records, and oversee logistics operations.
                </p>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => navigateToRole('admin')}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Open Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* 4. About Us Section */}
        <section id="about-us" className="bg-white rounded-xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              About Us
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Arohan Logistics is a smart agricultural logistics platform designed to connect farmers with suitable cold storage and refrigerated transport services. Our goal is to improve access to cold-chain infrastructure, reduce post-harvest losses, and support better handling of agricultural produce.
            </p>
          </div>
        </section>

        {/* 5. Our Operations Section */}
        <section id="our-operations" className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Our Operations
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              End-to-end cold-chain preservation workflow across four clear steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Step 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Step 1
                </span>
                <ClipboardList className="w-4 h-4 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Produce Registration
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Farmers enter crop details, harvest dates, quantities, and locations.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Step 2
                </span>
                <Compass className="w-4 h-4 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Find Cold Storage
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The platform identifies suitable storage options based on crop requirements, space available, distance, and cost.
              </p>
              <div className="text-[10px] text-slate-400 font-medium">
                *Demonstration recommendation model
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Step 3
                </span>
                <Activity className="w-4 h-4 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Temperature & Humidity Monitoring
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recorded chamber conditions and temperature ranges are displayed for monitoring.
              </p>
              <div className="text-[10px] text-slate-400 font-medium">
                *Demonstration sensor readings & alerts
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Step 4
                </span>
                <Truck className="w-4 h-4 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Track My Transport
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Farmers and storage operators track produce movement and delivery progress.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* 6. Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <span className="text-base font-bold text-slate-900 font-display block">
                Arohan Logistics
              </span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Smarter Cold Chains. Fresher Produce.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs font-medium text-slate-600">
              <a href="#about-us" className="hover:text-emerald-800 transition-colors">
                About Us
              </a>
              <a href="#our-operations" className="hover:text-emerald-800 transition-colors">
                Our Operations
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
