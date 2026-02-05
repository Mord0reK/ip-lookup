"use client"

import { Network, Link, Globe, Calendar, Building2 } from "lucide-react"
import { InfoCard } from "./info-card"
import { Badge } from "@/ui/badge"

interface ASNData {
  asn: number
  route: string
  descr: string
  org: string
  domain: string
  country: string
  created?: string
  updated?: string
  rir?: string
}

interface NetworkCardProps {
  ptr: string | null
  network: string
  domain: string
  route: string
  asn?: ASNData
}

export function NetworkCard({
  ptr,
  network,
  domain,
  route,
  asn
}: NetworkCardProps) {
  return (
    <InfoCard
      title="Network"
      icon={<Network className="h-5 w-5" />}
    >
      <div className="space-y-3">
        {/* PTR Record */}
        {ptr && (
          <div className="bg-muted/50 rounded-lg p-2.5">
            <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
              <Globe className="h-3 w-3" />
              PTR Record (Reverse DNS)
            </div>
            <div className="font-mono text-sm break-all">{ptr}</div>
          </div>
        )}

        {/* ASN Info */}
        {asn && (
          <div className="bg-muted/50 rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-muted-foreground text-xs flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                AS{asn.asn}
              </div>
              {asn.rir && (
                <Badge variant="outline" className="text-xs">
                  {asn.rir}
                </Badge>
              )}
            </div>
            {asn.org && (
              <div className="font-medium text-sm mb-1 truncate">{asn.org}</div>
            )}
            {asn.descr && (
              <div className="text-xs text-muted-foreground line-clamp-2">{asn.descr}</div>
            )}
          </div>
        )}

        {/* Network Details */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-muted-foreground text-xs mb-1">Network Range</div>
            <div className="font-mono text-xs truncate">{network || "N/A"}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-muted-foreground text-xs mb-1">Route</div>
            <div className="font-mono text-xs truncate">{route || "N/A"}</div>
          </div>
        </div>

        {/* Domain */}
        {domain && domain !== "N/A" && (
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
              <Link className="h-3 w-3" />
              Domain
            </div>
            <a 
              href={`https://${domain}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-sm text-blue-400 hover:underline"
            >
              {domain}
            </a>
          </div>
        )}

        {/* Dates */}
        {(asn?.created || asn?.updated) && (
          <div className="grid grid-cols-2 gap-2">
            {asn.created && (
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created
                </div>
                <div className="text-xs">{asn.created}</div>
              </div>
            )}
            {asn.updated && (
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Updated
                </div>
                <div className="text-xs">{asn.updated}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </InfoCard>
  )
}
