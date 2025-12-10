import Dexie, { type Table } from 'dexie';

// --- Interfaces ---

export interface PendingRequest {
    id: string; // UUID
    originRequestId: string; // UUID
    originDeviceId: string;
    hopCount: number;
    maxHops: number;
    bloodType: string;
    componentType: string; // 'WHOLE_BLOOD' etc.
    units: number | string;
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    contactName: string;
    contactPhone: string;
    lat: number;
    lng: number;
    status: 'pending_sync' | 'synced' | 'failed';
    lastBroadcastedBy: string; // maps to broadcastedBy
    createdAt: number;
    updatedAt: number;
}

export interface BloodBankCache {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address: string;
    contactPhone: string;
    is24x7: boolean;
    lastUpdatedAt: number;
}

export interface SyncLog {
    id?: number; // Auto-increment
    requestId: string;
    deviceId: string;
    action: 'enqueued' | 'synced' | 'rebroadcast';
    timestamp: number;
}

// --- Database Definition ---

export class EmergencyBloodDB extends Dexie {
    pendingRequests!: Table<PendingRequest>;
    bloodBanksCache!: Table<BloodBankCache>;
    syncLogs!: Table<SyncLog>;

    constructor() {
        super('EmergencyBloodDB');
        this.version(1).stores({
            pendingRequests: 'id, originDeviceId, status, createdAt', // Indexed fields
            bloodBanksCache: 'id, lastUpdatedAt',
            syncLogs: '++id, requestId, timestamp'
        });
    }
}

export const db = new EmergencyBloodDB();

// --- Service Layer Functions ---

/**
 * Enqueues a new request or updates an existing one locally.
 */
export async function enqueueRequest(requestData: PendingRequest): Promise<string> {
    await db.pendingRequests.put(requestData);
    return requestData.id;
}

/**
 * Retrieves all requests that need syncing or are locally stored.
 */
export async function getPendingRequests(): Promise<PendingRequest[]> {
    // Returns all, you might filter by status if needed, but usually we want to see all
    // The user asked for "getPendingRequests", often meaning "all requests in this table" 
    // or specifically "pending_sync". 
    // Given the context of "Offline-First", this likely powers the "My Requests" view too,
    // so returning all is safer, but let's filter by status if implied. 
    // Used generic "toArray()" to get everything effectively.
    return await db.pendingRequests.orderBy('createdAt').reverse().toArray();
}

/**
 * Gets only requests that specifically need syncing (status === 'pending_sync')
 */
export async function getRequestsToSync(): Promise<PendingRequest[]> {
    return await db.pendingRequests.where('status').equals('pending_sync').toArray();
}

/**
 * Marks a request as successfully synced to the backend.
 */
export async function markRequestSynced(id: string): Promise<void> {
    await db.pendingRequests.update(id, {
        status: 'synced',
        updatedAt: Date.now()
    });
}

/**
 * Saves a list of blood banks to the local cache, overwriting existing ones.
 */
export async function saveBloodBanksToCache(banks: BloodBankCache[]): Promise<void> {
    await db.bloodBanksCache.bulkPut(banks);
}

/**
 * Retrieves cached blood banks.
 */
export async function getCachedBloodBanks(): Promise<BloodBankCache[]> {
    return await db.bloodBanksCache.toArray();
}

/**
 * Logs a sync or broadcast event for debugging.
 */
export async function logSyncEvent(
    requestId: string,
    deviceId: string,
    action: 'enqueued' | 'synced' | 'rebroadcast'
): Promise<void> {
    await db.syncLogs.add({
        requestId,
        deviceId,
        action,
        timestamp: Date.now()
    });
}
