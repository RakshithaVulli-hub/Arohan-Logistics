import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Table,
  Filter,
  ChevronLeft,
  ChevronRight,
  Server,
  Layers,
  Sparkles,
  X,
  Copy,
  Check,
  Eye,
  Code
} from 'lucide-react';
import {
  checkApiHealth,
  getDatabaseStats,
  getFarmers,
  getProduce,
  getColdStorages,
  getTransportVehicles,
  getBookings,
  getIoTReadings,
  getMarketPrices,
  getAiPredictions,
  DatabaseStats,
  ApiHealth,
} from '../../services/apiService';
import { useColdChain } from '../../context/ColdChainContext';

type CollectionKey =
  | 'farmers'
  | 'produce'
  | 'coldStorages'
  | 'transportVehicles'
  | 'bookings'
  | 'iotReadings'
  | 'marketPrices'
  | 'aiPredictions';

interface CollectionMeta {
  key: CollectionKey;
  label: string;
  icon: string;
  description: string;
  fetcher: () => Promise<any>;
}

const COLLECTIONS: CollectionMeta[] = [
  {
    key: 'farmers',
    label: 'Farmer Accounts',
    icon: '👨‍🌾',
    description: 'Registered small & marginal agricultural producers in AP',
    fetcher: getFarmers,
  },
  {
    key: 'produce',
    label: 'Registered Produce Records',
    icon: '🌾',
    description: 'Harvest batches registered with quantity, grade, and harvest date',
    fetcher: getProduce,
  },
  {
    key: 'coldStorages',
    label: 'Storage Facilities',
    icon: '❄️',
    description: 'Cold storage facilities with location and capacity tracking',
    fetcher: getColdStorages,
  },
  {
    key: 'transportVehicles',
    label: 'Transport Fleet',
    icon: '🚚',
    description: 'Refrigerated transport fleet with driver and route tracking',
    fetcher: getTransportVehicles,
  },
  {
    key: 'bookings',
    label: 'Storage & Transport Bookings',
    icon: '📋',
    description: 'Storage reservations and scheduled transport orders',
    fetcher: getBookings,
  },
  {
    key: 'iotReadings',
    label: 'Recorded Temperature & Humidity',
    icon: '📡',
    description: 'Timestamped temperature & humidity sensor logs',
    fetcher: () => getIoTReadings(50),
  },
  {
    key: 'marketPrices',
    label: 'Market Price Records',
    icon: '📈',
    description: 'Regional crop price indicators (Simulated Demonstration Figures)',
    fetcher: getMarketPrices,
  },
  {
    key: 'aiPredictions',
    label: 'Quality & Spoilage Assessments',
    icon: '🤖',
    description: 'Freshness grading & shelf-life estimates (Demonstration Figures)',
    fetcher: getAiPredictions,
  },
];

