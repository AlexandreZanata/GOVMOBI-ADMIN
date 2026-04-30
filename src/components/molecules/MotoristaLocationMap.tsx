"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MotoristaLocationMapProps {
  position: {
    lat: number;
    lng: number;
    atualizadoEm: string;
  };
  driverName: string;
}

const driverIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Smoothly pans the map to the new position whenever it changes. */
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng], { animate: true, duration: 0.5 });
  }, [map, lat, lng]);
  return null;
}

export default function MotoristaLocationMap({
  position,
  driverName,
}: MotoristaLocationMapProps) {
  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={15}
      scrollWheelZoom={true}
      className="h-64 w-full rounded-xl border border-neutral-200 shadow-sm"
      style={{ minHeight: "256px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater lat={position.lat} lng={position.lng} />
      <Marker position={[position.lat, position.lng]} icon={driverIcon}>
        <Popup>
          <div className="p-2">
            <p className="font-semibold text-sm">Posição do motorista</p>
            <p className="text-xs text-neutral-600 mt-1">CNH: {driverName}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {new Date(position.atualizadoEm).toLocaleString()}
            </p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
