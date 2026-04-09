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
import { ProcessedOrder, DeliveryStatus } from '@/lib/types';

interface OrderTableProps {
  orders: ProcessedOrder[];
}

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; className: string; icon: React.ReactNode }> = {
  delivered: {
    label: 'Delivered',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  in_transit: {
    label: 'In Transit',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-6.75 0V7.5m0 0H6A2.25 2.25 0 003.75 9.75v3.375M7.5 7.5h3" />
      </svg>
    ),
  },
  rto: {
    label: 'RTO',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    ),
  },
  dto: {
    label: 'DTO',
    className: 'border-orange-200 bg-orange-50 text-orange-700',
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  cancelled: {
    label: 'Cancelled',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  pending: {
    label: 'Pending',
    className: 'border-slate-200 bg-slate-50 text-slate-600',
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export function OrderTable({ orders }: OrderTableProps) {
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
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
              <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-slate-500">Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.deliveryStatus];
              const rowBg = order.deliveryStatus === 'rto'
                ? 'bg-rose-50/30 hover:bg-rose-50/50'
                : order.deliveryStatus === 'dto'
                ? 'bg-orange-50/30 hover:bg-orange-50/50'
                : order.deliveryStatus === 'cancelled'
                ? 'bg-amber-50/30 hover:bg-amber-50/50'
                : 'hover:bg-slate-50/50';

              return (
                <TableRow
                  key={order.orderId}
                  className={`border-b border-slate-50 transition-colors ${rowBg}`}
                >
                  <TableCell className="py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900">{order.orderNumber}</span>
                      {order.isSnapmint && (
                        <Badge className="w-fit border-0 bg-emerald-100 text-[10px] font-medium text-emerald-700">
                          Snapmint
                        </Badge>
                      )}
                    </div>
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
                  <TableCell className="py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className={`font-mono text-sm ${order.daysSinceFulfillment !== null && order.daysSinceFulfillment >= 3 && order.deliveryStatus === 'pending' ? 'font-semibold text-rose-600' : 'text-slate-600'}`}>
                      {order.daysSinceFulfillment ?? '—'}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
