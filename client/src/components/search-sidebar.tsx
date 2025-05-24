import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RangeSlider } from '@/components/ui/range-slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, MapPin, Star, Clock, Phone } from 'lucide-react';
import { ISTANBUL_DISTRICTS, BUSINESS_CATEGORIES, getDistrictByName, getCategoryTypes } from '@/lib/istanbul-districts';
import { GooglePlaceResult, BusinessFilters } from '@/types/business';
import { getPhotoUrl } from '@/lib/google-maps';

interface SearchSidebarProps {
  filters: BusinessFilters;
  onFiltersChange: (filters: BusinessFilters) => void;
  onSearch: () => void;
  searchResults: GooglePlaceResult[];
  isSearching: boolean;
  onBusinessSelect: (placeId: string) => void;
}

export function SearchSidebar({
  filters,
  onFiltersChange,
  onSearch,
  searchResults,
  isSearching,
  onBusinessSelect
}: SearchSidebarProps) {
  const [currentDistance, setCurrentDistance] = useState(filters.maxDistance);

  // Filtre güncelleme fonksiyonu
  const updateFilter = (key: keyof BusinessFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  // Yıldız gösterimi için yardımcı fonksiyon
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="w-full md:w-96 bg-white shadow-lg overflow-y-auto h-full">
      <div className="p-6">
        {/* Başlık */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">İşletme Ara</h2>
          
          {/* Ana Arama Kutusu */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Ne arıyorsunuz? (örn: restoran, kuaför, market)"
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>

            {/* İlçe Seçimi */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">İlçe Seçin</Label>
              <Select value={filters.district} onValueChange={(value) => updateFilter('district', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm İlçeler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm İlçeler</SelectItem>
                  {ISTANBUL_DISTRICTS.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kategori Seçimi */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Kategori</Label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Kategoriler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {BUSINESS_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="mb-6 border-t border-gray-200 pt-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">Filtreler</h3>
          
          {/* Puan Filtresi */}
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Minimum Puan</Label>
            <RadioGroup 
              value={filters.minRating.toString()} 
              onValueChange={(value) => updateFilter('minRating', Number(value))}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="4" id="rating-4" />
                  <Label htmlFor="rating-4" className="flex items-center cursor-pointer">
                    <div className="flex mr-2">
                      {renderStars(4)}
                    </div>
                    <span className="text-sm text-gray-700">4.0 ve üzeri</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="3" id="rating-3" />
                  <Label htmlFor="rating-3" className="flex items-center cursor-pointer">
                    <div className="flex mr-2">
                      {renderStars(3)}
                    </div>
                    <span className="text-sm text-gray-700">3.0 ve üzeri</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="0" id="rating-all" />
                  <Label htmlFor="rating-all" className="text-sm text-gray-700 cursor-pointer">
                    Tüm işletmeler
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Mesafe Filtresi */}
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Maksimum Mesafe</Label>
            <div className="px-3">
              <RangeSlider
                min={1}
                max={25}
                value={currentDistance}
                onValueChange={(value) => {
                  setCurrentDistance(value);
                  updateFilter('maxDistance', value);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>{currentDistance} km</span>
                <span>25 km</span>
              </div>
            </div>
          </div>

          {/* Açık/Kapalı Filtresi */}
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="only-open"
                checked={filters.onlyOpen}
                onCheckedChange={(checked) => updateFilter('onlyOpen', checked)}
              />
              <Label htmlFor="only-open" className="text-sm font-medium text-gray-700">
                Sadece açık olanlar
              </Label>
            </div>
          </div>
        </div>

        {/* Arama Butonu */}
        <Button 
          onClick={onSearch}
          disabled={isSearching}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Aranıyor...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              İşletmeleri Ara
            </>
          )}
        </Button>

        {/* Sonuç Sayısı */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {searchResults.length} işletme bulundu
          </p>
        </div>
      </div>

      {/* Sonuç Listesi */}
      {searchResults.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="p-4">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Arama Sonuçları</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.slice(0, 10).map((business) => (
                <Card 
                  key={business.place_id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onBusinessSelect(business.place_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{business.name}</h4>
                      {business.rating && (
                        <div className="flex items-center space-x-1 text-sm">
                          <div className="flex">
                            {renderStars(business.rating)}
                          </div>
                          <span className="text-gray-600">{business.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{business.vicinity || business.formatted_address}</span>
                    </div>

                    {business.types && business.types.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {business.types[0].replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {searchResults.length > 10 && (
                <Button variant="outline" className="w-full text-sm">
                  Daha fazla sonuç göster ({searchResults.length - 10} adet daha)
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
