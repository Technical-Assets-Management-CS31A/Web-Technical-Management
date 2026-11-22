import { DashboardSkeletonLoader } from "./dashboard-skeleton";
import { useDashboardViewModel } from "../model/dashboard-view-model";
import DashboardView from "./dashboard-view";

/** Route entry for /home/dashboard. */
export default function DashboardScreen() {
  const { isLoading, ...vm } = useDashboardViewModel();
  if (isLoading) return <DashboardSkeletonLoader />;
  return <DashboardView {...vm} />;
}
