import { Phone, Clock, CloudOff, Navigation } from 'lucide-react';
import { useBloodBanks } from './useBloodBanks';
import { BloodBankMap } from './BloodBankMap';

interface Props {
    userLat?: number;
    userLng?: number;
}

export function BloodBankLocator({ userLat, userLng }: Props) {
    const { banks, loading, isOfflineMode } = useBloodBanks(userLat, userLng);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 text-cyan animate-pulse">
            <div className="w-12 h-12 border-4 border-cyan border-t-transparent rounded-full animate-spin mb-4" />
            <span className="tracking-widest uppercase text-sm">Scanning Network...</span>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white text-glow flex items-center gap-3">
                        <Navigation className="w-8 h-8 text-cyan animate-float" />
                        Blood Bank Locator
                    </h2>
                    <p className="text-gray-400 text-sm tracking-wide mt-2">
                        NEARBY DONATION CENTERS
                    </p>
                </div>
                {isOfflineMode && (
                    <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full flex items-center gap-2 border border-gray-700">
                        <CloudOff className="w-3 h-3" /> Offline Cache
                    </span>
                )}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-glass-border shadow-neon-blue">
                <div className="p-1 bg-surface/50">
                    <BloodBankMap banks={banks} userLat={userLat} userLng={userLng} />
                </div>

                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto bg-surface/80">
                    {banks.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <CloudOff className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm uppercase tracking-widest">No blood banks detected in range.</p>
                        </div>
                    ) : (
                        banks.map(bank => (
                            <div key={bank.id} className="p-5 hover:bg-white/5 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-white text-lg group-hover:text-cyan transition-colors">{bank.name}</h4>
                                        <p className="text-sm text-gray-400 mt-1">{bank.address}</p>

                                        <div className="flex items-center gap-4 mt-3 text-xs">
                                            {bank.distance !== undefined && (
                                                <span className="font-mono text-cyan bg-cyan/10 px-2 py-1 rounded border border-cyan/20">
                                                    {bank.distance.toFixed(1)} KM
                                                </span>
                                            )}
                                            {bank.is24x7 && (
                                                <span className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                                    <Clock className="w-3 h-3" /> 24x7 Active
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <a
                                        href={`tel:${bank.contactPhone}`}
                                        className="p-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 border border-green-500/20 transition-all hover:scale-105 active:scale-95"
                                        title="Call Now"
                                    >
                                        <Phone className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
