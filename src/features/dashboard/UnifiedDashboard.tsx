import { useState } from 'react';
import { BloodBankMap } from '../bloodBanks/BloodBankMap';
import { useBloodBanks, type BloodBank } from '../bloodBanks/useBloodBanks';
import { EmergencyRequestForm } from '../emergencyRequest/EmergencyRequestForm';
import { Plus, X, Menu, Search, Navigation } from 'lucide-react';
import { RelaySimulationModal } from '../bloodBanks/RelaySimulationModal';

export function UnifiedDashboard() {
    const { banks, loading } = useBloodBanks(undefined, undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedBank, setSelectedBank] = useState<BloodBank | null>(null);
    const [selectedBankForRelay, setSelectedBankForRelay] = useState<BloodBank | null>(null);
    const [showList, setShowList] = useState(true);

    const handleBankClick = (bank: BloodBank) => {
        setSelectedBank(bank);
        setShowList(true); // Ensure list is open if we click on map? Or maybe just highlight.
        console.log("Selected:", bank.name);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-gray-900 text-white">

            {/* 1. Full Screen Map Layer */}
            <div className="absolute inset-0 z-0">
                <BloodBankMap
                    banks={banks}
                    userLat={17.3850}
                    userLng={78.4867}
                    onBankClick={handleBankClick}
                />
            </div>

            {/* 2. Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none flex justify-between items-start">
                <div className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
                    <div className="bg-plasma/20 p-2 rounded-xl border border-plasma/30 animate-pulse-slow">
                        <Navigation className="w-6 h-6 text-plasma" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight tracking-wide">HEMA<span className="text-plasma">BLOOD</span></h1>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Emergency Grid</p>
                    </div>
                </div>

                <div className="pointer-events-auto flex flex-col gap-2 items-end">
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-neon-red transition-all
                            ${isFormOpen ? 'bg-white text-red-600' : 'bg-plasma text-white hover:scale-105 active:scale-95'}
                        `}
                    >
                        {isFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {isFormOpen ? 'Close Request' : 'New Emergency'}
                    </button>

                    <button
                        onClick={() => setShowList(!showList)}
                        className="p-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 text-cyan shadow-lg md:hidden"
                    >
                        {showList ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* 3. Emergency Request Form Panel (Slide Over) */}
            <div className={`
                absolute top-24 right-4 z-20 w-full max-w-md transition-transform duration-500 ease-in-out
                ${isFormOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}
            `}>
                <div className="glass-card p-1 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto border border-plasma/30">
                    <EmergencyRequestForm />
                </div>
            </div>

            {/* 4. Bottom/Left Blood Bank List & Details */}
            <div className={`
                absolute bottom-4 left-4 z-10 w-full md:w-96 transition-all duration-500 max-h-[60vh] flex flex-col gap-4
                ${showList ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 md:translate-y-0 md:opacity-100'}
            `}>
                {selectedBank ? (
                    <div className="glass-card p-6 rounded-2xl border border-cyan/30 shadow-neon-blue relative animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <button
                            onClick={() => setSelectedBank(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-1">{selectedBank.name}</h2>
                        <p className="text-sm text-gray-400 mb-4">{selectedBank.address}</p>

                        <div className="flex gap-2">
                            <a
                                href={`tel:${selectedBank.contactPhone}`}
                                className="flex-1 bg-green-500/10 text-green-400 border border-green-500/20 py-2 rounded-lg text-center text-sm font-semibold hover:bg-green-500/20"
                            >
                                Call Now
                            </a>
                            <button
                                onClick={() => setSelectedBankForRelay(selectedBank)}
                                className="flex-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 py-2 rounded-lg text-center text-sm font-semibold hover:bg-purple-500/20 animate-pulse"
                            >
                                Relay Request
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
                        <div className="p-4 border-b border-white/5 bg-black/40 backdrop-blur-md flex justify-between items-center sticky top-0">
                            <h3 className="font-bold flex items-center gap-2">
                                <Search className="w-4 h-4 text-cyan" />
                                Nearby Centers
                            </h3>
                            <span className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400">{banks.length} Found</span>
                        </div>
                        <div className="overflow-y-auto flex-1 bg-black/60 backdrop-blur-sm divide-y divide-white/5">
                            {banks.map(bank => (
                                <div
                                    key={bank.id}
                                    onClick={() => handleBankClick(bank)}
                                    className="p-4 hover:bg-white/5 cursor-pointer transition-colors group"
                                >
                                    <h4 className="font-medium text-sm group-hover:text-cyan transition-colors">{bank.name}</h4>
                                    <p className="text-xs text-gray-500 truncate mt-1">{bank.address}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Layer */}
            {selectedBankForRelay && (
                <RelaySimulationModal
                    bank={selectedBankForRelay}
                    onClose={() => setSelectedBankForRelay(null)}
                />
            )}
        </div>
    );
}
