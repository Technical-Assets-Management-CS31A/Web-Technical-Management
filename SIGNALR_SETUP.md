# SignalR Setup Guide - Frontend

The web app is used by staff only. Students have no login, and borrow requests go to the
instructor's phone, so the web holds one hub connection for staff and admins.

## How It Works

```
signalRService (src/services/signalrService.ts)     one connection per tab
   │  onEvent / onStatus
   ▼
useRealtimeConnection (src/hooks/useRealtime.ts)    mounted once by AdminNotificationListener in Home.tsx
   ├─► useRealtimeStore (src/states/realtime-state.ts)   status + last 100 events
   └─► queryClient.invalidateQueries(...)                pages using useQuery refetch by themselves
```

- **Auth:** the staff JWT is read from the access-token cookie on every connect and reconnect. If it expires
  within 30 s it is refreshed first through `/auth/refresh` (the same call the axios interceptor uses). With
  WebSockets and SSE the browser cannot send headers, so SignalR sends the token as `?access_token=` on
  `/hubs/live`.
- **Reconnect:** it retries after 0 s, 2 s, 5 s and 10 s, then every 30 s (±20 %), and never gives up. This covers
  dropped connections, a failed first start, and the server closing the connection. It stops only on logout
  or when the refresh token is also dead.
- **Groups:** the server adds staff accounts to its `staff` group in `OnConnectedAsync`, so every new
  connection id is regrouped without a client call. The hub has no callable methods.
- **Missed events:** events sent while offline are not replayed, so after a reconnect every query key the
  events touch is refetched.
- **Logout:** `useLogoutUser` calls `signalRService.stop()` (which leaves the group) and `resetRealtimeState()`.

## Using It in a Page

```tsx
import { useRealtimeEvents, useRealtimeEvent, useRealtimeStatus, useLatestRealtimeEvent } from "../hooks/useRealtime";

const { status, isLive } = useRealtimeStatus();                      // "connected" | "reconnecting" | ...
const scans = useRealtimeEvents("scan.recorded", 10);                // newest first, typed payloads
const anomalies = useRealtimeEvents(["anomaly.raised", "anomaly.resolved"]);
const latestOverdue = useLatestRealtimeEvent("loan.overdue");
useRealtimeEvent("loan.created", (loan) => highlightRow(loan.loanId)); // side effects only
```

Pages that only show server data don't need any of this: the matching React Query keys are invalidated
automatically. `<RealtimeStatusPill />` shows the connection state (it is on the Dashboard header).

## Events

Payload types are in `src/@types/tams.ts` (`RealtimeEventMap`).

| Event | Payload | Toast | Refreshes |
|-------|---------|-------|-----------|
| `asset.statusChanged` | assetId, oldStatus, newStatus, roomId | – | assets, loans, dashboard |
| `loan.created` | loanId, loanNo, asset, student, destinationRoomId, transitDeadlineAt, dueAt | – | loans, assets, dashboard, kioskSessions |
| `loan.overdue` | loanId, assetCode, studentName, sectionCode | Loan Overdue (warning) | loans, dashboard, students |
| `room.occupancyChanged` | roomId, verifiedCount, incoming[] | – | dashboard, loans, room-occupancy |
| `anomaly.raised` / `anomaly.resolved` | anomalyId, type, status, assetId, assetCode, loanId, roomCode | Location Anomaly on raise (warning) | dashboard, loans, assets |
| `warning.issued` | loanId, studentId, studentName, warningNo, penaltyTriggered | Late Arrival Warning (info) | students, standing, loans |
| `station.healthChanged` | stationId, stationCode, health | Station Offline (error, only `OFFLINE`) | dashboard, stations |
| `scan.recorded` ⚠️ | scanId, stationId, stationCode, roomId, tagUid, result, assetId, assetCode, loanId, scannedAt | – | dashboard, room-occupancy |

⚠️ `scan.recorded` is **not in PRD 6.4 yet**. The backend needs to broadcast it to the admin/staff group after
`POST /stations/{code}/scans`. Until it does, the subscription does nothing.

To add an event: add it to `RealtimeEventMap`, `REALTIME_EVENTS` and `QUERY_KEYS_BY_EVENT` in
`src/lib/realtime.ts` (a test checks that the last two match).

## Backend Contract

- Hub at `/hubs/live` on the API host root (a trailing `/api/vN` in `VITE_API_BASE_URL` is stripped).
- JWT bearer auth must read `access_token` from the query string for that path (`JwtBearerEvents.OnMessageReceived`).
- No hub methods: ADMIN, TECH_STAFF and CUSTODIAN tokens join the `staff` group on connect.
- CORS must allow credentials for the web origin.

## Troubleshooting

1. The Dashboard pill shows the connection state. For details, log `useRealtimeStore.getState()` from a component (it holds `status`, `lastError` and `recent`).
2. Watch the console for `[SignalR]` warnings; the pill's tooltip shows the last error.
3. Check the backend logs to see whether events are being sent to the admin/staff group.
