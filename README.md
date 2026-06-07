# INCroute Document Verification Portal

This project implements a secure role-based Customer & Partner portal for INCroute. Clients can upload incorporation, tax, and compliance filings, and partners can check portfolios, verify attachments, or reject submissions with review feedback in real-time.

---

## 1. Firebase Project Provisioning Guide

Follow these steps to connect your Firebase project:

### Step A: Configure Firebase Web SDK
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (e.g. `incroute-compliance`).
3. Under **Project Settings**, add a new **Web App**.
4. Copy the Firebase configuration object.
5. In this repository root directory, create/update `firebase-applet-config.json` containing:
   ```json
   {
     "apiKey": "YOUR_API_KEY",
     "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
     "projectId": "YOUR_PROJECT_ID",
     "storageBucket": "YOUR_PROJECT_ID.appspot.com",
     "messagingSenderId": "YOUR_SENDER_ID",
     "appId": "YOUR_APP_ID"
   }
   ```

### Step B: Provision Services
- **Firebase Authentication**: Enable **Email/Password** sign-in and **Google** sign-in providers under the Build > Authentication dashboard.
- **Cloud Firestore**: Enable Firestore in your desired regional datastore.
- **Cloud Storage**: Enable Cloud Storage. Choose your preferred storage region.

---

## 2. Deploying Security Rules

Security rules are declared locally in the workspace. Deploy them using the Firebase CLI:

1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Authenticate and select your active project:
   ```bash
   firebase login
   firebase use --add
   ```
3. Deploy Firestore rules from `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```
4. Deploy Storage rules from `storage.rules`:
   ```bash
   firebase deploy --only storage:rules
   ```

---

## 3. Local Simulation Sandbox Desk

To allow rapid developer testing without requiring active Firebase credentials, we have built a **Simulation Sandbox Desk** directly into the interface:

- If Firebase triggers `auth/operation-not-allowed` (indicating email auth is disabled in the project console) or if the developer uses the sandbox buttons, the app automatically switches to **Mock Local Mode**.
- In mock mode:
  - Users, documents, and progress indices are preserved inside `localStorage` across page reloads.
  - Uploading documents uses browser `ObjectURL` pointers, allowing the partner to actually download and review the customer's uploaded file.
  - Quick simulation toggles allow testing of customer uploads and real-time partner review approvals/rejections side-by-side.
