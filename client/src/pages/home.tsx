import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Heart, User, Menu, X } from 'lucide-react';
import { SearchSidebar } from '@/components/search-sidebar';
import { MapContainer } from '@/components/map-container';
import { BusinessModal } from '@/components/business-modal';
import { BusinessFilters, BusinessSearchParams } from '@/types/business';
import { ISTANBUL_CENTER, getDistrictByName, getCategoryTypes } from '@/lib/istanbul-districts';

export default function Home() {
  // Durum değişkenleri
  const [filters, setFilters] = useState<BusinessFilters>({
    query: '',
    district: 'all',
    category: 'all',
    minRating: 0,
    maxDistance: 10,
    onlyOpen: false
  });

  const [searchParams, setSearchParams] = useState<BusinessSearchParams | null>(null);
  const [shouldSearch, setShouldSearch] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

  // Kullanıcı konumunu al
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Konum alınamadı:', error);
          // İstanbul merkezini varsayılan olarak kullan
          setUserLocation(ISTANBUL_CENTER);
        }
      );
    } else {
      setUserLocation(ISTANBUL_CENTER);
    }
  }, []);

  // Arama fonksiyonu
  const handleSearch = () => {
    if (!userLocation) {
      console.error('Konum bilgisi henüz alınmadı');
      return;
    }

    // Arama parametrelerini hazırla
    let searchLocation = userLocation;
    let searchRadius = filters.maxDistance * 1000; // km to meters

    // İlçe seçilmişse o ilçenin merkezini kullan
    if (filters.district && filters.district !== 'all') {
      const district = getDistrictByName(filters.district);
      if (district) {
        searchLocation = district.center;
      }
    }

    // Kategori seçilmişse type'ları al
    let searchType = '';
    if (filters.category && filters.category !== 'all') {
      const types = getCategoryTypes(filters.category);
      if (types.length > 0) {
        searchType = types[0]; // İlk type'ı kullan
      }
    }

    const params: BusinessSearchParams = {
      location: searchLocation,
      radius: Math.min(searchRadius, 50000), // Maksimum 50km
      keyword: filters.query || undefined,
      type: searchType || undefined,
      opennow: filters.onlyOpen || undefined
    };

    // Rating filtresi için price level kullan (yaklaşık)
    if (filters.minRating >= 4) {
      params.minprice = 2;
    }

    setSearchParams(params);
    setShouldSearch(true);
    
    // Mobil menüyü kapat
    setIsMobileMenuOpen(false);
  };

  // Arama tamamlandığında
  const handleSearchComplete = () => {
    setShouldSearch(false);
  };

  // İşletme seçildiğinde
  const handleBusinessSelect = (placeId: string) => {
    setSelectedBusinessId(placeId);
    setIsModalOpen(true);
  };

  // Modal kapatma
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBusinessId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">İstanbul Keşif Rehberi</h1>
                <p className="text-sm text-gray-500">İşletme Bulucu</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                <Heart className="w-4 h-4 mr-2" />
                Favoriler
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                <User className="w-4 h-4 mr-2" />
                Hesabım
              </Button>
            </div>
            
            <Button
              variant="ghost"
              className="md:hidden text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="text-xl" /> : <Menu className="text-xl" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <SearchSidebar
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            searchResults={[]}
            isSearching={false}
            onBusinessSelect={handleBusinessSelect}
          />
        </div>

        {/* Mobil Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative bg-white w-80 h-full shadow-xl">
              <SearchSidebar
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={handleSearch}
                searchResults={[]}
                isSearching={false}
                onBusinessSelect={handleBusinessSelect}
              />
            </div>
          </div>
        )}

        {/* Harita Alanı */}
        <div className="flex-1 relative bg-gray-100">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">İstanbul Haritası</h3>
              <p className="text-gray-600 mb-4">
                Google Maps API ile entegrasyon hazır. Arama yapın ve haritada sonuçları görün.
              </p>
              <div className="text-sm text-gray-500">
                <p>✓ {filters.district !== 'all' ? `İlçe: ${filters.district}` : 'Tüm İlçeler'}</p>
                <p>✓ {filters.category !== 'all' ? `Kategori: ${filters.category}` : 'Tüm Kategoriler'}</p>
                <p>✓ Mesafe: {filters.maxDistance} km</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İşletme Detay Modal */}
      <BusinessModal
        placeId={selectedBusinessId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Mobil Arama Butonu */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
        <Button
          onClick={handleSearch}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
        >
          <MapPin className="w-5 h-5 mr-2" />
          İşletmeleri Ara
        </Button>
      </div>
    </div>
  );
}
