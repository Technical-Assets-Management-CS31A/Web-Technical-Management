import { useKioskDisplayViewModel } from "../model/kiosk-display-view-model";
import KioskDisplayView from "./kiosk-display-view";

/** Route entry: connects the view model to the view. */
export default function KioskDisplayScreen() {
  const vm = useKioskDisplayViewModel();
  return <KioskDisplayView {...vm} />;
}
