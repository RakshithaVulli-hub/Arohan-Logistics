import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Thermometer, 
  Check, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  Truck,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import { StorageRecommendation } from '../../types';
import { FarmerWorkflowStepper } from './FarmerWorkflowStepper';

export const ColdStorageRecommendation: React.FC = () => {
  const { 
    produceList, 
    getStorageRecommendations, 
    bookColdStorage, 
    setCurrentView,
    isStoragesLoading,
    storagesError,
    refreshColdStorages,
    targetProduceId,
    setTargetBookingId
  } = useColdChain();

  // Select produce (default to targetProduceId if available, else first)
  const [selectedProduceId, setSelectedProduceId] = useState(
    targetProduceId || (produceList.length > 0 ? produceList[0].produceId : '')
  );

  useEffect(() => {
    if (targetProduceId && produceList.some(p => p.produceId === targetProduceId)) {
      setSelectedProduceId(targetProduceId);
    }
  }, [targetProduceId, produceList]);
  
  const [durationDays, setDurationDays] = useState(14);
  const [useSharedTransport, setUseSharedTransport] = useState(true);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<any | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingTargetId, setBookingTargetId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fallback to first available produce if selected produce is invalid
  const activeProduce = produceList.find(p => p.produceId === selectedProduceId) || produceList[0];

  // Loading State
  if (isStoragesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => setCurrentView('farmer_dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Farmer Portal
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Find Cold Storage
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-lg mx-auto space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Loading Storage Facilities...</h3>
          <p className="text-xs text-slate-500">Retrieving available storage spaces and temperature conditions.</p>
        </div>
      </div>
    );
  }

  // Error State (no silent mock fallback)
  if (storagesError) {
    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => setCurrentView('farmer_dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Farmer Portal
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Find Cold Storage
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Unable to Load Storage Facilities</h3>
            <p className="text-xs text-red-700 mt-1">{storagesError}</p>
          </div>
          <button
            onClick={() => refreshColdStorages()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition inline-flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Empty Produce State
  if (produceList.length === 0 || !activeProduce) {
    return (
      <div className="space-y-6">
        <FarmerWorkflowStepper compact />
        <div>
          <button
            onClick={() => setCurrentView('farmer_dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Farmer Portal
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Find Cold Storage
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">No Produce Batches Available</h3>
            <p className="text-xs text-slate-500 mt-1">
              Please register your harvested crop in Register Produce first to find cold storage options.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('register_produce')}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            Register Produce Now
          </button>
        </div>
      </div>
    );
  }

  // Sort recommendations by suitability with highest suitability at the top
  const recommendations: StorageRecommendation[] = getStorageRecommendations(activeProduce)
    .slice()
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const topRecommendation = recommendations[0];

  const handleBook = async (storageId: string) => {
    if (!activeProduce) return;
    setBookingError(null);
    setIsBooking(true);
    setBookingTargetId(storageId);
    try {
      const booking = await bookColdStorage(
        activeProduce.produceId, 
        storageId, 
        durationDays, 
        useSharedTransport
      );
      setBookingSuccessModal(booking);
      await refreshColdStorages();
    } catch (err: any) {
      setBookingError(
        err.message || 'Failed to complete storage reservation. Please check capacity and try again.'
      );
    } finally {
      setIsBooking(false);
      setBookingTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Farmer Workflow Stepper */}
      <FarmerWorkflowStepper compact />

      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => setCurrentView('farmer_dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Farmer Portal
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Find Cold Storage
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Suitable storage facilities ranked based on crop requirements, distance, space available, and logistics cost.
          </p>
        </div>

        {/* Batch Selector */}
        {produceList.length > 0 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-600 pl-1">Batch:</span>
            <select
              id="rec-produce-select"
              value={activeProduce.produceId}
              onChange={(e) => setSelectedProduceId(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-emerald-800"
            >
              {produceList.map(p => (
                <option key={p.produceId} value={p.produceId}>
                  {p.cropType} ({p.quantity} {p.unit}) - {p.produceId}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Booking Error Banner */}
      {bookingError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block text-red-900">Reservation Request Rejected</span>
            <span className="mt-0.5 block">{bookingError}</span>
          </div>
          <button
            type="button"
            onClick={() => setBookingError(null)}
            className="text-red-400 hover:text-red-700 font-bold p-1"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Selected Batch Parameter Strip */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-sm">
            {activeProduce.cropType.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{activeProduce.cropType}</span>
              <span className="text-xs text-emerald-400 font-mono">{activeProduce.quantity} {activeProduce.unit}</span>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" /> Source: {activeProduce.sourceLocation}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Optimal Temp</span>
            <span className="font-mono font-semibold text-white">
              {activeProduce.preferredTempMin}°C - {activeProduce.preferredTempMax}°C
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Optimal RH</span>
            <span className="font-mono font-semibold text-white">
              {activeProduce.preferredHumidityMin}% - {activeProduce.preferredHumidityMax}%
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Duration</span>
            <div className="flex items-center gap-1 mt-0.5">
              <input
                type="number"
                min="1"
                max="60"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-14 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-emerald-400 font-bold"
              />
              <span className="text-slate-400">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHTED BEST OPTION: Dark green background, Best Match label, clear reasons */}
      {topRecommendation && (
        <div className="rounded-xl bg-emerald-900 text-white p-6 border-2 border-emerald-700 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-400 text-emerald-950 uppercase tracking-wide flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 fill-current" /> Best Match
              </span>
              <h3 className="text-base font-bold text-white">
                {topRecommendation.storage.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-800 text-emerald-100 border border-emerald-700">
                Match Score: {topRecommendation.suitabilityScore}/100 ({topRecommendation.suitabilityGrade})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            
            <div className="lg:col-span-3 space-y-3">
              <div className="text-xs sm:text-sm text-emerald-100 bg-emerald-950/60 p-3.5 rounded-lg border border-emerald-800">
                <span className="font-semibold text-white block mb-1">Why this facility is recommended:</span>
                {topRecommendation.aiExplanation}
              </div>
              
              {/* Key Factor Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="bg-emerald-800/60 p-2.5 rounded-lg border border-emerald-700/60">
                  <span className="text-[10px] text-emerald-300 block uppercase font-semibold">Distance</span>
                  <span className="font-bold text-white text-sm">{topRecommendation.distanceKm} km</span>
                </div>
                <div className="bg-emerald-800/60 p-2.5 rounded-lg border border-emerald-700/60">
                  <span className="text-[10px] text-emerald-300 block uppercase font-semibold">Chamber Temp</span>
                  <span className="font-bold text-white text-sm">{topRecommendation.storage.temperature}°C</span>
                </div>
                <div className="bg-emerald-800/60 p-2.5 rounded-lg border border-emerald-700/60">
                  <span className="text-[10px] text-emerald-300 block uppercase font-semibold">Space Available</span>
                  <span className="font-bold text-white text-sm">{topRecommendation.storage.availableCapacity.toLocaleString()} kg</span>
                </div>
                <div className="bg-emerald-800/60 p-2.5 rounded-lg border border-emerald-700/60">
                  <span className="text-[10px] text-emerald-300 block uppercase font-semibold">Storage Cost</span>
                  <span className="font-bold text-white text-sm">₹{topRecommendation.storage.storageCost}/kg/day</span>
                </div>
              </div>
            </div>

            {/* Quick Action in Card */}
            <div className="lg:col-span-1 bg-white text-slate-900 p-4 rounded-xl shadow-xs flex flex-col justify-between h-full space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Estimated Total</span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                  ₹{(topRecommendation.storageCostTotal + (useSharedTransport ? 700 : 1800)).toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-800 font-medium block mt-0.5">
                  {useSharedTransport ? 'Includes shared transport (₹700)' : 'Solo transport (₹1,800)'}
                </span>
              </div>

              <button
                id="book-top-recommended-btn"
                disabled={isBooking || topRecommendation.storage.availableCapacity < activeProduce.quantity}
                onClick={() => handleBook(topRecommendation.storage.storageId)}
                className={`w-full py-2.5 rounded-lg font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 ${
                  topRecommendation.storage.availableCapacity < activeProduce.quantity
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : isBooking && bookingTargetId === topRecommendation.storage.storageId
                    ? 'bg-emerald-900 text-white cursor-wait opacity-80'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white cursor-pointer'
                }`}
              >
                {isBooking && bookingTargetId === topRecommendation.storage.storageId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reserving...</span>
                  </>
                ) : topRecommendation.storage.availableCapacity < activeProduce.quantity ? (
                  'Capacity Full'
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Book This Facility
                  </>
                )}
              </button>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-emerald-200 pt-1 border-t border-emerald-800/80 gap-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-300" />
              <span>Shared Transport Mode:</span>
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-white">
                <input
                  type="checkbox"
                  checked={useSharedTransport}
                  onChange={(e) => setUseSharedTransport(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-500"
                />
                <span>{useSharedTransport ? 'Enabled (Save ₹1,100)' : 'Disabled (Solo fare)'}</span>
              </label>
            </div>
            <span className="text-[10px] text-emerald-300/80 font-sans">
              *Demonstration recommendation model based on crop requirements and distance
            </span>
          </div>
        </div>
      )}

      {/* Complete Comparison Matrix of All Facilities */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display">
            All Nearby Storage Options
          </h3>
          <p className="text-xs text-slate-500">
            Sorted by match score based on crop requirements, distance, and rates
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Storage Facility</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3">Space Available</th>
                <th className="py-3 px-3">Temperature / RH</th>
                <th className="py-3 px-3">Daily Tariff</th>
                <th className="py-3 px-3">Total Estimated</th>
                <th className="py-3 px-3">Match Score</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recommendations.map((rec) => {
                const isTop = rec.storage.storageId === topRecommendation?.storage.storageId;
                const effectiveTransportCost = useSharedTransport ? 700 : rec.transportCost;
                const finalTotal = rec.storageCostTotal + effectiveTransportCost;

                return (
                  <tr key={rec.storage.storageId} className={`hover:bg-slate-50 transition-colors ${
                    isTop ? 'bg-emerald-50/40 font-medium' : ''
                  }`}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {rec.storage.name}
                        {isTop && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-800 text-white">
                            Top Pick
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rec.storage.location} • {rec.storage.storageId}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {rec.distanceKm} km
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-800">
                      {rec.storage.availableCapacity.toLocaleString()} kg
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-800">
                      {rec.storage.temperature}°C / {rec.storage.humidity}%
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700">
                      ₹{rec.storage.storageCost}/kg/day
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      ₹{finalTotal.toLocaleString()}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.suitabilityGrade === 'High' ? 'bg-emerald-100 text-emerald-900' :
                        rec.suitabilityGrade === 'Medium' ? 'bg-blue-100 text-blue-900' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {rec.suitabilityScore}% ({rec.suitabilityGrade})
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        disabled={isBooking || rec.storage.availableCapacity < activeProduce.quantity}
                        onClick={() => handleBook(rec.storage.storageId)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ml-auto ${
                          rec.storage.availableCapacity < activeProduce.quantity
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : isBooking && bookingTargetId === rec.storage.storageId
                            ? 'bg-emerald-900 text-white cursor-wait'
                            : isTop 
                            ? 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs cursor-pointer' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer'
                        }`}
                      >
                        {isBooking && bookingTargetId === rec.storage.storageId ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>...</span>
                          </>
                        ) : rec.storage.availableCapacity < activeProduce.quantity ? (
                          'Full'
                        ) : (
                          'Book'
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Booking Confirmed
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Booking Reference: {bookingSuccessModal.bookingId}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Reserved at {bookingSuccessModal.storageName} for {bookingSuccessModal.durationDays} days.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Produce Details:</span>
                <span className="font-bold text-slate-900">{bookingSuccessModal.quantity} kg {bookingSuccessModal.cropType}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Storage Cost:</span>
                <span className="font-bold text-slate-900">₹{bookingSuccessModal.storageCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Transport Cost:</span>
                <span className="font-bold text-slate-900">₹{bookingSuccessModal.transportCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-900 pt-2 border-t border-slate-200 font-sans font-bold text-sm">
                <span>Total Cost:</span>
                <span className="text-emerald-800 font-mono">₹{bookingSuccessModal.totalCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  const bId = bookingSuccessModal.bookingId;
                  setTargetBookingId(bId);
                  setBookingSuccessModal(null);
                  setCurrentView('tracking');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
              >
                Track Transport for This Booking →
              </button>

              <button
                onClick={() => setBookingSuccessModal(null)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
              >
                Close & Stay on Storage Options
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
