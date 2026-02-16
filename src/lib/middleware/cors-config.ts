/**
 * Configuration CORS pour l'application
 */

export interface CorsOptions {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

/**
 * Origines autorisées selon l'environnement
 */
const getAllowedOrigins = (): string[] => {
  const origins: string[] = [];

  // Production
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  // Développement
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000');
    origins.push('http://127.0.0.1:3000');
    // Ajouter d'autres origines de développement si nécessaire
    if (process.env.NEXT_PUBLIC_DEV_ORIGIN) {
      origins.push(process.env.NEXT_PUBLIC_DEV_ORIGIN);
    }
  }

  return origins;
};

/**
 * Configuration CORS par défaut
 */
export const corsConfig: CorsOptions = {
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  credentials: true,
  maxAge: 86400, // 24 heures
};

/**
 * Vérifie si une origine est autorisée
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Requêtes same-origin

  const allowedOrigins = getAllowedOrigins();
  
  // En développement, autoriser localhost avec n'importe quel port
  if (process.env.NODE_ENV === 'development') {
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return true;
    }
  }

  return allowedOrigins.includes(origin);
}

/**
 * Crée les headers CORS pour une réponse
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {};

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  headers['Access-Control-Allow-Methods'] = corsConfig.methods.join(', ');
  headers['Access-Control-Allow-Headers'] = corsConfig.allowedHeaders.join(', ');
  headers['Access-Control-Expose-Headers'] = corsConfig.exposedHeaders.join(', ');
  headers['Access-Control-Max-Age'] = corsConfig.maxAge.toString();

  return headers;
}