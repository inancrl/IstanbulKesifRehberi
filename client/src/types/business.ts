// Google Places API türleri ve işletme ile ilgili türler

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  types: string[];
  vicinity?: string;
}

export interface BusinessFilters {
  query: string;
  district: string;
  category: string;
  minRating: number;
  maxDistance: number;
  onlyOpen: boolean;
}

export interface BusinessSearchParams {
  location: {
    lat: number;
    lng: number;
  };
  radius: number;
  keyword?: string;
  type?: string;
  minprice?: number;
  maxprice?: number;
  opennow?: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface BusinessMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  rating?: number;
  category: string;
}
