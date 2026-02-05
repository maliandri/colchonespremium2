import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Redirigir www a no-www
  if (hostname.startsWith('www.')) {
    const newHostname = hostname.replace('www.', '');
    url.host = newHostname;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas excepto archivos estaticos y api
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
