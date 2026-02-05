"use client"

import { MapPin, Globe, Clock, Radio } from "lucide-react"
import { InfoCard } from "./info-card"
import { Badge } from "@/ui/badge"

interface LocationCardProps {
  country: string
  countryCode: string
  state: string
  city: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
  asn: string
}

export function LocationCard({
  country,
  countryCode,
  state,
  city,
  latitude,
  longitude,
  timezone,
  isp,
  asn
}: LocationCardProps) {
  const getFlagEmoji = (code: string) => {
    if (!code || code === 'XX') return '🏳️'
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const hasLocation = country !== "N/A" && city !== "N/A"

  return (
    <InfoCard
      title="Location"
      icon={<MapPin className="h-5 w-5" />}
    >
      <div className="space-y-4">
        {hasLocation ? (
          <>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getFlagEmoji(countryCode)}</span>
              <div>
                <div className="font-semibold text-lg">{city}</div>
                <div className="text-sm text-muted-foreground">{state}, {country}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 rounded-lg p-2.5">
                <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Coordinates
                </div>
                <div className="font-mono text-xs">
                  {latitude?.toFixed(4) || '0.0000'}, {longitude?.toFixed(4) || '0.0000'}
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5">
                <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Timezone
                </div>
                <div className="font-medium text-xs truncate">{timezone || 'N/A'}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5">
                <div className="text-muted-foreground text-xs mb-1">ISP</div>
                <div className="font-medium text-xs truncate">{isp}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5">
                <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                  <Radio className="h-3 w-3" />
                  ASN
                </div>
                <div className="font-mono text-xs">{asn}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Globe className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Location data unavailable</p>
          </div>
        )}
      </div>
    </InfoCard>
  )
}
