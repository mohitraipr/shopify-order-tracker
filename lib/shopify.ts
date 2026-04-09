import { ShopifyOrder, ProcessedOrder } from './types';

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

export async function fetchAllOrders(): Promise<ShopifyOrder[]> {
  if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
    throw new Error('Missing Shopify credentials');
  }

  const allOrders: ShopifyOrder[] = [];
  let pageInfo: string | null = null;
  const limit = 250;

  do {
    let url: string;
    if (pageInfo) {
      url = `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/orders.json?limit=${limit}&page_info=${pageInfo}`;
    } else {
      url = `https://${SHOPIFY_STORE_URL}/admin/api/2024-01/orders.json?limit=${limit}&status=any`;
    }

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    allOrders.push(...data.orders);

    // Check for next page
    const linkHeader = response.headers.get('Link');
    pageInfo = null;
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<[^>]*page_info=([^>&>]+)[^>]*>;\s*rel="next"/);
      if (nextMatch) {
        pageInfo = nextMatch[1];
      }
    }
  } while (pageInfo);

  return allOrders;
}

export function processOrders(orders: ShopifyOrder[], stuckDaysThreshold: number): ProcessedOrder[] {
  const now = new Date();

  return orders.map((order) => {
    const latestFulfillment = order.fulfillments[order.fulfillments.length - 1];
    const fulfilledAt = latestFulfillment?.created_at || null;
    const shipmentStatus = latestFulfillment?.shipment_status || 'unknown';

    let daysSinceFulfillment: number | null = null;
    if (fulfilledAt) {
      const fulfillmentDate = new Date(fulfilledAt);
      daysSinceFulfillment = Math.floor(
        (now.getTime() - fulfillmentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    const skus = order.line_items.map((item) => item.sku).filter(Boolean).join(', ');
    const trackingNumbers = order.fulfillments
      .map((f) => f.tracking_number)
      .filter(Boolean)
      .join(', ');
    const trackingCompanies = order.fulfillments
      .map((f) => f.tracking_company)
      .filter(Boolean)
      .join(', ');

    // Determine if order is "stuck" - fulfilled but not in transit after threshold days
    const isFulfilled = order.fulfillment_status === 'fulfilled';
    const notInTransit = !['in_transit', 'out_for_delivery', 'delivered'].includes(shipmentStatus);
    const pastThreshold = daysSinceFulfillment !== null && daysSinceFulfillment >= stuckDaysThreshold;
    const isStuck = isFulfilled && notInTransit && pastThreshold;

    // Cancelled orders
    const isCancelled = order.cancelled_at !== null;

    // Parse tags
    const tags = order.tags ? order.tags.split(',').map((t) => t.trim().toLowerCase()) : [];
    const isSnapmint = tags.some((t) => t.includes('snapmint'));

    return {
      orderId: String(order.id),
      orderNumber: order.name,
      trackingId: trackingNumbers || 'N/A',
      trackingCompany: trackingCompanies || 'N/A',
      skus: skus || 'N/A',
      fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
      shipmentStatus: shipmentStatus,
      cancelledAt: order.cancelled_at,
      fulfilledAt,
      daysSinceFulfillment,
      isStuck,
      isCancelled,
      tags,
      isSnapmint,
    };
  });
}

export function filterOrders(
  orders: ProcessedOrder[],
  filterType: 'all' | 'stuck' | 'cancelled'
): ProcessedOrder[] {
  switch (filterType) {
    case 'stuck':
      return orders.filter((o) => o.isStuck && !o.isCancelled);
    case 'cancelled':
      return orders.filter((o) => o.isCancelled && o.fulfillmentStatus === 'fulfilled');
    default:
      return orders;
  }
}

export function filterByTab(
  orders: ProcessedOrder[],
  tab: 'snapmint' | 'other'
): ProcessedOrder[] {
  if (tab === 'snapmint') {
    return orders.filter((o) => o.isSnapmint);
  }
  return orders.filter((o) => !o.isSnapmint);
}

export function searchOrders(
  orders: ProcessedOrder[],
  query: string
): ProcessedOrder[] {
  if (!query.trim()) return orders;
  const q = query.toLowerCase();
  return orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.orderId.includes(q) ||
      o.trackingId.toLowerCase().includes(q) ||
      o.skus.toLowerCase().includes(q)
  );
}
