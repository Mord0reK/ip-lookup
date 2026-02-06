export const runtime = 'edge';

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
    let dnsRecords: any = {};
    let ipapi: any = null;
    let abuseipdb: any = null;

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

    if (isDomain) {
      // For domains, we must resolve DNS first to get the IP for AbuseIPDB
      dnsRecords = await resolveDNS(trimmedQuery, 'domain');
      
      const aRecords = dnsRecords.A || [];
      const aaaaRecords = dnsRecords.AAAA || [];

      if (aRecords.length > 0 && aRecords[0]?.data) {
        resolvedIP = aRecords[0].data;
      } else if (aaaaRecords.length > 0 && aaaaRecords[0]?.data) {
        resolvedIP = aaaaRecords[0].data;
      }

      const ipToQuery = resolvedIP || trimmedQuery;
      
      // If we have a resolved IP, we can check AbuseIPDB, otherwise skip it or it might fail
      [ipapi, abuseipdb] = await Promise.all([
        fetchIPApiData(ipToQuery),
        resolvedIP ? fetchAbuseIPDB(resolvedIP) : Promise.resolve(null)
      ]);
    } else {
      // For IPs, execute all fetch operations in parallel for maximum speed
      const [dnsResult, ipapiResult, abuseResult] = await Promise.all([
        resolveDNS(trimmedQuery, type as 'ipv4' | 'ipv6'),
        fetchIPApiData(trimmedQuery),
        fetchAbuseIPDB(trimmedQuery)
      ]);
      
      dnsRecords = dnsResult;
      ipapi = ipapiResult;
      abuseipdb = abuseResult;
    }

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
