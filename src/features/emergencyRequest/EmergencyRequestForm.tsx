import { useEmergencyRequest } from './useEmergencyRequest';
import { AlertCircle, Wifi, WifiOff, MapPin, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export function EmergencyRequestForm() {
    const {
        formData,
        location,
        locationError,
        isOnline,
        isSubmitting,
        submitResult,
        handleChange,
        handleSubmit
    } = useEmergencyRequest();

    // DUMMIES REMOVED
    // const formData = ...

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Header / Connectivity Badge */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        Request Blood
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Fill this form to notify nearby blood banks and donors.
                    </p>
                </div>

                <div className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                    isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                    {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    {isOnline ? "Online" : "Offline Mode"}
                </div>
            </div>

            {/* Success/Error Message */}
            {submitResult && (
                <div className={clsx(
                    "mb-6 p-4 rounded-lg flex items-start gap-3",
                    submitResult.success ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
                )}>
                    <div>
                        <h4 className="font-semibold">{submitResult.success ? "Success" : "Error"}</h4>
                        <p className="text-sm">{submitResult.message}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section 1: Blood Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                        <select
                            name="bloodType"
                            value={formData.bloodType}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        >
                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Component</label>
                        <select
                            name="componentType"
                            value={formData.componentType}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="WHOLE_BLOOD">Whole Blood</option>
                            <option value="PLATELETS">Platelets</option>
                            <option value="PLASMA">Plasma</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Units Required</label>
                        <input
                            type="number"
                            name="units"
                            min="1"
                            max="10"
                            value={formData.units}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                        <select
                            name="urgency"
                            value={formData.urgency}
                            onChange={handleChange}
                            className={clsx(
                                "w-full rounded-lg border-gray-300 p-2.5 outline-none focus:ring-2 focus:ring-red-500",
                                formData.urgency === 'CRITICAL' && "bg-red-50 text-red-700 font-semibold",
                                formData.urgency === 'HIGH' && "bg-orange-50 text-orange-700",
                                formData.urgency === 'MEDIUM' && "bg-yellow-50 text-yellow-700",
                                formData.urgency === 'LOW' && "bg-gray-50 text-gray-700"
                            )}
                        >
                            <option value="CRITICAL">Critical (Life Threatening)</option>
                            <option value="HIGH">High (Immediate Need)</option>
                            <option value="MEDIUM">Medium (Within 24h)</option>
                            <option value="LOW">Low (Scheduled)</option>
                        </select>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 2: Contact Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                        <input
                            required
                            type="text"
                            name="patientName"
                            value={formData.patientName}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            className="w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                            <input
                                required
                                type="text"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleChange}
                                placeholder="Attendee Name"
                                className="w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                            <input
                                required
                                type="tel"
                                name="contactPhone"
                                pattern="[0-9]{10}"
                                title="Please enter a valid 10-digit phone number"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                placeholder="9876543210"
                                className="w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Notes & Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Hospital name, room number, or specific instructions..."
                    />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3 text-sm text-blue-700">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    {location ? (
                        <span>
                            Location captured: <strong>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</strong>
                        </span>
                    ) : locationError ? (
                        <span className="text-red-600 font-medium">{locationError}</span>
                    ) : (
                        <span>Fetching current location...</span>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting || !location}
                        className={clsx(
                            "w-full py-3 px-4 rounded-lg text-white font-semibold shadow-md transition-colors flex justify-center items-center gap-2",
                            isOnline ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700",
                            (isSubmitting || !location) && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending Request...
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-5 h-5" />
                                {isOnline ? "Broadcast Emergency Alert" : "Save Request Offline"}
                            </>
                        )}
                    </button>
                    {!location && (
                        <p className="text-xs text-center text-red-500 mt-2">
                            Note: Location is required to submit a request.
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}
