'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderTable } from '@/components/OrderTable';
import { StatsCards } from '@/components/StatsCards';
import { FilterControls } from '@/components/FilterControls';
import { AllSkusTable } from '@/components/AllSkusTable';
import { AllCitiesTable } from '@/components/AllCitiesTable';
import { ProcessedOrder, StatusTab, SkuStats, CityStats } from '@/lib/types';
import { downloadExcel } from '@/lib/excel';
import { searchOrders, filterByStatus, getStatusCounts } from '@/lib/shopify';

type ViewMode = 'dashboard' | 'skus' | 'cities';
type MainTab = 'snapmint' | 'other' | 'prepaid' | 'cod';
type DateRange = 'all' | '7' | '15' | '30' | '60';

interface StatusCounts {
  all: number;
  delivered: number;
  rto: number;
  dto: number;
  in_transit: number;
  cancelled: number;
  pending: number;
}

interface ApiResponse {
  success: boolean;
  orders: ProcessedOrder[];
  total: number;
  stuckCount: number;
  statusCounts: StatusCounts;
  paymentTypeCounts: { cod: number; prepaid: number };
  allSkus: SkuStats[];
  snapmintAllSkus: SkuStats[];
  otherAllSkus: SkuStats[];
  codAllSkus: SkuStats[];
  prepaidAllSkus: SkuStats[];
  allCities: CityStats[];
  snapmintAllCities: CityStats[];
  otherAllCities: CityStats[];
  codAllCities: CityStats[];
  prepaidAllCities: CityStats[];
  snapmintCount: number;
  snapmintStatusCounts: StatusCounts;
  otherCount: number;
  otherStatusCounts: StatusCounts;
  codCount: number;
  codStatusCounts: StatusCounts;
  prepaidCount: number;
  prepaidStatusCounts: StatusCounts;
  error?: string;
}

