import { useInventoryListViewModel } from "../model/inventory-list-view-model";
import InventoryListView from "./inventory-list-view";

/** Route entry: connects the view model to the view. */
export default function InventoryListScreen() {
  const vm = useInventoryListViewModel();
  return <InventoryListView {...vm} />;
}
