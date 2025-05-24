import { useEffect, useRef, useState } from 'react';

interface MapContainerProps {
  onBusinessSelect: (placeId: string) => void;
  searchParams: any;
  shouldSearch: boolean;
  onSearchComplete: (results?: any[]) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export function MapContainer({ 
  onBusinessSelect,
  searchParams,
  shouldSearch,
  onSearchComplete
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&language=tr`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Google Maps yüklenemedi');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      try {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 41.0082, lng: 28.9784 }, // İstanbul merkezi
          zoom: 11,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP
        });

        setMap(mapInstance);
        setIsLoading(false);
      } catch (error) {
        console.error('Harita başlatma hatası:', error);
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, []);

  // Arama işlemi
  useEffect(() => {
    if (!map || !shouldSearch || !searchParams) return;

    const performSearch = () => {
      // Eski markerları temizle
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);

      const service = new window.google.maps.places.PlacesService(map);
      
      const request = {
        location: searchParams.location,
        radius: searchParams.radius || 5000,
        keyword: searchParams.keyword,
        type: searchParams.type
      };

      service.nearbySearch(request, (results: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const newMarkers: any[] = [];
          
          // Yeni markerları ekle
          results.slice(0, 20).forEach((place) => {
            if (place.geometry?.location) {
              const marker = new window.google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name,
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new window.google.maps.Size(24, 24)
                }
              });

              marker.addListener('click', () => {
                if (place.place_id) {
                  onBusinessSelect(place.place_id);
                }
              });

              newMarkers.push(marker);
            }
          });

          setMarkers(newMarkers);

          // Harita görünümünü ayarla
          if (results.length > 0 && results[0].geometry?.location) {
            map.setCenter(results[0].geometry.location);
            map.setZoom(13);
          }
        }
        onSearchComplete();
      });
    };

    performSearch();
  }, [map, shouldSearch, searchParams, onBusinessSelect, onSearchComplete]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full bg-gray-100"
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Harita yükleniyor...</p>
          </div>
        </div>
      )}
    </div>
  );
}