# 🧰 Technical Assets Management System

A web application that helps schools manage their technical equipment, such as HDMI cables, projectors, laptops, microphones and other stored items.
Staff can **add, track, lend and receive returned assets** for events and classroom use, and every borrow is recorded.

This repository contains the **frontend**. It talks to a separate C# / ASP.NET backend over REST and SignalR.

---

## 🎯 Project Overview

The **Technical Assets Management System** records school-owned technical items and who has them.
Each item and borrow is logged, so missing or misused equipment can be traced to a borrower.

### ✨ Key Features
- 📊 **Dashboard** – Summary badges, item status overview and borrowing activity charts.
- 📦 **Inventory Management** – Add, edit, view and archive items, set their status and condition, and bulk-import items from Excel.
- 🛒 **Borrowing** – Staff can lend items directly or walk a guest through the step-by-step borrow wizard.
- 📡 **RFID / Scan Controller** – Scan items and student RFID cards to speed up borrowing and returns.
- ⏳ **Pending Reservations** – Approve or deny borrow requests, with countdowns and due-soon reminders.
- ✅ **Active Borrows** – Track items currently out and process returns.
- 🔔 **Real-time Notifications** – Admins and staff get live updates through SignalR.
- 🗂️ **Archives** – Restore or permanently delete archived items, students and teachers.
- 📜 **Logs & History** – Activity logs and borrowing logs with detail views and filters.
- 📑 **Reports** – Export reports to PDF and Excel.
- 🔍 **Search, Filter & Pagination** – On all major tables.
- 🎨 **Appearance Settings** – Light and dark themes, profile editing and password changes.

### 👥 Users & Roles
- 🛡️ **SuperAdmin / Admin** – Full access to users, items, reservations, reports and archives.
- 🧑‍💼 **Staff** – Day-to-day operations: inventory, borrowing, returns and reservations.
- 🧑‍🏫 **Teacher** and 🎓 **Student** – Borrowers. They can be registered one by one or imported from Excel, and students can be linked to RFID cards.
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
| **Export / Import** | jsPDF, html2canvas, SheetJS (`xlsx`) |
| **Testing** | Vitest, React Testing Library |
| **Backend** | C# (ASP.NET), in a separate repository |
| **Database** | SQL |
| **Hosting** | Cloudflare (Wrangler) |
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

---

## 📁 Project Structure

```
src/
├── api/          # Axios instance and API calls (auth, items, users, logs, settings)
├── components/   # Reusable UI: tables, modals, forms, sidebar, wizards
├── constants/    # Page text and toast messages
├── context/      # React context (sidebar)
├── hooks/        # TanStack Query hooks and custom hooks (SignalR, counts)
├── loader/       # Skeleton loaders for each page
├── routes/       # Pages (Dashboard, Inventory, Borrow, Reports, Settings, ...)
├── services/     # SignalR connection service
├── states/       # Zustand stores
├── theme/        # Theme configuration
├── utils/        # Helpers
└── @types/       # Shared TypeScript types
```

More docs:
- [SIGNALR_SETUP.md](SIGNALR_SETUP.md) – Real-time notification setup
- [GENERATED_PASSWORD_VERIFICATION.md](GENERATED_PASSWORD_VERIFICATION.md) – Generated password flow

---

## 🤝 Contributing

1. Branch off `develop`.
2. Commit using conventional prefixes (`feat:`, `fix:`, `chore:`).
3. Open a pull request into `develop`.
