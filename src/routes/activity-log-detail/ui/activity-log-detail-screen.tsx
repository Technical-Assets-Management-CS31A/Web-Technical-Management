import { useActivityLogDetailViewModel } from "../model/activity-log-detail-view-model";
import ActivityLogDetailView from "./activity-log-detail-view";

/** Route entry: connects the view model to the view. */
export default function ActivityLogDetailScreen() {
  const vm = useActivityLogDetailViewModel();
  return <ActivityLogDetailView {...vm} />;
}
