import { Phone, Clock, MapPin, CloudOff } from 'lucide-react';
import { useBloodBanks } from './useBloodBanks';
import { BloodBankMap } from './BloodBankMap';
import clsx from 'clsx';

interface Props {
    userLat?: number;
    userLng?: number;
}

export function BloodBankLocator({ userLat, userLng }: Props) {
    const { banks, loading, isOfflineMode } = useBloodBanks(userLat, userLng);

    if (loading) return <div className="p-4 text-center">Loading Blood Banks...</div>;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    Nearby Blood Banks
                </h3>
                {isOfflineMode && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded flex items-center gap-1">
                        <CloudOff className="w-3 h-3" /> Offline Mode
                    </span>
                )}
            </div>

            <div className="p-4">
                <BloodBankMap banks={banks} userLat={userLat} userLng={userLng} />
            </div>

            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {banks.length === 0 ? (
                    <p className="p-4 text-center text-gray-500 text-sm">No blood banks found nearby.</p>
                ) : (
                    banks.map(bank => (
                        <div key={bank.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{bank.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{bank.address}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                        {bank.distance !== undefined && (
                                            <span className="font-medium text-blue-600">
                                                {bank.distance.toFixed(1)} km away
                                            </span>
                                        )}
                                        {bank.is24x7 && (
                                            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                                <Clock className="w-3 h-3" /> 24x7
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <a
                                    href={`tel:${bank.contactPhone}`}
                                    className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                                    title="Call Now"
                                >
                                    <Phone className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
