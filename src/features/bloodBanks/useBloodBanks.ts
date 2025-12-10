import { useState, useEffect } from 'react';
// import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
// import { db } from '../../lib/firebase';
import { saveBloodBanksToCache, getCachedBloodBanks, BloodBankCache } from '../../lib/offlineStore';

export interface BloodBank extends BloodBankCache {
    distance?: number; // Calculated at runtime
}

// Distance calc helper
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

// Mock Data for Demo if Firestore is empty
const MOCK_BANKS: BloodBankCache[] = [
    { id: '1', name: 'City Hospital Blood Bank', lat: 12.9716, lng: 77.5946, address: 'MG Road, Bangalore', contactPhone: '080-12345678', is24x7: true, lastUpdatedAt: Date.now() },
    { id: '2', name: 'Red Cross Center', lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bangalore', contactPhone: '080-87654321', is24x7: false, lastUpdatedAt: Date.now() },
    { id: '3', name: 'Lifeline Blood Bank', lat: 13.0352, lng: 77.5645, address: 'Malleshwaram, Bangalore', contactPhone: '080-11223344', is24x7: true, lastUpdatedAt: Date.now() }
];

export function useBloodBanks(userLat: number | undefined, userLng: number | undefined) {
    const [banks, setBanks] = useState<BloodBank[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    useEffect(() => {
        async function fetchBanks() {
            setLoading(true);
            try {
                // FORCE MOCK / OFFLINE
                // Mock Fetch regardless of online status
                const onlineData = MOCK_BANKS;

                // Save to cache
                await saveBloodBanksToCache(onlineData);
                setBanks(onlineData);
                setIsOfflineMode(false); // Or true, but data is there

            } catch (err) {
                console.error("Error fetching blood banks", err);
                // Try cache
                const cached = await getCachedBloodBanks();
                setBanks(cached);
                setIsOfflineMode(true);
            } finally {
                setLoading(false);
            }
        }
        fetchBanks();
    }, []);

    // Calculate distance when banks or user location changes
    const banksWithDistance = banks.map(b => {
        if (userLat && userLng) {
            return {
                ...b,
                distance: getDistanceFromLatLonInKm(userLat, userLng, b.lat, b.lng)
            };
        }
        return b;
    }).sort((a, b) => (a.distance || 9999) - (b.distance || 9999));

    return {
        banks: banksWithDistance,
        loading,
        isOfflineMode
    };
}
