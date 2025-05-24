// Google Maps API yardımcı fonksiyonları

import { GooglePlaceResult, BusinessSearchParams } from "@/types/business";

// Google Maps API key'i environment variable'dan al
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";

if (!GOOGLE_MAPS_API_KEY) {
  console.error("Google Maps API key bulunamadı. VITE_GOOGLE_MAPS_API_KEY environment variable'ını ayarlayın.");
}

// Google Maps API script'ini yükle
export function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=tr&region=TR`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps API yüklenemedi'));
    
    document.head.appendChild(script);
  });
}

// Places API ile işletme ara
export function searchBusinesses(params: BusinessSearchParams): Promise<GooglePlaceResult[]> {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Maps API henüz yüklenmedi'));
      return;
    }

    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(params.location.lat, params.location.lng),
      radius: params.radius,
    };

    // Keyword ekle
    if (params.keyword) {
      request.keyword = params.keyword;
    }

    // Type ekle
    if (params.type) {
      request.type = params.type as any;
    }

    // Fiyat seviyesi ekle
    if (params.minprice !== undefined) {
      request.minPriceLevel = params.minprice;
    }
    if (params.maxprice !== undefined) {
      request.maxPriceLevel = params.maxprice;
    }

    // Sadece açık olanlar
    if (params.opennow) {
      request.openNow = true;
    }

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results as GooglePlaceResult[]);
      } else {
        reject(new Error(`Places API hatası: ${status}`));
      }
    });
  });
}

// İşletme detaylarını al
export function getBusinessDetails(placeId: string): Promise<google.maps.places.PlaceResult> {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Maps API henüz yüklenmedi'));
      return;
    }

    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: placeId,
      fields: [
        'place_id',
        'name',
        'formatted_address',
        'geometry',
        'rating',
        'user_ratings_total',
        'price_level',
        'opening_hours',
        'photos',
        'international_phone_number',
        'website',
        'reviews',
        'types',
        'vicinity'
      ]
    };

    service.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        resolve(place);
      } else {
        reject(new Error(`Place Details API hatası: ${status}`));
      }
    });
  });
}

// Fotoğraf URL'si oluştur
export function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  if (!GOOGLE_MAPS_API_KEY) {
    return '';
  }
  
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
}

// Adres bileşenlerinden ilçeyi çıkar
export function extractDistrictFromAddress(addressComponents: google.maps.GeocoderAddressComponent[]): string {
  // Önce administrative_area_level_2 ara (ilçe)
  let district = addressComponents.find(component => 
    component.types.includes('administrative_area_level_2')
  );
  
  // Bulunamazsa administrative_area_level_3 ara
  if (!district) {
    district = addressComponents.find(component => 
      component.types.includes('administrative_area_level_3')
    );
  }
  
  // Bulunamazsa sublocality ara
  if (!district) {
    district = addressComponents.find(component => 
      component.types.includes('sublocality') || 
      component.types.includes('sublocality_level_1')
    );
  }
  
  return district ? district.long_name : 'İstanbul';
}

// Mesafe hesapla (Haversine formülü)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Global türler
declare global {
  interface Window {
    google: typeof google;
  }
}
