import * as XLSX from 'xlsx';
import { ProcessedOrder, FilterType, DeliveryStatus } from './types';

const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  delivered: 'Delivered',
  in_transit: 'In Transit',
  rto: 'RTO (Return to Origin)',
  dto: 'DTO (Customer Return)',
  cancelled: 'Cancelled',
  pending: 'Pending',
};

export function generateExcel(orders: ProcessedOrder[], filterType: FilterType): Blob {
  const data = orders.map((order) => ({
    'Order Number': order.orderNumber,
    'Order ID': order.orderId,
    'Tracking ID': order.trackingId,
    'Tracking Company': order.trackingCompany,
    'SKUs': order.skus,
    'City': order.city,
    'State': order.state,
    'Delivery Status': DELIVERY_STATUS_LABELS[order.deliveryStatus],
    'Shipment Status': order.shipmentStatus,
    'Days Since Fulfillment': order.daysSinceFulfillment ?? 'N/A',
    'Fulfilled At': order.fulfilledAt || 'N/A',
    'Snapmint': order.isSnapmint ? 'Yes' : 'No',
    'Tags': order.tags.join(', '),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  // Add metadata sheet
  const metadata = [
    { Field: 'Export Date', Value: new Date().toISOString() },
    { Field: 'Total Records', Value: orders.length },
  ];
  const metaSheet = XLSX.utils.json_to_sheet(metadata);
  XLSX.utils.book_append_sheet(workbook, metaSheet, 'Export Info');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadExcel(orders: ProcessedOrder[], filterType: FilterType): void {
  const blob = generateExcel(orders, filterType);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `shopify-orders-${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
