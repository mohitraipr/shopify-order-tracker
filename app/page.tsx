'use client';

import { useState, useEffect, useCallback } from 'react';
import { OrderTable } from '@/components/OrderTable';
import { StatsCards } from '@/components/StatsCards';
import { FilterControls } from '@/components/FilterControls';
import { ProcessedOrder, FilterType } from '@/lib/types';
import { downloadExcel } from '@/lib/excel';
import { filterOrders } from '@/lib/shopify';

interface ApiResponse {
  success: boolean;
  orders: ProcessedOrder[];
  total: number;
  stuckCount: number;
  cancelledCount: number;
  error?: string;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<ProcessedOrder[]>([]);
  const [stuckDays, setStuckDays] = useState(3);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, stuckCount: 0, cancelledCount: 0 });

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

  const handleExport = () => {
    const filteredOrders = filterOrders(orders, filterType);
    downloadExcel(filteredOrders, filterType);
  };

  const filteredOrders = filterOrders(orders, filterType);

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopify Order Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Monitor fulfillment status and identify problematic orders
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <StatsCards
          total={stats.total}
          stuckCount={stats.stuckCount}
          cancelledCount={stats.cancelledCount}
        />

        <FilterControls
          stuckDays={stuckDays}
          onStuckDaysChange={setStuckDays}
          filterType={filterType}
          onFilterChange={setFilterType}
          onRefresh={fetchOrders}
          onExport={handleExport}
          isLoading={isLoading}
        />

        <div>
          <h2 className="text-lg font-semibold mb-4">
            {filterType === 'all' && `All Orders (${filteredOrders.length})`}
            {filterType === 'stuck' && `Stuck Orders (${filteredOrders.length})`}
            {filterType === 'cancelled' && `Cancelled Fulfilled Orders (${filteredOrders.length})`}
          </h2>
          <OrderTable orders={filteredOrders} />
        </div>
      </div>
    </main>
  );
}
