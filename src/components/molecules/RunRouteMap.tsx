"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

export interface RunRouteMapProps {
  origem: { lat: number; lng: number; endereco: string | null };
  destino: { lat: number; lng: number; endereco: string | null };
  routeGeometry?: [number, number][];
}

const originIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const destIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FitBounds({ origem, destino }: { origem: [number, number]; destino: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = new LatLngBounds([origem, destino]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, origem, destino]);
  return null;
}

export default function RunRouteMap({ origem, destino, routeGeometry }: RunRouteMapProps) {
  const center: [number, number] = [
    (origem.lat + destino.lat) / 2,
    (origem.lng + destino.lng) / 2,
  ];

  const straightLine: [number, number][] = [
    [origem.lat, origem.lng],
    [destino.lat, destino.lng],
  ];

  const polyline = routeGeometry && routeGeometry.length > 0 ? routeGeometry : straightLine;

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-xl border border-neutral-200 shadow-sm"
      style={{ minHeight: "288px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds origem={[origem.lat, origem.lng]} destino={[destino.lat, destino.lng]} />

      {/* Route line */}
      <Polyline
        positions={polyline}
        pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.85, dashArray: routeGeometry ? undefined : "8 6" }}
      />

      {/* Origin marker */}
      <Marker position={[origem.lat, origem.lng]} icon={originIcon}>
        <Popup>
          <div className="p-1">
            <p className="text-xs font-semibold text-neutral-900">Origem</p>
            <p className="mt-0.5 text-xs text-neutral-600">{origem.endereco ?? `${origem.lat.toFixed(5)}, ${origem.lng.toFixed(5)}`}</p>
          </div>
        </Popup>
      </Marker>

      {/* Destination marker */}
      <Marker position={[destino.lat, destino.lng]} icon={destIcon}>
        <Popup>
          <div className="p-1">
            <p className="text-xs font-semibold text-neutral-900">Destino</p>
            <p className="mt-0.5 text-xs text-neutral-600">{destino.endereco ?? `${destino.lat.toFixed(5)}, ${destino.lng.toFixed(5)}`}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
