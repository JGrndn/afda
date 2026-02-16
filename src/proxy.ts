import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  applyRateLimit,
  applyCorsHeaders,
  handleOptionsRequest,
  addSecurityHeaders,
} from '@/lib/middleware/security';

/**
 * Middleware Next.js principal
 * Gère dans l'ordre :
 * 1. Requêtes OPTIONS (CORS preflight)
 * 2. Rate Limiting
 * 3. Authentification (via NextAuth)
 * 4. Autorisation basée sur les rôles
 * 5. Headers de sécurité et CORS
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  // ============================================
  // 1. Gestion des requêtes OPTIONS (CORS Preflight)
  // ============================================
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(req);
  }

  // ============================================
  // 2. Rate Limiting
  // ============================================
  const rateLimitResult = applyRateLimit(req);
  if (!rateLimitResult.allowed) {
    // Appliquer CORS même sur les réponses d'erreur
    return applyCorsHeaders(req, rateLimitResult.response!);
  }

  // ============================================
  // 3. Routes publiques (pas d'authentification requise)
  // ============================================
  const publicRoutes = ['/signin', '/signup', '/error', '/api/health'];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    let response = NextResponse.next();
    response = applyCorsHeaders(req, response);
    response = addSecurityHeaders(response);
    return response;
  }

  // ============================================
  // 4. Authentification
  // ============================================
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn) {
    // Redirection vers login pour les pages web
    if (!pathname.startsWith('/api')) {
      const signInUrl = new URL('/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Erreur 401 pour les API
    const response = NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    );
    return applyCorsHeaders(req, response);
  }

  // ============================================
  // 5. Autorisation basée sur les rôles
  // ============================================
  const userRole = req.auth?.user.role;

  // Routes admin uniquement
  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    const response = NextResponse.redirect(new URL('/unauthorized', req.url));
    return applyCorsHeaders(req, response);
  }

  // Routes de création/modification (MANAGER ou ADMIN uniquement)
  const mutationRoutes = [
    '/members/new',
    '/workshops/new',
    '/families/new',
    '/seasons/new',
    '/payments/new',
  ];
  const isMutationRoute = mutationRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isMutationRoute && userRole === 'VIEWER') {
    const response = NextResponse.redirect(new URL('/unauthorized', req.url));
    return applyCorsHeaders(req, response);
  }

  // Protection des routes API de mutation
  if (pathname.startsWith('/api')) {
    const isMutationMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
      req.method
    );

    if (isMutationMethod && userRole === 'VIEWER') {
      const response = NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      );
      return applyCorsHeaders(req, response);
    }
  }

  // ============================================
  // 6. Requête autorisée - Ajouter les headers
  // ============================================
  let response = NextResponse.next();
  response = applyCorsHeaders(req, response);
  response = addSecurityHeaders(response);

  return response;
});

/**
 * Configuration du matcher
 * Exclut les fichiers statiques et les ressources Next.js
 */
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico
     * - Fichiers statiques (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};