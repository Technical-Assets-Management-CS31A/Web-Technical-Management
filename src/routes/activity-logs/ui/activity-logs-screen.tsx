import { useActivityLogsViewModel } from "../model/activity-logs-view-model";
import ActivityLogsView from "./activity-logs-view";

/** Route entry: connects the view model to the view. */
export default function ActivityLogsScreen() {
  const vm = useActivityLogsViewModel();
  return <ActivityLogsView {...vm} />;
}
