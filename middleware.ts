import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract client IP
function getClientIP(request: NextRequest): string {
  const cfConnectingIP = request.headers.get('CF-Connecting-IP');
  const xRealIP = request.headers.get('X-Real-IP');
  const xForwardedFor = request.headers.get('X-Forwarded-For');

  if (cfConnectingIP) return cfConnectingIP;
  if (xRealIP) return xRealIP;
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();

  return 'Unknown';
}

// Check if request is from curl or similar CLI tool
function isCurlRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('User-Agent') || '';
  return (
    userAgent.toLowerCase().includes('curl') ||
    userAgent.toLowerCase().includes('wget') ||
    userAgent.toLowerCase().includes('httpie')
  );
}

export async function middleware(request: NextRequest) {
  // Only handle GET requests to root path
  if (request.method === 'GET' && request.nextUrl.pathname === '/') {
    if (isCurlRequest(request)) {
      const clientIP = getClientIP(request);

      // Fetch data for client's IP
      try {
        const apiUrl = new URL('/api/lookup', request.url);
        apiUrl.searchParams.set('q', clientIP);

        const response = await fetch(apiUrl.toString());
        const data = await response.json();

        return NextResponse.json(data, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to fetch IP data', ip: clientIP },
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
