import type { EmergencyRequest, BloodType, ComponentType, UrgencyLevel } from "../../types/emergency";

/**
 * Minimized payload structure for QR codes to keep size manageable.
 */
export interface CompactRequestPayload {
    i: string; // id
    oi: string; // originRequestId
    od: string; // originDeviceId
    bt: string; // bloodType
    ct: string; // componentType (shortened)
    u: number; // units
    urg: string; // urgency
    l: [number, number]; // [lat, lng]
    ts: number; // createdAt
    hc: number; // hopCount
}

/**
 * Compresses an EmergencyRequest into a compact payload for QR/Bluetooth.
 */
export function compressRequest(req: EmergencyRequest): string {
    const payload: CompactRequestPayload = {
        i: req.id,
        oi: req.id, // In a relay scenario, we might need to track the *original* request ID differently if we were mutating IDs, but usually ID is static.
        // However, the interface asks for originRequestId. In our schema they are the same for the creator.
        od: req.originDeviceId,
        bt: req.bloodType,
        ct: req.componentType === 'WHOLE_BLOOD' ? 'wb' : (req.componentType === 'PLATELETS' ? 'pl' : 'pa'),
        u: req.units,
        urg: req.urgency === 'CRITICAL' ? 'c' : (req.urgency === 'HIGH' ? 'h' : (req.urgency === 'MEDIUM' ? 'm' : 'l')),
        l: [Number(req.location.lat.toFixed(5)), Number(req.location.lng.toFixed(5))],
        ts: req.createdAt,
        hc: req.hopCount
    };
    return JSON.stringify(payload);
}

/**
 * Parses a compact string back into a partial EmergencyRequest object equivalent.
 */
export function parsePayload(jsonStr: string): Partial<EmergencyRequest> | null {
    try {
        const p = JSON.parse(jsonStr) as CompactRequestPayload;

        // Map back shortened values
        let componentType: ComponentType = 'WHOLE_BLOOD';
        if (p.ct === 'pl') componentType = 'PLATELETS';
        if (p.ct === 'pa') componentType = 'PLASMA';

        let urgency: UrgencyLevel = 'LOW';
        if (p.urg === 'c') urgency = 'CRITICAL';
        if (p.urg === 'h') urgency = 'HIGH';
        if (p.urg === 'm') urgency = 'MEDIUM';

        return {
            id: p.i,
            // For a relayed request, the originRequestId is crucial for deduplication
            // We'll treat p.oi as the ground truth for origin
            originDeviceId: p.od,
            bloodType: p.bt as BloodType,
            componentType,
            units: p.u,
            urgency,
            location: {
                lat: p.l[0],
                lng: p.l[1]
            },
            createdAt: p.ts,
            hopCount: p.hc,
            // Default values for fields not in QR
            status: 'OPEN',
            requesterId: 'unknown',
            patientName: 'Unknown (Relayed)',
            contactName: 'See App',
            contactPhone: '',
            isSynced: false,
            maxHops: 5,
            broadcastedBy: []
        };
    } catch (e) {
        console.error("Failed to parse QR payload", e);
        return null;
    }
}
