"use client"

import { Shield, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, Smartphone, Server, Eye } from "lucide-react"
import { InfoCard } from "./info-card"
import { Badge } from "@/ui/badge"
import { Progress } from "@/ui/progress"

interface SecurityCardProps {
  abuseScore: number
  totalReports?: number | null
  isTor: boolean
  isVpn: boolean
  isProxy: boolean
  isDatacenter: boolean
  isWhitelisted: boolean
  usageType: string
  isAbuser: boolean
  isMobile: boolean
  isBogon: boolean
}

export function SecurityCard({
  abuseScore,
  totalReports,
  isTor,
  isVpn,
  isProxy,
  isDatacenter,
  isWhitelisted,
  usageType,
  isAbuser,
  isMobile,
  isBogon
}: SecurityCardProps) {
  const getThreatInfo = () => {
    if (abuseScore > 75) return { 
      icon: <ShieldX className="h-5 w-5" />, 
      label: "High Threat", 
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    }
    if (abuseScore > 25) return { 
      icon: <ShieldAlert className="h-5 w-5" />, 
      label: "Medium Risk", 
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    }
    return { 
      icon: <ShieldCheck className="h-5 w-5" />, 
      label: "Clean", 
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    }
  }

  const threat = getThreatInfo()

  const indicators = [
    { label: "Tor", value: isTor, color: "bg-red-500" },
    { label: "VPN", value: isVpn, color: "bg-yellow-500" },
    { label: "Proxy", value: isProxy, color: "bg-yellow-500" },
    { label: "Datacenter", value: isDatacenter, color: "bg-blue-500" },
    { label: "Abuser", value: isAbuser, color: "bg-red-500" },
    { label: "Mobile", value: isMobile, color: "bg-green-500" },
    { label: "Bogon", value: isBogon, color: "bg-red-500" },
  ].filter(i => i.value)

  return (
    <InfoCard
      title="Security"
      icon={<Shield className="h-5 w-5" />}
    >
      <div className="space-y-4">
        {/* Threat Score */}
        <div className={`p-3 rounded-lg border ${threat.bgColor} ${threat.borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${threat.color}`}>
              {threat.icon}
              <span className="font-semibold">{threat.label}</span>
            </div>
            <span className={`text-2xl font-bold ${threat.color}`}>{abuseScore}%</span>
          </div>
          <Progress value={abuseScore} className="h-1.5" />
        </div>

        {/* Security Indicators */}
        {indicators.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {indicators.map((ind) => (
              <Badge 
                key={ind.label} 
                variant="secondary"
                className={`${ind.color.replace('bg-', 'bg-opacity-20 text-')}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ind.color} mr-1.5`} />
                {ind.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-muted-foreground text-xs mb-1">Total Reports</div>
            <div className="font-semibold">{totalReports ?? "N/A"}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-muted-foreground text-xs mb-1">Usage Type</div>
            <div className="font-medium text-xs truncate">{usageType || "N/A"}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-muted-foreground text-xs mb-1">Whitelisted</div>
            <div className="font-semibold">{isWhitelisted ? "Yes ✓" : "No"}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-muted-foreground text-xs mb-1">Risk Level</div>
            <div className={`font-semibold ${threat.color}`}>
              {abuseScore > 75 ? "High" : abuseScore > 25 ? "Medium" : "Low"}
            </div>
          </div>
        </div>
      </div>
    </InfoCard>
  )
}
