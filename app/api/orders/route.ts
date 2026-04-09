import { NextResponse } from 'next/server';
import { fetchAllOrders, processOrders, getStatusCounts, getPaymentTypeCounts, getTopSkus, getTopCities, filterByPaymentType } from '@/lib/shopify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stuckDays = parseInt(searchParams.get('stuckDays') || '3', 10);

    const orders = await fetchAllOrders();
    const processedOrders = processOrders(orders, stuckDays);

    const snapmintOrders = processedOrders.filter((o) => o.isSnapmint);
    const otherOrders = processedOrders.filter((o) => !o.isSnapmint);
    const codOrders = filterByPaymentType(processedOrders, 'cod');
    const prepaidOrders = filterByPaymentType(processedOrders, 'prepaid');

    return NextResponse.json({
      success: true,
      orders: processedOrders,
      total: processedOrders.length,
      stuckCount: processedOrders.filter((o) => o.isStuck).length,
      // Status counts for all orders
      statusCounts: getStatusCounts(processedOrders),
      // Payment type counts
      paymentTypeCounts: getPaymentTypeCounts(processedOrders),
      // All SKUs
      allSkus: getTopSkus(processedOrders),
      snapmintAllSkus: getTopSkus(snapmintOrders),
      otherAllSkus: getTopSkus(otherOrders),
      codAllSkus: getTopSkus(codOrders),
      prepaidAllSkus: getTopSkus(prepaidOrders),
      // All Cities
      allCities: getTopCities(processedOrders),
      snapmintAllCities: getTopCities(snapmintOrders),
      otherAllCities: getTopCities(otherOrders),
      codAllCities: getTopCities(codOrders),
      prepaidAllCities: getTopCities(prepaidOrders),
      // Snapmint specific
      snapmintCount: snapmintOrders.length,
      snapmintStatusCounts: getStatusCounts(snapmintOrders),
      // Other orders specific
      otherCount: otherOrders.length,
      otherStatusCounts: getStatusCounts(otherOrders),
      // COD specific
      codCount: codOrders.length,
      codStatusCounts: getStatusCounts(codOrders),
      // Prepaid specific
      prepaidCount: prepaidOrders.length,
      prepaidStatusCounts: getStatusCounts(prepaidOrders),
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
