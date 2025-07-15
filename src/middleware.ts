
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('firebaseIdToken'); // Example cookie name

  // Define protected routes
  const protectedRoutes = ['/dashboard'];

  if (protectedRoutes.some(path => pathname.startsWith(path))) {
    if (!sessionToken) {
      // Redirect to login page if not authenticated
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
