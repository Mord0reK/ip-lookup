"use client"

import { MapPin, Navigation } from "lucide-react"
import dynamic from "next/dynamic"

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

interface LocationMapProps {
  latitude: number
  longitude: number
  city: string
  country: string
  ip: string
}

export function LocationMap({
  latitude,
  longitude,
  city,
  country,
  ip
}: LocationMapProps) {
  const hasLocation = latitude !== 0 && longitude !== 0

  if (!hasLocation) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Brak lokalizacji</p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-0 h-full w-full [&_.leaflet-tile]:filter [&_.leaflet-tile]:invert [&_.leaflet-tile]:hue-rotate-180 [&_.leaflet-tile]:brightness-95 [&_.leaflet-tile]:contrast-90">
      <MapContainer
        center={[latitude, longitude]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-sm font-medium">
              {city}, {country}
              <br />
              <span className="font-mono text-xs text-muted-foreground">{ip}</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
