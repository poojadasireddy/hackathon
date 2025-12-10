# Offline-First Emergency Blood & Platelet Request System - Demo Walkthrough

## 1. Overview
This is a Progressive Web App (PWA) designed to save lives during emergencies by allowing users to request blood even without an internet connection.
**Key Features:**
*   **Offline-First:** Requests are stored locally (Dexie.js) and synced when online.
*   **Relay Simulation:** "Bluetooth-like" peer-to-peer propagation using QR codes/payload sharing.
*   **Blood Bank Locator:** Map and list view of nearby blood banks, cached for offline use.
*   **Notifications:** Real-time Firebase Cloud Messaging (FCM) alerts to nearby donors.

## 2. Setup Instructions

### Prerequisites
*   Node.js (v18+) & npm
*   Modern Browser (Chrome/Edge recommended for PWA features)

### Installation
1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Configure Firebase:**
    *   Open `src/lib/firebase.ts`.
    *   Replace the `firebaseConfig` object with your active Firebase project credentials.
    *   Ensure Firestore and Authentication are enabled in your Firebase Console.
    *   (Optional for Notifications) Add your VAPID key in `src/features/notifications/useNotifications.ts`.
3.  **Run Locally:**
    ```bash
    npm run dev
    ```
4.  **Backend (Cloud Functions):**
    *   Deploy functions using `firebase deploy --only functions` OR serve locally if familiar with emulators.
    *   *Note for Judges:* The core app logic works without functions, but notifications won't trigger.

### Browser Permissions
*   **Location:** Allow when prompted (required for blood bank distance and request geotagging).
*   **Notifications:** Allow when clicking "Join as Donor" (required for alerts).

## 3. Demo Personas
*   **Receiver:** The person in an emergency (User A).
*   **Donor/Bank:** The person nearby who can help (User B).

---

## 4. Demo Scenario 1 – Normal Online Flow

**Goal:** Show standard request creation and immediate background sync.

**Steps:**
1.  **[User A]** Open app, ensure "Online" badge is Green.
2.  **[User A]** Fill the "Request Blood" form:
    *   Blood Type: **O+**, Component: **Whole Blood**, Urgency: **High**.
    *   Click **"Broadcast Emergency Alert"**.
3.  **[User A]** Observe "Success" message and reset form.
4.  **[User B]** (On separate tab/device) Enable "Join as Donor".
    *   *Observation:* If Cloud Functions are live, User B receives a browser notification: "Urgent: O+ Blood Needed!".
5.  **Technical Proof:** Check Firestore console -> `requests` collection to see the new document.

**Talking Point:**
> "In a connected scenario, the request is instantly broadcast to our cloud server and nearby registered donors get a push notification immediately."

---

## 5. Demo Scenario 2 – Offline Request + Later Sync

**Goal:** Demonstrate "Offline-First" resilience.

**Steps:**
1.  **[User A]** Disconnect Internet (Toggle WiFi off or use Chrome DevTools > Network > Offline).
2.  **[User A]** Observe Badge changes to Red "Offline Mode".
3.  **[User A]** Helper text appears: "Offline Mode".
4.  **[User A]** Submit a new request (e.g., **A- Platelets**).
    *   *UI Feedback:* "Request saved offline. Will sync when internet is available."
5.  **[Technical]** Open DevTools > Application > Storage > IndexedDB > `EmergencyBloodDB` > `pendingRequests`. Show the record with status `pending_sync`.
6.  **[User A]** Reconnect Internet.
7.  **[User A]** (Optional) Click "Trigger Cloud Sync" in Relay Simulator (or wait for auto-sync if implemented).
    *   *UI Feedback:* "Synced 1 requests."
8.  **[Technical]** Check Firestore; the request is now present.

**Talking Point:**
> "When the internet fails—common in disasters—we don't block the user. We save the request locally and automatically sync it the moment connectivity is restored."

---

## 6. Demo Scenario 3 – Bluetooth Relay Simulation

**Goal:** Show how requests hop between devices without internet.

**Steps:**
1.  **[User A]** Go Offline. Create a Request. Initial state: `Hops: 0`.
2.  **[User A]** Open **Relay Simulator**.
3.  **[User A]** Click request to Broadcast. **QR Code** appears.
    *   *Click "Use Web Bluetooth" to copy payload (simulated).*
4.  **[User B]** Open **Relay Simulator** > **Receive/Scan** tab.
5.  **[User B]** Paste the payload (or scan QR). Click **"Decode & Store"**.
6.  **[User B]** Success! "Request received! Hops: 1".
    *   *Observe:* Request is now in User B's local Dexie DB.
7.  **[User B]** Go Online. Click **"Trigger Cloud Sync"**.
8.  **[System]** Request is uploaded to Cloud from User B's device.

**Talking Point:**
> "This simulates our Bluetooth Mesh. Even if User A never gets internet, User B can 'carry' the request physically until they find a signal, acting as a digital carrier pigeon."

---

## 7. Demo Scenario 4 – Blood Bank Locator (Offline Cache)

**Goal:** Show map availability without internet.

**Steps:**
1.  **[Online]** open app. Map loads live data. "3 Blood Banks found".
2.  **[Offline]** Go offline. Reload page.
3.  **[Offline]** Map still works! Markers are visible.
    *   *Badge:* "Offline Mode: showing last known data."
4.  **[Action]** Click "Call" button on a blood bank list item.

**Talking Point:**
> "We aggressively cache critical resource data. During an outage, you can still find where to go."

---

## 8. Technical Validation Checklist
- [ ] PWA manifests installed (App installable).
- [ ] Dexie DB `EmergencyBloodDB` initializes correctly.
- [ ] Geolocation permission prompts and captures coordinates.
- [ ] Offline form submission writes to IndexDB.
- [ ] Relay Simulator parses JSON payload correctly.
- [ ] Firestore writes occur on Online Sync.

## 9. Limitations & Future Work
*   **Bluetooth Simulation:** Real Web Bluetooth is flaky on many standard browsers; we use a QR/Payload simulation to demonstrate the *protocol* reliability for this hackathon.
*   **Mesh Network:** Full ad-hoc mesh requires native mobile APIs (Android/iOS); this PWA demonstrates the architecture.
*   **Notifications:** Currently requires the app/browser to be open or Service Worker configured for background. It can be extended to SMS/WhatsApp via Twilio.
