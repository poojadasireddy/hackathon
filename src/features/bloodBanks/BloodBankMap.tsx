import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BloodBank } from './useBloodBanks';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import markerIconShadow from "leaflet/dist/images/marker-shadow.png"

// Fix Leaflet Icon
const DefaultIcon = L.icon({
    iconUrl: markerIconPng,
    shadowUrl: markerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
    banks: BloodBank[];
    userLat?: number;
    userLng?: number;
    onBankClick?: (bank: BloodBank) => void;
}

export function BloodBankMap({ banks, userLat, userLng, onBankClick }: Props) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const defaultLat = 17.3850;
        const defaultLng = 78.4867; // Hyderabad Center

        const map = L.map(mapContainerRef.current).setView(
            [userLat || defaultLat, userLng || defaultLng],
            12
        );

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Update Markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // User Location
        if (userLat && userLng) {
            const userMarker = L.marker([userLat, userLng])
                .addTo(map)
                .bindPopup("You are here");
            // User marker color override if possible, or just standard
            markersRef.current.push(userMarker);
        }

        // Bank Markers
        banks.forEach(bank => {
            const marker = L.marker([bank.lat, bank.lng])
                .addTo(map)
                .bindPopup(`
                    <div style="font-family: sans-serif;">
                        <strong>${bank.name}</strong><br/>
                        ${bank.address}
                    </div>
                `);

            marker.on('click', () => {
                if (onBankClick) onBankClick(bank);
            });

            markersRef.current.push(marker);
        });

    }, [banks, userLat, userLng, onBankClick]);

    // Recenter effect
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (map && userLat && userLng) {
            // map.flyTo([userLat, userLng], 13);
        }
    }, [userLat, userLng]);


    return (
        <div
            ref={mapContainerRef}
            className="w-full h-full text-black z-0"
            style={{ minHeight: '400px' }}
        />
    );
}
