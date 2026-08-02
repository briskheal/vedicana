import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Create a new headers object to pass current pathname to downstream
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  // Protect Admin Pages & Admin APIs
  if (isAdminRoute || isAdminApiRoute) {
    const token = request.cookies.get('vedicana_session')?.value;
    
    if (!token) {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: 'Unauthorized: Missing session token' }, { status: 401 });
      }
      // Redirect to login for pages
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_vedicana_auth_xyz123');
      const { payload } = await jwtVerify(token, secret);
      
      if (payload.role !== 'admin') {
        if (isAdminApiRoute) {
          return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Middleware JWT Verification Failed:', error.message);
      if (isAdminApiRoute) {
        return NextResponse.json({ error: 'Unauthorized: Invalid or expired session' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Apply middleware to all routes except standard static files and Next internal
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
