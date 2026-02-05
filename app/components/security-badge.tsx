"use client"

import { Badge, badgeVariants } from "@/ui/badge"
import { cn } from "@/lib/utils"

interface SecurityBadgeProps {
  isTor: boolean
  isVpn: boolean
  isProxy: boolean
  isDatacenter: boolean
  score: number
}

export function SecurityBadge({
  isTor,
  isVpn,
  isProxy,
  isDatacenter,
  score
}: SecurityBadgeProps) {
  const badges = []

  if (isTor) {
    badges.push(
      <Badge key="tor" variant="danger" className="gap-1">
        🔴 Tor Exit Node
      </Badge>
    )
  }

  if (isVpn) {
    badges.push(
      <Badge key="vpn" variant="warning" className="gap-1">
        🟡 VPN Detected
      </Badge>
    )
  }

  if (isProxy) {
    badges.push(
      <Badge key="proxy" variant="warning" className="gap-1">
        🟡 Proxy
      </Badge>
    )
  }

  if (isDatacenter) {
    badges.push(
      <Badge key="dc" className="gap-1 bg-blue-500 hover:bg-blue-600">
        🔵 Datacenter
      </Badge>
    )
  }

  if (score > 75) {
    badges.push(
      <Badge key="high" variant="danger" className="gap-1">
        🔴 High Threat ({score}%)
      </Badge>
    )
  } else if (score > 25) {
    badges.push(
      <Badge key="med" variant="warning" className="gap-1">
        🟡 Medium ({score}%)
      </Badge>
    )
  } else {
    badges.push(
      <Badge key="low" variant="success" className="gap-1">
        🟢 Low Risk
      </Badge>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.length > 0 ? badges : <span className="text-muted-foreground">No security indicators</span>}
    </div>
  )
}
