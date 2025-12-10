import { useEffect, useState } from 'react';
import { useRelay } from './useRelay';
import { QRCodeSVG } from 'qrcode.react';
import { Bluetooth, RefreshCw, Smartphone, Download } from 'lucide-react';
import clsx from 'clsx';
import type { PendingRequest } from '../../lib/offlineStore';

export function RelaySimulator() {
    const {
        deviceRequests,
        deviceId,
        loadRequests,
        generateBroadcastPayload,
        handleReceivePayload,
        triggerSync
    } = useRelay();

    const [activeTab, setActiveTab] = useState<'BROADCAST' | 'RECEIVE'>('BROADCAST');
    const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
    const [generatedQR, setGeneratedQR] = useState<string | null>(null);
    const [pasteInput, setPasteInput] = useState('');
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Load requests on mount
    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleBroadcast = (req: PendingRequest) => {
        setSelectedRequest(req);
        const payload = generateBroadcastPayload(req);
        setGeneratedQR(payload);
        setStatusMsg({ type: 'success', text: "Payload generated! Share via QR or Bluetooth." });
    };

    const handleReceiveSubmit = async () => {
        if (!pasteInput) return;
        const res = await handleReceivePayload(pasteInput);
        setStatusMsg({ type: res.success ? 'success' : 'error', text: res.message });
        if (res.success) {
            setPasteInput('');
        }
    };

    const handleSync = async () => {
        const res = await triggerSync();
        setStatusMsg({ type: res.success ? 'success' : 'error', text: res.message });
        loadRequests();
    };

    // Mock Bluetooth Action
    const handleBluetoothShare = () => {
        // In a real app, this would call navigator.bluetooth.requestDevice()
        // For simulation, we just copy the JSON to clipboard
        if (generatedQR) {
            navigator.clipboard.writeText(generatedQR);
            setStatusMsg({ type: 'success', text: "Simulated Bluetooth Packet copied to clipboard! Paste this on another device to 'Receive'." });
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bluetooth className="w-6 h-6 text-blue-600" />
                    Relay Simulator
                </h2>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">
                    ID: {deviceId.slice(0, 8)}...
                </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('BROADCAST')}
                    className={clsx(
                        "flex-1 py-2 font-medium text-sm border-b-2 transition-colors",
                        activeTab === 'BROADCAST' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    Broadcast / Share
                </button>
                <button
                    onClick={() => setActiveTab('RECEIVE')}
                    className={clsx(
                        "flex-1 py-2 font-medium text-sm border-b-2 transition-colors",
                        activeTab === 'RECEIVE' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    Receive / Scan
                </button>
            </div>

            {/* Status Message */}
            {statusMsg && (
                <div className={clsx(
                    "mb-4 p-3 rounded text-sm",
                    statusMsg.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                )}>
                    {statusMsg.text}
                </div>
            )}

            {/* Broadcast View */}
            {activeTab === 'BROADCAST' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-yellow-50 p-3 rounded text-sm text-yellow-800">
                        <span>Pending Requests: <strong>{deviceRequests.length}</strong></span>
                        <button onClick={() => loadRequests()} className="text-blue-600 underline">Refresh</button>
                    </div>

                    {deviceRequests.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No local requests to share.</p>
                    ) : (
                        <div className="space-y-3">
                            {deviceRequests.map(req => (
                                <div key={req.id}
                                    onClick={() => handleBroadcast(req)}
                                    className={clsx(
                                        "p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors",
                                        selectedRequest?.id === req.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-200"
                                    )}
                                >
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-800">{req.bloodType} {req.componentType}</span>
                                        <span className={clsx("text-xs font-bold px-2 py-0.5 rounded", req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800')}>{req.urgency}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Hops: {req.hopCount} | Status: {req.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {generatedQR && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Scan Code or Share via Bluetooth</h3>
                            <div className="bg-white p-2 rounded shadow-sm">
                                <QRCodeSVG value={generatedQR} size={180} />
                            </div>

                            <div className="flex gap-2 mt-4 w-full">
                                <button
                                    onClick={handleBluetoothShare}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
                                >
                                    <Bluetooth className="w-4 h-4" />
                                    Use Web Bluetooth
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center max-w-xs">
                                *Web Bluetooth mimics sending packet. Clicking copies payload to clipboard for "Receive" simulation.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Receive View */}
            {activeTab === 'RECEIVE' && (
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            Simulate Reception
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Paste a payload string (from QR/Clipboard) below to simulate receiving a request via Bluetooth.
                        </p>
                        <textarea
                            value={pasteInput}
                            onChange={(e) => setPasteInput(e.target.value)}
                            placeholder='Paste payload here: {"i":"..."}'
                            className="w-full text-xs font-mono p-3 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={handleReceiveSubmit}
                            disabled={!pasteInput}
                            className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4 inline mr-2" />
                            Decode & Store Request
                        </button>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Sync Controls</h3>
                        <p className="text-xs text-gray-500 mb-3">
                            If this device has internet, push received offline requests to the server.
                        </p>
                        <button
                            onClick={handleSync}
                            className="w-full border border-gray-300 bg-white text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Trigger Cloud Sync
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
