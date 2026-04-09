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
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      fulfilled: 'default',
      unfulfilled: 'secondary',
      partial: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getShipmentBadge = (status: string, isStuck: boolean) => {
    if (isStuck) {
      return <Badge variant="destructive">{status} (STUCK)</Badge>;
    }
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      in_transit: 'default',
      delivered: 'default',
      out_for_delivery: 'default',
      unknown: 'secondary',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No orders found matching the current filter.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Tracking ID</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>SKUs</TableHead>
            <TableHead>Fulfillment</TableHead>
            <TableHead>Shipment Status</TableHead>
            <TableHead>Days Since Fulfilled</TableHead>
            <TableHead>Cancelled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderId} className={order.isStuck ? 'bg-red-50' : order.isCancelled ? 'bg-amber-50' : ''}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell className="font-mono text-sm">{order.trackingId}</TableCell>
              <TableCell>{order.trackingCompany}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={order.skus}>
                {order.skus}
              </TableCell>
              <TableCell>{getStatusBadge(order.fulfillmentStatus)}</TableCell>
              <TableCell>{getShipmentBadge(order.shipmentStatus, order.isStuck)}</TableCell>
              <TableCell>{order.daysSinceFulfillment ?? 'N/A'}</TableCell>
              <TableCell>
                {order.isCancelled ? (
                  <Badge variant="destructive">Cancelled</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
