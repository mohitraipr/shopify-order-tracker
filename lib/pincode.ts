// Pincode to city cache - will be populated from API calls
const pincodeCache: Map<string, string> = new Map();

// Fetch city from India Post API
async function fetchCityFromAPI(pincode: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      // Get the district/city name from the first post office
      const postOffice = data[0].PostOffice[0];
      return postOffice.District || postOffice.Division || postOffice.Region || null;
    }

    return null;
  } catch {
    return null;
  }
}

// Batch lookup cities for multiple pincodes
export async function batchLookupCities(pincodes: string[]): Promise<Map<string, string>> {
  const uniquePincodes = [...new Set(pincodes.filter(p => p && p.length >= 6))];
  const results = new Map<string, string>();

  // Check cache first
  const uncachedPincodes: string[] = [];
  for (const pincode of uniquePincodes) {
    const clean = pincode.replace(/\D/g, '');
    if (pincodeCache.has(clean)) {
      results.set(clean, pincodeCache.get(clean)!);
    } else {
      uncachedPincodes.push(clean);
    }
  }

  // Fetch uncached pincodes (limit concurrent requests)
  const batchSize = 10;
  for (let i = 0; i < uncachedPincodes.length; i += batchSize) {
    const batch = uncachedPincodes.slice(i, i + batchSize);
    const promises = batch.map(async (pincode) => {
      const city = await fetchCityFromAPI(pincode);
      if (city) {
        pincodeCache.set(pincode, city);
        results.set(pincode, city);
      }
    });
    await Promise.all(promises);
  }

  return results;
}

// Synchronous function for initial processing (uses cache only)
export function getCityFromPincode(pincode: string | null | undefined, fallbackCity?: string): string {
  if (!pincode) {
    return fallbackCity || 'Unknown';
  }

  // Clean the pincode
  const cleanPincode = pincode.replace(/\D/g, '').trim();

  if (cleanPincode.length < 6) {
    return fallbackCity || 'Unknown';
  }

  // Check cache
  if (pincodeCache.has(cleanPincode)) {
    return pincodeCache.get(cleanPincode)!;
  }

  // If we have the city from Shopify, use it as fallback
  if (fallbackCity && fallbackCity !== 'Unknown' && fallbackCity.trim()) {
    return fallbackCity.trim();
  }

  return 'Unknown';
}

// Async version that fetches from API
export async function getCityFromPincodeAsync(pincode: string | null | undefined, fallbackCity?: string): Promise<string> {
  if (!pincode) {
    return fallbackCity || 'Unknown';
  }

  const cleanPincode = pincode.replace(/\D/g, '').trim();

  if (cleanPincode.length < 6) {
    return fallbackCity || 'Unknown';
  }

  // Check cache first
  if (pincodeCache.has(cleanPincode)) {
    return pincodeCache.get(cleanPincode)!;
  }

  // Fetch from API
  const city = await fetchCityFromAPI(cleanPincode);
  if (city) {
    pincodeCache.set(cleanPincode, city);
    return city;
  }

  // Fallback
  if (fallbackCity && fallbackCity !== 'Unknown' && fallbackCity.trim()) {
    return fallbackCity.trim();
  }

  return 'Unknown';
}
