import { useEffect, useRef } from "react";
import { useRealtimeConnection, useRealtimeEvent, useRealtimeStatus } from "../hooks/useRealtime";
import { showToast } from "./AppToast";
import { formatEnum } from "../lib/utils";

/**
 * Mounted once in the Home layout for staff and admins.
 * Opens the SignalR connection (which also feeds useRealtimeStore and refreshes React Query keys)
 * and shows the toasts for events that need attention. Pages read live data through the useRealtime hooks.
 */
const AdminNotificationListener = () => {
  useRealtimeConnection();

  useRealtimeEvent("anomaly.raised", (e) => {
    showToast.warning("Location Anomaly", [formatEnum(e.type), e.assetCode, e.roomCode].filter(Boolean).join(" · "), { autoClose: 10000 });
  });

  useRealtimeEvent("warning.issued", (e) => {
    showToast.info(
      `Late Arrival Warning #${e.warningNo}`,
      `${e.studentName ?? "A student"}${e.penaltyTriggered ? " now has a Non-Compliance Mark." : " arrived late."}`,
    );
  });

  useRealtimeEvent("loan.overdue", (e) => {
    showToast.warning("Loan Overdue", [e.assetCode, e.studentName, e.sectionCode].filter(Boolean).join(" · "), { autoClose: 10000 });
  });

  useRealtimeEvent("station.healthChanged", (e) => {
    if (e.health === "OFFLINE") showToast.error("Station Offline", e.stationCode);
  });

  // Tell the user once if live updates drop; the client keeps retrying in the background.
  const { status } = useRealtimeStatus();
  const warned = useRef(false);
  useEffect(() => {
    if (status === "reconnecting" && !warned.current) {
      warned.current = true;
      showToast.warning("Live updates paused", "Reconnecting in the background. Data refreshes once it is back.", { toastId: "realtime-reconnecting" });
    }
    if (status === "connected") warned.current = false;
  }, [status]);

  return null;
};

export default AdminNotificationListener;
