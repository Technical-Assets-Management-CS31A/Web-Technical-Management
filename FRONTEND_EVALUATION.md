# Old Frontend (Web) — Feature Inventory & Evaluation

**Project:** Technical Assets Management System — Web Frontend
**Branch reviewed:** `develop` (commit `2d34bc5`, ~1,620 commits)
**Date:** 2026-10-27

---

## 1. Overview

| Item | Detail |
|---|---|
| Framework | React 19 + TypeScript 5.8, built with Vite 7 |
| Routing | TanStack Router (code-based route tree in `src/routes/__root.tsx`) |
| Server state | TanStack Query + Axios |
| Client state | Zustand (`src/states/*`) |
| Tables | TanStack Table |
| Styling | Tailwind CSS v4, light/dark themes |
| Real-time | SignalR (`@microsoft/signalr`) |
| Charts | Chart.js via `react-chartjs-2` |
| Import / Export | SheetJS (`xlsx`); `jspdf` and `html2canvas` are installed but never used |
| Auth | JWT access token in a cookie, refresh token in an HttpOnly cookie, silent refresh on 401 |
| Hosting | Cloudflare Workers (Wrangler) |
| Backend | Separate C# / ASP.NET REST API |
| Size | 16 pages, ~100 components, 14 skeleton loaders, ~21k lines in routes and components |

---

## 2. Existing Features

### 2.1 Authentication & Session
- Login page (`/`) with a public-route guard that redirects logged-in users to the dashboard.
- Protected `/home/*` layout. It checks for a token and tries a silent refresh before redirecting to login.
- Axios interceptor that attaches the Bearer token, queues requests that run at the same time, and refreshes once on a 401.
- Logout (`/auth/logout`).
- Change password and edit profile (Settings).
- **Forgot Password page exists (`ForgotPassword.tsx`) but is not routed**, so users can't reach it.

### 2.2 Dashboard (`/home/dashboard`)
- Summary badges: total items, active users, items lent and categories.
- Item status overview and a borrowing activity chart.
- Recent borrows table with a detail dialog and a return action.
- Quick-action shortcuts.

### 2.3 Inventory (`/home/inventory-list`, `/home/item/$id`)
- List items with search, category/status/condition filters, stats summary and pagination.
- Add item (with image), edit item and view item detail page.
- Archive item.
- Bulk import from Excel (`/items/import`).
- **Export the filtered list to Excel.**
- Item scan sessions (RFID/barcode) to find items.
- Category and condition management (Settings → Inventory tab).

### 2.4 Borrowing (`/home/borrow-item`)
- Step-by-step guest borrow wizard with two modes:
  - **Borrow now:** borrower → item → photo (webcam capture) → confirm
  - **Reserve:** borrower → item → schedule → confirm
- Item scanning inside the wizard.
- Borrow success modal and return action.

### 2.5 Scan / RFID Controller (`/home/rfid-controller`)
- Borrow mode and return mode, backed by server-side sessions (`borrow-session`, `return-session`) that are polled and can be cancelled.
- Lookup by item RFID and student RFID.

### 2.6 Pending Reservations (`/home/pending-reservations`)
- Pending requests table with stats, search and a count badge in the sidebar.
- Approve, deny and mark as borrowed, each behind a confirmation modal.
- Review countdown and a due-soon reservation dialog.

### 2.7 Active Borrows (`/home/active-borrowed-items`)
- Items currently out, with search, sorting and pagination.
- Return confirmation flow and a count badge in the sidebar.

### 2.8 History (`/home/history-list`)
- Borrow history with status tabs, search and pagination.
- Not in the sidebar. It can only be reached from the "Total Borrowed" dashboard badge.

### 2.9 User Management (`/home/user-management`, `/home/registration-module`)
- Users table with a status filter and search.
- Multi-step Add User form for SuperAdmin, Admin, Staff, Teacher and Student accounts. Who can create which role is checked in the UI.
- Edit user, teacher and student profiles, and view credentials.
- Block or unblock users with a reason, and check block status.
- Archive users.
- Bulk-import students from Excel.
- Link a student to an RFID card through a server-side session.

### 2.10 Archives (`/home/archive-table`)
- Archived items, students and teachers, with filters, search and pagination.
- Detail pop-ups, restore and permanent delete.

### 2.11 Logs
- **Activity Logs** (`/home/activity-logs`, `/home/activity-logs/$id`): action filter, search, pagination and a detail page.
- **Borrowing Logs** (`/home/borrow-logs`): status badges, search, pagination and a detail modal.

### 2.12 Real-time Notifications
- `AdminNotificationListener` joins the Admin/Staff SignalR group and handles these events:
  `ReceiveNewPendingRequest`, `ReceiveApprovalNotification`, `ReceiveStatusChangeNotification`, `ReceiveReservationExpired`, `ReceiveReservationDueSoon`.
- Toast notifications through `react-toastify`.

### 2.13 Settings (`/home/settings`)
- Profile tab (view and edit, change password).
- Inventory tab (categories and conditions).
- Appearance tab (Light, Dark or System theme, saved per device).

### 2.14 Reports (`/home/reports`)
- **Placeholder only.** The page shows an "under construction" screen. The README advertises PDF/Excel report export, but this page has none of it.

### 2.15 Cross-cutting UI
- Collapsible sidebar with grouped navigation and count badges, plus a mobile menu.
- A skeleton loader for every page.
- Shared search bar, pagination, error tables and confirmation modals.
- UI text kept in `src/constants/*Content.ts` files, which makes copy changes and future translation easier.

---

## 3. Evaluation

### 3.1 Strengths
1. **Modern, consistent stack.** React 19, TanStack Router/Query/Table and Zustand are current, well-supported choices.
2. **Clear folder layout.** API, hooks, queries, state, constants and loaders each have their own folder.
3. **Wide feature coverage.** The full borrow lifecycle works: reserve → approve → borrow → return → history → logs.
4. **Good real-time design.** SignalR is wrapped in a singleton service that queues handlers until the connection is ready.
5. **Solid token refresh.** The interceptor queues requests that fail together, so the app makes only one refresh call.
6. **Polished UX.** It has skeleton loaders, confirmation modals, toasts, dark mode, count badges and a guided borrow wizard.
7. **UI text is centralised** in constant files instead of being hard-coded in JSX.
8. **TypeScript throughout**, with shared types in `src/@types/types.ts`.
