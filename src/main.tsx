import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Home from "./layout/Home.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import InventoryList from "./pages/InventoryList.tsx";
import ItemList from "./pages/ItemList.tsx";
import { Staff } from "./pages/Staff.tsx";
import HistoryList from "./pages/HistoryList.tsx";
import ViewItem from "./components/ViewItem.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PublicRoute, ProtectedRoute } from "./utils/middleware/accessAuth.tsx";
import NotFound from "./pages/NotFound.tsx";

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      // <PublicRoute>
      <App />
      // </PublicRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/home",
    element: <Home />,
    children: [
      {
        path: "dashboard",
        element: (
          // <ProtectedRoute>
          <Dashboard />
          // </ProtectedRoute>
        ),
      },
      {
        path: "inventory-list",
        element: (
          // <ProtectedRoute>
          <InventoryList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "item-list",
        element: (
          // <ProtectedRoute>
          <ItemList />
          // </ProtectedRoute>
        ),
      },
      {
        path: "staff",
        element: (
          // <ProtectedRoute>
          <Staff />
          // </ProtectedRoute>
        ),
      },
      {
        path: "history-list",
        element: (
          // <ProtectedRoute>
          <HistoryList />
          // </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/items/:id",
    element: (
      // <ProtectedRoute>
      <ViewItem />
      // </ProtectedRoute>
    ),
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={routes} />
    </QueryClientProvider>
  </StrictMode>
);
