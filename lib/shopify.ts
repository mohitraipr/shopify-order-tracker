import { ShopifyOrder, ProcessedOrder, DeliveryStatus, StatusTab, SkuStats, CityStats } from './types';

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

    // Parse tags
    const tags = order.tags ? order.tags.split(',').map((t) => t.trim().toLowerCase()) : [];
    const isSnapmint = tags.some((t) => t.includes('snapmint'));

    // Cancelled orders
    const isCancelled = order.cancelled_at !== null ||
                        tags.some((t) => t === 'cancelled' || t === 'coc-cancelled');

    // Determine delivery status
    const hasReturnTags = tags.some((t) =>
      t === 'returned' || t === 'rto' || t.includes('rto ')
    );
    const hasDtoTags = tags.some((t) =>
      t.startsWith('return-') || t === 'return-shipped' || t === 'return-refunded' ||
      t === 'return-pickedup' || t === 'return-approved' || t === 'return-pickup-scheduled'
    );
    const hasDeliveredTag = tags.includes('delivered');

    let deliveryStatus: DeliveryStatus;

    if (isCancelled) {
      deliveryStatus = 'cancelled';
    } else if (hasDtoTags) {
      // Customer-initiated returns (delivered then returned)
      deliveryStatus = 'dto';
    } else if (shipmentStatus === 'failure' || hasReturnTags) {
      // Failed delivery / RTO
      deliveryStatus = 'rto';
    } else if (shipmentStatus === 'delivered' || hasDeliveredTag) {
      deliveryStatus = 'delivered';
    } else if (shipmentStatus === 'in_transit' || shipmentStatus === 'out_for_delivery') {
      deliveryStatus = 'in_transit';
    } else {
      // confirmed, unknown, or unfulfilled
      deliveryStatus = 'pending';
    }

    // Determine if order is "stuck" - pending for too long (not RTO, not delivered, not in transit)
    const isFulfilled = order.fulfillment_status === 'fulfilled';
    const pastThreshold = daysSinceFulfillment !== null && daysSinceFulfillment >= stuckDaysThreshold;
    const isStuck = isFulfilled && deliveryStatus === 'pending' && pastThreshold;

    // Extract city and state
    const city = order.shipping_address?.city?.trim() || 'Unknown';
    const state = order.shipping_address?.province?.trim() || 'Unknown';

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
      deliveryStatus,
      city,
      state,
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

export function filterByStatus(
  orders: ProcessedOrder[],
  statusTab: StatusTab
): ProcessedOrder[] {
  if (statusTab === 'all') return orders;
  return orders.filter((o) => o.deliveryStatus === statusTab);
}

export function getStatusCounts(orders: ProcessedOrder[]) {
  return {
    all: orders.length,
    delivered: orders.filter((o) => o.deliveryStatus === 'delivered').length,
    rto: orders.filter((o) => o.deliveryStatus === 'rto').length,
    dto: orders.filter((o) => o.deliveryStatus === 'dto').length,
    in_transit: orders.filter((o) => o.deliveryStatus === 'in_transit').length,
    cancelled: orders.filter((o) => o.deliveryStatus === 'cancelled').length,
    pending: orders.filter((o) => o.deliveryStatus === 'pending').length,
  };
}

export function getTopSkus(orders: ProcessedOrder[], limit: number = 10): SkuStats[] {
  const skuMap = new Map<string, SkuStats>();

  for (const order of orders) {
    // Split SKUs if multiple in one order
    const skus = order.skus.split(',').map((s) => s.trim()).filter((s) => s && s !== 'N/A');

    for (const sku of skus) {
      if (!skuMap.has(sku)) {
        skuMap.set(sku, {
          sku,
          total: 0,
          delivered: 0,
          rto: 0,
          dto: 0,
          in_transit: 0,
          cancelled: 0,
          pending: 0,
        });
      }

      const stats = skuMap.get(sku)!;
      stats.total++;
      stats[order.deliveryStatus]++;
    }
  }

  // Sort by total and get top N
  return Array.from(skuMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function getTopCities(orders: ProcessedOrder[], limit: number = 15): CityStats[] {
  const cityMap = new Map<string, CityStats>();

  for (const order of orders) {
    const cityKey = `${order.city}|${order.state}`;

    if (!cityMap.has(cityKey)) {
      cityMap.set(cityKey, {
        city: order.city,
        state: order.state,
        total: 0,
        delivered: 0,
        rto: 0,
        dto: 0,
        in_transit: 0,
        cancelled: 0,
        pending: 0,
      });
    }

    const stats = cityMap.get(cityKey)!;
    stats.total++;
    stats[order.deliveryStatus]++;
  }

  // Sort by total and get top N
  return Array.from(cityMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}
