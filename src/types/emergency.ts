export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ComponentType = 'WHOLE_BLOOD' | 'PLATELETS' | 'PLASMA';
export type RequestStatus = 'OPEN' | 'FULFILLED' | 'EXPIRED';

export interface EmergencyRequest {
    id: string;
    requesterId: string; // User ID or 'anonymous'
    originDeviceId: string;
    bloodType: BloodType;
    componentType: ComponentType;
    units: number;
    urgency: UrgencyLevel;
    patientName: string;
    contactName: string;
    contactPhone: string;
    notes?: string;
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
    status: RequestStatus;
    createdAt: number;
    updatedAt: number;
    // Offline/Relay specific fields
    isSynced: boolean;
    hopCount: number;
    maxHops: number;
    broadcastedBy?: string[]; // IDs of devices that relayed it
}
