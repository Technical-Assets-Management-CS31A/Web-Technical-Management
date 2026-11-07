import { createRoute, createRootRoute } from "@tanstack/react-router";

import App from "../App";
import Login from "./auth/Login";
import Dashboard from "./Dashboard";
import Home from "./Home";
import InventoryList from "./InventoryList";
import UserManagement from "./UserManagement";
import HistoryList from "./HistoryList";
import Settings from "./Settings";
import { ProtectedRoute, PublicRoute } from "../utils/middleware/accessAuth";
import ViewItem from "../components/ViewItem";
import ActivityLogs from "./ActivityLogs";
import ActivityLogDetail from "./ActivityLogDetail";
import ActiveBorrowedItems from "./ActiveBorrowedItems";
import RfidController from "./RfidController";
import Reports from "./Reports";
import Rooms from "./Rooms";
import AuthCards from "./AuthCards";


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

const HistoryListRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "history-list",
    component: HistoryList,
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

const ActiveBorrowedItemsRoute = createRoute({
    getParentRoute: () => homeRoute,
    path: "active-borrowed-items",
    component: ActiveBorrowedItems
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
    homeRoute.addChildren([
        DashboardRoute,
        InventoryListRoute,
        UserManagementRoute,
        HistoryListRoute,
        SettingsRoute,
        ViewItemRoute,
        ActivityLogsRoute,
        ActivityLogDetailRoute,
        ActiveBorrowedItemsRoute,
        RfidControllerRoute,
        ReportsRoute,
        RoomsRoute,
        AuthCardsRoute
    ]),
]);
