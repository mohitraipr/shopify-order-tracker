import { NextResponse } from 'next/server';
import { fetchAllOrders, processOrders } from '@/lib/shopify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stuckDays = parseInt(searchParams.get('stuckDays') || '3', 10);

    const orders = await fetchAllOrders();
    const processedOrders = processOrders(orders, stuckDays);

    return NextResponse.json({
      success: true,
      orders: processedOrders,
      total: processedOrders.length,
      stuckCount: processedOrders.filter((o) => o.isStuck && !o.isCancelled).length,
      cancelledCount: processedOrders.filter((o) => o.isCancelled && o.fulfillmentStatus === 'fulfilled').length,
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
