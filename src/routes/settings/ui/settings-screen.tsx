import { useSettingsViewModel } from "../model/settings-view-model";
import SettingsView from "./settings-view";

/** Route entry: connects the view model to the view. */
export default function SettingsScreen() {
  const vm = useSettingsViewModel();
  return <SettingsView {...vm} />;
}
