import { DNSRecords } from '@/types/api';

// DNS record types to query
const DNS_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'PTR', 'CAA', 'SRV', 'DS', 'DNSKEY'];

// Helper function to check if string is IPv4
function isIPv4(str: string): boolean {
  return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(str);
}

// Helper function to check if string is IPv6
function isIPv6(str: string): boolean {
  return str.includes(':') && !isIPv4(str);
}

// Helper function to convert IPv4 to reverse DNS format
function ipv4ToReverseDNS(ip: string): string {
  return ip.split('.').reverse().join('.') + '.in-addr.arpa';
}

// Helper function to expand compressed IPv6 address
function expandIPv6(ip: string): string {
  if (ip === '::') return '0000:0000:0000:0000:0000:0000:0000:0000';
  if (ip === '::1') return '0000:0000:0000:0000:0000:0000:0000:0001';

  const sides = ip.split('::');
  if (sides.length === 2) {
    const left = sides[0] ? sides[0].split(':') : [];
    const right = sides[1] ? sides[1].split(':') : [];
    const missing = 8 - left.length - right.length;
    const middle = Array(missing).fill('0000');
    const full = [...left, ...middle, ...right];
    return full.map(h => h.padStart(4, '0')).join(':');
  }

  return ip.split(':').map(h => h.padStart(4, '0')).join(':');
}

// Helper function to convert IPv6 to reverse DNS format
function ipv6ToReverseDNS(ip: string): string {
  const expandedIP = ip.includes('::') ? expandIPv6(ip) : ip;
  const nibbles = expandedIP.replace(/:/g, '').split('').reverse().join('.');
  return nibbles + '.ip6.arpa';
}

export async function resolveDNS(query: string, type: 'ipv4' | 'ipv6' | 'domain'): Promise<DNSRecords> {
  const records: DNSRecords = {};
  const isIP = isIPv4(query) || isIPv6(query);

  // Define which record types to query based on input type
  // For IPs, we practically only care about PTR (reverse DNS)
  // For domains, we want to see everything
  const typesToQuery = isIP ? ['PTR'] : DNS_TYPES;

  // Perform DNS lookups using Cloudflare DNS-over-HTTPS
  await Promise.all(
    typesToQuery.map(async (dnsType) => {
      try {
        let queryName = query;

        // For PTR records, convert IP to reverse DNS format
        if (dnsType === 'PTR') {
          if (!isIP) {
            // For domains, PTR is rarely useful or queryable directly like this, but occasionally used for checks
            // We can skip PTR for domains to save a request if we want, but let's keep it for completeness if not IP
            if (!isIP) {
                 records[dnsType] = [];
                 return;
            }
          }

          if (isIPv4(query)) {
            queryName = ipv4ToReverseDNS(query);
          } else if (isIPv6(query)) {
            queryName = ipv6ToReverseDNS(query);
          }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout for DNS

        const response = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(queryName)}&type=${dnsType}`,
          {
            headers: { accept: 'application/dns-json' },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          records[dnsType] = [];
          return;
        }

        const data = await response.json();
        records[dnsType] = data.Answer || [];
      } catch {
        records[dnsType] = [];
      }
    })
  );

  return records;
}

