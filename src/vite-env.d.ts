/// <reference types="vite/client" />

/// Web Bluetooth API Types
interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>;
    device: BluetoothDevice;
    connected: boolean;
    disconnect(): void;
}

interface Bluetooth {
    requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
}

interface RequestDeviceOptions {
    filters?: BluetoothLEScanFilter[];
    optionalServices?: (BluetoothServiceUUID)[];
    acceptAllDevices?: boolean;
}

interface BluetoothLEScanFilter {
    name?: string;
    namePrefix?: string;
    services?: (BluetoothServiceUUID)[];
}

type BluetoothServiceUUID = number | string;

interface Navigator {
    bluetooth: Bluetooth;
}
