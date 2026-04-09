import { NextResponse } from 'next/server';
import { fetchAllOrders, processOrders, getStatusCounts, getTopSkus } from '@/lib/shopify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stuckDays = parseInt(searchParams.get('stuckDays') || '3', 10);

    const orders = await fetchAllOrders();
    const processedOrders = processOrders(orders, stuckDays);

    const snapmintOrders = processedOrders.filter((o) => o.isSnapmint);
    const otherOrders = processedOrders.filter((o) => !o.isSnapmint);

    return NextResponse.json({
      success: true,
      orders: processedOrders,
      total: processedOrders.length,
      stuckCount: processedOrders.filter((o) => o.isStuck).length,
      // Status counts for all orders
      statusCounts: getStatusCounts(processedOrders),
      // Top SKUs
      topSkus: getTopSkus(processedOrders, 10),
      snapmintTopSkus: getTopSkus(snapmintOrders, 10),
      otherTopSkus: getTopSkus(otherOrders, 10),
      // Snapmint specific
      snapmintCount: snapmintOrders.length,
      snapmintStatusCounts: getStatusCounts(snapmintOrders),
      // Other orders specific
      otherCount: otherOrders.length,
      otherStatusCounts: getStatusCounts(otherOrders),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
}
