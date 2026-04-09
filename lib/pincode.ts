// Indian pincode to city mapping
// First 2-3 digits of pincode indicate the region/city

const PINCODE_CITY_MAP: Record<string, string> = {
  // Delhi NCR
  '110': 'New Delhi',
  '201': 'Ghaziabad',
  '122': 'Gurugram',
  '121': 'Faridabad',
  '120': 'Ghaziabad',

  // Mumbai & Maharashtra
  '400': 'Mumbai',
  '401': 'Mumbai',
  '410': 'Navi Mumbai',
  '411': 'Pune',
  '412': 'Pune',
  '440': 'Nagpur',
  '422': 'Nashik',
  '416': 'Kolhapur',
  '431': 'Aurangabad',

  // Bangalore & Karnataka
  '560': 'Bangalore',
  '561': 'Bangalore',
  '562': 'Bangalore',
  '570': 'Mysore',
  '575': 'Mangalore',
  '580': 'Hubli',

  // Chennai & Tamil Nadu
  '600': 'Chennai',
  '601': 'Chennai',
  '602': 'Chennai',
  '603': 'Chennai',
  '620': 'Tiruchirappalli',
  '625': 'Madurai',
  '641': 'Coimbatore',
  '642': 'Coimbatore',

  // Kolkata & West Bengal
  '700': 'Kolkata',
  '711': 'Howrah',
  '712': 'Hooghly',
  '713': 'Asansol',

  // Hyderabad & Telangana
  '500': 'Hyderabad',
  '501': 'Hyderabad',
  '502': 'Hyderabad',
  '506': 'Warangal',

  // Ahmedabad & Gujarat
  '380': 'Ahmedabad',
  '382': 'Gandhinagar',
  '390': 'Vadodara',
  '395': 'Surat',
  '360': 'Rajkot',

  // Jaipur & Rajasthan
  '302': 'Jaipur',
  '303': 'Jaipur',
  '305': 'Ajmer',
  '311': 'Bhilwara',
  '313': 'Udaipur',
  '324': 'Kota',
  '342': 'Jodhpur',

  // Lucknow & Uttar Pradesh
  '226': 'Lucknow',
  '208': 'Kanpur',
  '211': 'Allahabad',
  '221': 'Varanasi',
  '250': 'Meerut',
  '282': 'Agra',

  // Punjab
  '140': 'Ludhiana',
  '141': 'Ludhiana',
  '143': 'Amritsar',
  '144': 'Jalandhar',
  '147': 'Patiala',
  '160': 'Chandigarh',

  // Kerala
  '670': 'Kannur',
  '673': 'Kozhikode',
  '680': 'Thrissur',
  '682': 'Kochi',
  '683': 'Kochi',
  '685': 'Idukki',
  '695': 'Thiruvananthapuram',

  // Madhya Pradesh
  '452': 'Indore',
  '462': 'Bhopal',
  '474': 'Gwalior',
  '482': 'Jabalpur',

  // Bihar
  '800': 'Patna',
  '801': 'Patna',
  '802': 'Patna',
  '842': 'Muzaffarpur',
  '846': 'Darbhanga',

  // Odisha
  '751': 'Bhubaneswar',
  '752': 'Puri',
  '753': 'Cuttack',
  '769': 'Rourkela',

  // Assam & Northeast
  '781': 'Guwahati',
  '782': 'Guwahati',
  '786': 'Dibrugarh',
  '795': 'Imphal',
  '796': 'Aizawl',
  '797': 'Kohima',

  // Jharkhand
  '831': 'Jamshedpur',
  '834': 'Ranchi',

  // Chhattisgarh
  '492': 'Raipur',
  '490': 'Bhilai',

  // Uttarakhand
  '248': 'Dehradun',
  '249': 'Dehradun',
  '263': 'Nainital',

  // Himachal Pradesh
  '171': 'Shimla',
  '175': 'Mandi',
  '176': 'Kangra',

  // Goa
  '403': 'Panaji',
  '404': 'North Goa',

  // Andhra Pradesh
  '520': 'Vijayawada',
  '530': 'Visakhapatnam',
  '517': 'Tirupati',
  '515': 'Anantapur',
};

// Pincode prefix to state mapping (for states not covered by city mapping)
const PINCODE_STATE_MAP: Record<string, string> = {
  '1': 'Delhi/NCR',
  '2': 'Uttar Pradesh',
  '3': 'Rajasthan/Gujarat',
  '4': 'Maharashtra/Goa',
  '5': 'Andhra/Telangana/Karnataka',
  '6': 'Tamil Nadu/Kerala',
  '7': 'West Bengal/Odisha/Northeast',
  '8': 'Bihar/Jharkhand',
};

export function getCityFromPincode(pincode: string | null | undefined, fallbackCity?: string): string {
  if (!pincode || pincode.length < 3) {
    return fallbackCity || 'Unknown';
  }

  // Clean the pincode
  const cleanPincode = pincode.replace(/\D/g, '').trim();

  if (cleanPincode.length < 3) {
    return fallbackCity || 'Unknown';
  }

  // Try 3-digit prefix first (more specific)
  const prefix3 = cleanPincode.substring(0, 3);
  if (PINCODE_CITY_MAP[prefix3]) {
    return PINCODE_CITY_MAP[prefix3];
  }

  // Try 2-digit prefix (less specific but still useful)
  const prefix2 = cleanPincode.substring(0, 2);
  if (PINCODE_CITY_MAP[prefix2]) {
    return PINCODE_CITY_MAP[prefix2];
  }

  // If we have the city from Shopify, use it as fallback
  if (fallbackCity && fallbackCity !== 'Unknown' && fallbackCity.trim()) {
    return fallbackCity.trim();
  }

  // Last resort: return based on first digit (state level)
  const firstDigit = cleanPincode[0];
  if (PINCODE_STATE_MAP[firstDigit]) {
    return `Other (${PINCODE_STATE_MAP[firstDigit]})`;
  }

  return 'Unknown';
}
