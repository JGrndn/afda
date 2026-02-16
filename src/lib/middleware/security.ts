import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from './cors-config';
import { rateLimiters, RateLimiterType } from './rate-limiter';

/**
 * Obtient l'identifiant client pour le rate limiting
 * Priorité : userId > IP
 */
function getClientIdentifier(request: NextRequest): string {
  // Utiliser l'ID utilisateur si disponible (depuis le token ou session)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extraire l'ID du token si possible
    // Note: En production, décoder le JWT proprement
    const tokenMatch = authHeader.match(/Bearer\s+(.+)/);
    if (tokenMatch) {
      return `user:${tokenMatch[1].substring(0, 20)}`; // Identifier par token
    }
  }

  // Fallback sur l'IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Détermine quel rate limiter utiliser selon la route
 */
function getRateLimiterType(pathname: string): RateLimiterType {
  if (pathname.startsWith('/api/auth')) {
    return 'auth';
  }
  if (pathname.startsWith('/api')) {
    return 'api';
  }
  return 'public';
}

/**
 * Applique le rate limiting et retourne une réponse si limite atteinte
 */
export function applyRateLimit(
  request: NextRequest
): { allowed: boolean; response?: NextResponse } {
  const pathname = request.nextUrl.pathname;
  
  // Ne pas rate limiter les assets statiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return { allowed: true };
  }

  const limiterType = getRateLimiterType(pathname);
  const limiter = rateLimiters[limiterType];
  const identifier = getClientIdentifier(request);

  const { allowed, remaining, resetTime } = limiter.check(identifier);

  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    
    const response = NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Vous avez atteint la limite de requêtes. Veuillez réessayer plus tard.',
        retryAfter,
      },
      { status: 429 }
    );

    // Ajouter les headers de rate limit
    response.headers.set('X-RateLimit-Limit', limiter['maxRequests'].toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', resetTime.toString());
    response.headers.set('Retry-After', retryAfter.toString());

    return { allowed: false, response };
  }

  return { allowed: true };
}

/**
 * Applique les headers CORS à une réponse
 */
export function applyCorsHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Gère les requêtes OPTIONS (preflight CORS)
 */
export function handleOptionsRequest(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  const response = new NextResponse(null, { status: 204 });
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Ajoute les headers de sécurité supplémentaires
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prévention du clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prévention du MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection (pour les vieux navigateurs)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (anciennement Feature-Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}