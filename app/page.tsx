'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderTable } from '@/components/OrderTable';
import { StatsCards } from '@/components/StatsCards';
import { FilterControls } from '@/components/FilterControls';
import { ProcessedOrder, FilterType, TabType } from '@/lib/types';
import { downloadExcel } from '@/lib/excel';
import { filterOrders, filterByTab, searchOrders } from '@/lib/shopify';

interface ApiResponse {
  success: boolean;
  orders: ProcessedOrder[];
  total: number;
  stuckCount: number;
  cancelledCount: number;
  snapmintCount: number;
  snapmintStuckCount: number;
  otherCount: number;
  otherStuckCount: number;
  error?: string;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<ProcessedOrder[]>([]);
  const [stuckDays, setStuckDays] = useState(3);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<TabType>('other');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    stuckCount: 0,
    cancelledCount: 0,
    snapmintCount: 0,
    snapmintStuckCount: 0,
    otherCount: 0,
    otherStuckCount: 0,
  });

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders?stuckDays=${stuckDays}`);
      const data: ApiResponse = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setStats({
          total: data.total,
          stuckCount: data.stuckCount,
          cancelledCount: data.cancelledCount,
          snapmintCount: data.snapmintCount,
          snapmintStuckCount: data.snapmintStuckCount,
          otherCount: data.otherCount,
          otherStuckCount: data.otherStuckCount,
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
    const exportOrders = getDisplayedOrders();
    downloadExcel(exportOrders, filterType);
  };

  const getDisplayedOrders = useMemo(() => {
    return () => {
      let result = filterByTab(orders, activeTab);
      result = filterOrders(result, filterType);
      result = searchOrders(result, appliedSearch);
      return result;
    };
  }, [orders, activeTab, filterType, appliedSearch]);

  const displayedOrders = getDisplayedOrders();

  const currentStats = useMemo(() => {
    const tabOrders = filterByTab(orders, activeTab);
    return {
      total: tabOrders.length,
      stuckCount: tabOrders.filter((o) => o.isStuck && !o.isCancelled).length,
      cancelledCount: tabOrders.filter((o) => o.isCancelled && o.fulfillmentStatus === 'fulfilled').length,
    };
  }, [orders, activeTab]);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50">
      {/* Subtle grain overlay */}
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
                Monitor fulfillments and identify problematic orders
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

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabType)}
          className="space-y-6"
        >
          <TabsList className="inline-flex h-12 items-center gap-1 rounded-xl bg-slate-100 p-1">
            <TabsTrigger
              value="other"
              className="relative h-10 rounded-lg px-6 text-sm font-medium text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <span className="flex items-center gap-2">
                Other Orders
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 data-[state=active]:bg-slate-100">
                  {stats.otherCount.toLocaleString()}
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="snapmint"
              className="relative h-10 rounded-lg px-6 text-sm font-medium text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-[10px] font-bold text-white">S</span>
                Snapmint
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {stats.snapmintCount.toLocaleString()}
                </span>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="other" className="space-y-6">
            <StatsCards
              total={currentStats.total}
              stuckCount={currentStats.stuckCount}
              cancelledCount={currentStats.cancelledCount}
              isSnapmintTab={false}
            />

            <FilterControls
              stuckDays={stuckDays}
              onStuckDaysChange={setStuckDays}
              filterType={filterType}
              onFilterChange={setFilterType}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
              onRefresh={fetchOrders}
              onExport={handleExport}
              isLoading={isLoading}
            />

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {filterType === 'all' && 'All Orders'}
                  {filterType === 'stuck' && 'Stuck Orders'}
                  {filterType === 'cancelled' && 'Cancelled Orders'}
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({displayedOrders.length.toLocaleString()} results)
                  </span>
                </h2>
              </div>
              <OrderTable orders={displayedOrders} />
            </div>
          </TabsContent>

          <TabsContent value="snapmint" className="space-y-6">
            <StatsCards
              total={currentStats.total}
              stuckCount={currentStats.stuckCount}
              cancelledCount={currentStats.cancelledCount}
              isSnapmintTab={true}
            />

            <FilterControls
              stuckDays={stuckDays}
              onStuckDaysChange={setStuckDays}
              filterType={filterType}
              onFilterChange={setFilterType}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
              onRefresh={fetchOrders}
              onExport={handleExport}
              isLoading={isLoading}
            />

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-xs font-bold text-white">S</span>
                    {filterType === 'all' && 'All Snapmint Orders'}
                    {filterType === 'stuck' && 'Stuck Snapmint Orders'}
                    {filterType === 'cancelled' && 'Cancelled Snapmint Orders'}
                  </span>
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({displayedOrders.length.toLocaleString()} results)
                  </span>
                </h2>
              </div>
              <OrderTable orders={displayedOrders} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
