'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderTable } from '@/components/OrderTable';
import { StatsCards } from '@/components/StatsCards';
import { FilterControls } from '@/components/FilterControls';
import { ProcessedOrder, TabType, StatusTab } from '@/lib/types';
import { downloadExcel } from '@/lib/excel';
import { filterByTab, searchOrders, filterByStatus, getStatusCounts } from '@/lib/shopify';

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
  snapmintCount: number;
  snapmintStatusCounts: StatusCounts;
  otherCount: number;
  otherStatusCounts: StatusCounts;
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

export default function Dashboard() {
  const [orders, setOrders] = useState<ProcessedOrder[]>([]);
  const [stuckDays, setStuckDays] = useState(3);
  const [activeTab, setActiveTab] = useState<TabType>('other');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    stuckCount: 0,
    statusCounts: { all: 0, delivered: 0, rto: 0, dto: 0, in_transit: 0, cancelled: 0, pending: 0 },
    snapmintCount: 0,
    snapmintStatusCounts: { all: 0, delivered: 0, rto: 0, dto: 0, in_transit: 0, cancelled: 0, pending: 0 },
    otherCount: 0,
    otherStatusCounts: { all: 0, delivered: 0, rto: 0, dto: 0, in_transit: 0, cancelled: 0, pending: 0 },
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
          statusCounts: data.statusCounts,
          snapmintCount: data.snapmintCount,
          snapmintStatusCounts: data.snapmintStatusCounts,
          otherCount: data.otherCount,
          otherStatusCounts: data.otherStatusCounts,
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
    downloadExcel(exportOrders, 'all');
  };

  const getDisplayedOrders = useMemo(() => {
    return () => {
      let result = filterByTab(orders, activeTab);
      result = filterByStatus(result, statusTab);
      result = searchOrders(result, appliedSearch);
      return result;
    };
  }, [orders, activeTab, statusTab, appliedSearch]);

  const displayedOrders = getDisplayedOrders();

  // Calculate counts for displayed results after search
  const filteredStatusCounts = useMemo(() => {
    const tabOrders = filterByTab(orders, activeTab);
    const searchedOrders = searchOrders(tabOrders, appliedSearch);
    return getStatusCounts(searchedOrders);
  }, [orders, activeTab, appliedSearch]);

  const currentStatusCounts = activeTab === 'snapmint' ? stats.snapmintStatusCounts : stats.otherStatusCounts;

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

        {/* Snapmint / Other Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as TabType);
            setStatusTab('all');
          }}
          className="space-y-6"
        >
          <TabsList className="inline-flex h-12 items-center gap-1 rounded-xl bg-slate-100 p-1">
            <TabsTrigger
              value="other"
              className="relative h-10 rounded-lg px-6 text-sm font-medium text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <span className="flex items-center gap-2">
                Other Orders
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
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

          {/* Tab Content */}
          {(['other', 'snapmint'] as TabType[]).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              {/* Stats Cards */}
              <StatsCards
                total={tab === 'snapmint' ? stats.snapmintCount : stats.otherCount}
                statusCounts={tab === 'snapmint' ? stats.snapmintStatusCounts : stats.otherStatusCounts}
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
                  const count = appliedSearch ? filteredStatusCounts[status] : currentStatusCounts[status];
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
                    {appliedSearch && (
                      <span className="ml-2 text-sm font-normal text-slate-500">
                        matching "{appliedSearch}"
                      </span>
                    )}
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      ({displayedOrders.length.toLocaleString()} results)
                    </span>
                  </h2>
                </div>
                <OrderTable orders={displayedOrders} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
