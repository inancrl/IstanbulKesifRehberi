import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBusinessSchema, insertFavoriteSchema, searchFiltersSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // İşletme arama endpoint'i
  app.post("/api/businesses/search", async (req, res) => {
    try {
      const filters = searchFiltersSchema.parse(req.body);
      const businesses = await storage.searchBusinesses(filters);
      
      // Arama geçmişine ekle (eğer userId varsa)
      if (filters.query || filters.district || filters.category) {
        const userId = req.body.userId || 'anonymous';
        await storage.addSearchHistory({
          query: filters.query || '',
          district: filters.district || null,
          category: filters.category || null,
          resultsCount: businesses.length,
          userId
        });
      }

      res.json({
        businesses,
        total: businesses.length,
        filters
      });
    } catch (error) {
      console.error('İşletme arama hatası:', error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? 'Geçersiz filtre parametreleri' : 'Arama başarısız oldu' 
      });
    }
  });

  // Tek işletme getirme
  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Geçersiz işletme ID' });
      }

      const business = await storage.getBusiness(id);
      if (!business) {
        return res.status(404).json({ message: 'İşletme bulunamadı' });
      }

      res.json(business);
    } catch (error) {
      console.error('İşletme getirme hatası:', error);
      res.status(500).json({ message: 'İşletme bilgileri alınamadı' });
    }
  });

  // Place ID ile işletme getirme
  app.get("/api/businesses/place/:placeId", async (req, res) => {
    try {
      const { placeId } = req.params;
      const business = await storage.getBusinessByPlaceId(placeId);
      
      if (!business) {
        return res.status(404).json({ message: 'İşletme bulunamadı' });
      }

      res.json(business);
    } catch (error) {
      console.error('İşletme getirme hatası (place ID):', error);
      res.status(500).json({ message: 'İşletme bilgileri alınamadı' });
    }
  });

  // Yeni işletme ekleme
  app.post("/api/businesses", async (req, res) => {
    try {
      const businessData = insertBusinessSchema.parse(req.body);
      
      // Aynı place_id ile işletme var mı kontrol et
      const existingBusiness = await storage.getBusinessByPlaceId(businessData.placeId);
      if (existingBusiness) {
        return res.status(409).json({ message: 'Bu işletme zaten kayıtlı' });
      }

      const business = await storage.createBusiness(businessData);
      res.status(201).json(business);
    } catch (error) {
      console.error('İşletme ekleme hatası:', error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? 'Geçersiz işletme bilgileri' : 'İşletme eklenemedi' 
      });
    }
  });

  // İşletme güncelleme
  app.put("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Geçersiz işletme ID' });
      }

      const updates = insertBusinessSchema.partial().parse(req.body);
      const business = await storage.updateBusiness(id, updates);
      
      if (!business) {
        return res.status(404).json({ message: 'İşletme bulunamadı' });
      }

      res.json(business);
    } catch (error) {
      console.error('İşletme güncelleme hatası:', error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? 'Geçersiz güncelleme bilgileri' : 'İşletme güncellenemedi' 
      });
    }
  });

  // Favorilere ekleme
  app.post("/api/favorites", async (req, res) => {
    try {
      const favoriteData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addToFavorites(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error('Favori ekleme hatası:', error);
      res.status(400).json({ 
        message: error instanceof z.ZodError ? 'Geçersiz favori bilgileri' : 'Favorilere eklenemedi' 
      });
    }
  });

  // Favorilerden çıkarma
  app.delete("/api/favorites/:businessId/:userId", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const { userId } = req.params;

      if (isNaN(businessId)) {
        return res.status(400).json({ message: 'Geçersiz işletme ID' });
      }

      const removed = await storage.removeFromFavorites(businessId, userId);
      
      if (!removed) {
        return res.status(404).json({ message: 'Favori bulunamadı' });
      }

      res.json({ message: 'Favorilerden çıkarıldı' });
    } catch (error) {
      console.error('Favori çıkarma hatası:', error);
      res.status(500).json({ message: 'Favorilerden çıkarılamadı' });
    }
  });

  // Kullanıcı favorilerini getirme
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error('Favoriler getirme hatası:', error);
      res.status(500).json({ message: 'Favoriler alınamadı' });
    }
  });

  // Arama geçmişi getirme
  app.get("/api/search-history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const history = await storage.getUserSearchHistory(userId);
      res.json(history);
    } catch (error) {
      console.error('Arama geçmişi getirme hatası:', error);
      res.status(500).json({ message: 'Arama geçmişi alınamadı' });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'İstanbul Keşif Rehberi API'
    });
  });

  // API version bilgisi
  app.get("/api/version", (req, res) => {
    res.json({
      name: 'İstanbul Keşif Rehberi API',
      version: '1.0.0',
      description: 'İstanbul işletmelerini keşfetmek için Google Maps tabanlı API',
      endpoints: {
        'POST /api/businesses/search': 'İşletme arama',
        'GET /api/businesses/:id': 'İşletme detayları',
        'GET /api/businesses/place/:placeId': 'Place ID ile işletme',
        'POST /api/businesses': 'Yeni işletme ekleme',
        'PUT /api/businesses/:id': 'İşletme güncelleme',
        'POST /api/favorites': 'Favorilere ekleme',
        'DELETE /api/favorites/:businessId/:userId': 'Favorilerden çıkarma',
        'GET /api/favorites/:userId': 'Kullanıcı favorileri',
        'GET /api/search-history/:userId': 'Arama geçmişi'
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
