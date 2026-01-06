'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Apply the custom icon globally to all Markers
L.Marker.prototype.options.icon = DefaultIcon;

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

export default function PropertyMap({ latitude, longitude, title }: PropertyMapProps) {
  // Leaflet relies on the window object, so we need to ensure this only runs on client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[400px] w-full bg-muted rounded-lg animate-pulse" />;
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border">
        <MapContainer 
            center={[latitude, longitude]} 
            zoom={15} 
            scrollWheelZoom={false} 
            className="h-[400px] w-full z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]}>
                <Popup>
                    {title}
                </Popup>
            </Marker>
        </MapContainer>
    </div>
  );
}
