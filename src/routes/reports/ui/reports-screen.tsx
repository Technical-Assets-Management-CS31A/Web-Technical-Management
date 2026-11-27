import { useReportsViewModel } from "../model/reports-view-model";
import ReportsView from "./reports-view";

/** Route entry for /home/reports: connects the view model to the view. */
export default function ReportsScreen() {
  const vm = useReportsViewModel();
  return <ReportsView {...vm} />;
}
