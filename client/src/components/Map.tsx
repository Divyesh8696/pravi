import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom HTML Icons
const createCustomIcon = (bgColor: string, svgPath: string) => {
  return new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        background-color: ${bgColor}; 
        color: white; 
        border-radius: 50%; 
        width: 32px; 
        height: 32px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        border: 2px solid white; 
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${svgPath}
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -16],
  });
};

// Truck icon (Purple)
const truckIcon = createCustomIcon(
  '#7c3aed', 
  '<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'
);

// Destination/Plant icon (Amber)
const destIcon = createCustomIcon(
  '#d97706',
  '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>'
);

// Dustbin icon (Green)
const binIcon = createCustomIcon(
  '#059669',
  '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>'
);

interface MapProps {
  center: [number, number];
  points: any[];
  showRoute?: boolean;
  truckIndex?: number;
  destination?: any;
}

export default function Map({ center, points, showRoute, truckIndex, destination }: MapProps) {
  const positions = points.map(p => [p.lat, p.lng] as [number, number]);
  
  // If we have a destination, add a path from the last stop to the destination
  const destPosition = destination ? [destination.lat, destination.lng] as [number, number] : null;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner z-0 relative z-10">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showRoute && positions.length > 0 && (
          <Polyline positions={positions} color="#059669" weight={5} opacity={0.7} />
        )}
        {showRoute && positions.length > 0 && destPosition && (
          <Polyline positions={[positions[positions.length - 1], destPosition]} color="#d97706" weight={4} opacity={0.6} dashArray="10, 10" />
        )}
        {points.map((p, idx) => {
          const isStart = idx === 0;
          const isEnd = idx === points.length - 1;
          const isTruck = p.isTruck || p.assetType === 'VEHICLE' || p.type === 'VEHICLE' || p.vehicleType || idx === truckIndex;
          const isPlant = p.assetType === 'TRANSFER_STATION' || p.type === 'DESTINATION' || p.type === 'PLANT' || p.name?.toLowerCase()?.includes('station') || p.name?.toLowerCase()?.includes('facility');
          
          const iconToUse = isTruck ? truckIcon : (isPlant ? destIcon : binIcon);

          return (
            <Marker 
              key={p._id || idx} 
              position={[p.lat, p.lng]} 
              icon={iconToUse}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
                <div className="text-center font-sans">
                  <div className="font-bold text-gray-800">{p.code || `Asset ${idx+1}`}</div>
                  <div className="text-xs text-gray-600">{p.name || 'Collection Point'}</div>
                  {p.registeredAt && (
                    <div className="text-[10px] text-gray-500 mt-1">Added: {new Date(p.registeredAt).toLocaleDateString()}</div>
                  )}
                  {p.updatedAt && (
                    <div className="text-[10px] text-blue-500 mt-1">Last Update: {new Date(p.updatedAt).toLocaleTimeString()}</div>
                  )}
                  {p.status && (
                    <div className={`text-[10px] font-bold mt-1 ${p.status === 'OVERFLOWING' || p.status === 'BREAKDOWN' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {p.status.replace('_', ' ')}
                    </div>
                  )}
                  {p.condition && p.condition !== 'GOOD' && (
                    <div className="text-[10px] text-amber-600 font-bold mt-1">{p.condition}</div>
                  )}
                </div>
              </Tooltip>
              <Popup>
                <div className="font-sans">
                  <strong className="text-gray-900">{p.code}</strong><br/>
                  <span className="text-gray-600 text-sm">{p.name}</span><br/>
                  
                  {isTruck && (
                    <span className="text-purple-600 font-bold mt-2 inline-block text-xs">🚚 {p.status || 'Active Vehicle'}</span>
                  )}
                  
                  {(!isTruck && p.capacityLitres) && (
                    <>
                      <div className="text-gray-500 text-xs mt-2 border-t pt-2">Capacity: {p.capacityLitres}L</div>
                      <div className="text-gray-500 text-xs">Fill Level: {p.condition}</div>
                      <div className={`text-xs font-bold mt-1 ${p.status === 'OVERFLOWING' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {p.status || 'ACTIVE'}
                      </div>
                    </>
                  )}
                  
                  {p.type === 'COMPLAINT' && (
                    <span className="text-amber-600 font-bold mt-2 inline-block text-xs">⚠️ Reported Issue</span>
                  )}

                  {isStart && !isTruck && <div className="text-blue-600 font-bold mt-2 border-t pt-2 text-xs">🏁 Route Start Point</div>}
                  {isEnd && !isTruck && <div className="text-red-600 font-bold mt-2 border-t pt-2 text-xs">🛑 Route End Point</div>}
                  {p.address && <div className="text-gray-400 text-[10px] mt-2">{p.address}</div>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Destination Marker */}
        {destination && destPosition && (
          <Marker position={destPosition} icon={destIcon}>
            <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
              <div className="text-center font-sans">
                <div className="font-bold text-gray-800">{destination.code}</div>
                <div className="text-xs text-gray-600">{destination.name}</div>
                <div className="text-[10px] text-amber-600 font-bold mt-1">🏭 Transfer Station</div>
              </div>
            </Tooltip>
            <Popup>
              <div className="font-sans">
                <strong className="text-gray-900">{destination.code}</strong><br/>
                <span className="text-gray-600 text-sm">{destination.name}</span><br/>
                <span className="text-amber-700 font-bold mt-2 inline-block text-xs">🏭 Waste Destination</span>
                {destination.capacity && <div className="text-gray-500 text-xs mt-1 border-t pt-1">Daily Cap: {destination.capacity}</div>}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
