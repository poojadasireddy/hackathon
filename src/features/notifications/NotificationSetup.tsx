import { Bell, BellRing, CheckCircle } from 'lucide-react';
import { useNotifications } from './useNotifications';
import clsx from 'clsx';

export function NotificationSetup() {
    const { permission, fcmToken, loading, requestPermissionAndToken } = useNotifications();

    if (permission === 'granted' && fcmToken) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-700">
                    <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-green-900 text-sm">Emergency Alerts Active</h4>
                    <p className="text-xs text-green-700">You will receive notifications for nearby blood requests.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
                <BellRing className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900">Enable Emergency Alerts</h3>
            <p className="text-sm text-gray-500 mb-4 mt-1">
                Help save lives! Get notified when someone near you needs blood or platelets.
            </p>

            <div className="flex gap-3 justify-center">
                <button
                    onClick={() => requestPermissionAndToken('DONOR')}
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? "Enabling..." : "Join as Donor"}
                </button>
                <button
                    onClick={() => requestPermissionAndToken('BANK')}
                    disabled={loading}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                    I'm a Blood Bank
                </button>
            </div>

            {permission === 'denied' && (
                <p className="text-xs text-red-500 mt-3">
                    Notifications are blocked. Please enable them in your browser settings.
                </p>
            )}
        </div>
    );
}
