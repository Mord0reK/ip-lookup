export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { validateIP, validateDomain } from '@/lib/validators';
import { fetchIPApiData, fetchAbuseIPDB } from '@/lib/api-clients';
import { resolveDNS } from '@/lib/dns-resolver';
import { LookupResult, EdgeInfo } from '@/types/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const trimmedQuery = query.trim().toLowerCase();
  const ipType = validateIP(trimmedQuery);
  const isDomain = validateDomain(trimmedQuery);

  if (!ipType && !isDomain) {
    return NextResponse.json({ error: 'Invalid IP address or domain' }, { status: 400 });
  }

  try {
    let resolvedIP: string | undefined;
    let type: 'ipv4' | 'ipv6' | 'domain' = isDomain ? 'domain' : (ipType || 'ipv4');

    // Extract Edge information (available on Cloudflare Pages)
    let edge: EdgeInfo | null = null;
    try {
      // @ts-ignore - Cloudflare's geo object might not be typed
      if (request.cf) {
        edge = {
          // @ts-ignore
          colo: request.cf.colo || '',
          // @ts-ignore
          country: request.cf.country || '',
          // @ts-ignore
          city: request.cf.city || null,
          // @ts-ignore
          continent: request.cf.continent || '',
          // @ts-ignore
          latitude: request.cf.latitude,
          // @ts-ignore
          longitude: request.cf.longitude,
          // @ts-ignore
          region: request.cf.region,
          // @ts-ignore
          regionCode: request.cf.regionCode,
          // @ts-ignore
          timezone: request.cf.timezone,
        };
      }
    } catch {
      // Edge info not available (local development)
    }

    // Get DNS records first
    const dnsRecords = await resolveDNS(trimmedQuery, type);

    // If it's a domain, try to resolve IP from DNS records
    if (isDomain) {
      const aRecords = dnsRecords.A || [];
      const aaaaRecords = dnsRecords.AAAA || [];

      if (aRecords.length > 0 && aRecords[0]?.data) {
        resolvedIP = aRecords[0].data;
      } else if (aaaaRecords.length > 0 && aaaaRecords[0]?.data) {
        resolvedIP = aaaaRecords[0].data;
      }
    }

    const ipToQuery = resolvedIP || trimmedQuery;

    const [ipapi, abuseipdb] = await Promise.all([
      fetchIPApiData(ipToQuery),
      fetchAbuseIPDB(ipToQuery)
    ]);

    const result: LookupResult = {
      query: trimmedQuery,
      type: type as 'ipv4' | 'ipv6' | 'domain',
      resolvedIP,
      ipapi,
      abuseipdb: abuseipdb?.data || null,
      dns: dnsRecords,
      edge,
      timestamp: Date.now()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lookup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
