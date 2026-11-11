import { createRoute, createRootRoute, redirect } from "@tanstack/react-router";

import App from "../App";
import Login from "./auth/Login";
import Dashboard from "./Dashboard";
import Home from "./Home";
import InventoryList from "./InventoryList";
import UserManagement from "./UserManagement";
import Settings from "./Settings";
import { ProtectedRoute, PublicRoute } from "../utils/middleware/accessAuth";
import ViewItem from "../components/ViewItem";
import ActivityLogs from "./ActivityLogs";
import ActivityLogDetail from "./ActivityLogDetail";
import Loans from "./Loans";
import { isLoanStatusFilter } from "../lib/loanFilters";
import RfidController from "./RfidController";
import Reports from "./Reports";
import Rooms from "./Rooms";
import AuthCards from "./AuthCards";
import CounterCamera from "./CounterCamera";


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

export const routeTree = Route.addChildren([
    indexRoute,
    CounterCameraRoute,
    homeRoute.addChildren([
        DashboardRoute,
        InventoryListRoute,
        UserManagementRoute,
        SettingsRoute,
        ViewItemRoute,
        ActivityLogsRoute,
        ActivityLogDetailRoute,
        LoansRoute,
        ActiveBorrowedItemsRedirect,
        HistoryListRedirect,
        RfidControllerRoute,
        ReportsRoute,
        RoomsRoute,
        AuthCardsRoute
    ]),
]);
