import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  Navigation as DirectionsIcon,
  Heart,
  User,
  ExternalLink
} from 'lucide-react';
import { getBusinessDetails, getPhotoUrl } from '@/lib/google-maps';

interface BusinessModalProps {
  placeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessModal({ placeId, isOpen, onClose }: BusinessModalProps) {
  const [business, setBusiness] = useState<google.maps.places.PlaceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // İşletme detaylarını yükle
  useEffect(() => {
    if (placeId && isOpen) {
      setIsLoading(true);
      setError(null);
      
      getBusinessDetails(placeId)
        .then((details) => {
          setBusiness(details);
        })
        .catch((err) => {
          console.error('İşletme detay hatası:', err);
          setError('İşletme detayları yüklenemedi');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [placeId, isOpen]);

  // Modal kapandığında verileri temizle
  useEffect(() => {
    if (!isOpen) {
      setBusiness(null);
      setError(null);
    }
  }, [isOpen]);

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

  // Çalışma saatleri formatla
  const formatOpeningHours = (periods: google.maps.places.PlaceOpeningHoursPeriod[]) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const hours: { [key: number]: string } = {};

    periods.forEach((period) => {
      const day = period.open.day;
      const openTime = period.open.time;
      const closeTime = period.close?.time || '2400';
      
      const formatTime = (time: string) => {
        const hour = time.slice(0, 2);
        const minute = time.slice(2, 4);
        return `${hour}:${minute}`;
      };

      hours[day] = `${formatTime(openTime)} - ${formatTime(closeTime)}`;
    });

    return days.map((day, index) => ({
      day,
      hours: hours[index] || 'Kapalı'
    }));
  };

  // Yol tarifi al
  const getDirections = () => {
    if (business && business.geometry) {
      const destination = `${business.geometry.location!.lat()},${business.geometry.location!.lng()}`;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    }
  };

  // İşletmeyi ara
  const callBusiness = () => {
    if (business && business.international_phone_number) {
      window.open(`tel:${business.international_phone_number}`, '_self');
    }
  };

  // Web sitesini aç
  const openWebsite = () => {
    if (business && business.website) {
      window.open(business.website, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span>İşletme detayları yükleniyor...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !business) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error || 'İşletme bilgileri bulunamadı'}</p>
            <Button onClick={onClose}>Kapat</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {business.name}
          </DialogTitle>
          {business.rating && (
            <div className="flex items-center space-x-2">
              <div className="flex">
                {renderStars(business.rating)}
              </div>
              <span className="font-semibold text-gray-900">{business.rating.toFixed(1)}</span>
              {business.user_ratings_total && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{business.user_ratings_total} değerlendirme</span>
                </>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* İşletme Fotoğrafları */}
          {business.photos && business.photos.length > 0 && (
            <div>
              <img
                src={getPhotoUrl(business.photos[0].photo_reference, 800)}
                alt={business.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* İşletme Bilgileri */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">İletişim Bilgileri</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{business.formatted_address}</span>
                </div>
                
                {business.international_phone_number && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{business.international_phone_number}</span>
                  </div>
                )}
                
                {business.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <button
                      onClick={openWebsite}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      Web Sitesi
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {business.opening_hours && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Çalışma Saatleri</h3>
                <div className="space-y-1 text-sm">
                  {business.opening_hours.weekday_text?.map((dayText, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{dayText}</span>
                    </div>
                  ))}
                  
                  {business.opening_hours.open_now !== undefined && (
                    <Badge
                      variant={business.opening_hours.open_now ? "default" : "secondary"}
                      className={business.opening_hours.open_now ? "bg-green-600" : "bg-red-600"}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {business.opening_hours.open_now ? "Şu an açık" : "Şu an kapalı"}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Kategoriler ve Özellikler */}
          {business.types && business.types.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Kategoriler</h3>
              <div className="flex flex-wrap gap-2">
                {business.types.slice(0, 8).map((type, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Son Değerlendirmeler */}
          {business.reviews && business.reviews.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Son Değerlendirmeler</h3>
              <div className="space-y-4">
                {business.reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.author_name}</p>
                        <div className="flex items-center space-x-1">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {review.relative_time_description}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Aksiyon Butonları */}
          <div className="flex space-x-3">
            <Button
              onClick={getDirections}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <DirectionsIcon className="h-4 w-4 mr-2" />
              Yol Tarifi Al
            </Button>
            
            {business.international_phone_number && (
              <Button
                onClick={callBusiness}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Ara
              </Button>
            )}
            
            <Button
              variant="outline"
              className="px-4"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
