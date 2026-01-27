import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '../context/SocketContext';
import L from 'leaflet';
import { Navigation, Truck } from 'lucide-react';

// Fix Leaflet Default Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Truck Icon
const truckIcon = new L.DivIcon({
  html: `<div style="background-color: white; padding: 5px; border-radius: 50%; border: 2px solid #16a34a; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
         </div>`,
  className: 'custom-truck-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16] 
});

const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], 15);
    }, [lat, lng, map]);
    return null;
}

const LiveTrackingMap = ({ pickupId, initialLat, initialLng }) => {
  const { socket } = useSocket();
  const [position, setPosition] = useState([initialLat || 28.6139, initialLng || 77.2090]); // Default Delhi or passed prop
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    if (!socket || !pickupId) return;

    // Join the specific pickup tracking room
    socket.emit('join_pickup', pickupId);

    socket.on('location_updated', (data) => {
        if (data.pickupId === pickupId) {
            console.log("Map received update:", data);
            setPosition([data.lat, data.lng]);
            setHasUpdate(true);
        }
    });

    return () => {
        socket.off('location_updated');
    };
  }, [socket, pickupId]);

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Collector Marker */}
            <Marker position={position} icon={truckIcon}>
                <Popup>
                    Collector is here! <br /> {hasUpdate ? 'Live Updates Active' : 'Waiting for GPS...'}
                </Popup>
            </Marker>

            {hasUpdate && <RecenterMap lat={position[0]} lng={position[1]} />}
        </MapContainer>
        
        <div className="absolute bottom-4 left-4 z-[400] bg-white p-2 rounded-lg shadow-md text-xs font-bold text-green-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LIVE TRACKING ACTIVE
        </div>
    </div>
  );
};

export default LiveTrackingMap;
