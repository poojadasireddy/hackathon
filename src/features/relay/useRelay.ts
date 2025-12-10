import { useState, useCallback } from 'react';
import { db } from '../../lib/firebase'; // For online sync check if needed, though mostly we use offlineStore
import {
    getPendingRequests,
    enqueueRequest,
    logSyncEvent,
    getRequestsToSync,
    markRequestSynced,
    PendingRequest
} from '../../lib/offlineStore';
import { EmergencyRequest } from '../../types/emergency';
import { compressRequest, parsePayload } from './qrUtils';
import { collection, addDoc } from 'firebase/firestore';

// Helper to get device ID (duplicated from useEmergencyRequest - ideally move to shared lib)
function getDeviceId() {
    let deviceId = localStorage.getItem('blood_req_device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('blood_req_device_id', deviceId);
    }
    return deviceId;
}

export function useRelay() {
    const [deviceRequests, setDeviceRequests] = useState<PendingRequest[]>([]);
    const [logs, setLogs] = useState<string[]>([]);

    const deviceId = getDeviceId();

    // Load requests from Dexie
    const loadRequests = useCallback(async () => {
        const reqs = await getPendingRequests();
        setDeviceRequests(reqs);
    }, []);

    // 1. Broadcast Logic (Simulated)
    const generateBroadcastPayload = (req: PendingRequest): string => {
        // Convert PendingRequest (Dexie) to EmergencyRequest (Type) for compression tool
        // They are almost identical structure-wise for these fields
        const emergencyReq: any = {
            ...req,
            location: { lat: req.lat, lng: req.lng }
        };

        // Log intent
        logSyncEvent(req.id, deviceId, 'rebroadcast');

        return compressRequest(emergencyReq);
    };

    // 2. Receive Logic
    const handleReceivePayload = async (payloadStr: string): Promise<{ success: boolean; message: string }> => {
        const parsed = parsePayload(payloadStr);

        if (!parsed) {
            return { success: false, message: "Invalid payload format." };
        }

        // TTL Check (48 hours)
        const TTL = 48 * 60 * 60 * 1000;
        if (Date.now() - parsed.createdAt! > TTL) {
            return { success: false, message: "Request expired (TTL)." };
        }

        // Loop Prevention: Check if we already have this Origin Request ID
        const existing = await getPendingRequests();
        const isDuplicate = existing.some(r => r.originRequestId === parsed.id || r.id === parsed.id);

        if (isDuplicate) {
            return { success: false, message: "Request already exists on this device." };
        }

        // Hop Limit Check
        if ((parsed.hopCount || 0) >= (parsed.maxHops || 5)) {
            return { success: false, message: "Max hops reached for this request." };
        }

        // Save to Dexie
        const newHopCount = (parsed.hopCount || 0) + 1;

        const newRequest: PendingRequest = {
            id: parsed.id!, // Keep original ID to track it
            originRequestId: parsed.id!, // Keep track of origin
            originDeviceId: parsed.originDeviceId!,
            hopCount: newHopCount,
            maxHops: parsed.maxHops || 5,
            bloodType: parsed.bloodType!,
            componentType: parsed.componentType!,
            units: parsed.units!,
            urgency: parsed.urgency!,
            contactName: parsed.contactName || "Relayed",
            contactPhone: parsed.contactPhone || "",
            lat: parsed.location!.lat,
            lng: parsed.location!.lng,
            status: 'pending_sync', // Needs to be synced to cloud
            lastBroadcastedBy: deviceId, // We are now the holder
            createdAt: parsed.createdAt!,
            updatedAt: Date.now()
        };

        await enqueueRequest(newRequest);
        await logSyncEvent(newRequest.id, deviceId, 'enqueued');

        // Refresh local list
        await loadRequests();

        return { success: true, message: `Request received! Hops: ${newHopCount}` };
    };

    // 3. Online Sync Logic (Triggered manually or by online event)
    const triggerSync = async () => {
        if (!navigator.onLine) return { success: false, message: "Device is offline." };

        const toSync = await getRequestsToSync();
        if (toSync.length === 0) return { success: true, message: "Nothing to sync." };

        let syncedCount = 0;
        for (const req of toSync) {
            try {
                // Post to Firestore
                // We add a specific field 'relayedBy' or similar to indicate it came from offline mesh
                await addDoc(collection(db, 'requests'), {
                    ...req,
                    location: { lat: req.lat, lng: req.lng }, // Remap structure
                    syncedFromDeviceId: deviceId,
                    syncMethod: 'BATCH_UPLOAD'
                });

                await markRequestSynced(req.id);
                await logSyncEvent(req.id, deviceId, 'synced');
                syncedCount++;
            } catch (e) {
                console.error("Sync failed for", req.id, e);
            }
        }

        await loadRequests();
        return { success: true, message: `Synced ${syncedCount} requests.` };
    };

    return {
        deviceRequests,
        deviceId,
        loadRequests,
        generateBroadcastPayload,
        handleReceivePayload,
        triggerSync
    };
}
