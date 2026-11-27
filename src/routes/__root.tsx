import { createRoute, createRootRoute, redirect } from "@tanstack/react-router";

import App from "../App";
import Login from "./auth/login/ui/login-screen";
import Dashboard from "./dashboard/ui/dashboard-screen";
import Home from "./home/ui/home-screen";
import InventoryList from "./inventory-list/ui/inventory-list-screen";
import UserManagement from "./user-management/ui/user-management-screen";
import Settings from "./settings/ui/settings-screen";
import { ProtectedRoute, PublicRoute } from "../utils/middleware/accessAuth";
import ViewItem from "../components/ViewItem";
import ActivityLogs from "./activity-logs/ui/activity-logs-screen";
import ActivityLogDetail from "./activity-log-detail/ui/activity-log-detail-screen";
import Loans from "./loans/ui/loans-screen";
import LoanDetail from "./loan-detail/ui/loan-detail-screen";
import { isLoanStatusFilter } from "../lib/loanFilters";
import RfidController from "./rfid-controller/ui/rfid-controller-screen";
import Reports from "./reports/ui/reports-screen";
import Rooms from "./rooms/ui/rooms-screen";
import AuthCards from "./auth-cards/ui/auth-cards-screen";
import CounterCamera from "./counter-camera/ui/counter-camera-screen";
import KioskDisplay from "./kiosk-display/ui/kiosk-display-screen";
import Anomalies from "./anomalies/ui/anomalies-screen";
import { isAnomalyTypeFilter, isAnomalyView, type AnomalyView } from "../lib/anomalies";
import Violations from "./violations/ui/violations-screen";
import { isStudentViolationFilter, isViolationsTab, type StudentViolationFilter, type ViolationsTab } from "../lib/violations";
import type { AnomalyType, ReportKey } from "../@types/types";
import { isDateInput, isReportKey, isReportRange, type ReportRange } from "../lib/reports";


export const Route = createRootRoute({
    component: App,
});

const indexRoute = createRoute({
    getParentRoute: () => Route,
    path: "/",
    component: () => (
        <PublicRoute>
            <Login />
        </PublicRoute>
    )
});

const homeRoute = createRoute({
    getParentRoute: () => Route,
    path: "home",
    component: () => (
        <ProtectedRoute>
            <Home />
        </ProtectedRoute>
    ),
});

// Standalone (no sidebar) so the counter computer can run it full-screen.
const CounterCameraRoute = createRoute({
    getParentRoute: () => Route,
    path: "counter-camera",
    component: () => (
        <ProtectedRoute>
            <CounterCamera />
        </ProtectedRoute>
    ),
});

// Kiosk confirmation view (PRD 6.2, 6.7): standalone so it can run full-screen next to the kiosk.
// ?station=KIOSK-01 follows one counter kiosk.
const KioskDisplayRoute = createRoute({
    getParentRoute: () => Route,
    path: "counter-display",
    validateSearch: (search: Record<string, unknown>): { station?: string } =>
        typeof search.station === "string" && search.station ? { station: search.station } : {},
    component: () => (
        <ProtectedRoute>
            <KioskDisplay />
        </ProtectedRoute>
    ),
});

const DashboardRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "dashboard",
    component: Dashboard,
});

const InventoryListRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "inventory-list",
    component: InventoryList,
});

const UserManagementRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "user-management",
    component: UserManagement,
});


const SettingsRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "settings",
    component: Settings,
});

export const ViewItemRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "item/$id",
    component: ViewItem
})

const ActivityLogsRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "activity-logs",
    component: ActivityLogs
})

const ActivityLogDetailRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "activity-logs/$id",
    component: ActivityLogDetail
})

// PRD 6.5 Loans: read-only list of kiosk loans. ?status= and ?roomId= deep-link a filter.
const LoansRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "loans",
    validateSearch: (search: Record<string, unknown>): { status?: string; roomId?: string } => ({
        ...(isLoanStatusFilter(search.status) && search.status !== "all" ? { status: search.status } : {}),
        ...(typeof search.roomId === "string" && search.roomId ? { roomId: search.roomId } : {}),
    }),
    component: Loans
})

// PRD 6.5 Loan detail: checkout photo, class length, due time, room and approval ledger.
const LoanDetailRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "loans/$loanId",
    component: LoanDetail
})

// The old lent-items pages now redirect to Loans so bookmarks keep working.
const ActiveBorrowedItemsRedirect = createRoute({
    getParentRoute: () => homeRoute,
    path: "active-borrowed-items",
    beforeLoad: () => { throw redirect({ to: "/home/loans", replace: true }); },
})

const HistoryListRedirect = createRoute({
    getParentRoute: () => homeRoute,
    path: "history-list",
    beforeLoad: () => { throw redirect({ to: "/home/loans", replace: true }); },
})

const RfidControllerRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "rfid-controller",
    component: RfidController
})

const ReportsRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "/reports",
    validateSearch: (search: Record<string, unknown>): { report?: ReportKey; range?: ReportRange; from?: string; to?: string } => ({
        ...(isReportKey(search.report) ? { report: search.report } : {}),
        ...(isReportRange(search.range) ? { range: search.range } : {}),
        ...(search.range === "custom" && isDateInput(search.from) ? { from: search.from } : {}),
        ...(search.range === "custom" && isDateInput(search.to) ? { to: search.to } : {}),
    }),
    component: Reports
})

const RoomsRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "rooms",
    component: Rooms
})

const AuthCardsRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "auth-cards",
    component: AuthCards
})

// PRD FR-4.5 / US-09: anomalies queue. ?view=resolved and ?type=WRONG_ROOM deep-link a filter.
const AnomaliesRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "anomalies",
    validateSearch: (search: Record<string, unknown>): { view?: AnomalyView; type?: AnomalyType } => ({
        ...(isAnomalyView(search.view) && search.view !== "active" ? { view: search.view } : {}),
        ...(isAnomalyTypeFilter(search.type) && search.type !== "all" ? { type: search.type } : {}),
    }),
    component: Anomalies
})

// PRD FR-6.8 / US-10: violations and resolution. ?tab=instructors and ?filter=holds deep-link a view.
const ViolationsRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "violations",
    validateSearch: (search: Record<string, unknown>): { tab?: ViolationsTab; filter?: StudentViolationFilter } => ({
        ...(isViolationsTab(search.tab) && search.tab !== "students" ? { tab: search.tab } : {}),
        ...(isStudentViolationFilter(search.filter) && search.filter !== "all" ? { filter: search.filter } : {}),
    }),
    component: Violations
})

export const routeTree = Route.addChildren([
    indexRoute,
    CounterCameraRoute,
    KioskDisplayRoute,
    homeRoute.addChildren([
        DashboardRoute,
        InventoryListRoute,
        UserManagementRoute,
        SettingsRoute,
        ViewItemRoute,
        ActivityLogsRoute,
        ActivityLogDetailRoute,
        LoansRoute,
        LoanDetailRoute,
        ActiveBorrowedItemsRedirect,
        HistoryListRedirect,
        RfidControllerRoute,
        ReportsRoute,
        RoomsRoute,
        AuthCardsRoute,
        AnomaliesRoute,
        ViolationsRoute
    ]),
]);
