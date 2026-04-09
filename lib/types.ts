export interface ShopifyFulfillment {
  id: number;
  status: string;
  tracking_number: string | null;
  tracking_company: string | null;
  shipment_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifyLineItem {
  id: number;
  sku: string;
  name: string;
  quantity: number;
}

export interface ShopifyOrder {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  fulfillment_status: string | null;
  financial_status: string;
  cancelled_at: string | null;
  tags: string;
  line_items: ShopifyLineItem[];
  fulfillments: ShopifyFulfillment[];
}

export type DeliveryStatus = 'delivered' | 'rto' | 'dto' | 'in_transit' | 'cancelled' | 'pending';

export interface ProcessedOrder {
  orderId: string;
  orderNumber: string;
  trackingId: string;
  trackingCompany: string;
  skus: string;
  fulfillmentStatus: string;
  shipmentStatus: string;
  cancelledAt: string | null;
  fulfilledAt: string | null;
  daysSinceFulfillment: number | null;
  isStuck: boolean;
  isCancelled: boolean;
  tags: string[];
  isSnapmint: boolean;
  deliveryStatus: DeliveryStatus;
}

export type FilterType = 'all' | 'stuck' | 'cancelled';
export type TabType = 'snapmint' | 'other';
export type StatusTab = 'all' | 'delivered' | 'rto' | 'dto' | 'in_transit' | 'cancelled' | 'pending';
