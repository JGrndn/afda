/**
 * Rate Limiter simple basé sur la mémoire
 * Pour une solution production, considérer Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Nettoyage périodique toutes les 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Vérifie si une requête est autorisée
   * @param identifier - Identifiant unique (IP, userId, etc.)
   * @returns true si autorisé, false sinon
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.storage.get(identifier);

    // Première requête ou fenêtre expirée
    if (!entry || now >= entry.resetTime) {
      const resetTime = now + this.windowMs;
      this.storage.set(identifier, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
      };
    }

    // Incrémenter le compteur
    entry.count++;
    this.storage.set(identifier, entry);

    return {
      allowed: entry.count <= this.maxRequests,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now >= entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Réinitialise le compteur pour un identifiant
   */
  reset(identifier: string): void {
    this.storage.delete(identifier);
  }

  /**
   * Obtient les statistiques actuelles
   */
  getStats(): { totalKeys: number } {
    return {
      totalKeys: this.storage.size,
    };
  }
}

// Configuration différente selon le type de route
export const rateLimiters = {
  // Routes API générales : 100 req/min
  api: new RateLimiter(60 * 1000, 100),
  
  // Routes d'authentification : 10 req/min (plus strict)
  auth: new RateLimiter(60 * 1000, 10),
  
  // Routes publiques : 200 req/min
  public: new RateLimiter(60 * 1000, 200),
};

export type RateLimiterType = keyof typeof rateLimiters;