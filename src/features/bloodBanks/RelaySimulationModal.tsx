import { useState, useEffect } from 'react';
import { X, Wifi, Radio, Smartphone } from 'lucide-react';
import type { BloodBank } from './useBloodBanks';
import { useRelay } from '../relay/useRelay';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
    bank: BloodBank;
    onClose: () => void;
}

export function RelaySimulationModal({ bank, onClose }: Props) {
    const [step, setStep] = useState<'scanning' | 'connecting' | 'broadcasting' | 'sent'>('scanning');
    const [scanProgress, setScanProgress] = useState(0);
    const { generateBroadcastPayload } = useRelay();
    const [payload, setPayload] = useState('');

    useEffect(() => {
        // Stage 1: Scanning Simulation
        if (step === 'scanning') {
            const interval = setInterval(() => {
                setScanProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setStep('connecting');
                        return 100;
                    }
                    return prev + 5;
                });
            }, 100);
            return () => clearInterval(interval);
        }

        // Stage 2: Connecting Simulation
        if (step === 'connecting') {
            const timer = setTimeout(() => {
                setStep('broadcasting');
            }, 2000);
            return () => clearTimeout(timer);
        }

        // Stage 3: Prepare Payload
        if (step === 'broadcasting' && !payload) {
            const req = {
                id: `req-${Date.now()}`,
                originRequestId: `req-${Date.now()}`,
                originDeviceId: "local-user", // handled by hook usually but for simulation:
                lat: bank.lat,
                lng: bank.lng,
                bloodType: "O+", // Defaulting for demo or needs picker
                componentType: "Whole Blood",
                units: 1,
                urgency: "High",
                createdAt: Date.now(),
                maxHops: 5,
                hopCount: 0
            };
            // In a real app we'd pass this from a form. 
            // For this locater demo, we'll assume a "Generic Help" request to this bank.

            // Note: generateBroadcastPayload expects a PendingRequest. 
            // We'll construct a compatible object.
            const mockPendingRequest: any = {
                ...req,
                status: 'pending_sync'
            };

            setPayload(generateBroadcastPayload(mockPendingRequest));
        }

    }, [step, bank, payload, generateBroadcastPayload]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-cyan/30 rounded-2xl w-full max-w-md overflow-hidden relative shadow-neon-blue">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Wifi className="w-6 h-6 text-cyan animate-pulse" />
                        Simulated Relay Link
                    </h3>

                    {step === 'scanning' && (
                        <div className="flex flex-col items-center py-8">
                            <div className="relative w-32 h-32 mb-6">
                                <div className="absolute inset-0 border-4 border-cyan/20 rounded-full animate-ping" />
                                <div className="absolute inset-0 border-4 border-cyan/50 rounded-full" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-mono text-cyan">{scanProgress}%</span>
                                </div>
                            </div>
                            <p className="text-cyan animate-pulse tracking-widest text-sm uppercase">Scanning nearby spectrum...</p>
                        </div>
                    )}

                    {step === 'connecting' && (
                        <div className="flex flex-col items-center py-8">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                <Smartphone className="w-10 h-10 text-green-400" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-1">Device Found</h4>
                            <p className="text-green-400 font-mono text-sm">Relay_Node_Alpha (Signal: 98%)</p>
                            <p className="text-gray-500 text-xs mt-4">Establishing Secure Handshake...</p>
                        </div>
                    )}

                    {step === 'broadcasting' && (
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-white rounded-xl mb-4">
                                {payload && <QRCodeSVG value={payload} size={200} />}
                            </div>
                            <p className="text-white font-bold mb-2">Ready to Broadcast</p>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-xs text-yellow-200 text-center mb-4">
                                Ask the nearby volunteer to scan this code to accept the packet.
                            </div>
                            <p className="text-gray-500 text-xs">Packet ID: {payload.substring(0, 15)}...</p>
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                        <span>Mode: PWA Simulation</span>
                        <span className="flex items-center gap-1">
                            <Radio className="w-3 h-3" /> Encrypted
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
