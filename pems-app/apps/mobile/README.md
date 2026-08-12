# P.E.M.S. Mobile

Enterprise Android/iOS workspace for the Property Estate Management System.

The first mobile build is an Expo Router app that gives each core user role a native command-center experience:

- Landlords: portfolio health, rent collection, maintenance, and messages.
- Tenants: room details, rent status, service requests, and inbox.
- Enterprise admins: platform-wide governance, onboarding, risk, and reporting queues.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a development build, Android emulator, iOS simulator, Expo Go, or web.

## Build notes

- The current screen is a role-aware enterprise shell with realistic operational data.
- Firebase-backed authentication and live Firestore collections should be wired through the shared `packages/firebase` services next.
- Keep role-specific mobile flows compact; phone users need fast status, approval, payment, and communication actions rather than the full desktop table experience.

## Useful scripts

```bash
npm run android
npm run ios
npm run web
npm run lint
```
