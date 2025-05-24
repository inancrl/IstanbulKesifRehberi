// İstanbul ilçeleri ve koordinatları

export interface District {
  id: string;
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export const ISTANBUL_DISTRICTS: District[] = [
  {
    id: "adalar",
    name: "Adalar",
    center: { lat: 40.8786, lng: 29.1133 }
  },
  {
    id: "arnavutkoy",
    name: "Arnavutköy",
    center: { lat: 41.1886, lng: 28.7325 }
  },
  {
    id: "atasehir",
    name: "Ataşehir",
    center: { lat: 40.9827, lng: 29.1264 }
  },
  {
    id: "avcilar",
    name: "Avcılar",
    center: { lat: 41.0231, lng: 28.7231 }
  },
  {
    id: "bagcilar",
    name: "Bağcılar",
    center: { lat: 41.0394, lng: 28.8564 }
  },
  {
    id: "bahcelievler",
    name: "Bahçelievler",
    center: { lat: 41.0031, lng: 28.8567 }
  },
  {
    id: "bakirkoy",
    name: "Bakırköy",
    center: { lat: 40.9781, lng: 28.8739 }
  },
  {
    id: "basaksehir",
    name: "Başakşehir",
    center: { lat: 41.1086, lng: 28.8089 }
  },
  {
    id: "bayrampasa",
    name: "Bayrampaşa",
    center: { lat: 41.0431, lng: 28.9017 }
  },
  {
    id: "besiktas",
    name: "Beşiktaş",
    center: { lat: 41.0428, lng: 29.0094 }
  },
  {
    id: "beykoz",
    name: "Beykoz",
    center: { lat: 41.1186, lng: 29.0828 }
  },
  {
    id: "beylikduzu",
    name: "Beylikdüzü",
    center: { lat: 41.0022, lng: 28.6444 }
  },
  {
    id: "beyoglu",
    name: "Beyoğlu",
    center: { lat: 41.0369, lng: 28.9756 }
  },
  {
    id: "buyukcekmece",
    name: "Büyükçekmece",
    center: { lat: 41.0186, lng: 28.5839 }
  },
  {
    id: "catalca",
    name: "Çatalca",
    center: { lat: 41.1406, lng: 28.4639 }
  },
  {
    id: "cekmece",
    name: "Çekmeköy",
    center: { lat: 41.0322, lng: 29.2056 }
  },
  {
    id: "esenler",
    name: "Esenler",
    center: { lat: 41.0414, lng: 28.8811 }
  },
  {
    id: "esenyurt",
    name: "Esenyurt",
    center: { lat: 41.0297, lng: 28.6744 }
  },
  {
    id: "eyupsultan",
    name: "Eyüpsultan",
    center: { lat: 41.0547, lng: 28.9344 }
  },
  {
    id: "fatih",
    name: "Fatih",
    center: { lat: 41.0186, lng: 28.9497 }
  },
  {
    id: "gaziosmanpasa",
    name: "Gaziosmanpaşa",
    center: { lat: 41.0661, lng: 28.9119 }
  },
  {
    id: "gungoren",
    name: "Güngören",
    center: { lat: 41.0172, lng: 28.8758 }
  },
  {
    id: "kadikoy",
    name: "Kadıköy",
    center: { lat: 40.9833, lng: 29.0333 }
  },
  {
    id: "kagithane",
    name: "Kağıthane",
    center: { lat: 41.0819, lng: 28.9769 }
  },
  {
    id: "kartal",
    name: "Kartal",
    center: { lat: 40.9058, lng: 29.1897 }
  },
  {
    id: "kucukcekmece",
    name: "Küçükçekmece",
    center: { lat: 41.0131, lng: 28.7764 }
  },
  {
    id: "maltepe",
    name: "Maltepe",
    center: { lat: 40.9356, lng: 29.1497 }
  },
  {
    id: "pendik",
    name: "Pendik",
    center: { lat: 40.8781, lng: 29.2331 }
  },
  {
    id: "sancaktepe",
    name: "Sancaktepe",
    center: { lat: 41.0103, lng: 29.2328 }
  },
  {
    id: "sariyer",
    name: "Sarıyer",
    center: { lat: 41.1069, lng: 29.0531 }
  },
  {
    id: "silivri",
    name: "Silivri",
    center: { lat: 41.0719, lng: 28.2486 }
  },
  {
    id: "sisli",
    name: "Şişli",
    center: { lat: 41.0608, lng: 28.9828 }
  },
  {
    id: "sultanbeyli",
    name: "Sultanbeyli",
    center: { lat: 40.9678, lng: 29.2714 }
  },
  {
    id: "sultangazi",
    name: "Sultangazi",
    center: { lat: 41.1036, lng: 28.8697 }
  },
  {
    id: "tuzla",
    name: "Tuzla",
    center: { lat: 40.8347, lng: 29.3019 }
  },
  {
    id: "umraniye",
    name: "Ümraniye",
    center: { lat: 41.0194, lng: 29.1244 }
  },
  {
    id: "uskudar",
    name: "Üsküdar",
    center: { lat: 41.0256, lng: 29.0244 }
  },
  {
    id: "zeytinburnu",
    name: "Zeytinburnu",
    center: { lat: 41.0006, lng: 28.9131 }
  }
];

export const ISTANBUL_CENTER = {
  lat: 41.0082,
  lng: 28.9784
};

export const BUSINESS_CATEGORIES = [
  { id: "restaurant", name: "Restoran & Kafe", types: ["restaurant", "food", "meal_takeaway", "cafe"] },
  { id: "shopping", name: "Alışveriş", types: ["shopping_mall", "store", "clothing_store", "electronics_store"] },
  { id: "health", name: "Sağlık & Güzellik", types: ["hospital", "pharmacy", "beauty_salon", "hair_care", "spa"] },
  { id: "service", name: "Hizmetler", types: ["bank", "atm", "car_repair", "gas_station", "laundry"] },
  { id: "entertainment", name: "Eğlence & Kültür", types: ["movie_theater", "museum", "park", "tourist_attraction", "night_club"] },
  { id: "education", name: "Eğitim", types: ["school", "university", "library"] },
  { id: "accommodation", name: "Konaklama", types: ["lodging", "hotel"] },
  { id: "transport", name: "Ulaşım", types: ["bus_station", "subway_station", "taxi_stand", "airport"] }
];

export function getDistrictByName(name: string): District | undefined {
  return ISTANBUL_DISTRICTS.find(district => 
    district.name.toLowerCase() === name.toLowerCase() ||
    district.id === name.toLowerCase()
  );
}

export function getCategoryTypes(categoryId: string): string[] {
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.types : [];
}
