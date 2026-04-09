'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProcessedOrder } from '@/lib/types';

interface OrderTableProps {
  orders: ProcessedOrder[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      fulfilled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      unfulfilled: 'bg-slate-50 text-slate-600 border-slate-200',
      partial: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.unfulfilled}`}>
        {status}
      </span>
    );
  };

  const getShipmentBadge = (status: string, isStuck: boolean) => {
    if (isStuck) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
          {status}
        </span>
      );
    }
    const styles: Record<string, string> = {
      in_transit: 'bg-blue-50 text-blue-700 border-blue-200',
      delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      out_for_delivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      unknown: 'bg-slate-50 text-slate-500 border-slate-200',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.unknown}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600">No orders found</p>
        <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/50">
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-slate-500">Order</TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-slate-500">Tracking</TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-slate-500">Carrier</TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-slate-500">SKUs</TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-slate-500">Fulfillment</TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-slate-500">Shipment</TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-slate-500">Days</TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow
                key={order.orderId}
                className={`
                  border-b border-slate-50 transition-colors
                  ${order.isStuck ? 'bg-rose-50/30 hover:bg-rose-50/50' : order.isCancelled ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-slate-50/50'}
                  ${index % 2 === 0 ? '' : 'bg-slate-25'}
                `}
              >
                <TableCell className="py-3.5">
                  <span className="font-semibold text-slate-900">{order.orderNumber}</span>
                  {order.isSnapmint && (
                    <Badge className="ml-2 border-0 bg-emerald-100 text-[10px] font-medium text-emerald-700">
                      Snapmint
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-3.5">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                    {order.trackingId}
                  </code>
                </TableCell>
                <TableCell className="py-3.5 text-sm text-slate-600">{order.trackingCompany}</TableCell>
                <TableCell className="max-w-[180px] truncate py-3.5 text-sm text-slate-600" title={order.skus}>
                  {order.skus}
                </TableCell>
                <TableCell className="py-3.5">{getStatusBadge(order.fulfillmentStatus)}</TableCell>
                <TableCell className="py-3.5">{getShipmentBadge(order.shipmentStatus, order.isStuck)}</TableCell>
                <TableCell className="py-3.5">
                  <span className={`font-mono text-sm ${order.daysSinceFulfillment !== null && order.daysSinceFulfillment >= 3 ? 'font-semibold text-rose-600' : 'text-slate-600'}`}>
                    {order.daysSinceFulfillment ?? '—'}
                  </span>
                </TableCell>
                <TableCell className="py-3.5">
                  {order.isCancelled ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelled
                    </span>
                  ) : order.isStuck ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      Stuck
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
