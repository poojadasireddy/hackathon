import { useEmergencyRequest } from './useEmergencyRequest';
import { AlertCircle, Wifi, WifiOff, MapPin, Loader2, Navigation, Activity, Droplet, Bluetooth } from 'lucide-react';
import clsx from 'clsx';

export function EmergencyRequestForm() {
    const {
        formData,
        location,
        locationError,
        isOnline,
        isSubmitting,
        isScanning,
        submitResult,
        relayDevice,
        handleChange,
        handleSubmit,
        requestBluetoothRelay
    } = useEmergencyRequest();

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header Status Bar */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white text-glow flex items-center gap-3">
                        <Activity className="w-8 h-8 text-plasma animate-pulse-slow" />
                        Request Blood
                    </h2>
                    <p className="text-cyan text-sm tracking-wide mt-2 opacity-80">
                        BROADCAST EMERGENCY SIGNAL
                    </p>
                </div>

                <div className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md transition-all",
                    isOnline
                        ? "bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]"
                        : "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.2)]"
                )}>
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {isOnline ? "Network Active" : "Offline Mode"}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Main Card */}
                <div className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden group">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-plasma opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:opacity-10 transition-opacity duration-700" />

                    <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-plasma" />
                        Blood Requirements
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Blood Type */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blood Type</label>
                            <div className="relative">
                                <select
                                    name="bloodType"
                                    value={formData.bloodType}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all appearance-none cursor-pointer hover:bg-white/10"
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                                        <option key={type} value={type} className="bg-surface text-gray-200">{type}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* Component Type */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Component</label>
                            <div className="relative">
                                <select
                                    name="componentType"
                                    value={formData.componentType}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-all appearance-none cursor-pointer hover:bg-white/10"
                                >
                                    <option value="WHOLE_BLOOD" className="bg-surface text-gray-200">Whole Blood</option>
                                    <option value="PLATELETS" className="bg-surface text-gray-200">Platelets</option>
                                    <option value="PLASMA" className="bg-surface text-gray-200">Plasma</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* Units */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Units</label>
                            <input
                                type="number"
                                name="units"
                                min="1"
                                max="10"
                                value={formData.units}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-all"
                            />
                        </div>

                        {/* Urgency */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Urgency Level</label>
                            <div className="relative">
                                <select
                                    name="urgency"
                                    value={formData.urgency}
                                    onChange={handleChange}
                                    className={clsx(
                                        "w-full border rounded-xl p-4 transition-all appearance-none cursor-pointer focus:outline-none focus:ring-1",
                                        formData.urgency === 'CRITICAL'
                                            ? "bg-red-500/20 border-red-500 text-red-200 focus:ring-red-500"
                                            : "bg-white/5 border-white/10 text-white hover:bg-white/10 focus:border-plasma focus:ring-plasma"
                                    )}
                                >
                                    <option value="CRITICAL" className="bg-surface text-red-400 font-bold">CRITICAL (Life Threatening)</option>
                                    <option value="HIGH" className="bg-surface text-orange-400">High (Immediate)</option>
                                    <option value="MEDIUM" className="bg-surface text-yellow-400">Medium (Within 24h)</option>
                                    <option value="LOW" className="bg-surface text-gray-400">Low (Scheduled)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Card */}
                <div className="glass-card p-6 md:p-8 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-cyan" />
                        Patient & Contact
                    </h3>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Patient Name</label>
                            <input
                                required
                                type="text"
                                name="patientName"
                                value={formData.patientName}
                                onChange={handleChange}
                                placeholder="Enter patient name"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attendee Name</label>
                                <input
                                    required
                                    type="text"
                                    name="contactName"
                                    value={formData.contactName}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Phone</label>
                                <input
                                    required
                                    type="tel"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    placeholder="Mobile number"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Additional Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Hospital name, room number..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Location Status */}
                <div className="flex items-center gap-3 text-sm px-2">
                    <MapPin className={clsx("w-5 h-5", location ? "text-green-400" : "text-gray-500 animate-pulse")} />
                    {location ? (
                        <span className="text-gray-300">
                            Location locked: <strong className="text-white font-mono">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</strong>
                        </span>
                    ) : locationError ? (
                        <span className="text-red-400">{locationError}</span>
                    ) : (
                        <span className="text-gray-400">Triangulating precise location...</span>
                    )}
                </div>

                {/* Bluetooth Relay Section (Offline Only) */}
                {!isOnline && (
                    <div className="space-y-3 p-4 rounded-xl border border-dashed border-cyan/30 bg-cyan/5">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-cyan uppercase tracking-wider flex items-center gap-2">
                                <Bluetooth className="w-4 h-4" />
                                Air-Gap Relay
                            </h4>
                            {relayDevice && (
                                <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                    LINKED
                                </span>
                            )}
                        </div>

                        <p className="text-xs text-gray-400">
                            You are offline. Connect to a nearby device to relay this request via mesh network.
                        </p>

                        {relayDevice ? (
                            <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-green-500/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm text-white font-mono">{relayDevice.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={requestBluetoothRelay}
                                    className="text-xs text-gray-500 hover:text-white underline p-2"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={requestBluetoothRelay}
                                disabled={isScanning}
                                className={clsx(
                                    "w-full py-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation",
                                    isScanning
                                        ? "bg-cyan/20 border-cyan/50 text-cyan cursor-wait"
                                        : "bg-cyan/10 hover:bg-cyan/20 border-cyan/30 text-cyan"
                                )}
                            >
                                {isScanning ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Bluetooth className="w-5 h-5" />
                                        Scan for Relay Device
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Action Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || !location}
                    className={clsx(
                        "w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 flex justify-center items-center gap-3 shadow-neon-red",
                        (isSubmitting || !location)
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                            : "bg-plasma text-white hover:bg-red-600 hover:scale-[1.02]"
                    )}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Broadcasting...
                        </>
                    ) : !location ? (
                        <>
                            <MapPin className="w-5 h-5 animate-bounce" />
                            Waiting for Location...
                        </>
                    ) : (
                        <>
                            <Activity className="w-5 h-5" />
                            {isOnline ? "Broadcast Emergency" : "Save Offline Request"}
                        </>
                    )}
                </button>

                {submitResult && (
                    <div className={clsx(
                        "p-4 rounded-xl border flex items-center gap-3 backdrop-blur-md",
                        submitResult.success
                            ? "bg-green-500/10 border-green-500/30 text-green-200"
                            : "bg-red-500/10 border-red-500/30 text-red-200"
                    )}>
                        <AlertCircle className="w-5 h-5" />
                        <span>{submitResult.message}</span>
                    </div>
                )}
            </form>
        </div>
    );
}