export const DatabaseExplorer: React.FC = () => {
  const { setCurrentView } = useColdChain();
  const [activeCollection, setActiveCollection] = useState<CollectionKey>('farmers');
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectDoc, setInspectDoc] = useState<any | null>(null);
  const [copiedDocJson, setCopiedDocJson] = useState<boolean>(false);
  const pageSize = 10;

  // Copy helper with feedback
  const handleCopyText = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Load health & stats
  const loadSystemInfo = async () => {
    setStatsLoading(true);
    try {
      const healthRes = await checkApiHealth();
      if (healthRes.success && healthRes.data) {
        setHealth(healthRes.data);
      } else {
        setHealth(null);
      }

      const statsData = await getDatabaseStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load system stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load records for active collection
  const loadCollectionData = async (colKey: CollectionKey) => {
    setLoading(true);
    setError(null);
    setSearchQuery('');
    setPage(1);

    const meta = COLLECTIONS.find((c) => c.key === colKey);
    if (!meta) return;

    try {
      const res = await meta.fetcher();
      if (res.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setError(res.error?.message || 'Failed to retrieve collection records from database.');
        setRecords([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with MongoDB backend API.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemInfo();
  }, []);

  useEffect(() => {
    loadCollectionData(activeCollection);
  }, [activeCollection]);

  const handleRefresh = async () => {
    await loadSystemInfo();
    await loadCollectionData(activeCollection);
  };

  // Filter records based on search query
  const filteredRecords = records.filter((rec) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(rec).some((val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(query);
      return String(val).toLowerCase().includes(query);
    });
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  // Extract columns dynamically (omit internal MongoDB fields & sensitive fields)
  const getColumns = (items: any[]) => {
    if (items.length === 0) return [];
    const keys = new Set<string>();
    const forbiddenKeys = ['_id', '__v', 'password', 'token', 'secret', 'hash'];
    items.forEach((item) => {
      Object.keys(item).forEach((k) => {
        if (!forbiddenKeys.includes(k)) {
          keys.add(k);
        }
      });
    });
    return Array.from(keys);
  };

  const columns = getColumns(paginatedRecords);

  const formatCellValue = (val: any, colKey?: string) => {
    if (val === null || val === undefined) return <span className="text-slate-400 italic">null</span>;

    // Check if column is an identifier
    const isIdField = colKey && (colKey.toLowerCase().endsWith('id') || colKey === '_id');
    if (isIdField && typeof val === 'string') {
      const isCopied = copiedId === val;
      return (
        <div className="flex items-center gap-1 font-mono">
          <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] truncate max-w-[140px]" title={val}>
            {val}
          </span>
          <button
            onClick={(e) => handleCopyText(val, e)}
            title={isCopied ? 'Copied ID!' : `Copy ${colKey}`}
            className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition shrink-0"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      );
    }

    if (typeof val === 'boolean') {
      return (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            val ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {val ? 'true' : 'false'}
        </span>
      );
    }
    if (Array.isArray(val)) {
      return (
        <span className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono">
          {val.length === 0 ? '[]' : val.join(', ')}
        </span>
      );
    }
    if (typeof val === 'object') {
      return <span className="text-xs text-slate-500 font-mono truncate max-w-[200px] block">{JSON.stringify(val)}</span>;
    }
    // Date string detection with readable formatted value & original ISO in hover title
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
      const dateObj = new Date(val);
      const isDateValid = !isNaN(dateObj.getTime());
      if (isDateValid) {
        return (
          <span 
            className="text-xs text-slate-700 font-mono cursor-help bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60"
            title={`Original MongoDB Timestamp: ${val}`}
          >
            {dateObj.toLocaleString('en-IN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        );
      }
    }
    return String(val);
  };

  // Safe document for JSON inspector (masks any sensitive credentials)
  const getSafeDocForInspection = (doc: any) => {
    if (!doc) return null;
    const safe = { ...doc };
    if (safe.password) safe.password = '•••••••• (Protected)';
    if (safe.hash) safe.hash = '•••••••• (Protected)';
    return safe;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <button
        onClick={() => setCurrentView('admin_dashboard')}
        className="text-xs font-semibold text-slate-500 hover:text-blue-700 transition flex items-center gap-1 cursor-pointer w-fit"
      >
        ← Back to Admin Portal
      </button>

      {/* Header & Status Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Records & Information Explorer</span>
            </div>
            <h2 className="text-2xl font-bold font-display">Records & Information</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Inspect system records, data counts, and live operational entries across the cold chain logistics network.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* System Connection Status Pill */}
            {(() => {
              const isDbConnected =
                health?.api === 'ok' ||
                health?.database === 'connected' ||
                (typeof health?.database === 'object' && health?.database?.connected) ||
                health?.details?.connected === true;

              return (
                <div
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium backdrop-blur-xs ${
                    isDbConnected
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  />
                  <span>
                    System Records: {isDbConnected ? 'Connected & Active' : 'Disconnected / Offline'}
                  </span>
                </div>
              );
            })()}

            <button
              onClick={handleRefresh}
              disabled={loading || statsLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || statsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Global Statistics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-xs text-slate-400">Total Records</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {stats ? stats.totalRecords : '—'}
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-xs text-slate-400">Record Categories</div>
            <div className="text-xl font-bold text-white mt-0.5">8 Categories</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-xs text-slate-400">Data Store</div>
            <div className="text-xl font-bold text-cyan-400 mt-0.5">Active Database</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-xs text-slate-400">Backend Service</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">Operational</div>
          </div>
        </div>
      </div>

      {/* Collection Selector Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
          Select Record Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLLECTIONS.map((col) => {
            const count = stats?.collections ? (stats.collections as any)[col.key] : null;
            const isSelected = activeCollection === col.key;

            return (
              <button
                key={col.key}
                onClick={() => setActiveCollection(col.key)}
                className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xl">{col.icon}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold font-mono ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {count !== null && count !== undefined ? `${count} records` : '...'}
                  </span>
                </div>
                <div className="mt-2">
                  <div
                    className={`text-sm font-bold ${
                      isSelected ? 'text-emerald-950' : 'text-slate-800'
                    }`}
                  >
                    {col.label}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {col.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Collection Data Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-900 text-sm">
              Category: <span className="text-emerald-700">{COLLECTIONS.find(c => c.key === activeCollection)?.label || activeCollection}</span>
            </span>
            <span className="text-xs text-slate-500">
              {filteredRecords.length !== records.length
                ? `(Showing ${filteredRecords.length} of ${records.length} total)`
                : `(${records.length} ${records.length === 1 ? 'record' : 'records'})`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search records in this category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content State Handling */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-medium">Fetching records from database...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-rose-900">Backend Communication Error</h4>
            <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
            <p className="text-[11px] text-slate-500">
              Ensure the backend server is running and accessible.
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Database className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium">
              {searchQuery ? 'No documents match your search query.' : 'This collection currently contains 0 records.'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
              >
                Clear Search Filter
              </button>
            ) : (
              <p className="text-[11px] text-slate-400">
                Run seed scripts to populate initial Andhra Pradesh demonstration records.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600">
                  <th className="py-2.5 px-3 font-semibold text-center w-10">#</th>
                  {columns.map((col) => (
                    <th key={col} className="py-2.5 px-3 font-semibold">
                      {col}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 font-semibold text-center w-28">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedRecords.map((item, idx) => (
                  <tr key={item._id || item.farmerId || item.storageId || idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 text-slate-400 text-center font-mono text-[11px]">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="py-2.5 px-3 text-slate-700">
                        {formatCellValue(item[col], col)}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setInspectDoc(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
                        title="View technical record details"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && !error && filteredRecords.length > 0 && (
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-900">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(page * pageSize, filteredRecords.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{filteredRecords.length}</span> records in{' '}
              <span className="font-semibold text-slate-900">{COLLECTIONS.find(c => c.key === activeCollection)?.label || activeCollection}</span>
              {filteredRecords.length !== records.length && (
                <span className="text-slate-400 ml-1">
                  (filtered from {records.length} total)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Raw Document Inspector Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                    <span>Technical Record Details</span>
                    <span className="text-xs font-mono font-normal text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {COLLECTIONS.find(c => c.key === activeCollection)?.label || activeCollection}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Reference: {inspectDoc._id || inspectDoc.farmerId || inspectDoc.bookingId || inspectDoc.produceId || 'Record'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const safe = getSafeDocForInspection(inspectDoc);
                    navigator.clipboard.writeText(JSON.stringify(safe, null, 2));
                    setCopiedDocJson(true);
                    setTimeout(() => setCopiedDocJson(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white hover:text-emerald-700 transition cursor-pointer"
                >
                  {copiedDocJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setInspectDoc(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title="Close inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 px-6 overflow-y-auto flex-1 bg-slate-950 text-slate-100 font-mono text-xs">
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(getSafeDocForInspection(inspectDoc), null, 2)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Record Category: <code className="text-slate-800 font-bold">{COLLECTIONS.find(c => c.key === activeCollection)?.label || activeCollection}</code></span>
              <button
                onClick={() => setInspectDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseExplorer;

