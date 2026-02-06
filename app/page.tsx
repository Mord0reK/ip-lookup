"use client"

import { useState, useEffect } from "react"
import { SearchBar } from "./components/search-bar"
import { HistoryPanel } from "./components/history-panel"
import { LocationMap } from "./components/location-map"
import { DNSTable } from "./components/dns-table"
import { LookupResult } from "@/types/api"
import { addToHistory } from "@/lib/history-store"
import { toast } from "sonner"
import { Globe, Server, Shield, MapPin, AlertCircle, Menu, Network } from "lucide-react"
import { Badge } from "@/ui/badge"
import { Card, CardContent } from "@/ui/card"
import { Button } from "@/ui/button"

export default function HomePage() {
  const [result, setResult] = useState<LookupResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [asnData, setAsnData] = useState<any>(null)
  const [loadingAsn, setLoadingAsn] = useState(false)

  const fetchASNData = async (asnNumber: number) => {
    setLoadingAsn(true)
    try {
      const res = await fetch(`/api/asn?asn=${asnNumber}`)
      const data = await res.json()
      if (res.ok) {
        setAsnData(data)
      }
    } catch (err) {
      console.error('Failed to fetch ASN data:', err)
    } finally {
      setLoadingAsn(false)
    }
  }

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    setHasSearched(true)
    setError(null)
    setAsnData(null)

    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(query)}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Lookup failed")
        toast.error(data.error || "Lookup failed")
        return
      }

      setResult(data)

      if (data.ipapi) {
        addToHistory({
          query: data.query,
          type: data.type,
          city: data.ipapi.location?.city || "Unknown",
          country: data.ipapi.location?.country || "Unknown",
          timestamp: Date.now()
        })
      }

      // Auto-fetch ASN data if available
      if (data.ipapi?.asn?.asn) {
        fetchASNData(data.ipapi.asn.asn)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError("Failed to fetch data")
      toast.error("Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-load user's IP on page load
  useEffect(() => {
    const loadUserIP = async () => {
      try {
        const response = await fetch('/api/myip')
        const data = await response.json()
        if (data.ip && data.ip !== 'Unknown') {
          handleSearch(data.ip)
        }
      } catch (err) {
        console.error('Failed to load user IP:', err)
        // Silently fail - user can manually search
      }
    }
    loadUserIP()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar - History */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static`}
      >
        <HistoryPanel onSelect={handleSearch} />
      </aside>

      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header/Navbar */}
        <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-20">
          <div className="w-full px-4 lg:px-6 h-16 flex items-center justify-between lg:justify-center relative gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-zinc-800 rounded-lg lg:hidden text-zinc-400 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Desktop title */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden xl:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent whitespace-nowrap">
                Wyszukiwarka IP
              </h1>
            </div>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {/* Desktop history toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
              title="Toggle History"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 container mx-auto px-4 py-6 space-y-6 max-w-[1600px] overflow-auto">
          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4 text-zinc-500">
                <svg className="animate-spin h-12 w-12 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Pobieranie danych...</p>
              </div>
            </div>
          ) : hasSearched && result ? (
            <ResultsView
              result={result}
              asnData={asnData}
              loadingAsn={loadingAsn}
              onFetchAsn={fetchASNData}
            />
          ) : !hasSearched && (
            <div className="text-center text-zinc-500 py-24">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/10 to-blue-500/10 mb-6">
                <Globe className="h-10 w-10 opacity-50" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-zinc-200">Gotowy do wyszukiwania</h2>
              <p className="text-sm mb-6">Wprowadź adres IP lub domenę aby uzyskać szczegółowe informacje</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Results component
function ResultsView({ result, asnData, loadingAsn, onFetchAsn }: {
  result: LookupResult
  asnData: any
  loadingAsn: boolean
  onFetchAsn: (asn: number) => void
}) {
  return (
    <div className="space-y-6">
      {/* Top Row: Network & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network & Infrastructure Card */}
        <NetworkInfrastructureCard result={result} onFetchAsn={onFetchAsn} />

        {/* Security Card */}
        <SecurityCard result={result} />
      </div>

      {/* Second Row: Geo Details & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geo Details (span 2) */}
        <GeoDetailsCard result={result} />

        {/* Map (span 1) */}
        <div className="lg:col-span-1 bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden relative h-64 lg:h-auto min-h-[250px] shadow-xl">
          {result.ipapi?.location?.latitude && result.ipapi?.location?.longitude ? (
            <>
              <LocationMap
                latitude={result.ipapi.location.latitude}
                longitude={result.ipapi.location.longitude}
                city={result.ipapi.location.city || "Unknown"}
                country={result.ipapi.location.country || "Unknown"}
                ip={result.resolvedIP || result.query}
              />
              {/* Live Location Badge */}
              <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                <span className="text-xs font-medium text-white flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                  </span>
                  Live
                </span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
              <span className="text-zinc-500">Brak lokalizacji</span>
            </div>
          )}
        </div>
      </div>

      {/* ASN Section */}
      {asnData && <ASNSection data={asnData} loading={loadingAsn} />}

      {/* DNS Records */}
      <DNSSection result={result} />
    </div>
  )
}

// Individual card components will go here
function NetworkInfrastructureCard({ result, onFetchAsn }: { result: LookupResult, onFetchAsn: (asn: number) => void }) {
  const ipapi = result.ipapi

  return (
    <Card className="bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-xl backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
          <div className="p-2 bg-sky-500/10 rounded-lg">
            <Server className="w-6 h-6 text-sky-500" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100">Sieć i Infrastruktura</h2>
        </div>

        <div className="space-y-3">
          {/* Network info fields */}
          <InfoRow label="Adres IP" value={ipapi?.ip} copyable />
          <InfoRow label="Dostawca (ISP)" value={ipapi?.asn?.org || ipapi?.company?.name} />
          <InfoRow
            label="ASN"
            value={ipapi?.asn?.asn ? `AS${ipapi.asn.asn}` : 'N/A'}
            isLink={!!ipapi?.asn?.asn}
            onClick={() => ipapi?.asn?.asn && onFetchAsn(ipapi.asn.asn)}
          />
          <InfoRow label="Organizacja" value={ipapi?.company?.name} />
          <InfoRow label="Typ firmy" value={ipapi?.company?.type} />
          <InfoRow label="Hosting/DC" value={ipapi?.is_datacenter ? 'Tak' : 'Nie'} />
          <InfoRow label="Proxy/VPN/Tor" value={(ipapi?.is_proxy || ipapi?.is_vpn || ipapi?.is_tor) ? 'Tak' : 'Nie'} />

          {/* Datacenter info */}
          {ipapi?.datacenter && (
            <div className="border-t border-zinc-800 pt-3 mt-3">
              <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-2">Centrum Danych</span>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Nazwa:</span>
                  <span className="text-zinc-300">{ipapi.datacenter.datacenter}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Usługa:</span>
                  <span className="text-zinc-300">{ipapi.datacenter.service}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Zakres:</span>
                  <span className="text-zinc-300">{ipapi.datacenter.network}</span>
                </div>
              </div>
            </div>
          )}

          {/* Route */}
          {ipapi?.asn?.route && (
            <div className="flex justify-between items-center py-2 border-t border-zinc-800">
              <span className="text-zinc-500 text-xs uppercase tracking-wider">Trasa (Route)</span>
              <div className="bg-zinc-800 text-sky-400 px-2 py-0.5 rounded text-xs border border-zinc-700 font-mono">
                {ipapi.asn.route}
              </div>
            </div>
          )}

          {/* Edge info */}
          {result.edge && (
            <div className="border-t border-zinc-800 pt-3 mt-3">
              <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-2">Lokalizacja Zapytania (Edge)</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex flex-col">
                  <span className="text-zinc-500 uppercase">Centrum (Colo)</span>
                  <span className="text-sky-400 font-mono">{result.edge.colo}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-zinc-500 uppercase">Kraj</span>
                  <span className="text-zinc-300">{result.edge.country}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-zinc-500 uppercase">Miasto</span>
                  <span className="text-zinc-300">{result.edge.city || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-zinc-500 uppercase">Kontynent</span>
                  <span className="text-zinc-300">{result.edge.continent}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SecurityCard({ result }: { result: LookupResult }) {
  const ipapi = result.ipapi
  const abuseipdb = result.abuseipdb

  const isAbuser = ipapi?.is_abuser || false
  const abuserScore = isAbuser ? 100 : 0
  const scoreText = isAbuser ? "Wysokie" : "Niskie"
  const scoreColor = isAbuser ? "text-red-500" : "text-emerald-500"
  const barColor = isAbuser ? "bg-red-500" : "bg-emerald-500"

  return (
    <Card className="bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-xl backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100">Bezpieczeństwo</h2>
        </div>

        <div className="space-y-4">
          {/* Abuse score indicator */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Wskaźnik nadużyć</span>
              <span className={`${scoreColor} text-sm font-bold`}>{scoreText}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className={`${barColor} h-2 rounded-full transition-all duration-1000`} style={{ width: `${abuserScore}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* AbuseIPDB Info */}
            {abuseipdb && (
              <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                <div className="text-zinc-500 text-[10px] uppercase mb-1 flex justify-between items-center">
                  <span>AbuseIPDB</span>
                  <a
                    href={`https://www.abuseipdb.com/check/${abuseipdb.ipAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-500 hover:underline"
                  >
                    Raport
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-zinc-500 text-[9px] uppercase">Raporty</span>
                    <span className={`text-xs font-bold ${(abuseipdb.totalReports || 0) > 0 ? 'text-red-400' : 'text-emerald-500'}`}>
                      {abuseipdb.totalReports || 0}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-zinc-500 text-[9px] uppercase">Pewność</span>
                    <span className={`text-xs font-bold ${(abuseipdb.abuseConfidenceScore || 0) > 20 ? 'text-red-400' : 'text-emerald-500'}`}>
                      {abuseipdb.abuseConfidenceScore || 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Abuse contact */}
            <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
              <div className="text-zinc-500 text-[10px] uppercase mb-1">Kontakt Abuse</div>
              <div className="text-zinc-200 text-[11px] font-medium truncate">{ipapi?.abuse?.email || 'N/A'}</div>
              <div className="text-zinc-400 text-[10px] truncate">{ipapi?.abuse?.name || ''}</div>
            </div>

            {/* Abuser scores */}
            <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 sm:col-span-2">
              <div className="text-zinc-500 text-[10px] uppercase mb-1">Abuser Score (ASN/Company)</div>
              <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-zinc-500 text-[9px] uppercase">ASN</span>
                  <span className={`text-xs ${ipapi?.asn?.abuser_score?.includes('Low') ? 'text-emerald-500' : 'text-red-400'} font-mono`}>
                    {ipapi?.asn?.abuser_score || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-zinc-500 text-[9px] uppercase">Firma</span>
                  <span className={`text-xs ${ipapi?.company?.abuser_score?.includes('Low') ? 'text-emerald-500' : 'text-red-400'} font-mono`}>
                    {ipapi?.company?.abuser_score || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Abuser warning */}
          {ipapi?.is_abuser && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <AlertCircle className="w-5 h-5" />
              <div className="text-xs font-semibold uppercase tracking-wider">Wykryto jako nadużycie!</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function GeoDetailsCard({ result }: { result: LookupResult }) {
  const location = result.ipapi?.location

  if (!location) {
    return (
      <Card className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-xl backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-zinc-600 text-sm italic">Brak danych geograficznych.</div>
        </CardContent>
      </Card>
    )
  }

  const formatLocalTime = (timeString?: string) => {
    if (!timeString) return 'N/A'
    try {
      const date = new Date(timeString.replace(' ', 'T'))
      if (isNaN(date.getTime())) return timeString

      return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch {
      return timeString
    }
  }

  return (
    <Card className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-xl backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Globe className="w-6 h-6 text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100">Szczegóły Geograficzne</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="Kraj" value={`${location.country} (${location.country_code})`} />
          <InfoRow label="Region/Stan" value={location.state} />
          <InfoRow label="Miasto" value={location.city} />
          <InfoRow label="Kod pocztowy" value={location.zip} />
          <InfoRow label="Strefa czasowa" value={location.timezone} />
          <InfoRow label="Lokalny czas" value={formatLocalTime(location.local_time)} />
          <InfoRow label="Współrzędne" value={`${location.latitude}, ${location.longitude}`} />
          <InfoRow label="Waluta" value={location.currency_code} />
          <InfoRow label="Numer kierunkowy" value={location.calling_code ? `+${location.calling_code}` : 'N/A'} />
          <InfoRow label="Członek UE" value={location.is_eu_member ? 'Tak' : 'Nie'} />
        </div>
      </CardContent>
    </Card>
  )
}

function ASNSection({ data, loading }: { data: any, loading: boolean }) {
  if (loading) {
    return (
      <Card className="bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-xl backdrop-blur-sm">
        <CardContent className="p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-zinc-500">
            <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Pobieranie szczegółów ASN...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const asnData = (data.asn && typeof data.asn === 'object') ? data.asn : data

  return (
    <Card className="bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-xl backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Network className="w-6 h-6 text-purple-500" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100">Informacje o ASN</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Info grid */}
          <div className="bg-zinc-800/30 rounded-2xl p-5 border border-zinc-700/30 space-y-3 lg:col-span-2">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4">Podstawowe informacje o ASN</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <InfoRow label="Numer ASN" value={`AS${asnData.asn}`} />
              <InfoRow label="Organizacja" value={asnData.org} />
              <InfoRow label="Opis" value={asnData.descr} />
              <InfoRow label="Kraj" value={asnData.country?.toUpperCase()} />
              <InfoRow label="Typ" value={asnData.type} />
              <InfoRow label="Data powstania" value={asnData.created} />
              <InfoRow label="Ostatnia aktualizacja" value={asnData.updated} />
              <InfoRow label="RIR" value={asnData.rir} />
              <InfoRow label="Abuse Email" value={asnData.abuse} />
              <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                <span className="text-zinc-500 text-xs">Domena</span>
                {asnData.domain ? (
                  <a
                    href={`http://${asnData.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline text-sm truncate max-w-[60%]"
                  >
                    {asnData.domain}
                  </a>
                ) : (
                  <span className="text-zinc-200 font-medium text-sm">N/A</span>
                )}
              </div>
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-zinc-800/30 rounded-2xl p-5 border border-zinc-700/30 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 text-purple-500">
              <Globe className="w-8 h-8" />
            </div>
            <div className="text-zinc-200 font-bold text-xl mb-1">{asnData.org}</div>
            <div className="text-zinc-500 text-xs uppercase tracking-widest">{asnData.country} • {asnData.type}</div>
            <a
              href={`https://api.ipapi.is/?q=AS${asnData.asn}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 text-xs text-sky-400 border border-sky-500/30 px-4 py-2 rounded-full hover:bg-sky-500/10 transition-colors"
            >
              Zobacz WHOIS w ipapi.is
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DNSSection({ result }: { result: LookupResult }) {
  return (
    <Card className="bg-zinc-900/80 border border-zinc-800 rounded-3xl shadow-xl backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-200">Rekordy DNS</h2>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Live Lookup</span>
        </div>
        <DNSTable records={result.dns} />
      </CardContent>
    </Card>
  )
}

// Helper component for info rows
function InfoRow({
  label,
  value,
  copyable = false,
  isLink = false,
  onClick
}: {
  label: string
  value?: string | null
  copyable?: boolean
  isLink?: boolean
  onClick?: () => void
}) {
  const displayValue = value || 'N/A'

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value)
      toast.success('Skopiowano do schowka')
    }
  }

  return (
    <div className="flex justify-between items-center border-b border-zinc-800/50 py-2 last:border-0">
      <span className="text-zinc-500 text-xs">{label}</span>
      {isLink && onClick ? (
        <button
          onClick={onClick}
          className="text-sky-400 hover:text-sky-300 font-medium text-sm text-right truncate max-w-[60%] transition-colors flex items-center gap-1 ml-auto"
        >
          {displayValue}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </button>
      ) : copyable && value ? (
        <button
          onClick={handleCopy}
          className="text-zinc-200 hover:text-sky-400 font-medium text-sm text-right truncate max-w-[60%] transition-colors flex items-center gap-1 ml-auto group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
          </svg>
          {displayValue}
        </button>
      ) : (
        <span className="text-zinc-200 font-medium text-sm truncate max-w-[60%]">{displayValue}</span>
      )}
    </div>
  )
}
