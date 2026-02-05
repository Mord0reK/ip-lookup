export interface IPApiResponse {
  ip: string;
  rir: string;
  is_bogon: boolean;
  is_mobile: boolean;
  is_crawler: boolean;
  is_datacenter: boolean;
  is_tor: boolean;
  is_proxy: boolean;
  is_vpn: boolean;
  is_abuser: boolean;
  company: {
    name: string;
    domain: string;
    type: string;
    network: string;
    whois?: string;
    abuser_score?: string;
  };
  asn: {
    asn: number;
    route: string;
    descr: string;
    org: string;
    domain: string;
    country: string;
    type?: string;
    created?: string;
    updated?: string;
    rir?: string;
    whois?: string;
    abuser_score?: string;
  };
  location: {
    country: string;
    country_code: string;
    state: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
    continent?: string;
    is_eu_member?: boolean;
    calling_code?: string;
    currency_code?: string;
    zip?: string;
    local_time?: string;
  };
  datacenter?: {
    datacenter: string;
    network: string;
    service: string;
  };
  abuse?: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  error?: boolean;
}

export interface AbuseIPDBResponse {
  data: {
    ipAddress: string;
    abuseConfidenceScore: number;
    totalReports: number;
    lastReportedAt: string | null;
    usageType: string;
    isp: string;
    domain: string;
    isWhitelisted: boolean;
    countryCode?: string;
    countryName?: string;
  };
}

export interface DNSRecords {
  ptr?: string | null;
  a?: string[];
  aaaa?: string[];
  mx?: { exchange: string; priority: number }[];
  txt?: string[][];
  ns?: string[];
  cname?: string | null;
  soa?: any[];
  caa?: any[];
  srv?: any[];
  ds?: any[];
  dnskey?: any[];
  [key: string]: any;
}

export interface EdgeInfo {
  colo: string;
  country: string;
  city: string | null;
  continent: string;
  latitude?: string;
  longitude?: string;
  region?: string;
  regionCode?: string;
  timezone?: string;
}

export interface LookupResult {
  query: string;
  type: 'ipv4' | 'ipv6' | 'domain';
  resolvedIP?: string;
  ipapi: IPApiResponse | null;
  abuseipdb: AbuseIPDBResponse['data'] | null;
  dns: DNSRecords;
  edge?: EdgeInfo | null;
  timestamp: number;
}

export interface HistoryItem {
  query: string;
  type: 'ipv4' | 'ipv6' | 'domain';
  city: string;
  country: string;
  timestamp: number;
}
