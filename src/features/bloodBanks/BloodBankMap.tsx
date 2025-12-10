import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { BloodBank } from './useBloodBanks'; // Interface
import { Icon } from 'leaflet';
import { useEffect } from 'react';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import markerIconShadow from "leaflet/dist/images/marker-shadow.png"

// Fix Leaflet Default Icon
const defaultIcon = new Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface Props {
    banks: BloodBank[];
    userLat?: number;
    userLng?: number;
}

// Helper to re-center map
function Recenter({ lat, lng }: { lat: number, lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
}

export function BloodBankMap({ banks, userLat, userLng }: Props) {
    const centerLat = userLat || (banks.length > 0 ? banks[0].lat : 12.9716); // Default Bangalore
    const centerLng = userLng || (banks.length > 0 ? banks[0].lng : 77.5946);

    return (
        <div className="h-64 md:h-80 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
            <MapContainer center={[centerLat, centerLng]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {userLat && userLng && (
                    <>
                        <Marker position={[userLat, userLng]} icon={defaultIcon}>
                            <Popup>You are here</Popup>
                        </Marker>
                        <Recenter lat={userLat} lng={userLng} />
                    </>
                )}

                {banks.map(bank => (
                    <Marker key={bank.id} position={[bank.lat, bank.lng]} icon={defaultIcon}>
                        <Popup>
                            <strong>{bank.name}</strong><br />
                            {bank.address}<br />
                            <a href={`tel:${bank.contactPhone}`}>{bank.contactPhone}</a>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
