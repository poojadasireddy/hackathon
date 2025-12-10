import { useState, useEffect } from 'react';
// import { collection, addDoc, Timestamp } from 'firebase/firestore';
// import { db } from '../../lib/firebase';
import { enqueueRequest } from '../../lib/offlineStore';
import { EmergencyRequest, BloodType, ComponentType, UrgencyLevel } from '../../types/emergency';

// Simple UUID generator fallback
function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Helper to get or create a persistent device ID
function getDeviceId() {
    let deviceId = localStorage.getItem('blood_req_device_id');
    if (!deviceId) {
        deviceId = generateUUID();
        localStorage.setItem('blood_req_device_id', deviceId);
    }
    return deviceId;
}

export interface EmergencyFormState {
    bloodType: BloodType;
    componentType: ComponentType;
    units: number;
    urgency: UrgencyLevel;
    patientName: string;
    contactName: string;
    contactPhone: string;
    notes: string;
}

const INITIAL_STATE: EmergencyFormState = {
    bloodType: 'O+',
    componentType: 'WHOLE_BLOOD',
    units: 1,
    urgency: 'HIGH',
    patientName: '',
    contactName: '',
    contactPhone: '',
    notes: ''
};

export function useEmergencyRequest() {
    const [formData, setFormData] = useState<EmergencyFormState>(INITIAL_STATE);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; mode: 'ONLINE' | 'OFFLINE' } | null>(null);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Get Location on mount
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => setLocationError("Unable to retrieve location. Please enable GPS.")
            );
        } else {
            setLocationError("Geolocation is not supported by this browser.");
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location) {
            alert("Location is required. Please enable GPS.");
            return;
        }

        setIsSubmitting(true);
        setSubmitResult(null);

        const deviceId = getDeviceId();
        const requestId = generateUUID();
        const timestamp = Date.now();

        const requestData: EmergencyRequest = {
            id: requestId,
            requesterId: 'anonymous', // pending auth implementation
            originDeviceId: deviceId,
            bloodType: formData.bloodType,
            componentType: formData.componentType,
            units: Number(formData.units),
            urgency: formData.urgency,
            patientName: formData.patientName,
            contactName: formData.contactName,
            contactPhone: formData.contactPhone,
            notes: formData.notes,
            location: {
                lat: location.lat,
                lng: location.lng
            },
            status: 'OPEN',
            createdAt: timestamp,
            updatedAt: timestamp,
            isSynced: isOnline,
            hopCount: 0,
            maxHops: 5,
            broadcastedBy: []
        };

        try {
            // FORCE OFFLINE FOR DEBUGGING - BYPASS FIREBASE IMPORTS
            // We use standard try-catch but only execute offline logic

            // OFFLINE FLOW
            await enqueueRequest({
                ...requestData,
                originRequestId: requestData.id,
                lat: location.lat,
                lng: location.lng,
                status: 'pending_sync',
                lastBroadcastedBy: deviceId
            });

            setSubmitResult({ success: true, message: "Request saved offline. Will sync when internet is available.", mode: 'OFFLINE' });

            // Reset form
            setFormData(INITIAL_STATE);

        } catch (error) {
            console.error("Error submitting request:", error);
            setSubmitResult({ success: false, message: "Failed to submit request. Please try again.", mode: isOnline ? 'ONLINE' : 'OFFLINE' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        location,
        locationError,
        isOnline,
        isSubmitting,
        submitResult,
        handleChange,
        handleSubmit
    };
}
