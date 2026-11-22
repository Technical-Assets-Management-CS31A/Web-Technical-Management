import { useViolationsViewModel } from "../model/violations-view-model";
import ViolationsView from "./violations-view";

/** Route entry: connects the view model to the view. */
export default function ViolationsScreen() {
  const vm = useViolationsViewModel();
  return <ViolationsView {...vm} />;
}
