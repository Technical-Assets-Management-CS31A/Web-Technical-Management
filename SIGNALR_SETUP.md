# SignalR Setup Guide - Frontend

The web app is used by staff only. Students have no login, and borrow requests go to the
instructor's phone, so the web has a single listener: `AdminNotificationListener`.

## How It Works

`src/routes/Home.tsx` mounts `AdminNotificationListener` for staff and admins. It:

1. Registers every event handler with `subscribe()`. Handlers are queued in the service until the connection exists.
2. Calls `connect()`, which starts the connection to `${VITE_API_BASE_URL}/notificationHub` and replays the queued handlers.
3. Calls `joinAdminStaffGroup()` so events start flowing.

Each event shows a toast (when it needs attention) and invalidates the related React Query keys.

## Notification Events (PRD 6.4)

| Event | Toast | Refreshes |
|-------|-------|-----------|
| `asset.statusChanged` | – | assets, loans, dashboard |
| `loan.created` | – | loans, assets, dashboard, kioskSessions |
| `room.occupancyChanged` | – | dashboard, loans |
| `anomaly.raised` | Location Anomaly (warning) | dashboard, loans, assets |
| `anomaly.resolved` | – | dashboard, loans, assets |
| `warning.issued` | Late Arrival Warning (info) | students, standing, loans |
| `loan.overdue` | Loan Overdue (warning) | loans, dashboard, students |
| `station.healthChanged` | Station Offline (error, only when `OFFLINE`) | dashboard |

To handle a new event, add another `subscribe(...)` call in `AdminNotificationListener.tsx` before `connect()`.

## Files

- `src/services/signalrService.ts` - Singleton connection with automatic reconnect
- `src/hooks/useSignalR.ts` - React hook over the service
- `src/components/AdminNotificationListener.tsx` - Staff notifications

## Troubleshooting

1. **Check the connection:**
   ```typescript
   import { signalRService } from './services/signalrService';
   console.log('Connected:', signalRService.isConnected());
   ```
2. **Check the browser console** for connection errors. A failed connection also shows a "SignalR Connection Failed" toast.
3. **Check the backend logs** to see whether the events are being sent to the admin/staff group.
4. **CORS:** the backend must allow credentials for the web origin.

Reconnection retries at 0 s, 2 s, 5 s, 10 s and 30 s; watch the console for reconnect messages.
