import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Routes publiques
  const publicRoutes = ['/signin', '/signup', '/error'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Si page publique, laisser passer
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Si pas connecté, rediriger vers login
  if (!isLoggedIn) {
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Vérifier les permissions selon le rôle
  const userRole = req.auth?.user.role;

  // Routes admin uniquement
  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // Routes MANAGER ou ADMIN pour les mutations
  const mutationRoutes = ['/members/new', '/workshops/new', '/families/new'];
  const isMutationRoute = mutationRoutes.some(route => pathname.startsWith(route));
  
  if (isMutationRoute && userRole === 'VIEWER') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};