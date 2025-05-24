import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Plus, 
  Minus
} from 'lucide-react';
import { loadGoogleMapsScript } from '@/lib/google-maps';
import { ISTANBUL_CENTER } from '@/lib/istanbul-districts';

interface MapContainerProps {
  onBusinessSelect: (placeId: string) => void;
  searchParams: any;
  shouldSearch: boolean;
  onSearchComplete: () => void;
}

export function MapContainer({ 
  onBusinessSelect, 
  searchParams, 
  shouldSearch,
  onSearchComplete 
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Haritayı başlat
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMapsScript();
        
        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: ISTANBUL_CENTER,
            zoom: 12,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });
          
          setMap(mapInstance);
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Harita yükleme hatası:', err);
        setError('Harita yüklenemedi');
      }
    };

    initMap();
  }, []);

  // Arama tetiklendiğinde işletmeleri ara
  useEffect(() => {
    if (shouldSearch && isLoaded && searchParams && map) {
      setIsSearching(true);
      // Arama simülasyonu - gerçek Places API entegrasyonu için daha sonra geliştirilebilir
      setTimeout(() => {
        setIsSearching(false);
        onSearchComplete();
      }, 1000);
    }
  }, [shouldSearch, isLoaded, searchParams, map, onSearchComplete]);

  // Harita kontrol fonksiyonları
  const centerMap = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(pos);
          map.setZoom(15);
        },
        () => {
          console.error('Konum bilgisi alınamadı');
        }
      );
    }
  };

  const toggleMapType = () => {
    if (map) {
      const currentType = map.getMapTypeId();
      map.setMapTypeId(
        currentType === 'roadmap' ? 'satellite' : 'roadmap'
      );
    }
  };

  const zoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom()! + 1);
    }
  };

  const zoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom()! - 1);
    }
  };

  if (error) {
    return (
      <div className="flex-1 relative bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Harita Yüklenemedi</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <p className="text-xs text-gray-500">
            Google Maps API key'ini kontrol edin ve VITE_GOOGLE_MAPS_API_KEY environment variable'ını ayarlayın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {/* Harita Alanı */}
      <div ref={mapRef} className="w-full h-full bg-gray-200 relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">İstanbul Haritası Yükleniyor</h3>
              <p className="text-gray-600">Google Maps API başlatılıyor...</p>
            </div>
          </div>
        )}

        {/* Harita Kontrolleri */}
        <div className="absolute top-4 right-4 space-y-2 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="p-3 bg-white shadow-md hover:shadow-lg"
            onClick={centerMap}
            title="Konumumu Bul"
          >
            <Navigation className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="p-3 bg-white shadow-md hover:shadow-lg"
            onClick={toggleMapType}
            title="Harita Türü"
          >
            <Layers className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="p-3 bg-white shadow-md hover:shadow-lg"
            onClick={zoomIn}
            title="Yakınlaştır"
          >
            <Plus className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="p-3 bg-white shadow-md hover:shadow-lg"
            onClick={zoomOut}
            title="Uzaklaştır"
          >
            <Minus className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        {/* Yükleme Durumu */}
        {isSearching && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2 mx-auto"></div>
              <p className="text-gray-600">İşletmeler aranıyor...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}