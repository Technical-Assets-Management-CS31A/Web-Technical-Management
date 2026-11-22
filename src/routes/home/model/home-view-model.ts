import { useEffect, useState } from "react";
import { useSidebar } from "../../../context/SidebarContext";
import { isAccountRole, UserData } from "../../../utils/usersData/userData";
import { logoutUserApi } from "../../../api/auth_api";

export type HomeViewModel =
  | { status: "end-session" }
  | { status: "ready"; isStaff: boolean; isSidebarExpanded: boolean };

/** State for the signed-in shell: who is signed in and how the sidebar is laid out. */
export const useHomeViewModel = (): HomeViewModel => {
  const { isSidebarExpanded } = useSidebar();
  const userData = UserData();

  // A session whose role is not a users-table account (e.g. an old student login) is ended.
  if (!isAccountRole(userData.role)) return { status: "end-session" };

  // Instructors get their notices on the mobile app; staff dashboards get live SignalR events.
  const isStaff = userData.role !== "INSTRUCTOR";
  return { status: "ready", isStaff, isSidebarExpanded };
};

/** Signs the session out once; `isDone` turns true when the user can be sent to the login page. */
export const useEndSession = () => {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // The next login clears the query cache, so the stale ["me"] is not reused.
    logoutUserApi()
      .catch(() => undefined)
      .finally(() => setIsDone(true));
  }, []);

  return { isDone };
};
