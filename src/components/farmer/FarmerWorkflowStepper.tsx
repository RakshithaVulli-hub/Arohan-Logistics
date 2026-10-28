import React from 'react';
import { 
  Leaf, 
  Building2, 
  Truck, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

interface FarmerWorkflowStepperProps {
  compact?: boolean;
}

export const FarmerWorkflowStepper: React.FC<FarmerWorkflowStepperProps> = ({ compact = false }) => {
  const { 
    currentView, 
    setCurrentView, 
    produceList, 
    bookings, 
    activeUser 
  } = useColdChain();

  // Find produce & bookings belonging to active farmer
  const farmerProduce = produceList.filter(
    p => p.farmerId === activeUser.userId || p.farmerId === 'F-1001'
  );
  const activeBookings = bookings.filter(
    b => (b.farmerId === activeUser.userId || b.farmerId === 'F-1001') && b.status !== 'Cancelled'
  );
  const inTransitBookings = activeBookings.filter(
    b => b.rawStatus === 'in_transit' || b.status === 'Active'
  );

  const isStep1Active = currentView === 'register_produce';
  const isStep2Active = currentView === 'recommendation';
  const isStep3Active = currentView === 'tracking' || currentView === 'farmer_tracking';

  const isStep1Complete = farmerProduce.length > 0;
  const isStep2Complete = activeBookings.length > 0;
  const isStep3Complete = inTransitBookings.length > 0 || activeBookings.some(b => b.rawStatus === 'completed');

  const steps = [
    {
      stepNumber: 1,
      targetView: 'register_produce',
      title: 'Register Produce',
      shortTitle: '1. Register',
      icon: Leaf,
      isActive: isStep1Active,
      isComplete: isStep1Complete,
      statusLabel: isStep1Complete 
        ? `${farmerProduce.length} Batch${farmerProduce.length > 1 ? 'es' : ''} Registered`
        : 'Enter crop & volume',
    },
    {
      stepNumber: 2,
      targetView: 'recommendation',
      title: 'Find Cold Storage',
      shortTitle: '2. Find Storage',
      icon: Building2,
      isActive: isStep2Active,
      isComplete: isStep2Complete,
      statusLabel: isStep2Complete 
        ? `${activeBookings.length} Facility Reserved`
        : isStep1Complete ? 'Find Matching Storage' : 'Awaiting Harvest',
    },
    {
      stepNumber: 3,
      targetView: 'tracking',
      title: 'Track My Transport',
      shortTitle: '3. Track Logistics',
      icon: Truck,
      isActive: isStep3Active,
      isComplete: isStep3Complete,
      statusLabel: inTransitBookings.length > 0
        ? `${inTransitBookings.length} On the Way`
        : activeBookings.length > 0
        ? `${activeBookings.length} Booking Confirmed`
        : 'Awaiting Reservation',
    },
  ];

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Farmer Cold-Chain Journey
          </span>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200/60">
            3-Step Workflow
          </span>
        </div>
        {currentView !== 'farmer_dashboard' && (
          <button
            onClick={() => setCurrentView('farmer_dashboard')}
            className="text-[11px] font-semibold text-slate-500 hover:text-emerald-800 transition-colors self-start sm:self-auto flex items-center gap-1 cursor-pointer"
          >
            ← Back to Farmer Portal
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <button
              key={step.stepNumber}
              type="button"
              onClick={() => setCurrentView(step.targetView)}
              className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 relative group cursor-pointer ${
                step.isActive
                  ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950 shadow-xs'
                  : step.isComplete
                  ? 'bg-slate-50/70 border-slate-200 hover:border-emerald-300 text-slate-800'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-500 opacity-80'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                step.isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : step.isComplete
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
              }`}>
                {step.isComplete && !step.isActive ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-bold truncate block ${
                    step.isActive ? 'text-emerald-950 font-display' : 'text-slate-800'
                  }`}>
                    {step.title}
                  </span>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden md:block shrink-0" />
                  )}
                </div>
                <span className={`text-[11px] block truncate mt-0.5 ${
                  step.isActive 
                    ? 'text-emerald-800 font-semibold' 
                    : step.isComplete
                    ? 'text-emerald-700 font-medium'
                    : 'text-slate-500'
                }`}>
                  {step.statusLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
