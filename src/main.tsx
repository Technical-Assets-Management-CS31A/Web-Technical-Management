import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Home from "./layout/Home.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import InventoryList from "./pages/InventoryList.tsx";
import { UserManagement } from "./pages/UserManagement.tsx";
import HistoryList from "./pages/HistoryList.tsx";
import Settings from "./pages/Settings.tsx";
import ViewItem from "./components/ViewItem.tsx";
import Archive from "./pages/Archive.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PublicRoute, ProtectedRoute } from "./utils/middleware/accessAuth.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./auth/Login.tsx";

const routes = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: (
      <PublicRoute>
        <App />
      </PublicRoute>
    ),
    children: [
      {
        index: true,
        element: <Login />,
      },
    ],
  },

  // Protected routes (wrap Home)
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "inventory-list", element: <InventoryList /> },
      { path: "user-management", element: <UserManagement /> },
      { path: "history-list", element: <HistoryList /> },
      { path: "settings", element: <Settings /> },
      { path: "archive-table", element: <Archive /> },
    ],
  },

  {
    path: "/item/:id",
    element: (
      <ProtectedRoute>
        <ViewItem />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);


const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={routes} />
    </QueryClientProvider>
  </StrictMode>,
);
