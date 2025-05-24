import { 
  businesses, 
  favorites,
  searchHistory,
  type Business, 
  type InsertBusiness,
  type Favorite,
  type InsertFavorite,
  type SearchHistory,
  type InsertSearchHistory,
  type SearchFilters
} from "@shared/schema";

// Depolama arayüzü
export interface IStorage {
  // İşletme CRUD işlemleri
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessByPlaceId(placeId: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, updates: Partial<InsertBusiness>): Promise<Business | undefined>;
  searchBusinesses(filters: SearchFilters): Promise<Business[]>;
  
  // Favori işlemleri
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(businessId: number, userId: string): Promise<boolean>;
  getUserFavorites(userId: string): Promise<Business[]>;
  
  // Arama geçmişi
  addSearchHistory(search: InsertSearchHistory): Promise<SearchHistory>;
  getUserSearchHistory(userId: string): Promise<SearchHistory[]>;
}

// Bellek tabanlı depolama implementasyonu
export class MemStorage implements IStorage {
  private businesses: Map<number, Business>;
  private businessesByPlaceId: Map<string, Business>;
  private favorites: Map<number, Favorite>;
  private searchHistory: Map<number, SearchHistory>;
  private currentBusinessId: number;
  private currentFavoriteId: number;
  private currentSearchId: number;

  constructor() {
    this.businesses = new Map();
    this.businessesByPlaceId = new Map();
    this.favorites = new Map();
    this.searchHistory = new Map();
    this.currentBusinessId = 1;
    this.currentFavoriteId = 1;
    this.currentSearchId = 1;
  }

  // İşletme CRUD işlemleri
  async getBusiness(id: number): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async getBusinessByPlaceId(placeId: string): Promise<Business | undefined> {
    return this.businessesByPlaceId.get(placeId);
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = this.currentBusinessId++;
    const business: Business = { 
      ...insertBusiness, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.businesses.set(id, business);
    this.businessesByPlaceId.set(business.placeId, business);
    
    return business;
  }

  async updateBusiness(id: number, updates: Partial<InsertBusiness>): Promise<Business | undefined> {
    const existing = this.businesses.get(id);
    if (!existing) return undefined;

    const updated: Business = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    this.businesses.set(id, updated);
    this.businessesByPlaceId.set(updated.placeId, updated);
    
    return updated;
  }

  async searchBusinesses(filters: SearchFilters): Promise<Business[]> {
    let results = Array.from(this.businesses.values());

    // Query filtresi
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(business => 
        business.name.toLowerCase().includes(query) ||
        business.category.toLowerCase().includes(query) ||
        business.address.toLowerCase().includes(query)
      );
    }

    // İlçe filtresi
    if (filters.district) {
      results = results.filter(business => 
        business.district.toLowerCase() === filters.district?.toLowerCase()
      );
    }

    // Kategori filtresi
    if (filters.category) {
      results = results.filter(business => 
        business.category.toLowerCase().includes(filters.category?.toLowerCase() || '')
      );
    }

    // Minimum rating filtresi
    if (filters.minRating && filters.minRating > 0) {
      results = results.filter(business => 
        business.rating && business.rating >= filters.minRating!
      );
    }

    // Sadece açık olanlar filtresi
    if (filters.onlyOpen) {
      results = results.filter(business => business.isOpen === true);
    }

    // Mesafe filtresi (eğer konum verilmişse)
    if (filters.latitude && filters.longitude && filters.maxDistance) {
      results = results.filter(business => {
        const distance = this.calculateDistance(
          filters.latitude!,
          filters.longitude!,
          business.latitude,
          business.longitude
        );
        return distance <= filters.maxDistance!;
      });
    }

    // Rating'e göre sırala (yüksekten düşüğe)
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return results;
  }

  // Favori işlemleri
  async addToFavorites(insertFavorite: InsertFavorite): Promise<Favorite> {
    // Zaten favorilerde var mı kontrol et
    const existingFavorite = Array.from(this.favorites.values()).find(
      fav => fav.businessId === insertFavorite.businessId && fav.userId === insertFavorite.userId
    );

    if (existingFavorite) {
      return existingFavorite;
    }

    const id = this.currentFavoriteId++;
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      createdAt: new Date()
    };

    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFromFavorites(businessId: number, userId: string): Promise<boolean> {
    const favoriteEntry = Array.from(this.favorites.entries()).find(
      ([_, fav]) => fav.businessId === businessId && fav.userId === userId
    );

    if (favoriteEntry) {
      this.favorites.delete(favoriteEntry[0]);
      return true;
    }

    return false;
  }

  async getUserFavorites(userId: string): Promise<Business[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(fav => fav.userId === userId);

    const favoriteBusinesses: Business[] = [];
    for (const favorite of userFavorites) {
      const business = this.businesses.get(favorite.businessId!);
      if (business) {
        favoriteBusinesses.push(business);
      }
    }

    return favoriteBusinesses;
  }

  // Arama geçmişi
  async addSearchHistory(insertSearch: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.currentSearchId++;
    const search: SearchHistory = {
      ...insertSearch,
      id,
      createdAt: new Date()
    };

    this.searchHistory.set(id, search);
    return search;
  }

  async getUserSearchHistory(userId: string): Promise<SearchHistory[]> {
    return Array.from(this.searchHistory.values())
      .filter(search => search.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, 50); // Son 50 arama
  }

  // Yardımcı fonksiyonlar
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
}

export const storage = new MemStorage();
