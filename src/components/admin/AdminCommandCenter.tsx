import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Truck, 
  Boxes, 
  Activity, 
  AlertTriangle, 
  Users,
  MapPin,
  CheckCircle2,
  Radio,
  Sparkles,
  TrendingUp,
  Search,
  X,
  Filter
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import { DatabaseExplorer } from './DatabaseExplorer';

export const AdminCommandCenter: React.FC = () => {
  const { 
    coldStorages, 
    bookings, 
    produceList, 
    vehicles, 
    sensors, 
    currentView,
    setCurrentView,
    activeUser,
    marketPrices,
    aiPredictions
  } = useColdChain();

  // Logistics Monitoring Filters
  const [logisticsStatusFilter, setLogisticsStatusFilter] = useState<
    'all' | 'confirmed' | 'in_transit' | 'completed' | 'pending_cancelled'
  >('all');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState<string>('');

  const totalOccupied = coldStorages.reduce((acc, curr) => acc + curr.occupiedCapacity, 0);
  const totalCapacity = coldStorages.reduce((acc, curr) => acc + curr.totalCapacity, 0);
  const averageUtilization = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  const cs102Sensor = sensors.find(s => s.storageId === 'CS-102') || sensors[0];

  // Filtered Bookings for Logistics Monitoring View
  const filteredLogisticsBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Vehicle or text search filter
      if (vehicleSearchQuery.trim()) {
        const query = vehicleSearchQuery.toLowerCase().trim();
        const matchesVehicle = (b.vehicleId && b.vehicleId.toLowerCase().includes(query)) ||
                               (b.transportId && b.transportId.toLowerCase().includes(query));
        const matchesBooking = b.bookingId && b.bookingId.toLowerCase().includes(query);
        const matchesFarmer = b.farmerName && b.farmerName.toLowerCase().includes(query);
        if (!matchesVehicle && !matchesBooking && !matchesFarmer) {
          return false;
        }
      }

      // Status chip filter
      if (logisticsStatusFilter === 'all') return true;

      const raw = (b.rawStatus || '').toLowerCase();
      const st = (b.status || '').toLowerCase();

      if (logisticsStatusFilter === 'confirmed') {
        return raw === 'confirmed' || st === 'confirmed';
      }
      if (logisticsStatusFilter === 'in_transit') {
        return raw === 'in_transit' || st === 'active';
      }
      if (logisticsStatusFilter === 'completed') {
        return raw === 'completed' || st === 'completed';
      }
      if (logisticsStatusFilter === 'pending_cancelled') {
        return raw === 'pending' || raw === 'cancelled' || st === 'cancelled';
      }
      return true;
    });
  }, [bookings, vehicleSearchQuery, logisticsStatusFilter]);

  // Counts for status filters
  const confirmedCount = bookings.filter(b => b.rawStatus === 'confirmed' || b.status === 'Confirmed').length;
  const inTransitCount = bookings.filter(b => b.rawStatus === 'in_transit' || b.status === 'Active').length;
  const completedCount = bookings.filter(b => b.rawStatus === 'completed' || b.status === 'Completed').length;
  const pendingCancelledCount = bookings.filter(b => b.rawStatus === 'pending' || b.rawStatus === 'cancelled' || b.status === 'Cancelled').length;

  // VIEW 2: Database Explorer (Connecting to Express + MongoDB)
  if (currentView === 'admin_database') {
    return <DatabaseExplorer />;
  }

  // VIEW 3: Logistics Monitoring
  if (currentView === 'admin_logistics') {
    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => setCurrentView('admin_dashboard')}
            className="text-xs font-semibold text-slate-500 hover:text-blue-700 transition flex items-center gap-1 cursor-pointer mb-2"
          >
            ← Back to Admin Portal
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-blue-700" /> Transport & Fleet Movement
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Bookings & Fleet
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Tracking of refrigerated vehicles, transport dispatches, and delivery status across agricultural corridors.
          </p>
        </div>

        {/* Fleet Status Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Active Fleet</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {vehicles.length > 0 ? vehicles.length : 5} Vehicles
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Temperature-controlled reefer fleet</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">On the Way</span>
            <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
              {inTransitCount} Shipments
            </div>
            <p className="text-[11px] text-blue-700 font-medium mt-1">Active transit shipments</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Delivered</span>
            <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
              {completedCount} Delivered
            </div>
            <p className="text-[11px] text-emerald-800 font-medium mt-1">Safely delivered to storage</p>
          </div>
        </div>

        {/* Transport Dispatch Bookings Table & Filter Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Transport Bookings & Delivery Status
              </h3>
              <p className="text-xs text-slate-500">
                Status across pickup locations, cold storage facilities, and assigned reefer fleet
              </p>
            </div>

            {/* Vehicle Search Filter */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search vehicle or booking reference..."
                value={vehicleSearchQuery}
                onChange={(e) => setVehicleSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              {vehicleSearchQuery && (
                <button
                  onClick={() => setVehicleSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>

            <button
              onClick={() => setLogisticsStatusFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                logisticsStatusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({bookings.length})
            </button>

            <button
              onClick={() => setLogisticsStatusFilter('confirmed')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                logisticsStatusFilter === 'confirmed'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Booking Confirmed ({confirmedCount})
            </button>

            <button
              onClick={() => setLogisticsStatusFilter('in_transit')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                logisticsStatusFilter === 'in_transit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              On the Way ({inTransitCount})
            </button>

            <button
              onClick={() => setLogisticsStatusFilter('completed')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                logisticsStatusFilter === 'completed'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Delivered ({completedCount})
            </button>

            <button
              onClick={() => setLogisticsStatusFilter('pending_cancelled')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                logisticsStatusFilter === 'pending_cancelled'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              Pending / Cancelled ({pendingCancelledCount})
            </button>
          </div>

          {/* Active Filter Result Counter */}
          <div className="text-[11px] text-slate-500 font-medium">
            Showing {filteredLogisticsBookings.length} of {bookings.length} recorded shipments
            {(logisticsStatusFilter !== 'all' || vehicleSearchQuery) && (
              <button
                onClick={() => {
                  setLogisticsStatusFilter('all');
                  setVehicleSearchQuery('');
                }}
                className="ml-2 text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Table or Empty State */}
          {filteredLogisticsBookings.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <Truck className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No transport shipments match the selected filters.</p>
              <p className="text-[11px] text-slate-400">
                Try searching for a different vehicle ID or selecting a different status filter chip.
              </p>
              <button
                onClick={() => {
                  setLogisticsStatusFilter('all');
                  setVehicleSearchQuery('');
                }}
                className="inline-block mt-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition border border-blue-200 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Booking Reference / Vehicle</th>
                    <th className="py-2.5 px-3">Farmer</th>
                    <th className="py-2.5 px-3">Produce Weight</th>
                    <th className="py-2.5 px-3">Pickup Location</th>
                    <th className="py-2.5 px-3">Destination Facility</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogisticsBookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{b.bookingId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {b.vehicleId || b.transportId ? `Vehicle: ${b.vehicleId || b.transportId}` : 'Vehicle: Pending'}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {b.farmerName} <span className="text-[10px] text-slate-400 block font-mono">({b.farmerId})</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {b.quantity.toLocaleString()} kg
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {b.pickupLocation || `${b.farmerName} Farm Origin`}
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium">
                        {b.destination || b.storageName}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          (b.rawStatus === 'completed' || b.status === 'Completed') ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                          (b.rawStatus === 'in_transit' || b.status === 'Active') ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                          (b.rawStatus === 'cancelled' || b.status === 'Cancelled') ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                          'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {(b.rawStatus === 'completed' || b.status === 'Completed') ? 'Delivered' :
                           (b.rawStatus === 'in_transit' || b.status === 'Active') ? 'On the Way' :
                           (b.rawStatus === 'cancelled' || b.status === 'Cancelled') ? 'Cancelled' : 'Booking Confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Overview
  return (
    <div className="space-y-6">
      
      {/* Welcome Heading */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-blue-700" /> Admin Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Welcome, {activeUser.name || 'Platform Administrator'}
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Central monitoring and intelligence hub for cold storage networks, capacity utilization, and agricultural transport operations.
        </p>
      </div>

      {/* Macro Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Registered Facilities */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Storage Facilities</span>
            <Building2 className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {coldStorages.length} Facilities
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Active registered facilities
            </p>
          </div>
        </div>

        {/* Card 2: Total Storage Volume */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Volume</span>
            <Boxes className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {totalCapacity.toLocaleString()} kg
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Across regional cluster
            </p>
          </div>
        </div>

        {/* Card 3: Capacity Utilization */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg. Capacity in Use</span>
            <Activity className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-800">
              {averageUtilization}%
            </div>
            <p className="text-[11px] text-emerald-800 font-medium mt-1">
              {totalOccupied.toLocaleString()} kg stored
            </p>
          </div>
        </div>

        {/* Card 4: Active Bookings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
            <ShieldCheck className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {bookings.length} Orders
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Storage and transport orders
            </p>
          </div>
        </div>

      </div>

      {/* Facilities Live Status Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Regional Storage Facilities Status
            </h3>
            <p className="text-xs text-slate-500">
              Storage capacity in use, temperature levels, and tariff structures
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
            Cluster in Use: {averageUtilization}%
          </span>
        </div>

        <div className="space-y-3">
          {coldStorages.map((storage) => {
            const percent = storage.totalCapacity > 0
              ? Math.round((storage.occupiedCapacity / storage.totalCapacity) * 100)
              : 0;
            const isWarning = storage.temperature > 11;

            return (
              <div 
                key={storage.storageId}
                className={`p-4 rounded-lg border transition-colors ${
                  isWarning ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{storage.name}</span>
                      <span className="text-xs font-mono text-slate-400">({storage.storageId})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isWarning ? 'bg-red-100 text-red-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {storage.temperature.toFixed(1)}°C / {storage.humidity}% RH
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      {storage.location} • ₹{storage.storageCost}/kg/day
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {storage.occupiedCapacity.toLocaleString()} / {storage.totalCapacity.toLocaleString()} kg
                    </span>
                    <span className="text-[11px] text-slate-500 block font-sans">
                      ({percent}% in use)
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isWarning ? 'bg-red-600' : 'bg-emerald-800'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macro Intelligence & Market Benchmarks Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Card 1: Produce Quality & Freshness Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Produce Quality & Freshness Summary
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
              {aiPredictions.length} Records
            </span>
          </div>

          <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-[11px] text-emerald-950">
            <strong>Demonstration Information:</strong> Quality grades and freshness estimates are illustrative values for demonstration.
          </div>

          <div className="space-y-2 pt-1">
            {aiPredictions.slice(0, 3).map((p) => (
              <div key={p.predictionId} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800">Batch: {p.produceId}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.predictionId}</span>
                  </div>
                  <span className="text-slate-500 text-[11px] block truncate max-w-xs">{p.recommendation}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    p.qualityGrade === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    Grade {p.qualityGrade}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">{p.spoilageRiskPercentage}% Risk</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Regional Market Prices Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Regional Market Prices Summary
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono">
              {marketPrices.length} Mandi Hubs
            </span>
          </div>

          <div className="p-2.5 bg-blue-50/60 border border-blue-200/80 rounded-lg text-[11px] text-blue-950">
            <strong>Demonstration Information:</strong> Wholesale market rates are illustrative reference figures for demonstration.
          </div>

          <div className="space-y-2 pt-1">
            {marketPrices.slice(0, 3).map((mp) => (
              <div key={mp._id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-800">{mp.cropName}</span>
                  <span className="text-slate-500 text-[11px] block">{mp.marketName} ({mp.district})</span>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="font-bold text-slate-900">₹{mp.pricePerKg}/kg</span>
                  <span className="text-[10px] text-slate-400 block font-sans">Reference</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
