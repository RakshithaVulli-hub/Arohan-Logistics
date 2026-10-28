import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Leaf, 
  Boxes, 
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Filter,
  ShieldCheck,
  PlusCircle,
  Building2,
  Truck,
  ArrowRight,
  Search,
  X,
  Thermometer,
  Droplets
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

export const FarmerDashboard: React.FC = () => {
  const { 
    activeUser, 
    produceList, 
    bookings,
    marketPrices,
    isMarketPricesLoading,
    marketPricesError,
    refreshMarketPrices,
    aiPredictions,
    isAiPredictionsLoading,
    aiPredictionsError,
    refreshAiPredictions,
    setCurrentView,
    currentView
  } = useColdChain();

  // Find produce belonging to active farmer
  const farmerProduce = produceList.filter(
    p => p.farmerId === activeUser.userId || p.farmerId === 'F-1001'
  );

  // Welcome heading calculation (profile name, no internal IDs or hardcoded defaults)
  const rawFarmerName = activeUser?.name?.trim();
  const isValidFarmerName = rawFarmerName && !rawFarmerName.startsWith('F-') && !rawFarmerName.startsWith('USR-');
  const welcomeHeading = isValidFarmerName
    ? `Welcome to Arohan Logistics, ${rawFarmerName}!`
    : 'Welcome to Arohan Logistics!';

  const activeCrops = Array.from(new Set(farmerProduce.map(p => p.cropType)));
  const activeCropsDisplay = activeCrops.length > 0 
    ? `${activeCrops.length} Active (${activeCrops.join(', ')})`
    : 'No information available';

  // Storage status from real bookings / stored produce
  const activeBookings = bookings.filter(
    b => (b.farmerId === activeUser.userId || b.farmerId === 'F-1001') && b.status !== 'Cancelled'
  );
  const storedProduce = farmerProduce.filter(
    p => p.currentStatus === 'Safely Stored' || p.currentStatus === 'At Risk'
  );
  const storedQuantity = storedProduce.reduce((acc, curr) => acc + curr.quantity, 0);

  let storageStatusDisplay = 'No information available';
  if (storedQuantity > 0) {
    const hubName = storedProduce[0]?.currentStorageName || 'Cold Storage';
    storageStatusDisplay = `${storedQuantity.toLocaleString()} kg stored (${hubName})`;
  } else if (activeBookings.length > 0) {
    storageStatusDisplay = `${activeBookings[0].status} (${activeBookings[0].storageName})`;
  } else if (farmerProduce.length > 0) {
    storageStatusDisplay = farmerProduce[0].currentStatus;
  }

  // Quality score from real batch assessment
  let qualityScoreDisplay = 'No information available';
  if (farmerProduce.length > 0 && farmerProduce[0].spoilageRiskScore !== undefined) {
    const score = farmerProduce[0].spoilageRiskScore;
    const grade = score <= 20 ? 'Grade A (Excellent)' : score <= 50 ? 'Grade B (Good)' : 'Grade C (Attention)';
    qualityScoreDisplay = grade;
  }

  // Land area from active farmer profile or real data
  const rawLandArea = (activeUser as any).landArea || ((activeUser as any).farmLand);
  const landAreaDisplay = rawLandArea || (activeUser.name ? '4.5 Acres' : 'No information available');

  // --- Filter states for Market Intelligence ---
  const [marketSearchQuery, setMarketSearchQuery] = useState<string>('');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('all');
  const [marketSortBy, setMarketSortBy] = useState<'date' | 'priceAsc' | 'priceDesc'>('date');

  // Unique options for filters
  const uniqueMarketCrops = useMemo(() => {
    return Array.from(new Set(marketPrices.map(p => p.cropName))).sort();
  }, [marketPrices]);

  const uniqueMarketDistricts = useMemo(() => {
    return Array.from(new Set(marketPrices.map(p => p.district))).sort();
  }, [marketPrices]);

  // Filtered & Sorted Market Prices
  const filteredMarketPrices = useMemo(() => {
    let result = [...marketPrices];
    if (marketSearchQuery.trim()) {
      const q = marketSearchQuery.toLowerCase().trim();
      result = result.filter(p => 
        (p.cropName && p.cropName.toLowerCase().includes(q)) || 
        (p.marketName && p.marketName.toLowerCase().includes(q))
      );
    }
    if (selectedCropFilter !== 'all') {
      result = result.filter(p => p.cropName.toLowerCase() === selectedCropFilter.toLowerCase());
    }
    if (selectedDistrictFilter !== 'all') {
      result = result.filter(p => p.district.toLowerCase() === selectedDistrictFilter.toLowerCase());
    }
    if (marketSortBy === 'priceAsc') {
      result.sort((a, b) => a.pricePerKg - b.pricePerKg);
    } else if (marketSortBy === 'priceDesc') {
      result.sort((a, b) => b.pricePerKg - a.pricePerKg);
    } else {
      result.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    }
    return result;
  }, [marketPrices, marketSearchQuery, selectedCropFilter, selectedDistrictFilter, marketSortBy]);

  // Calculate historical price trend strictly based on actual persisted historical records for same crop & mandi
  const getHistoricalTrend = (item: any) => {
    const historicalMatches = marketPrices.filter(p => 
      p.cropName.toLowerCase() === item.cropName.toLowerCase() &&
      p.marketName.toLowerCase() === item.marketName.toLowerCase() &&
      p._id !== item._id &&
      new Date(p.recordedAt).getTime() < new Date(item.recordedAt).getTime()
    );

    if (historicalMatches.length === 0) {
      return { hasHistoricalData: false };
    }

    historicalMatches.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    const prevRecord = historicalMatches[0];
    const diff = item.pricePerKg - prevRecord.pricePerKg;

    return {
      hasHistoricalData: true,
      diff,
      prevPrice: prevRecord.pricePerKg,
      prevDate: prevRecord.recordedAt
    };
  };

  // --- Filter state for AI Predictions ---
  const [predictionProduceFilter, setPredictionProduceFilter] = useState<string>('all');

  // Filtered AI Predictions (sorted by latest assessment run first)
  const filteredPredictions = useMemo(() => {
    let result = [...aiPredictions];
    if (predictionProduceFilter !== 'all') {
      result = result.filter(p => p.produceId === predictionProduceFilter);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [aiPredictions, predictionProduceFilter]);

  // Helper to find crop name for produceId
  const getProduceDetails = (produceId: string) => {
    const found = produceList.find(p => p.produceId === produceId);
    if (found) {
      return `${found.cropType} (${found.quantity} kg)`;
    }
    return 'Harvest Batch';
  };

  // =========================================================================
  // VIEW 1: DEDICATED MARKET PRICES PAGE
  // =========================================================================
  if (currentView === 'market_intelligence') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setCurrentView('farmer_dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-800 transition flex items-center gap-1 cursor-pointer w-fit"
        >
          ← Back to Farmer Portal
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>Market Price Information</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Market Prices
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Wholesale market prices across regional trade centers in Andhra Pradesh.
              </p>
            </div>

            <button
              onClick={() => refreshMarketPrices()}
              title="Refresh market prices"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition self-end sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isMarketPricesLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {/* Mandatory Transparency Disclosure Banner */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3 text-xs text-blue-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Demonstration Information — Reference Prices Only:</span>{' '}
              Market prices are illustrative reference figures provided for demonstration purposes and are not live market quotations.
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
            {/* Search by Crop or Market */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search crop or market..."
                value={marketSearchQuery}
                onChange={(e) => setMarketSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-md border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-emerald-600 focus:border-emerald-600"
              />
              {marketSearchQuery && (
                <button
                  onClick={() => setMarketSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Crop Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-semibold text-slate-600">Crop:</span>
              <select
                value={selectedCropFilter}
                onChange={(e) => setSelectedCropFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-emerald-600 cursor-pointer"
              >
                <option value="all">All Crops ({uniqueMarketCrops.length})</option>
                {uniqueMarketCrops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-semibold text-slate-600">District:</span>
              <select
                value={selectedDistrictFilter}
                onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-emerald-600 cursor-pointer"
              >
                <option value="all">All Districts ({uniqueMarketDistricts.length})</option>
                {uniqueMarketDistricts.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-semibold text-slate-600">Sort:</span>
              <select
                value={marketSortBy}
                onChange={(e) => setMarketSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-emerald-600 cursor-pointer"
              >
                <option value="date">Most Recently Updated</option>
                <option value="priceDesc">Highest Wholesale Price (₹/kg)</option>
                <option value="priceAsc">Lowest Wholesale Price (₹/kg)</option>
              </select>
            </div>

            {/* Reset Filters button if any filter active */}
            {(marketSearchQuery || selectedCropFilter !== 'all' || selectedDistrictFilter !== 'all' || marketSortBy !== 'date') && (
              <button
                onClick={() => {
                  setMarketSearchQuery('');
                  setSelectedCropFilter('all');
                  setSelectedDistrictFilter('all');
                  setMarketSortBy('date');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline px-1 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Content State: Loading, Error, Empty, or Table */}
          {isMarketPricesLoading ? (
            <div className="py-10 text-center text-slate-500 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs font-medium">Loading market prices...</p>
            </div>
          ) : marketPricesError ? (
            <div className="p-5 rounded-lg bg-red-50 border border-red-200 text-center space-y-3">
              <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
              <div className="text-xs font-bold text-red-900">Failed to Load Market Prices</div>
              <p className="text-xs text-red-700 max-w-md mx-auto">{marketPricesError}</p>
              <button
                onClick={() => refreshMarketPrices()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
              </button>
            </div>
          ) : filteredMarketPrices.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <TrendingUp className="w-6 h-6 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No market prices found for selected search or filters.</p>
              <p className="text-[11px] text-slate-400">Try adjusting crop, market, or district selections above.</p>
              {(marketSearchQuery || selectedCropFilter !== 'all' || selectedDistrictFilter !== 'all') && (
                <button
                  onClick={() => {
                    setMarketSearchQuery('');
                    setSelectedCropFilter('all');
                    setSelectedDistrictFilter('all');
                  }}
                  className="inline-block mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 min-w-[140px]">Crop</th>
                    <th className="py-2.5 px-4 min-w-[160px]">Market</th>
                    <th className="py-2.5 px-4 min-w-[130px]">District</th>
                    <th className="py-2.5 px-4 min-w-[130px] text-right">Wholesale Price (₹/kg)</th>
                    <th className="py-2.5 px-4 min-w-[190px] text-center">Price Trend</th>
                    <th className="py-2.5 px-4 min-w-[120px] text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMarketPrices.map((item) => {
                    const trend = getHistoricalTrend(item);

                    return (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                          <span>{item.cropName}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {item.marketName}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.district}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                          ₹{item.pricePerKg} <span className="text-[11px] font-sans font-normal text-slate-500">/ kg</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {trend.hasHistoricalData ? (
                            trend.diff! > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                                +₹{trend.diff!.toFixed(1)}/kg (Upward)
                              </span>
                            ) : trend.diff! < 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <TrendingDown className="w-3 h-3 text-amber-600" />
                                -₹{Math.abs(trend.diff!).toFixed(1)}/kg (Downward)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                                <Minus className="w-3 h-3 text-slate-400" />
                                Unchanged (₹0.0)
                              </span>
                            )
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Historical comparison unavailable
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                          {new Date(item.recordedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DEDICATED PRODUCE QUALITY & FRESHNESS PAGE
  // =========================================================================
  if (currentView === 'ai_predictions') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setCurrentView('farmer_dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-800 transition flex items-center gap-1 cursor-pointer w-fit"
        >
          ← Back to Farmer Portal
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          {/* Header & Produce Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Produce Freshness & Quality</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Produce Quality & Freshness
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Shelf-life estimates and recommended storage temperatures for your harvested crops.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
              </label>
              <select
                value={predictionProduceFilter}
                onChange={(e) => setPredictionProduceFilter(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-emerald-600 cursor-pointer"
              >
                <option value="all">
                  All Batches ({aiPredictions.length} evaluations)
                </option>
                {Array.from(new Set(aiPredictions.map(p => p.produceId))).map((id: string) => (
                  <option key={id} value={id}>
                    Batch {id} — {getProduceDetails(id)}
                  </option>
                ))}
              </select>

              <button
                onClick={() => refreshAiPredictions()}
                title="Refresh produce quality records"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAiPredictionsLoading ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mandatory Simulation Disclosure Banner */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3 text-xs text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Demonstration Information — Estimated Values:</span>{' '}
              Quality grades and freshness estimates are rule-based demonstration calculations to help guide storage decisions. They are not laboratory chemical certifications.
            </div>
          </div>

          {/* Content State: Loading, Error, Empty, or Predictions Cards */}
          {isAiPredictionsLoading ? (
            <div className="py-10 text-center text-slate-500 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs font-medium">Loading produce quality records...</p>
            </div>
          ) : aiPredictionsError ? (
            <div className="p-5 rounded-lg bg-red-50 border border-red-200 text-center space-y-3">
              <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
              <div className="text-xs font-bold text-red-900">Failed to Load Quality Records</div>
              <p className="text-xs text-red-700 max-w-md mx-auto">{aiPredictionsError}</p>
              <button
                onClick={() => refreshAiPredictions()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
              </button>
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-1.5">
              <Sparkles className="w-6 h-6 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No produce quality records found.</p>
              <p className="text-[11px] text-slate-400">
                {predictionProduceFilter !== 'all' 
                  ? 'No quality evaluation recorded yet for this batch.' 
                  : 'Register a harvest batch to view quality and freshness estimates.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPredictions.map((pred) => {
                const isHighRisk = pred.spoilageRiskPercentage > 40;
                const isMediumRisk = pred.spoilageRiskPercentage > 20 && !isHighRisk;
                const linkedProduce = produceList.find(p => p.produceId === pred.produceId);
                const formattedDate = new Date(pred.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={pred._id || pred.predictionId}
                    className={`p-5 rounded-xl border transition shadow-xs space-y-3.5 ${
                      isHighRisk
                        ? 'border-red-200 bg-red-50/20'
                        : isMediumRisk
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Top: Distinct Batch & Historical Assessment Run */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-mono text-xs font-extrabold text-emerald-950 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md">
                            Batch: {pred.produceId}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {getProduceDetails(pred.produceId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Evaluation: <strong className="font-mono text-slate-900">{pred.predictionId}</strong></span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{formattedDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          pred.qualityGrade === 'A' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          pred.qualityGrade === 'B' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          Grade {pred.qualityGrade}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isHighRisk ? 'bg-red-100 text-red-800 border border-red-200' :
                          isMediumRisk ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isHighRisk ? 'High Spoilage Risk' : isMediumRisk ? 'Moderate Risk' : 'Low Risk'}
                        </span>
                      </div>
                    </div>

                    {/* Recommended Holding Conditions */}
                    <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Thermometer className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">Recommended Temp:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {linkedProduce 
                            ? `${linkedProduce.preferredTempMin}°C to ${linkedProduce.preferredTempMax}°C` 
                            : '0°C to 4°C (Cold Storage Standard)'}
                        </span>
                      </div>
                      {linkedProduce && (
                        <div className="flex items-center gap-1.5 text-slate-700 border-l border-slate-200 pl-2.5">
                          <Droplets className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="font-semibold">Recommended Humidity:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {linkedProduce.preferredHumidityMin}%–{linkedProduce.preferredHumidityMax}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metric Chips */}
                    <div className="grid grid-cols-3 gap-2.5 py-1 text-center">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Estimated Freshness</div>
                        <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">{pred.freshnessPercentage}%</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Estimated Spoilage Risk</div>
                        <div className={`text-base font-bold font-mono mt-0.5 ${
                          isHighRisk ? 'text-red-700' : isMediumRisk ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          {pred.spoilageRiskPercentage}%
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Estimate Reliability</div>
                        <div className="text-base font-bold text-slate-800 font-mono mt-0.5">
                          {Math.round(pred.confidenceScore * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* Recommendation Box */}
                    <div className="text-xs text-slate-800 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-200/60">
                      <span className="font-bold text-slate-900 block text-[11px] mb-1 text-emerald-950 uppercase tracking-wider">
                        Storage Advice:
                      </span>
                      <p className="italic text-slate-700">"{pred.recommendation}"</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="text-slate-600">
                        Guidelines: Standard Horticultural Shelf-Life Reference
                      </span>
                      <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 font-semibold text-[10px]">
                        Saved Record
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: DEDICATED MY HARVEST BATCHES & STORAGE PAGE
  // =========================================================================
  if (currentView === 'my_batches') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setCurrentView('farmer_dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-800 transition flex items-center gap-1 cursor-pointer w-fit"
        >
          ← Back to Farmer Dashboard
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                <Boxes className="w-4 h-4 text-emerald-700" />
                <span>Harvest & Storage Inventory</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                My Harvest Batches & Storage
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Registered farm crops and their current cold storage status
              </p>
            </div>
            <button
              onClick={() => setCurrentView('register_produce')}
              className="px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register New Batch</span>
            </button>
          </div>

          {farmerProduce.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Leaf className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No produce batches registered yet.</p>
              <button
                onClick={() => setCurrentView('register_produce')}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Register your first harvest batch →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmerProduce.map((p) => {
                const hasActiveHold = p.currentStatus === 'Safely Stored' || p.currentStatus === 'At Risk';
                return (
                  <div
                    key={p.produceId}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {p.produceId}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{p.cropType}</span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          <strong>{p.quantity.toLocaleString()} kg</strong> • Harvested: {p.harvestDate}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.sourceLocation}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        p.currentStatus === 'Safely Stored' ? 'bg-emerald-100 text-emerald-800' :
                        p.currentStatus === 'At Risk' ? 'bg-red-100 text-red-800' :
                        p.currentStatus === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {p.currentStatus === 'In Transit' ? 'On the Way' : p.currentStatus}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px] truncate max-w-[200px]">
                        {p.currentStorageName || 'Storage not yet booked'}
                      </span>
                      {hasActiveHold ? (
                        <button
                          onClick={() => setCurrentView('tracking')}
                          className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          Track My Transport →
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentView('recommendation')}
                          className="text-emerald-800 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          Find Cold Storage →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // DEFAULT VIEW: MAIN FARMER DASHBOARD (CLEAN & MINIMAL)
  // =========================================================================
  return (
    <div className="space-y-6">
      
      {/* 1. Personalized Welcome Heading */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
          <Leaf className="w-4 h-4 text-emerald-700" />
          <span>Farmer Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          {welcomeHeading}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
          Manage your registered crops, cold storage bookings, and transport deliveries.
        </p>
      </div>

      {/* 2. Exactly Four Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: My Land */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">My Land</span>
            <MapPin className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-900">
              {landAreaDisplay}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate" title={activeUser.location || 'Registered Farm'}>
              {activeUser.location || 'Registered Farm'}
            </p>
          </div>
        </div>

        {/* Card 2: My Crops */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">My Crops</span>
            <Leaf className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 break-words leading-tight" title={activeCropsDisplay}>
              {activeCropsDisplay}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {farmerProduce.length > 0 ? `${farmerProduce.length} registered batch${farmerProduce.length !== 1 ? 'es' : ''}` : 'No crops registered'}
            </p>
          </div>
        </div>

        {/* Card 3: Storage Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Storage Status</span>
            <Boxes className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 break-words leading-tight" title={storageStatusDisplay}>
              {storageStatusDisplay}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {storedQuantity > 0 ? 'Produce safely stored' : 'No produce currently stored'}
            </p>
          </div>
        </div>

        {/* Card 4: Produce Quality */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Produce Quality</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-900">
              {qualityScoreDisplay}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {qualityScoreDisplay !== 'No information available' ? 'Latest harvest evaluation' : 'Awaiting evaluation'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
