import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Helper function to extract client IP from request headers
function getClientIP(request: NextRequest): string {
  // Check various headers where the IP might be stored
  const cfConnectingIP = request.headers.get('CF-Connecting-IP');
  const xRealIP = request.headers.get('X-Real-IP');
  const xForwardedFor = request.headers.get('X-Forwarded-For');

  if (cfConnectingIP) return cfConnectingIP;
  if (xRealIP) return xRealIP;
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }

  return 'Unknown';
}

export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);

  return NextResponse.json({ ip: clientIP }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
