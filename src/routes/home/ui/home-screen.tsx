import { Navigate } from "@tanstack/react-router";
import { SidebarProvider } from "../../../context/SidebarContext";
import { useEndSession, useHomeViewModel } from "../model/home-view-model";
import HomeView from "./home-view";

function EndSession() {
  const { isDone } = useEndSession();
  return isDone ? <Navigate to="/" replace /> : null;
}

function HomeContent() {
  const vm = useHomeViewModel();
  if (vm.status === "end-session") return <EndSession />;
  return <HomeView isStaff={vm.isStaff} isSidebarExpanded={vm.isSidebarExpanded} />;
}

/** Route entry for /home: wires the view model to the view. */
export default function HomeScreen() {
  return (
    <SidebarProvider>
      <HomeContent />
    </SidebarProvider>
  );
}
