import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// İşletmeler tablosu
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  placeId: text("place_id").unique().notNull(), // Google Places API'den gelen benzersiz ID
  name: text("name").notNull(),
  address: text("address").notNull(),
  district: text("district").notNull(), // İlçe
  category: text("category").notNull(), // Kategori
  rating: real("rating"), // Yıldız puanı
  reviewCount: integer("review_count"), // Değerlendirme sayısı
  phone: text("phone"),
  website: text("website"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isOpen: boolean("is_open"), // Şu anda açık mı
  photoUrl: text("photo_url"), // Ana fotoğraf URL'si
  priceLevel: integer("price_level"), // 1-4 arası fiyat seviyesi
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Favoriler tablosu
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id),
  userId: text("user_id").notNull(), // Basit user identifier
  createdAt: timestamp("created_at").defaultNow()
});

// Arama geçmişi tablosu
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  district: text("district"),
  category: text("category"),
  resultsCount: integer("results_count"),
  userId: text("user_id"),
  createdAt: timestamp("created_at").defaultNow()
});

// Zod şemaları
export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  createdAt: true
});

// Arama filtreleri şeması
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  district: z.string().optional(),
  category: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxDistance: z.number().min(1).max(25).optional(),
  onlyOpen: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

// TypeScript türleri
export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;
