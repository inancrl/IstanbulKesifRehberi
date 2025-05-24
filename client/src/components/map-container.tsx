import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Plus, 
  Minus, 
  Star,
  Phone,
  Globe,
  Navigation as DirectionsIcon,
  Info
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
      // Basit arama simülasyonu - gerçek Places API entegrasyonu için daha sonra geliştirilebilir
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

  // Yıldız gösterimi
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  // Yol tarifi al
  const getDirections = () => {
    // Placeholder fonksiyon - gerçek işletme detayları için geliştirilecek
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${ISTANBUL_CENTER.lat},${ISTANBUL_CENTER.lng}`, '_blank');
  };

  // İşletmeyi ara
  const callBusiness = () => {
    // Placeholder fonksiyon - gerçek işletme detayları için geliştirilecek
    alert('İşletme telefon numarası: Gerçek veri için Places API entegrasyonu gerekli');
  };

  if (error) {
    return (
      <div className="flex-1 relative bg-gray-100 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <MapPin className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Harita Yüklenemedi</h3>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <p className="text-xs text-gray-500">
              Google Maps API key'ini kontrol edin ve VITE_GOOGLE_MAPS_API_KEY environment variable'ını ayarlayın.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {/* Harita Alanı */}
      <div id="map-container" ref={mapRef} className="w-full h-full bg-gray-200 relative">
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

      {/* Seçilen İşletme Bilgi Paneli */}
      {selectedBusiness && (
        <Card className="absolute bottom-4 left-4 max-w-sm z-20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {/* İşletme Fotoğrafı */}
              {selectedBusiness.photos && selectedBusiness.photos.length > 0 ? (
                <img
                  src={getPhotoUrl(selectedBusiness.photos[0].photo_reference, 100)}
                  alt={selectedBusiness.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1 truncate">
                  {selectedBusiness.name}
                </h4>
                
                {selectedBusiness.rating && (
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="flex">
                      {renderStars(selectedBusiness.rating)}
                    </div>
                    <span className="text-sm text-gray-600">{selectedBusiness.rating.toFixed(1)}</span>
                    {selectedBusiness.user_ratings_total && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          {selectedBusiness.user_ratings_total} değerlendirme
                        </span>
                      </>
                    )}
                  </div>
                )}
                
                <p className="text-sm text-gray-600 mb-2 truncate">
                  {selectedBusiness.formatted_address}
                </p>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={getDirections}
                  >
                    <DirectionsIcon className="h-3 w-3 mr-1" />
                    Yol Tarifi
                  </Button>
                  
                  {selectedBusiness.international_phone_number && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={callBusiness}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Ara
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onBusinessSelect(selectedBusiness.place_id!)}
                  >
                    <Info className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
