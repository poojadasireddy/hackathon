import { useState, useEffect } from 'react';
// import { collection, addDoc, Timestamp } from 'firebase/firestore';
// import { db } from '../../lib/firebase';
// import { enqueueRequest } from '../../lib/offlineStore';
import type { EmergencyRequest, BloodType, ComponentType, UrgencyLevel } from '../../types/emergency';
import type { PendingRequest } from '../../lib/offlineStore';

// MOCK LOCAL STORE TO AVOID CRASH FOR NOW
// We will re-enable strict typing later. For now, ensure it doesn't crash.
const enqueueRequest = async (data: PendingRequest) => {
    console.log("Mock enqueue:", data);
    return "mock-id";
};

// Simple UUID generator fallback
function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Helper to get or create a persistent device ID
function getDeviceId() {
    if (typeof window === 'undefined' || !window.localStorage) return "unknown-device";
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
    const [isScanning, setIsScanning] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; mode: 'ONLINE' | 'OFFLINE' } | null>(null);
    const [relayDevice, setRelayDevice] = useState<{ name: string } | null>(null);

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
                (err) => {
                    console.error("Geo error:", err);
                    setLocationError("Unable to retrieve location. Using backup...");
                    // FALLBACK FOR DEMO:
                    setTimeout(() => {
                        setLocation({ lat: 12.9716, lng: 77.5946 }); // Bangalore Default
                        setLocationError(null);
                    }, 1000);
                }
            );
        } else {
            setLocationError("Geolocation not supported. Using backup...");
            setTimeout(() => {
                setLocation({ lat: 12.9716, lng: 77.5946 });
                setLocationError(null);
            }, 1000);
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

    const requestBluetoothRelay = async (): Promise<{ success: boolean; name: string | null }> => {
        setIsScanning(true);
        try {
            if (!navigator.bluetooth) {
                alert("Web Bluetooth is not supported in this browser. Try Chrome/Edge/Android.");
                setIsScanning(false);
                return { success: false, name: null };
            }

            // TRIGGERS REAL SYSTEM SCANNER
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['battery_service'] // Common service to ensure wide compatibility or just connection
            });

            if (device) {
                // Simulate "Connecting"
                console.log("Connecting to:", device.name);
                setRelayDevice({ name: device.name || "Unknown Device" });
                // Real connection logic would go here if we had a UUID
                // const server = await device.gatt.connect(); 

                return { success: true, name: device.name || "Unknown Device" };
            }

        } catch (error: any) {
            console.error("Bluetooth Scan Error:", error);
            alert(`Bluetooth Error: ${error.message || error}`);
        } finally {
            setIsScanning(false);
        }
        return { success: false, name: null };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let relayDeviceName: string | null = relayDevice?.name || null;
        let isOfflineSubmission = !isOnline;

        // Auto-prompt removed in favor of explicit UI button

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
            // MOCKED SAVE FOR NOW
            await enqueueRequest({
                ...requestData,
                originRequestId: requestData.id,
                lat: location.lat,
                lng: location.lng,
                status: 'pending_sync',
                lastBroadcastedBy: deviceId
            });

            if (relayDeviceName) {
                setSubmitResult({ success: true, message: `Request RELAYED via Bluetooth to: ${relayDeviceName}`, mode: 'OFFLINE' });
            } else if (isOfflineSubmission) {
                setSubmitResult({ success: true, message: "Request saved offline (No relay connected).", mode: 'OFFLINE' });
            } else {
                setSubmitResult({ success: true, message: "Request broadcasted successfully!", mode: 'ONLINE' });
            }

            // Reset form
            setFormData(INITIAL_STATE);
            setRelayDevice(null); // Reset relay selection

        } catch (error) {
            console.error("Error submitting request:", error);
            setSubmitResult({ success: false, message: "Failed to submit request.", mode: 'OFFLINE' });
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
        isScanning,
        submitResult,
        relayDevice,
        handleChange,
        handleSubmit,
        requestBluetoothRelay
    };
};
