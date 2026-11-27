# 🧰 Technical Assets Management System

A web application that helps schools manage their technical equipment, such as HDMI cables, projectors, laptops, microphones and other stored items.
Staff **add and track assets** and watch loans in real time. Students borrow at the RFID kiosk with an instructor's approval, and every loan is recorded.

This repository contains the **frontend**. It talks to a separate C# / ASP.NET backend over REST and SignalR.

---

## 🎯 Project Overview

The **Technical Assets Management System** records school-owned technical items and who has them.
Each item and borrow is logged, so missing or misused equipment can be traced to a borrower.

### ✨ Key Features
- 📊 **Dashboard** – Live status board with summary badges, room occupancy and station health.
- 📦 **Assets** – Add, edit, view and delete assets, set their status, and bulk-import from Excel. Registering an asset is one flow: details → RFID tag → QR label.
- 🏷️ **RFID Tag Scanning** – The RFID tag step listens for the reader as soon as it opens, so staff only tap the tag. Edit asset has a **Scan on kiosk** button. Duplicate or invalid tags are flagged at once.
- 📡 **Counter Station** – Follow the active kiosk checkout at the counter. The **Counter webcam** page takes and uploads the borrower's photo automatically at the photo step.
- 🖥️ **Kiosk Display** – Confirmation screen shown at the kiosk during a borrow.
- ✅ **Loans** – Track items currently out, mark a loan missing or change its room. Loans are created only by a kiosk session, never from the web.
- 🧑‍🎓 **People** – Staff accounts and instructor RFID cards, plus the student roster (no student logins) with standing, warnings, marks, holds and liabilities.
- 🏫 **Rooms & Stations** – Classrooms and storage rooms with live occupancy, and the RFID stations in each room with their health and heartbeat.
- 🪪 **Authorization Cards** – Register instructor RFID cards, and mark them lost, found or revoked.
- ⚠️ **Anomalies** – Wrong-room scans, unknown cards and late arrivals raised by room stations. Acknowledge, then resolve with a note.
- 🚩 **Violations** – Late arrival warnings, non-compliance marks, profile holds and approval freezes. Penalties are issued automatically and resolved here with a reason for the audit log.
- 🔔 **Real-time Notifications** – Staff get live updates through SignalR (anomalies, late arrivals, overdue loans, station health).
- 🗂️ **Deleted records** – Restore soft-deleted assets, accounts and students.
- 📜 **Logs & History** – Activity logs and loan history with detail views and filters.
- 🔍 **Search, Filter & Pagination** – On all major tables.
- 🎨 **Appearance Settings** – Light and dark themes, profile editing and password changes.
- 📈 **Reports** – Usage and borrowing reports (coming soon).

### 👥 Users & Roles
- 🛡️ **Admin** – Full access, including staff and instructor accounts.
- 🧑‍💼 **Tech Staff** – Assets, the student roster and resolving student penalties.
- 📦 **Custodian** – Asset management.
- 🧑‍🏫 **Instructor** – Approves borrow requests on their phone; sees the loans they approved.
- 🎓 **Students** are roster records only. They have no login and borrow by tapping their RFID card at the kiosk. Their standing (good, warned, blocked) is computed by the backend from warnings and marks; there is no manual blocking.
- 🔐 JWT-based login, forgot-password flow and role-based access.

---

## 🧑‍💻 Technologies Used

| Stack | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4 |
| **Routing** | TanStack Router |
| **Data Fetching** | TanStack Query, Axios |
| **Tables** | TanStack Table |
| **State** | Zustand |
| **Real-time** | SignalR (`@microsoft/signalr`) |
| **Charts** | Chart.js (`react-chartjs-2`) |
| **Import / Export** | SheetJS (`xlsx`) |
| **Testing** | Vitest, React Testing Library |
| **Backend** | C# (ASP.NET), in a separate repository |
| **Database** | SQL |
| **Hosting** | Cloudflare (Wrangler) or Docker + nginx |
| **Version Control** | Git & GitHub |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm (or npm)
- A running instance of the backend API

### Installation

```bash
git clone git@github.com:Technical-Assets-Management-CS31A/Web-Technical-Management.git
cd Web-Technical-Management
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL, e.g. `http://localhost:5278` |
| `VITE_ACCESS_TOKEN_KEY` | Storage key for the access token |
| `VITE_REFRESH_TOKEN_KEY` | Storage key for the refresh token |
| `VITE_IMAGE_BASE_URL` | Base URL where item images are served |
| `VITE_FORGOT_PASSWORD_API` | Endpoint used by the forgot-password flow |
| `VITE_SITE_URL` | Public address of this web app (no trailing slash), used for link-preview thumbnails |

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | Type-check and build for production |
| `pnpm test` | Run the unit tests with Vitest |
| `pnpm lint` | Lint the project with ESLint |
| `pnpm preview` | Build and preview locally with Wrangler |
| `pnpm deploy` | Build and deploy to Cloudflare |
| `pnpm generate:routes` | Regenerate the TanStack Router route tree |

`make install`, `make run`, `make test`, `make build` and `make deploy` are available as shortcuts in the `Makefile`.

### RFID Readers

The app works with USB desk readers that act as a keyboard (they type the tag UID and press Enter). No driver or browser permission is needed. Plug the reader in, open **Assets → New asset**, and tap the tag on the RFID tag step.

### Docker

The `Dockerfile` builds the app and serves it with nginx on port 80. Vite inlines `VITE_*` variables at build time, so pass them as build args:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  --build-arg VITE_ACCESS_TOKEN_KEY=access_token \
  --build-arg VITE_REFRESH_TOKEN_KEY=refresh_token \
  --build-arg VITE_IMAGE_BASE_URL=https://images.example.com \
  --build-arg VITE_SITE_URL=https://tams.example.com \
  -t tams-web .
docker run -p 8080:80 tams-web
```

---

## 📁 Project Structure

```
src/
├── api/          # Axios instance and API calls (auth, items, users, logs, settings)
├── components/   # Reusable UI: tables, modals, forms, sidebar
├── constants/    # Page text and toast messages
├── context/      # React context (sidebar)
├── data/         # Static data for tables
├── hooks/        # TanStack Query hooks and custom hooks (SignalR, counts)
├── lib/          # Domain logic: filters, status board, anomalies, violations, kiosk display
├── routes/       # Pages (Dashboard, Assets, Loans, Counter, Anomalies, Violations, People, Settings, ...)
├── services/     # SignalR connection service
├── states/       # Zustand stores
├── theme/        # Theme configuration
├── utils/        # Helpers
└── @types/       # Shared TypeScript types
```

More docs:
- [SIGNALR_SETUP.md](SIGNALR_SETUP.md) – Real-time notification setup
- [DATA_MODELS.md](DATA_MODELS.md) – PRD data model and what it replaced
- [FRONTEND_EVALUATION.md](FRONTEND_EVALUATION.md) – Frontend evaluation notes

---