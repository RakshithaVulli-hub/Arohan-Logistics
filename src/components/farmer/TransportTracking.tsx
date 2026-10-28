import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Navigation,
  AlertTriangle,
  RotateCw,
  Package,
  Calendar,
  DollarSign,
  ShieldCheck,
  Building2,
  Clock,
  Info
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import { FarmerWorkflowStepper } from './FarmerWorkflowStepper';

const STAGES = [
  { key: 'pending', label: 'Awaiting Confirmation', desc: 'Storage and transport requested' },
  { key: 'confirmed', label: 'Booking Confirmed', desc: 'Storage reserved & scheduled' },
  { key: 'in_transit', label: 'On the Way', desc: 'Dispatched via refrigerated transport' },
  { key: 'completed', label: 'Delivered', desc: 'Safely arrived at destination storage' },
];

export const TransportTracking: React.FC = () => {
  const { 
    bookings, 
    vehicles, 
    updateBookingStatusOnBackend, 
    activeRole, 
    activeUser, 
    setCurrentView,
    targetBookingId
  } = useColdChain();

  const [selectedBookingId, setSelectedBookingId] = useState<string>(targetBookingId || '');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // 1. Role-based visibility filtering
  const relevantBookings = bookings.filter(b => {
    if (activeRole === 'farmer') {
      const currentFarmerId = activeUser.userId || 'F-1001';
      return b.farmerId === currentFarmerId;
    }
    if (activeRole === 'operator') {
      // Show bookings matching operator's cold storage
      return b.storageId === 'CS-102';
    }
    // Admin sees all bookings
    return true;
  });

  useEffect(() => {
    if (targetBookingId && relevantBookings.some(b => b.bookingId === targetBookingId)) {
      setSelectedBookingId(targetBookingId);
    }
  }, [targetBookingId, relevantBookings]);

  const activeBooking = 
    relevantBookings.find(b => b.bookingId === selectedBookingId) || 
    relevantBookings[0];

  const handleBack = () => {
    if (activeRole === 'operator') {
      setCurrentView('operator_dashboard');
    } else if (activeRole === 'admin') {
      setCurrentView('admin_dashboard');
    } else {
      setCurrentView('farmer_dashboard');
    }
  };

  const backButtonLabel = 
    activeRole === 'operator' ? '← Back to Cold Storage' :
    activeRole === 'admin' ? '← Back to Admin Portal' :
    '← Back to Farmer Portal';

  // Determine current progression stage
  const rawStatus = activeBooking?.rawStatus || 
    (activeBooking?.status === 'Active' ? 'in_transit' : activeBooking?.status?.toLowerCase() || 'pending');
  const isCancelled = rawStatus === 'cancelled';
  const stageOrder = ['pending', 'confirmed', 'in_transit', 'completed'];
  const currentStageIndex = stageOrder.indexOf(rawStatus);
  const effectiveIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  // Next stage determination
  const nextStage = effectiveIndex < stageOrder.length - 1 ? stageOrder[effectiveIndex + 1] : null;

  const handleAdvanceStage = async () => {
    if (!activeBooking || !nextStage || isUpdating) return;
    setStatusError(null);
    setIsUpdating(true);
    try {
      await updateBookingStatusOnBackend(activeBooking.bookingId, nextStage);
    } catch (err: any) {
      setStatusError(err.message || `Failed to update status to ${nextStage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Assigned vehicle lookup
  const assignedVehicle = activeBooking?.vehicleId || activeBooking?.transportId
    ? vehicles.find(v => v.vehicleId === (activeBooking.vehicleId || activeBooking.transportId))
    : null;

  // Empty State
  if (relevantBookings.length === 0) {
    return (
      <div className="space-y-6">
        {activeRole === 'farmer' && <FarmerWorkflowStepper compact />}
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-1 transition-colors"
          >
            {backButtonLabel}
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            {activeRole === 'farmer' ? 'Track My Transport' : 'Transport Tracking'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Check delivery progress, vehicle details, and transit milestones.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Truck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 font-display">
              No Transport Bookings Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeRole === 'farmer'
                ? 'You currently do not have any storage reservations or transport dispatches scheduled.'
                : 'No incoming or outgoing refrigerated shipments currently assigned to this facility.'}
            </p>
          </div>
          {activeRole === 'farmer' && (
            <button
              onClick={() => setCurrentView('recommendation')}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold transition shadow-xs"
            >
              Find Cold Storage & Transport
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeRole === 'farmer' && <FarmerWorkflowStepper compact />}
      
      {/* Header and Shipment Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-1 transition-colors"
          >
            {backButtonLabel}
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            {activeRole === 'farmer' ? 'Track My Transport' : 'Transport Tracking'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Check delivery progress, vehicle details, and transit milestones.
          </p>
        </div>

        {/* Shipment Selector & Stage Advancement */}
        <div className="flex flex-wrap items-center gap-3">
          {relevantBookings.length > 1 && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Shipment:</span>
              <select
                aria-label="Select active shipment"
                value={activeBooking.bookingId}
                onChange={(e) => {
                  setSelectedBookingId(e.target.value);
                  setStatusError(null);
                }}
                className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {relevantBookings.map((b) => (
                  <option key={b.bookingId} value={b.bookingId}>
                    {b.bookingId} — {b.quantity.toLocaleString()} kg ({b.rawStatus || b.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {nextStage && !isCancelled && (
            <button
              onClick={handleAdvanceStage}
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold transition flex items-center gap-2 shadow-xs"
            >
              {isUpdating ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  Advance: {STAGES.find(s => s.key === nextStage)?.label || nextStage} →
                </>
              )}
            </button>
          )}

          {rawStatus === 'completed' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Delivery Completed
            </span>
          )}

          {isCancelled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-900 text-xs font-bold border border-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              Shipment Cancelled
            </span>
          )}
        </div>
      </div>

      {/* Error alert if status update fails */}
      {statusError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <span className="font-bold block">Status Transition Failed</span>
            {statusError}
          </div>
        </div>
      )}

      {/* Compact Shipment Selector Tabs / Cards */}
      {relevantBookings.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Select Active Shipment ({relevantBookings.length} Total Bookings)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Active: #{activeBooking.bookingId}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {relevantBookings.map((b) => {
              const isSelected = b.bookingId === activeBooking.bookingId;
              const statusStr = (b.rawStatus || b.status).toLowerCase();
              return (
                <button
                  key={b.bookingId}
                  type="button"
                  onClick={() => {
                    setSelectedBookingId(b.bookingId);
                    setStatusError(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-left border shrink-0 transition cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono">
                        #{b.bookingId}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        statusStr === 'completed'
                          ? isSelected ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                          : statusStr === 'in_transit' || statusStr === 'active'
                          ? isSelected ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                          : isSelected ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {statusStr === 'in_transit' || statusStr === 'active' ? 'On the Way' :
                         statusStr === 'confirmed' ? 'Booking Confirmed' :
                         statusStr === 'completed' ? 'Delivered' :
                         statusStr === 'pending' ? 'Awaiting Confirmation' : statusStr}
                      </span>
                    </div>
                    <span className={`text-[10px] block mt-0.5 truncate max-w-[150px] ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {b.quantity.toLocaleString()} kg • {b.storageName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Tracking Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
              isCancelled 
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : rawStatus === 'completed'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-600'
            }`}>
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">
                  Booking Reference #{activeBooking.bookingId}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isCancelled 
                    ? 'bg-rose-100 text-rose-800'
                    : rawStatus === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : rawStatus === 'in_transit'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {rawStatus === 'in_transit' ? 'ON THE WAY' :
                   rawStatus === 'confirmed' ? 'BOOKING CONFIRMED' :
                   rawStatus === 'completed' ? 'DELIVERED' :
                   rawStatus === 'pending' ? 'AWAITING CONFIRMATION' : rawStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Farmer: <strong>{activeBooking.farmerName}</strong> • Produce Reference: {activeBooking.produceId}
              </p>
            </div>
          </div>

          {/* Vehicle Assignment Status Tag */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {assignedVehicle ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  {assignedVehicle.vehicleId.slice(-3)}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Assigned Transport</span>
                  <span className="text-xs font-bold text-slate-900 block">
                    {assignedVehicle.providerName}
                  </span>
                  <span className="text-[11px] text-slate-600">
                    {assignedVehicle.vehicleType}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold block">Vehicle Status</span>
                  <span className="text-xs font-semibold">Assignment Pending</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visual Progress Steps: Requested -> Confirmed -> On the Way -> Delivered */}
        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Transit Progress Status
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Stage {effectiveIndex + 1} of {STAGES.length}
            </span>
          </div>

          {/* Connected Progress Rail */}
          <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isCancelled ? 'bg-rose-500' : 'bg-emerald-600'
              }`}
              style={{ width: isCancelled ? '100%' : `${Math.max(12, ((effectiveIndex) / (STAGES.length - 1)) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STAGES.map((stage, idx) => {
              const isPast = !isCancelled && idx < effectiveIndex;
              const isCurrent = !isCancelled && idx === effectiveIndex;
              const isTransitActive = isCurrent && stage.key === 'in_transit';

              return (
                <div 
                  key={stage.key}
                  className={`p-3.5 rounded-xl border transition ${
                    isCancelled
                      ? 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60'
                      : isCurrent 
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500' 
                      : isPast 
                      ? 'border-slate-200 bg-slate-50/80 text-slate-700' 
                      : 'border-slate-100 bg-white text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isTransitActive ? (
                      <Truck className="w-4 h-4 text-blue-700 animate-pulse shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-slate-200 shrink-0" />
                    )}
                    <span className={`text-xs block font-bold leading-tight ${
                      isCurrent ? 'text-emerald-950 font-display' : 'text-slate-800'
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal pl-5">
                    {stage.desc}
                  </p>
                  {isTransitActive && (
                    <div className="mt-2 text-[10px] font-semibold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-blue-700 shrink-0" />
                      <span>On the Way</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {rawStatus === 'in_transit' && (
            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-1 pl-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Vehicle status indicator reflects recorded transit milestone.</span>
            </div>
          )}
        </div>

        {/* Route Details and Vehicle Allocation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Route & Storage Details */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-700" /> Transit Route & Storage Facility
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Pickup Origin</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {activeBooking.pickupLocation || `${activeBooking.farmerName} Farm Origin`}
                  </span>
                </div>
              </div>

              <div className="pl-2">
                <div className="h-4 border-l-2 border-dashed border-slate-300"></div>
              </div>

              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Destination Facility</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {activeBooking.destination || activeBooking.storageName}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Produce Quantity</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {activeBooking.quantity.toLocaleString()} kg
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Total Booking Cost</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  ₹{activeBooking.totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Transport Vehicle Allocation */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700" /> Transport Vehicle Allocation
            </div>

            {assignedVehicle ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Vehicle Reference</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {assignedVehicle.vehicleId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Provider</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {assignedVehicle.providerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Vehicle Model</span>
                    <span className="font-medium text-slate-700">
                      {assignedVehicle.vehicleType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Max Capacity</span>
                    <span className="font-mono font-bold text-slate-900">
                      {assignedVehicle.capacityKg.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-500 block uppercase">Last Reported Location</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="font-semibold text-slate-800">
                        {assignedVehicle.currentLocation}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 pt-0.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-400 shrink-0" />
                      Vehicle details and latest recorded location.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Vehicle Assignment Pending
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  The cold chain logistics coordinator is currently assigning an available refrigerated transport vehicle suited for {activeBooking.quantity.toLocaleString()} kg of produce along this route.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
