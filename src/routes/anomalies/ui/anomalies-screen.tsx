import { useAnomaliesViewModel } from "../model/anomalies-view-model";
import AnomaliesView from "./anomalies-view";

/** Route entry: connects the view model to the view. */
export default function AnomaliesScreen() {
  const vm = useAnomaliesViewModel();
  return <AnomaliesView {...vm} />;
}
