'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardsProps {
  total: number;
  stuckCount: number;
  cancelledCount: number;
}

export function StatsCards({ total, stuckCount, cancelledCount }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">All orders from Shopify</p>
        </CardContent>
      </Card>
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">Stuck Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-800">{stuckCount}</div>
          <p className="text-xs text-red-600">Fulfilled but not in transit</p>
        </CardContent>
      </Card>
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-800">Cancelled (Fulfilled)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800">{cancelledCount}</div>
          <p className="text-xs text-amber-600">Fulfilled orders that were cancelled</p>
        </CardContent>
      </Card>
    </div>
  );
}
