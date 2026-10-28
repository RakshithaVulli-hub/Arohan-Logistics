import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Boxes, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  Activity,
  Layers,
  Sparkles,
  Droplets,
  RotateCw,
  Clock,
  CheckCircle2,
  RefreshCw,
  Info,
  MapPin,
  Tag
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import { TransportTracking } from '../farmer/TransportTracking';
import { getIoTReadingsByStorage } from '../../services/apiService';
import { IoTReadingItem } from '../../types';

function parseHumidityRange(rangeStr?: string): { minHum: number; maxHum: number } {
  if (!rangeStr) return { minHum: 75, maxHum: 95 };
  const match = rangeStr.match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    return { minHum: Number(match[1]), maxHum: Number(match[2]) };
  }
  return { minHum: 75, maxHum: 95 };
}

export const OperatorDashboard: React.FC = () => {
  const { 
    coldStorages, 
    bookings, 
    produceList, 
    isStoragesLoading,
    storagesError,
    refreshColdStorages,
    recordNewIoTReading,
    currentView,
    setCurrentView,
    activeUser,
    aiPredictions,
    isAiPredictionsLoading
  } = useColdChain();

  // Facility Selection: Default to CS-102 if present, otherwise first available
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('CS-102');

  const currentFacility = 
    coldStorages.find(s => s.storageId === selectedFacilityId) || 
    coldStorages.find(s => s.storageId === 'CS-102') || 
    coldStorages[0];

  // Facility-specific IoT telemetry readings loaded from MongoDB
  const [facilityReadings, setFacilityReadings] = useState<IoTReadingItem[]>([]);
  const [isFacilityIotLoading, setIsFacilityIotLoading] = useState<boolean>(false);
  const [facilityIotError, setFacilityIotError] = useState<string | null>(null);
  const [isSubmittingReading, setIsSubmittingReading] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [targetTemp, setTargetTemp] = useState<number>(8.0);

  // Sync targetTemp when facility changes
  useEffect(() => {
    if (currentFacility) {
      const minT = currentFacility.minimumTemperature ?? 4;
      const maxT = currentFacility.maximumTemperature ?? 12;
      setTargetTemp(Number(((minT + maxT) / 2).toFixed(1)));
    }
  }, [currentFacility?.storageId]);

  // Load persisted telemetry readings for the selected facility (with stale-request protection)
  const loadFacilityTelemetry = (storageId: string) => {
    let isCurrent = true;
    setIsFacilityIotLoading(true);
    setFacilityIotError(null);

    getIoTReadingsByStorage(storageId, 50)
      .then((res) => {
        if (!isCurrent) return;
        if (res.success && Array.isArray(res.data)) {
          setFacilityReadings(res.data);
          setFacilityIotError(null);
        } else {
          setFacilityReadings([]);
          setFacilityIotError(res.error?.message || 'Failed to load telemetry readings from backend.');
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        setFacilityReadings([]);
        setFacilityIotError(err.message || 'Error connecting to IoT telemetry service.');
      })
      .finally(() => {
        if (isCurrent) setIsFacilityIotLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  };

  useEffect(() => {
    if (currentFacility?.storageId) {
      const cancel = loadFacilityTelemetry(currentFacility.storageId);
      return cancel;
    }
  }, [currentFacility?.storageId]);

  // Delegate Transport Tracking view
  if (currentView === 'operator_tracking') {
    return <TransportTracking />;
  }

  // Loading state for facilities
  if (isStoragesLoading && coldStorages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
        <RotateCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
        <h3 className="text-base font-bold text-slate-900 font-display">
          Loading Cold Storage Facilities...
        </h3>
        <p className="text-xs text-slate-500">
          Fetching facility capacity and storage records.
        </p>
      </div>
    );
  }

  // Error state for facilities
  if (storagesError && coldStorages.length === 0) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl max-w-xl mx-auto shadow-xs space-y-4 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-bold text-rose-950 font-display">
            Failed to Connect to Cold Storage Service
          </h3>
          <p className="text-xs text-rose-700">{storagesError}</p>
        </div>
        <button
          onClick={() => refreshColdStorages()}
          className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Empty state if no facilities found
  if (!currentFacility) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
        <Boxes className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 font-display">
          No Storage Facilities Found
        </h3>
        <p className="text-xs text-slate-500">
          No cold storage facility records were found.
        </p>
        <button
          onClick={() => refreshColdStorages()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          Refresh Storage Records
        </button>
      </div>
    );
  }

  // Authoritative capacity metrics
  const totalCap = currentFacility.capacityKg ?? currentFacility.totalCapacity ?? 0;
  const occupiedCap = currentFacility.occupiedCapacityKg ?? currentFacility.occupiedCapacity ?? 0;
  const availableCap = currentFacility.availableCapacityKg ?? currentFacility.availableCapacity ?? Math.max(0, totalCap - occupiedCap);
  const occupancyPercent = totalCap > 0 ? Math.round((occupiedCap / totalCap) * 100) : 0;

  // Environmental specifications
  const minTemp = currentFacility.minimumTemperature ?? 4.0;
  const maxTemp = currentFacility.maximumTemperature ?? 12.0;
  const { minHum, maxHum } = parseHumidityRange(currentFacility.humidityRange);

  // Latest persisted reading
  const latestReading = facilityReadings[0];
  const currentTemp = latestReading ? latestReading.temperature : currentFacility.temperature ?? 8.4;
  const currentHum = latestReading ? latestReading.humidity : currentFacility.humidity ?? 80;
  const currentSensorId = latestReading ? latestReading.sensorId : `SEN-${currentFacility.storageId.replace('CS-', '')}`;

  // Evaluate Environmental Thresholds
  const isTempLow = currentTemp < minTemp;
  const isTempHigh = currentTemp > maxTemp;
  const isTempBreached = isTempLow || isTempHigh;

  const isHumLow = currentHum < minHum;
  const isHumHigh = currentHum > maxHum;
  const isHumBreached = isHumLow || isHumHigh;

  const hasEnvironmentalBreach = isTempBreached || isHumBreached;
  const calculatedSeverity: 'normal' | 'warning' | 'critical' = 
    (isTempBreached && isHumBreached) ? 'critical' : hasEnvironmentalBreach ? 'warning' : 'normal';

  const persistedAlert = latestReading?.alertStatus || 'normal';
  const hasStatusDisagreement = latestReading ? persistedAlert !== calculatedSeverity : false;

  // Stored produce batches & bookings at this facility
  const facilityBookings = bookings.filter(b => b.storageId === currentFacility.storageId);
  const storedProduce = produceList.filter(p => p.currentStorageId === currentFacility.storageId);

  // Handle Actuator Setpoint Submission
  const handleApplyCooling = async () => {
    if (isSubmittingReading) return;
    setIsSubmittingReading(true);
    setActionNotice(null);
    try {
      await recordNewIoTReading({
        storageId: currentFacility.storageId,
        sensorId: currentSensorId,
        temperature: targetTemp,
        humidity: currentHum,
      });
      loadFacilityTelemetry(currentFacility.storageId);
      setActionNotice({
        message: `Chamber temperature setpoint (${targetTemp.toFixed(1)}°C) applied successfully.`,
        type: 'success',
      });
    } catch (err: any) {
      setActionNotice({
        message: err.message || 'Failed to apply temperature setpoint.',
        type: 'error',
      });
    } finally {
      setIsSubmittingReading(false);
    }
  };

  // Handle Normalize Action (Reset to Recommended Range)
  const handleNormalize = async () => {
    if (isSubmittingReading) return;
    setIsSubmittingReading(true);
    setActionNotice(null);
    const optimalT = Number(((minTemp + maxTemp) / 2).toFixed(1));
    const optimalH = Math.round((minHum + maxHum) / 2);
    try {
      await recordNewIoTReading({
        storageId: currentFacility.storageId,
        sensorId: currentSensorId,
        temperature: optimalT,
        humidity: optimalH,
        alertStatus: 'normal',
      });
      setTargetTemp(optimalT);
      loadFacilityTelemetry(currentFacility.storageId);
      setActionNotice({
        message: `Chamber conditions reset to recommended safe range (${optimalT}°C, ${optimalH}% RH).`,
        type: 'success',
      });
    } catch (err: any) {
      setActionNotice({
        message: err.message || 'Failed to reset chamber conditions.',
        type: 'error',
      });
    } finally {
      setIsSubmittingReading(false);
    }
  };

  // Facility Selector Component (Header)
  const FacilitySelectorHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        {currentView !== 'operator_dashboard' && (
          <button
            onClick={() => setCurrentView('operator_dashboard')}
            className="text-xs font-semibold text-slate-500 hover:text-emerald-800 transition flex items-center gap-1 cursor-pointer mb-2"
          >
            ← Cold Storage Overview
          </button>
        )}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          <Building2 className="w-4 h-4 text-emerald-800" /> Cold Storage Network Operations
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          {currentView === 'operator_capacity'
            ? 'Storage Capacity'
            : currentView === 'operator_iot' || currentView === 'iot'
            ? 'Temperature & Humidity'
            : 'Cold Storage Overview'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Managing: <strong className="text-slate-900">{currentFacility.name}</strong> • {currentFacility.location}
        </p>
      </div>

      {/* Facility Selector */}
      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-[11px] font-semibold text-slate-500 uppercase">Facility:</span>
        <select
          aria-label="Select Cold Storage Facility"
          value={currentFacility.storageId}
          onChange={(e) => {
            setSelectedFacilityId(e.target.value);
            setActionNotice(null);
          }}
          className="text-xs font-bold text-slate-900 bg-transparent border-none focus:outline-none cursor-pointer"
        >
          {coldStorages.map((s) => (
            <option key={s.storageId} value={s.storageId}>
              {s.name} ({s.storageId}) — {s.district || s.location}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // VIEW 1: Storage Capacity View
  if (currentView === 'operator_capacity') {
    return (
      <div className="space-y-6">
        <FacilitySelectorHeader />

        {/* Capacity Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Storage Capacity</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {totalCap.toLocaleString()} kg
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Facility Status: <strong className="uppercase text-slate-800">{currentFacility.status || 'AVAILABLE'}</strong>
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Storage Currently in Use</span>
            <div className="text-2xl font-bold font-mono text-slate-800 mt-1">
              {occupiedCap.toLocaleString()} kg
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {occupancyPercent}% Currently in use
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Space Available</span>
            <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
              {availableCap.toLocaleString()} kg
            </div>
            <span className="text-[11px] text-emerald-800 font-medium mt-1 block">
              Available storage headroom: {availableCap.toLocaleString()} kg
            </span>
          </div>
        </div>

        {/* Occupancy Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Chamber Storage Allocation</span>
            <span className="font-mono text-slate-900">{occupancyPercent}% Utilized</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div 
              className="h-full bg-emerald-800 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, occupancyPercent)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0 kg</span>
            <span>Target Operating Band: 40% - 85%</span>
            <span>{totalCap.toLocaleString()} kg</span>
          </div>
        </div>

        {/* Facility Specifications Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Storage Parameters & Supported Crops
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Optimal Temperature Band</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {minTemp.toFixed(1)}°C – {maxTemp.toFixed(1)}°C
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Configured Humidity Range</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {currentFacility.humidityRange || `${minHum}% – ${maxHum}%`}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Tariff Rate</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                ₹{currentFacility.storageCost || 2.5}/kg / day
              </span>
            </div>
          </div>
          {currentFacility.supportedCrops && currentFacility.supportedCrops.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block mb-1.5 font-semibold">
                Approved Commodity Profiles
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentFacility.supportedCrops.map((crop) => (
                  <span
                    key={crop}
                    className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 text-[11px] font-semibold border border-emerald-200"
                  >
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Facility Storage Bookings Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Storage Bookings
            </h3>
            <p className="text-xs text-slate-500">
              Active produce reservations linked to {currentFacility.name} ({currentFacility.storageId})
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Booking Reference</th>
                  <th className="py-2.5 px-3">Farmer</th>
                  <th className="py-2.5 px-3">Produce Weight</th>
                  <th className="py-2.5 px-3">Pickup Location</th>
                  <th className="py-2.5 px-3">Start Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facilityBookings.length > 0 ? (
                  facilityBookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <div>{b.bookingId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Batch: {b.produceId}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {b.farmerName} <span className="text-[10px] text-slate-400 font-mono">({b.farmerId})</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        {b.quantity.toLocaleString()} kg
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {b.pickupLocation || `${b.farmerName} Farm`}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {b.startDate}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          (b.rawStatus === 'completed' || b.status === 'Completed') ? 'bg-emerald-100 text-emerald-900' :
                          (b.rawStatus === 'in_transit' || b.status === 'Active') ? 'bg-blue-100 text-blue-900' :
                          (b.rawStatus === 'cancelled' || b.status === 'Cancelled') ? 'bg-rose-100 text-rose-900' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {(b.rawStatus === 'completed' || b.status === 'Completed') ? 'Delivered' :
                           (b.rawStatus === 'in_transit' || b.status === 'Active') ? 'On the Way' :
                           (b.rawStatus === 'cancelled' || b.status === 'Cancelled') ? 'Cancelled' : 'Booking Confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                      No active bookings currently registered for this facility.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: IoT Monitoring View
  if (currentView === 'operator_iot' || currentView === 'iot') {
    // Scaled coordinates for SVG time-series
    const chartWidth = 540;
    const chartHeight = 130;
    const pad = 24;

    // Persisted historical points sorted ascending by time for chart
    const historicalPoints = facilityReadings.slice(0, 15).reverse();

    // Temperature mapping (scale based on facility min/max with buffer)
    const chartMinTemp = Math.floor(Math.min(minTemp - 2, ...historicalPoints.map(p => p.temperature)));
    const chartMaxTemp = Math.ceil(Math.max(maxTemp + 2, ...historicalPoints.map(p => p.temperature)));
    const tempSpan = Math.max(chartMaxTemp - chartMinTemp, 1);

    const tempPoints = historicalPoints.map((pt, i) => {
      const x = pad + (i / Math.max(historicalPoints.length - 1, 1)) * (chartWidth - 2 * pad);
      const y = chartHeight - pad - ((pt.temperature - chartMinTemp) / tempSpan) * (chartHeight - 2 * pad);
      return { x, y, temp: pt.temperature, time: pt.recordedAt, status: pt.alertStatus };
    });

    const tempPathD = tempPoints.length > 0
      ? tempPoints.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')
      : '';

    return (
      <div className="space-y-6">
        <FacilitySelectorHeader />

        {/* Mandatory Transparency Label */}
        <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Demonstration Sensor Readings — Simulated Environment</span>
          </div>
          <span className="text-[11px] text-amber-700 font-mono shrink-0">
            Sensor: {currentSensorId}
          </span>
        </div>

        {/* Action feedback notice */}
        {actionNotice && (
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            actionNotice.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              {actionNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{actionNotice.message}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-xs font-bold hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Environmental Reading Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Chamber Temperature */}
          <div className={`p-5 rounded-xl border shadow-xs ${
            isTempBreached ? 'bg-red-50/60 border-red-300' : 'bg-white border-slate-200'
          }`}>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Chamber Temperature</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${
              isTempBreached ? 'text-red-700' : 'text-slate-900'
            }`}>
              {currentTemp.toFixed(1)}°C
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Safe Range: <strong>{minTemp.toFixed(1)}°C – {maxTemp.toFixed(1)}°C</strong>
            </span>
          </div>

          {/* 2. Chamber Humidity */}
          <div className={`p-5 rounded-xl border shadow-xs ${
            isHumBreached ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-slate-200'
          }`}>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Chamber Humidity</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${
              isHumBreached ? 'text-amber-800' : 'text-slate-900'
            }`}>
              {currentHum}% RH
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Safe Range: <strong>{minHum}% – {maxHum}% RH</strong>
            </span>
          </div>

          {/* 3. Telemetry Status */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Reading Evaluation</span>
            <div className="text-lg font-bold mt-1 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                calculatedSeverity === 'critical' ? 'bg-red-500 animate-ping' :
                calculatedSeverity === 'warning' ? 'bg-amber-500' : 'bg-emerald-600'
              }`} />
              <span className={
                calculatedSeverity === 'critical' ? 'text-red-700 font-bold' :
                calculatedSeverity === 'warning' ? 'text-amber-800 font-bold' : 'text-emerald-800'
              }>
                {calculatedSeverity === 'critical' ? 'CRITICAL' : calculatedSeverity === 'warning' ? 'WARNING' : 'NORMAL'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block font-mono">
              Status: {persistedAlert}
            </span>
          </div>
        </div>

        {/* Dynamic Environmental Threshold Alert Banner */}
        {hasEnvironmentalBreach && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-900">
                  Recommended Temperature or Humidity Exceeded for {currentFacility.name}
                </h4>
                <p className="text-xs text-red-700 mt-0.5">
                  {isTempBreached && `Temperature (${currentTemp.toFixed(1)}°C) is outside configured range [${minTemp}°C – ${maxTemp}°C]. `}
                  {isHumBreached && `Humidity (${currentHum}% RH) is outside configured range [${minHum}% – ${maxHum}% RH].`}
                </p>
                {hasStatusDisagreement && (
                  <p className="text-[11px] text-red-600 mt-1 font-mono">
                    *Note: Stored reading is tagged as '{persistedAlert}', but current facility limits evaluate to '{calculatedSeverity}'.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleNormalize}
              disabled={isSubmittingReading}
              className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-semibold shrink-0 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isSubmittingReading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : null}
              Reset to Recommended Range
            </button>
          </div>
        )}

        {/* Climate Setpoint Actuator Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Chamber Temperature Setting
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Facility: {currentFacility.storageId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center pt-1">
            <div>
              <label htmlFor="temp-slider" className="text-xs font-semibold text-slate-700 block mb-1">
                Target Temperature (°C)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="temp-slider"
                  type="range"
                  min="2"
                  max="16"
                  step="0.5"
                  value={targetTemp}
                  onChange={(e) => setTargetTemp(Number(e.target.value))}
                  className="w-full accent-emerald-800"
                />
                <span className="font-mono font-bold text-sm text-slate-900 w-14">
                  {targetTemp.toFixed(1)}°C
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Cooling Tech: <strong>{currentFacility.coolingTech}</strong> • Backup Power: <strong>{currentFacility.powerBackup ? 'Available' : 'Grid'}</strong>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleApplyCooling}
                disabled={isSubmittingReading}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isSubmittingReading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : null}
                Apply Temperature Setting
              </button>
            </div>
          </div>
        </div>

        {/* Historical Time-Series SVG Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-emerald-700" /> Temperature History (°C)
              </h3>
              <p className="text-xs text-slate-400">
                Safe operating corridor for {currentFacility.name}: {minTemp.toFixed(1)}°C – {maxTemp.toFixed(1)}°C
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
              Current: {currentTemp.toFixed(1)}°C
            </span>
          </div>

          {historicalPoints.length > 0 ? (
            <div className="relative border border-slate-100 rounded-xl bg-slate-50/50 p-2 overflow-hidden">
              <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
                {/* Optimal threshold band */}
                <rect
                  x={pad}
                  y={chartHeight - pad - ((maxTemp - chartMinTemp) / tempSpan) * (chartHeight - 2 * pad)}
                  width={chartWidth - 2 * pad}
                  height={Math.max(4, ((maxTemp - minTemp) / tempSpan) * (chartHeight - 2 * pad))}
                  fill="#10b98115"
                  stroke="#10b98135"
                  strokeDasharray="4 4"
                />

                {/* Grid lines */}
                <line x1={pad} y1={pad} x2={chartWidth - pad} y2={pad} stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1={pad} y1={chartHeight - pad} x2={chartWidth - pad} y2={chartHeight - pad} stroke="#cbd5e1" />

                {/* Data line */}
                {tempPathD && (
                  <path
                    d={tempPathD}
                    fill="none"
                    stroke={isTempBreached ? '#dc2626' : '#059669'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Points */}
                {tempPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill={pt.temp < minTemp || pt.temp > maxTemp ? '#dc2626' : '#059669'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>

              <div className="flex justify-between text-[10px] text-slate-400 px-2 pt-1 font-mono">
                <span>{historicalPoints[0] ? new Date(historicalPoints[0].recordedAt).toLocaleTimeString() : 'Past'}</span>
                <span className="text-emerald-700 font-semibold">Configured Safe Band: {minTemp}°C – {maxTemp}°C</span>
                <span>{historicalPoints[historicalPoints.length - 1] ? new Date(historicalPoints[historicalPoints.length - 1].recordedAt).toLocaleTimeString() : 'Now'}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No historical readings found for this facility.
            </div>
          )}
        </div>

        {/* Persisted IoT Readings Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Temperature & Humidity Reading Log
              </h3>
              <p className="text-xs text-slate-500">
                Recent sensor readings recorded for {currentFacility.storageId}
              </p>
            </div>
            <button
              onClick={() => loadFacilityTelemetry(currentFacility.storageId)}
              disabled={isFacilityIotLoading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFacilityIotLoading ? 'animate-spin' : ''}`} />
              Refresh Readings
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Reading ID</th>
                  <th className="py-2.5 px-3">Sensor Node</th>
                  <th className="py-2.5 px-3">Temperature</th>
                  <th className="py-2.5 px-3">Humidity</th>
                  <th className="py-2.5 px-3">Recorded At</th>
                  <th className="py-2.5 px-3">Reading Status</th>
                  <th className="py-2.5 px-3">Threshold Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facilityReadings.length > 0 ? (
                  facilityReadings.slice(0, 10).map((r) => {
                    const rTempBreached = r.temperature < minTemp || r.temperature > maxTemp;
                    const rHumBreached = r.humidity < minHum || r.humidity > maxHum;
                    const rEvaluated = (rTempBreached && rHumBreached) ? 'critical' : (rTempBreached || rHumBreached) ? 'warning' : 'normal';

                    return (
                      <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-800">
                          {r._id.slice(-8)}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {r.sensorId}
                        </td>
                        <td className={`py-3 px-3 font-mono font-bold ${
                          rTempBreached ? 'text-red-600' : 'text-slate-800'
                        }`}>
                          {r.temperature.toFixed(1)}°C
                        </td>
                        <td className={`py-3 px-3 font-mono font-medium ${
                          rHumBreached ? 'text-amber-700' : 'text-slate-800'
                        }`}>
                          {r.humidity}% RH
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {new Date(r.recordedAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            r.alertStatus === 'critical' ? 'bg-red-100 text-red-900' :
                            r.alertStatus === 'warning' ? 'bg-amber-100 text-amber-900' :
                            'bg-emerald-100 text-emerald-900'
                          }`}>
                            {r.alertStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-semibold ${
                            rEvaluated === 'critical' ? 'text-red-700' :
                            rEvaluated === 'warning' ? 'text-amber-800' :
                            'text-emerald-800'
                          }`}>
                            {rEvaluated === 'normal' ? '✓ Within Limits' : '! Limit Exceeded'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500 text-xs">
                      No historical sensor readings logged for this facility.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Cold Storage Overview
  return (
    <div className="space-y-6">
      <FacilitySelectorHeader />

      {/* Action Notification Banner (Confirmation or Error) */}
      {actionNotice && (
        <div className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 animate-in fade-in ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* OPERATOR CHAMBER HEALTH BAROMETER (LIVE FROM MONGODB)    */}
      {/* ======================================================== */}
      <div className={`rounded-2xl border p-5 sm:p-6 shadow-xs transition-colors space-y-4 ${
        calculatedSeverity === 'critical'
          ? 'bg-rose-50/70 border-rose-200'
          : calculatedSeverity === 'warning'
          ? 'bg-amber-50/70 border-amber-200'
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/60 pb-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              calculatedSeverity === 'critical'
                ? 'bg-rose-100 text-rose-700'
                : calculatedSeverity === 'warning'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {calculatedSeverity === 'normal' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chamber Health Barometer
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  calculatedSeverity === 'critical'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : calculatedSeverity === 'warning'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {calculatedSeverity === 'critical'
                    ? 'CRITICAL — THRESHOLD EXCURSION'
                    : calculatedSeverity === 'warning'
                    ? 'WARNING — CLIMATE DRIFT'
                    : 'SAFE — OPTIMAL CLIMATE'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {calculatedSeverity === 'normal'
                  ? `Chamber temperature and humidity are securely within configured limits for ${currentFacility.name}.`
                  : `Environmental conditions have breached configured preservation parameters for ${currentFacility.name}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {hasEnvironmentalBreach && (
              <button
                type="button"
                onClick={handleNormalize}
                disabled={isSubmittingReading}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isSubmittingReading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Reset to Recommended Range</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCurrentView('operator_iot')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>View Temperature & Humidity →</span>
            </button>
          </div>
        </div>

        {/* Live Metrics vs Configured Range Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Temperature Parameter */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Chamber Temp</span>
              <Thermometer className={`w-3.5 h-3.5 ${isTempBreached ? 'text-red-600' : 'text-emerald-700'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono ${
                isTempBreached ? 'text-red-700' : 'text-slate-900'
              }`}>
                {currentTemp.toFixed(1)}°C
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isTempBreached ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isTempBreached ? (isTempHigh ? 'High' : 'Low') : 'Within Range'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Safe: {minTemp.toFixed(1)}°C – {maxTemp.toFixed(1)}°C
            </div>
          </div>

          {/* Humidity Parameter */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Relative Humidity</span>
              <Droplets className={`w-3.5 h-3.5 ${isHumBreached ? 'text-amber-600' : 'text-blue-700'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono ${
                isHumBreached ? 'text-amber-700' : 'text-slate-900'
              }`}>
                {currentHum}% RH
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isHumBreached ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isHumBreached ? (isHumHigh ? 'High' : 'Low') : 'Within Range'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Safe: {minHum}% – {maxHum}% RH
            </div>
          </div>

          {/* Sensor Info */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Sensor Node</span>
              <Activity className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-sm font-bold font-mono text-slate-900 truncate">
              {currentSensorId}
            </div>
            <div className="text-[11px] text-slate-500">
              Chamber: {currentFacility.storageId}
            </div>
          </div>

          {/* Last Reading */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider">Reading Timestamp</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xs font-bold font-mono text-slate-800">
              {latestReading ? new Date(latestReading.recordedAt).toLocaleTimeString() : 'Current'}
            </div>
            <div className="text-[11px] text-slate-400">
              {latestReading ? new Date(latestReading.recordedAt).toLocaleDateString() : 'Recorded'}
            </div>
          </div>

        </div>

        {/* Mandatory Transparency Disclosure */}
        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-1">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Sensor readings are simulated values provided for demonstration purposes.
          </span>
        </div>
      </div>

      {/* Useful Summary Cards in a Single Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Storage Capacity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Capacity</span>
            <Boxes className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {totalCap.toLocaleString()} kg
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Status: <strong className="uppercase text-slate-800">{currentFacility.status || 'AVAILABLE'}</strong>
            </p>
          </div>
        </div>

        {/* 2. Storage Currently in Use */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Storage Currently in Use</span>
            <Boxes className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-800">
              {occupiedCap.toLocaleString()} kg
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {occupancyPercent}% utilized
            </p>
          </div>
        </div>

        {/* 3. Space Available */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Space Available</span>
            <Boxes className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-800">
              {availableCap.toLocaleString()} kg
            </div>
            <p className="text-[11px] text-emerald-800 font-medium mt-1">
              Verified storage space
            </p>
          </div>
        </div>

        {/* 4. Environmental Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Climate Status</span>
            <Thermometer className={`w-4 h-4 ${hasEnvironmentalBreach ? 'text-red-600' : 'text-emerald-700'}`} />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {currentTemp.toFixed(1)}°C / {currentHum}% RH
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {hasEnvironmentalBreach ? '⚠️ Outside threshold limits' : '✓ Climate within optimal limits'}
            </p>
          </div>
        </div>

      </div>

      {/* Quick Overview Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 font-display">
          Facility Profile & Active Commodities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">District & Location</span>
            <span className="font-semibold text-slate-800">
              {currentFacility.location}, {currentFacility.district}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Target Climate Band</span>
            <span className="font-mono font-semibold text-slate-800">
              {minTemp.toFixed(1)}°C – {maxTemp.toFixed(1)}°C ({currentFacility.humidityRange})
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Active Reservations</span>
            <span className="font-semibold text-slate-800">
              {facilityBookings.length} Bookings ({facilityBookings.reduce((sum, b) => sum + b.quantity, 0).toLocaleString()} kg)
            </span>
          </div>
        </div>
      </div>

      {/* Produce Quality & Freshness Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Produce Freshness Evaluation</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Produce Quality & Freshness Summary
            </h3>
            <p className="text-xs text-slate-500">
              Freshness and shelf-life assessments for produce stored at {currentFacility.name}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            {aiPredictions.length} Quality Evaluations
          </span>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-xs text-emerald-950 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            <strong>Demonstration Information — Estimated Values:</strong> Produce quality grades and shelf-life predictions are simulated demonstration estimates.
          </span>
        </div>

        {isAiPredictionsLoading ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-1" />
            Loading produce quality records...
          </div>
        ) : aiPredictions.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No produce quality records found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {aiPredictions.slice(0, 4).map((pred) => {
              const isRelevant = pred.recommendation.toLowerCase().includes(currentFacility.storageId.toLowerCase());
              return (
                <div
                  key={pred.predictionId}
                  className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                    isRelevant ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        Batch: {pred.produceId}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {pred.predictionId}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      pred.qualityGrade === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      Grade {pred.qualityGrade} ({pred.freshnessPercentage}% Fresh)
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    "{pred.recommendation}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>Estimated Spoilage Risk: <strong className={pred.spoilageRiskPercentage > 30 ? 'text-amber-700' : 'text-emerald-700'}>{pred.spoilageRiskPercentage}%</strong></span>
                    <span>Estimate Reliability: <strong>{Math.round(pred.confidenceScore * 100)}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

