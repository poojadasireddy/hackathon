import { useState, useEffect } from 'react';
// import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
// import { db } from '../../lib/firebase';
// import { saveBloodBanksToCache, getCachedBloodBanks } from '../../lib/offlineStore';
import type { BloodBankCache } from '../../lib/offlineStore';

export interface BloodBank extends BloodBankCache {
    distance?: number; // Calculated at runtime
}

// Distance calc helper
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

// Real Data Import
import { HYDERABAD_BANKS } from '../../data/hyderabadBloodBanks';

const MOCK_BANKS = HYDERABAD_BANKS;

export function useBloodBanks(userLat: number | undefined, userLng: number | undefined) {
    const [banks, setBanks] = useState<BloodBank[]>(MOCK_BANKS);
    const [loading, setLoading] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    // FORCE MOCK / OFFLINE
    // Mock Fetch regardless of online status
    const onlineData = MOCK_BANKS;

    // Save to cache (DISABLED FOR STABILITY)
    // await saveBloodBanksToCache(onlineData);
    useEffect(() => {
        // Simulate heavy load
        const timer = setTimeout(() => {
            setBanks(MOCK_BANKS);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // // Calculate distance when banks or user location changes
    // const banksWithDistance = banks.map(b => {
    //     if (userLat && userLng) {
    //         return {
    //             ...b,
    //             distance: getDistanceFromLatLonInKm(userLat, userLng, b.lat, b.lng)
    //         };
    //     }
    //     return b;
    // }).sort((a, b) => (a.distance || 9999) - (b.distance || 9999));

    return {
        banks: banks, // banksWithDistance
        loading,
        isOfflineMode
    };
}
