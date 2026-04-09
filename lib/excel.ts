import * as XLSX from 'xlsx';
import { ProcessedOrder, FilterType } from './types';

export function generateExcel(orders: ProcessedOrder[], filterType: FilterType): Blob {
  const data = orders.map((order) => ({
    'Order Number': order.orderNumber,
    'Order ID': order.orderId,
    'Tracking ID': order.trackingId,
    'Tracking Company': order.trackingCompany,
    'SKUs': order.skus,
    'Fulfillment Status': order.fulfillmentStatus,
    'Shipment Status': order.shipmentStatus,
    'Days Since Fulfillment': order.daysSinceFulfillment ?? 'N/A',
    'Cancelled': order.isCancelled ? 'Yes' : 'No',
    'Cancelled At': order.cancelledAt || 'N/A',
    'Fulfilled At': order.fulfilledAt || 'N/A',
    'Stuck Order': order.isStuck ? 'Yes' : 'No',
    'Snapmint': order.isSnapmint ? 'Yes' : 'No',
    'Tags': order.tags.join(', '),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  const sheetName = filterType === 'all' ? 'All Orders' :
                    filterType === 'stuck' ? 'Stuck Orders' : 'Cancelled Orders';

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Add metadata sheet
  const metadata = [
    { Field: 'Export Date', Value: new Date().toISOString() },
    { Field: 'Filter Applied', Value: filterType },
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
  link.download = `shopify-orders-${filterType}-${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
