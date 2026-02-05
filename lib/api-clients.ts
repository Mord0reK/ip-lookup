import fetch from 'node-fetch';
import { IPApiResponse, AbuseIPDBResponse } from '@/types/api';

export async function fetchIPApiData(ip: string): Promise<IPApiResponse | null> {
  try {
    const url = `https://api.ipapi.is?q=${ip}`;
    console.log(`[API] Fetching: ${url}`);
    
    const res = await fetch(url, { 
      headers: {
        'Accept': 'application/json',
      },
      timeout: 15000
    } as any);
    
    console.log(`[API] Response status: ${res.status}`);
    
    if (!res.ok) {
      console.error(`[API] HTTP error: ${res.status}`);
      return null;
    }
    
    const data = await res.json() as IPApiResponse;
    console.log(`[API] Got data for IP: ${data.ip}`);
    return data;
  } catch (error: any) {
    console.error('[API] Fetch error:', error.message || error);
    return null;
  }
}

export async function fetchAbuseIPDB(ip: string): Promise<AbuseIPDBResponse | null> {
  try {
    const apiKey = process.env.ABUSEIPDB_API_KEY;
    if (!apiKey) {
      console.log('[API] No ABUSEIPDB_API_KEY');
      return null;
    }
    
    const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`;
    
    const res = await fetch(url, {
      headers: {
        'Key': apiKey,
        'Accept': 'application/json'
      },
      timeout: 15000
    } as any);
    
    if (!res.ok) {
      console.error(`[API] AbuseIPDB error: ${res.status}`);
      return null;
    }
    
    return await res.json() as AbuseIPDBResponse;
  } catch (error: any) {
    console.error('[API] AbuseIPDB fetch error:', error.message);
    return null;
  }
}
