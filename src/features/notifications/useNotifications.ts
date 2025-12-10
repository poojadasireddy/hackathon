import { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db } from '../../lib/firebase';

// NOTE: In a real app, you need a Service Worker (firebase-messaging-sw.js) for background notifications.
// For this demo, we can get the token and handle foreground messages.

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const requestPermissionAndToken = async (role: 'DONOR' | 'BANK') => {
        setLoading(true);
        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm === 'granted') {
                const messaging = getMessaging();
                // VAPID key would be needed here in prod: getToken(messaging, { vapidKey: '...' })
                // user should replace 'YOUR_VAPID_KEY'
                const token = await getToken(messaging, {
                    vapidKey: "YOUR_PUBLIC_VAPID_KEY_HERE_IF_NEEDED"
                }).catch(e => {
                    console.warn("Failed to get token (likely due to missing VAPID or localhost env)", e);
                    return "mock-token-" + Date.now(); // Fallback for pure demo without certified https/vapid
                });

                if (token) {
                    setFcmToken(token);

                    // Save to Firestore
                    const deviceId = localStorage.getItem('blood_req_device_id') || 'unknown-device';
                    await setDoc(doc(db, "deviceTokens", deviceId), {
                        deviceId,
                        fcmToken: token,
                        role,
                        lastUpdatedAt: Date.now(),
                        // Ideally we'd update location here too
                    }, { merge: true });
                }
            }
        } catch (error) {
            console.error("Notification permission error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Listen for foreground messages
    useEffect(() => {
        if (permission === 'granted') {
            try {
                const messaging = getMessaging();
                onMessage(messaging, (payload) => {
                    console.log('Message received. ', payload);
                    // Show simple browser notification or toast
                    // new Notification(payload.notification?.title || "Alert", { body: payload.notification?.body });
                    alert(`🚨 ${payload.notification?.title}: ${payload.notification?.body}`);
                });
            } catch (e) {
                // Messaging might fail if SW not ready
                console.log("Messaging init skipped (SW not ready)");
            }
        }
    }, [permission]);

    return {
        permission,
        fcmToken,
        loading,
        requestPermissionAndToken
    };
}
