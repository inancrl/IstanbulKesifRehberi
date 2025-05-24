import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Heart, User, Menu, X, Star } from 'lucide-react';
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
              <span className="text-sm text-gray-600">İstanbul İşletme Rehberi</span>
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
        {/* Desktop Sidebar - Daha geniş */}
        <div className="hidden md:block w-96">
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

        {/* Harita ve Sonuçlar Alanı */}
        <div className="flex-1 flex flex-col">
          {/* Harita Alanı - Daha küçük */}
          <div className="h-64 bg-gray-100 relative">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <MapPin className="text-white text-lg" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">İstanbul Haritası</h4>
                <p className="text-sm text-gray-600">
                  {filters.district !== 'all' ? `${filters.district} İlçesi` : 'Tüm İlçeler'} - 
                  {filters.category !== 'all' ? ` ${filters.category}` : ' Tüm Kategoriler'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Sonuçlar Alanı - Genişletildi */}
          <div className="flex-1 bg-white border-t border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {filters.district !== 'all' ? `${filters.district} İlçesi` : 'İstanbul'} İşletmeleri
              </h3>
              
              {/* İşletme listesi - filtreler uygulandığında güncellenir */}
              <div className="space-y-3">
                {filters.district !== 'all' || filters.category !== 'all' || filters.query ? (
                  // Filtrelenmiş sonuçlar
                  [
                    {
                      name: `${filters.query || 'Lezzet'} Restoran`,
                      district: filters.district !== 'all' ? filters.district : 'Kadıköy',
                      category: filters.category !== 'all' ? filters.category : 'Restoran',
                      rating: 4.5,
                      reviews: 124,
                      isOpen: true
                    },
                    {
                      name: `${filters.query || 'Gurme'} Cafe`,
                      district: filters.district !== 'all' ? filters.district : 'Beşiktaş',
                      category: filters.category !== 'all' ? filters.category : 'Kafe',
                      rating: 4.2,
                      reviews: 89,
                      isOpen: true
                    },
                    {
                      name: `${filters.query || 'Modern'} Market`,
                      district: filters.district !== 'all' ? filters.district : 'Şişli',
                      category: filters.category !== 'all' ? filters.category : 'Market',
                      rating: 4.0,
                      reviews: 56,
                      isOpen: false
                    }
                  ].filter(business => {
                    // Rating filtresi
                    if (filters.minRating > 0 && business.rating < filters.minRating) {
                      return false;
                    }
                    // Açık/kapalı filtresi
                    if (filters.onlyOpen && !business.isOpen) {
                      return false;
                    }
                    return true;
                  }).map((business, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {business.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {business.district}, İstanbul
                          </p>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < Math.floor(business.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{business.rating} ({business.reviews} değerlendirme)</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {business.category}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${business.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {business.isOpen ? 'Açık' : 'Kapalı'}
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="ml-4"
                          onClick={() => handleBusinessSelect(`place_${index}`)}
                        >
                          Detaylar
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  // Varsayılan durum - filtre seçilmemiş
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg mb-2">İşletme aramaya başlayın</p>
                    <p className="text-sm">Sol taraftaki filtreleri kullanarak arama yapabilirsiniz</p>
                  </div>
                )}
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
