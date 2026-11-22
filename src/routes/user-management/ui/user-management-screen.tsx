import { useUserManagementViewModel } from "../model/user-management-view-model";
import UserManagementView from "./user-management-view";

/** Route entry: connects the view model to the view. */
export default function UserManagementScreen() {
  const vm = useUserManagementViewModel();
  return <UserManagementView {...vm} />;
}
