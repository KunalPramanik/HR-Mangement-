# HR Portal Application - Installation & Testing Guide

This guide explains how to run the HR Portal, share it for testing, and install it as a PWA (Mobile App).

## 1. Prerequisites
- Node.js installed on the host machine.
- The project files.

## 2. Running Locally (For sharing/testing)
To share the app for a check, run it on a host machine and access it via the network.

1. Open a terminal in the project folder.
2. Install dependencies (if not done):
   ```bash
   npm install
   ```
3. Run the development server (PWA enabled):
   ```bash
   npm run dev
   ```
   *Note: We have enabled PWA in dev mode for testing.*

## 3. Accessing from Mobile (to Install)
Make sure your mobile device and the computer are on the **same Wi-Fi network**.

1. On your computer, finding your local IP: `10.178.153.25` (Detected).
2. On your mobile phone, open Chrome (Android) or Safari (iOS).
3. Navigate to: 
   ```
   http://10.178.153.25:3000
   ```
   *(Ensure port 3000 is open in your firewall if it doesn't connect)*

## 4. Installing the App
**Android (Chrome):**
1. Once the page loads, you should see an "Install Mindstar HR" prompt at the bottom.
2. If not, tap the three dots menu (⋮) -> "Install App" or "Add to Home Screen".
3. The app will be installed on your device app drawer.

**iOS (Safari):**
1. Tap the "Share" button (box with arrow).
2. Scroll down and tap "Add to Home Screen".

## 5. Troubleshooting Build
To generate a production build for deployment:
```bash
npm run build
npm start
```
*Note: The build process has been updated to support Next.js 15 route handlers.*
