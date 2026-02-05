import { NextRequest, NextResponse } from 'next/server';
import { validateIP, validateDomain } from '@/lib/validators';
import { fetchIPApiData, fetchAbuseIPDB } from '@/lib/api-clients';
import { resolveDNS } from '@/lib/dns-resolver';

export const runtime = 'edge';

function formatBox(lines: string[], title: string): string {
  const maxLen = Math.max(...lines.map(l => l.length), title.length);
  const border = '─'.repeat(maxLen + 4);
  const titlePad = ' '.repeat(Math.floor((maxLen - title.length) / 2));
  
  return `╔═${border}╗
║ ${titlePad}${title}${titlePad}${maxLen - title.length - titlePad.length * 2 > 0 ? ' ' : ''} ║
╠═${border}╣
${lines.map(l => `║ ${l}${' '.repeat(maxLen - l.length)} ║`).join('\n')}
╚═${border}╝`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return new NextResponse('Error: Query parameter "q" is required\n', { 
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  const trimmedQuery = query.trim().toLowerCase();
  const ipType = validateIP(trimmedQuery);
  const isDomain = validateDomain(trimmedQuery);

  if (!ipType && !isDomain) {
    return new NextResponse('Error: Invalid IP address or domain\n', { 
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  try {
    let resolvedIP: string | undefined;
    let type: 'ipv4' | 'ipv6' | 'domain' = isDomain ? 'domain' : (ipType || 'ipv4');

    // Get DNS records first
    const dnsRecords = await resolveDNS(trimmedQuery, type);

    // If it's a domain, try to resolve IP from DNS records
    if (isDomain) {
      const aRecords = dnsRecords.A || [];
      const aaaaRecords = dnsRecords.AAAA || [];

      if (aRecords.length > 0 && aRecords[0]?.data) {
        resolvedIP = aRecords[0].data;
        type = 'ipv4';
      } else if (aaaaRecords.length > 0 && aaaaRecords[0]?.data) {
        resolvedIP = aaaaRecords[0].data;
        type = 'ipv6';
      } else {
        return new NextResponse('Error: Could not resolve domain\n', {
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }

    const ipToQuery = resolvedIP || trimmedQuery;

    const [ipapi, abuseipdb] = await Promise.all([
      fetchIPApiData(ipToQuery),
      fetchAbuseIPDB(ipToQuery)
    ]);

    const ipapiData = ipapi;
    const abuseData = abuseipdb?.data;

    let threatLevel = '✓ Clean';
    if (abuseData && abuseData.abuseConfidenceScore > 75) {
      threatLevel = '🔴 High Threat';
    } else if (abuseData && abuseData.abuseConfidenceScore > 25) {
      threatLevel = '🟡 Medium';
    }

    const locationLines = [
      `IP Address:    ${ipToQuery}`,
      `Hostname:      ${dnsRecords.ptr || 'N/A'}`,
      `Type:          ${type.toUpperCase()}`,
      '',
      `📍 LOCATION`,
      `Country:       ${ipapiData?.location.country || 'N/A'} (${ipapiData?.location.country_code || 'N/A'})`,
      `State:         ${ipapiData?.location.state || 'N/A'}`,
      `City:          ${ipapiData?.location.city || 'N/A'}`,
      `Coordinates:   ${ipapiData?.location.latitude || 'N/A'}, ${ipapiData?.location.longitude || 'N/A'}`,
      `Timezone:      ${ipapiData?.location.timezone || 'N/A'}`,
      '',
      `🌐 NETWORK`,
      `ISP:           ${abuseData?.isp || ipapiData?.company.name || 'N/A'}`,
      `ASN:           ${ipapiData?.asn.asn ? `AS${ipapiData.asn.asn}` : 'N/A'}`,
      `Network:       ${ipapiData?.asn.route || 'N/A'}`,
      `Company:       ${ipapiData?.company.name || 'N/A'} (${ipapiData?.company.type || 'N/A'})`,
      '',
      `🛡️  SECURITY`,
      `Abuse Score:   ${abuseData ? `${abuseData.abuseConfidenceScore}% (${abuseData.totalReports} reports)` : 'N/A'}`,
      `Threat Level:  ${threatLevel}`,
      `VPN:           ${ipapiData?.is_vpn ? 'Yes' : 'No'}`,
      `Proxy:         ${ipapiData?.is_proxy ? 'Yes' : 'No'}`,
      `Tor:           ${ipapiData?.is_tor ? 'Yes' : 'No'}`,
      `Datacenter:    ${ipapiData?.is_datacenter ? 'Yes' : 'No'}`,
      `Whitelisted:   ${abuseData?.isWhitelisted ? 'Yes' : 'No'}`
    ];

    const output = formatBox(locationLines, 'IP LOOKUP RESULTS');

    return new NextResponse(output + '\n', { 
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    return new NextResponse(`Error: Internal server error\n`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
