// Google Maps kullanımı için custom hook

import { useEffect, useState, useRef } from 'react';
import { loadGoogleMapsScript, searchBusinesses, getBusinessDetails } from '@/lib/google-maps';
import { GooglePlaceResult, BusinessSearchParams } from '@/types/business';
import { ISTANBUL_CENTER } from '@/lib/istanbul-districts';

interface UseGoogleMapsReturn {
  map: google.maps.Map | null;
  isLoaded: boolean;
  error: string | null;
  searchResults: GooglePlaceResult[];
  isSearching: boolean;
  searchBusinesses: (params: BusinessSearchParams) => Promise<void>;
  selectedBusiness: google.maps.places.PlaceResult | null;
  getBusinessDetails: (placeId: string) => Promise<void>;
  clearResults: () => void;
}

export function useGoogleMaps(mapElementId: string): UseGoogleMapsReturn {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<GooglePlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<google.maps.places.PlaceResult | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Google Maps API'yi yükle ve haritayı başlat
  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript();
        
        if (!mounted) return;

        const mapElement = document.getElementById(mapElementId);
        if (!mapElement) {
          throw new Error(`Harita elementi bulunamadı: ${mapElementId}`);
        }

        const mapInstance = new google.maps.Map(mapElement, {
          center: ISTANBUL_CENTER,
          zoom: 12,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true
        });

        setMap(mapInstance);
        setIsLoaded(true);
      } catch (err) {
        console.error('Google Maps başlatma hatası:', err);
        setError(err instanceof Error ? err.message : 'Harita yüklenemedi');
      }
    };

    initializeMap();

    return () => {
      mounted = false;
    };
  }, [mapElementId]);

  // Marker'ları temizle
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  // İşletme ara
  const handleSearchBusinesses = async (params: BusinessSearchParams) => {
    if (!map) {
      setError('Harita henüz yüklenmedi');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const results = await searchBusinesses(params);
      
      // En az 50 sonuç alana kadar farklı radiuslar dene
      let allResults = results;
      let currentRadius = params.radius;
      
      while (allResults.length < 50 && currentRadius < 25000) {
        currentRadius += 5000; // 5km artır
        const moreResults = await searchBusinesses({
          ...params,
          radius: currentRadius
        });
        
        // Duplikatları filtrele
        const existingPlaceIds = new Set(allResults.map(r => r.place_id));
        const newResults = moreResults.filter(r => !existingPlaceIds.has(r.place_id));
        allResults = [...allResults, ...newResults];
      }

      setSearchResults(allResults);

      // Marker'ları temizle ve yenilerini ekle
      clearMarkers();
      
      allResults.forEach((business, index) => {
        const marker = new google.maps.Marker({
          position: {
            lat: business.geometry.location.lat,
            lng: business.geometry.location.lng
          },
          map: map,
          title: business.name,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(32, 32)
          }
        });

        // Marker tıklama eventi
        marker.addListener('click', () => {
          handleGetBusinessDetails(business.place_id);
        });

        markersRef.current.push(marker);
      });

      // Haritayı sonuçlara odakla
      if (allResults.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        allResults.forEach(business => {
          bounds.extend({
            lat: business.geometry.location.lat,
            lng: business.geometry.location.lng
          });
        });
        map.fitBounds(bounds);
      }

    } catch (err) {
      console.error('İşletme arama hatası:', err);
      setError(err instanceof Error ? err.message : 'Arama başarısız oldu');
    } finally {
      setIsSearching(false);
    }
  };

  // İşletme detaylarını al
  const handleGetBusinessDetails = async (placeId: string) => {
    try {
      const details = await getBusinessDetails(placeId);
      setSelectedBusiness(details);
    } catch (err) {
      console.error('İşletme detay hatası:', err);
      setError(err instanceof Error ? err.message : 'Detaylar alınamadı');
    }
  };

  // Sonuçları temizle
  const clearResults = () => {
    setSearchResults([]);
    setSelectedBusiness(null);
    clearMarkers();
    if (map) {
      map.setCenter(ISTANBUL_CENTER);
      map.setZoom(12);
    }
  };

  return {
    map,
    isLoaded,
    error,
    searchResults,
    isSearching,
    searchBusinesses: handleSearchBusinesses,
    selectedBusiness,
    getBusinessDetails: handleGetBusinessDetails,
    clearResults
  };
}
