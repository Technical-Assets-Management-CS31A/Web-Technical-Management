import { useRfidControllerViewModel } from "../model/rfid-controller-view-model";
import RfidControllerView from "./rfid-controller-view";

/** Route entry: connects the view model to the view. */
export default function RfidControllerScreen() {
  const vm = useRfidControllerViewModel();
  return <RfidControllerView {...vm} />;
}
