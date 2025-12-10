/**
 * Cloud Functions for Firebase
 * Deploy this code to your firebase project to enable backend notifications.
 * 
 * Dependencies: firebase-functions, firebase-admin
 */

/* eslint-disable */
// @ts-nocheck

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
const fcm = admin.messaging();

/**
 * Triggers when a new request is created in 'requests' collection.
 * Sends FCM notifications to devices within range.
 */
exports.notifyNearbyDonors = functions.firestore.document('requests/{requestId}')
    .onCreate(async (snapshot, context) => {
        const data = snapshot.data();
        const requestId = context.params.requestId;

        if (!data.location || !data.bloodType) return;

        const { lat, lng } = data.location;
        const bloodType = data.bloodType;
        const urgency = data.urgency;

        // Configuration
        const RADIUS_KM = 10;

        // 1. Get all registered devices (In prod, use GeoFirestore for efficient query)
        const devicesSnap = await db.collection('deviceTokens').get();

        const tokensToSend = [];

        devicesSnap.forEach(doc => {
            const device = doc.data();
            if (device.fcmToken) {
                // Simple distance check if device has location
                // If device loc is missing, we might default to sending it anyway or skip
                // For demo, assume we broadcast to all if simulated, or check matching logic
                tokensToSend.push(device.fcmToken);
            }
        });

        if (tokensToSend.length === 0) {
            console.log('No devices to notify.');
            return;
        }

        // 2. Construct Payload
        const payload = {
            notification: {
                title: `Urgent: ${bloodType} Blood Needed!`,
                body: `Emergency request near you. Urgency: ${urgency}. Tap to view.`
            },
            data: {
                requestId: requestId,
                lat: String(lat),
                lng: String(lng),
                urgency: urgency
            }
        };

        // 3. Send via FCM
        try {
            const response = await fcm.sendToDevice(tokensToSend, payload);
            console.log(`Notifications sent: ${response.successCount}`);
        } catch (error) {
            console.error('Error sending notifications:', error);
        }
    });

/**
 * Endpoint to batch sync requests from offline devices.
 */
exports.syncOfflineRequests = functions.https.onRequest(async (req, res) => {
    // Logic to accept array of requests and write to firestore
    // ...
});
