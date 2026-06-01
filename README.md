# Till

Local-first Expo app for managing cashflow between salary paydays. The app works with payday cycles, not calendar months, and keeps cash flow, safe money, and credit/deferred debt separate.

## Tech

- Expo + React Native + TypeScript
- Expo Router
- `expo-sqlite` local persistence
- React Hook Form + Zod
- `date-fns`
- Vitest domain tests

## Run

```bash
npm install
npm start
```

Then open the project in Expo Go from the QR code or run:

```bash
npm run ios
npm run android
```

## Verify

```bash
npm run typecheck
npm test
```

## Notes

- The first launch forces onboarding before the dashboard.
- The database is local SQLite only. There is no backend, auth, sync, bank integration, or push notification logic.
- Dashboard values are derived from the account snapshot, ledger entries, and bill instances. They are not stored as calculated rows.
- Code and database names are English; UI copy is Polish.
