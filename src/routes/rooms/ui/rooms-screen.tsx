import { useRoomsViewModel } from "../model/rooms-view-model";
import RoomsView from "./rooms-view";

/** Route entry: connects the view model to the view. */
export default function RoomsScreen() {
  const vm = useRoomsViewModel();
  return <RoomsView {...vm} />;
}