const STATUS_LABELS: Record<StatusTab, { label: string; color: string; bgColor: string }> = {
  all: { label: 'All', color: 'text-slate-700', bgColor: 'bg-slate-100' },
  delivered: { label: 'Delivered', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  in_transit: { label: 'In Transit', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  rto: { label: 'RTO', color: 'text-rose-700', bgColor: 'bg-rose-100' },
  dto: { label: 'DTO', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  cancelled: { label: 'Cancelled', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  pending: { label: 'Pending', color: 'text-slate-500', bgColor: 'bg-slate-100' },
};

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: '7', label: 'Last 7 Days' },
  { value: '15', label: 'Last 15 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '60', label: 'Last 60 Days' },
];

export default function Dashboard() {
  const [orders, setOrders] = useState<ProcessedOrder[]>([]);
  const [stuckDays, setStuckDays] = useState(3);
  const [mainTab, setMainTab] = useState<MainTab>('other');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allSkus, setAllSkus] = useState<{
    snapmint: SkuStats[];
    other: SkuStats[];
    cod: SkuStats[];
    prepaid: SkuStats[];
  }>({ snapmint: [], other: [], cod: [], prepaid: [] });
  const [allCities, setAllCities] = useState<{
    snapmint: CityStats[];
    other: CityStats[];
    cod: CityStats[];
    prepaid: CityStats[];
  }>({ snapmint: [], other: [], cod: [], prepaid: [] });
  const [stats, setStats] = useState({
    snapmintCount: 0,
    snapmintStatusCounts: { all: 0, delivered: 0, rto: 0, dto: 0, in_transit: 0, cancelled: 0, pending: 0 },
    otherCount: 0,
    otherStatusCounts: { all: 0, delivered: 0, rto: 0, dto: 0, in_transit: 0, cancelled: 0, pending: 0 },
    codCount: 0,
    codStatusCounts: { all: 0, delivered: 0, rto: 0, dto: 0, in_transit: 0, cancelled: 0, pending: 0 },
    prepaidCount: 0,
    prepaidStatusCounts: { all: 0, delivered: 0, rto: 0, dto: 0, in_transit: 0, cancelled: 0, pending: 0 },
  });

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders?stuckDays=${stuckDays}`);
      const data: ApiResponse = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setAllSkus({
          snapmint: data.snapmintAllSkus,
          other: data.otherAllSkus,
          cod: data.codAllSkus,
          prepaid: data.prepaidAllSkus,
        });
        setAllCities({
          snapmint: data.snapmintAllCities,
          other: data.otherAllCities,
          cod: data.codAllCities,
          prepaid: data.prepaidAllCities,
        });
        setStats({
          snapmintCount: data.snapmintCount,
          snapmintStatusCounts: data.snapmintStatusCounts,
          otherCount: data.otherCount,
          otherStatusCounts: data.otherStatusCounts,
          codCount: data.codCount,
          codStatusCounts: data.codStatusCounts,
          prepaidCount: data.prepaidCount,
          prepaidStatusCounts: data.prepaidStatusCounts,
        });
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [stuckDays]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = () => {
    setAppliedSearch(searchQuery);
  };

  const handleExport = () => {
    downloadExcel(displayedOrders, 'all');
  };

  // Filter orders by main tab
  const filterByMainTab = useCallback((orderList: ProcessedOrder[], tab: MainTab) => {
    switch (tab) {
      case 'snapmint':
        return orderList.filter(o => o.isSnapmint);
      case 'other':
        return orderList.filter(o => !o.isSnapmint);
      case 'prepaid':
        return orderList.filter(o => o.paymentType === 'prepaid');
      case 'cod':
        return orderList.filter(o => o.paymentType === 'cod');
      default:
        return orderList;
    }
  }, []);

  // Filter by date range
  const filterByDateRange = useCallback((orderList: ProcessedOrder[], range: DateRange) => {
    if (range === 'all') return orderList;

    const days = parseInt(range);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return orderList.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= cutoffDate;
    });
  }, []);

  // Get displayed orders with all filters applied
  const displayedOrders = useMemo(() => {
    let result = filterByMainTab(orders, mainTab);

    // Apply date range filter for prepaid/cod tabs
    if (mainTab === 'prepaid' || mainTab === 'cod') {
      result = filterByDateRange(result, dateRange);
    }

    result = filterByStatus(result, statusTab);
    result = searchOrders(result, appliedSearch);
    return result;
  }, [orders, mainTab, dateRange, statusTab, appliedSearch, filterByMainTab, filterByDateRange]);

  // Calculate status counts for current tab (with date filter for prepaid/cod)
  const currentStatusCounts = useMemo(() => {
    let tabOrders = filterByMainTab(orders, mainTab);

    if (mainTab === 'prepaid' || mainTab === 'cod') {
      tabOrders = filterByDateRange(tabOrders, dateRange);
    }

    const searchedOrders = searchOrders(tabOrders, appliedSearch);
    return getStatusCounts(searchedOrders);
  }, [orders, mainTab, dateRange, appliedSearch, filterByMainTab, filterByDateRange]);

  // Get current tab's base stats (without date filter for display)
  const getTabStats = (tab: MainTab) => {
    switch (tab) {
      case 'snapmint': return { count: stats.snapmintCount, statusCounts: stats.snapmintStatusCounts };
      case 'other': return { count: stats.otherCount, statusCounts: stats.otherStatusCounts };
      case 'prepaid': return { count: stats.prepaidCount, statusCounts: stats.prepaidStatusCounts };
      case 'cod': return { count: stats.codCount, statusCounts: stats.codStatusCounts };
    }
  };

  const currentTabStats = getTabStats(mainTab);
  const isPaymentTab = mainTab === 'prepaid' || mainTab === 'cod';

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50">
      <div className="grain-overlay" />

      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Order Tracker
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Monitor fulfillments and delivery status
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-600">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs
          value={mainTab}
          onValueChange={(v) => {
            setMainTab(v as MainTab);
            setStatusTab('all');
            setViewMode('dashboard');
          }}
          className="space-y-6"
        >
          <TabsList className="inline-flex h-12 items-center gap-1 rounded-xl bg-slate-100 p-1">
            <TabsTrigger
              value="other"
              className="relative h-10 rounded-lg px-5 text-sm font-medium text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <span className="flex items-center gap-2">
                Other
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 data-[state=active]:bg-slate-100">
                  {stats.otherCount.toLocaleString()}
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="snapmint"
              className="relative h-10 rounded-lg px-5 text-sm font-medium text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-[10px] font-bold text-white">S</span>
                Snapmint
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {stats.snapmintCount.toLocaleString()}
                </span>
              </span>
            </TabsTrigger>
            <div className="mx-2 h-6 w-px bg-slate-300" />
            <TabsTrigger
              value="prepaid"
              className="relative h-10 rounded-lg px-5 text-sm font-medium text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500 text-[10px] font-bold text-white">P</span>
                Prepaid
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {stats.prepaidCount.toLocaleString()}
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="cod"
              className="relative h-10 rounded-lg px-5 text-sm font-medium text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-500 text-[10px] font-bold text-white">C</span>
                COD
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {stats.codCount.toLocaleString()}
                </span>
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content - Same for all tabs */}
          {(['other', 'snapmint', 'prepaid', 'cod'] as MainTab[]).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              {/* View Mode Selector + Date Range (for prepaid/cod) */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                  {([
                    { key: 'dashboard', label: 'Dashboard', icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    )},
                    { key: 'skus', label: 'All SKUs', icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )},
                    { key: 'cities', label: 'All Cities', icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )},
                  ] as const).map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => setViewMode(key)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        viewMode === key
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>

                {/* Date Range Selector - Only for Prepaid/COD */}
                {(tab === 'prepaid' || tab === 'cod') && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">Date Range:</span>
                    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                      {DATE_RANGE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setDateRange(option.value)}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                            dateRange === option.value
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dashboard View */}
              {viewMode === 'dashboard' && (
                <>
                  {/* Stats Cards */}
                  <StatsCards
                    total={isPaymentTab && dateRange !== 'all' ? currentStatusCounts.all : currentTabStats.count}
                    statusCounts={isPaymentTab && dateRange !== 'all' ? currentStatusCounts : currentTabStats.statusCounts}
                    isSnapmintTab={tab === 'snapmint'}
                  />

                  {/* Filter Controls */}
                  <FilterControls
                    stuckDays={stuckDays}
                    onStuckDaysChange={setStuckDays}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSearch={handleSearch}
                    onRefresh={fetchOrders}
                    onExport={handleExport}
                    isLoading={isLoading}
                  />

                  {/* Status Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'delivered', 'in_transit', 'rto', 'dto', 'cancelled', 'pending'] as StatusTab[]).map((status) => {
                      const config = STATUS_LABELS[status];
                      const count = currentStatusCounts[status];
                      const isActive = statusTab === status;

                      return (
                        <button
                          key={status}
                          onClick={() => setStatusTab(status)}
                          className={`
                            inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all
                            ${isActive
                              ? `border-transparent ${config.bgColor} ${config.color} shadow-sm`
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }
                          `}
                        >
                          {config.label}
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? 'bg-white/50' : config.bgColor} ${config.color}`}>
                            {count.toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Results */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {STATUS_LABELS[statusTab].label} Orders
                        {isPaymentTab && dateRange !== 'all' && (
                          <span className="ml-2 text-sm font-normal text-slate-500">
                            (Last {dateRange} days)
                          </span>
                        )}
                        {appliedSearch && (
                          <span className="ml-2 text-sm font-normal text-slate-500">
                            matching &quot;{appliedSearch}&quot;
                          </span>
                        )}
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          ({displayedOrders.length.toLocaleString()} results)
                        </span>
                      </h2>
                    </div>
                    <OrderTable orders={displayedOrders} />
                  </div>
                </>
              )}

              {/* All SKUs View */}
              {viewMode === 'skus' && (
                <AllSkusTable
                  skus={allSkus[tab]}
                  isSnapmintTab={tab === 'snapmint'}
                />
              )}

              {/* All Cities View */}
              {viewMode === 'cities' && (
                <AllCitiesTable
                  cities={allCities[tab]}
                  isSnapmintTab={tab === 'snapmint'}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
