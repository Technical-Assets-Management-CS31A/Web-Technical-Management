import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, RefreshCw, XCircle } from "lucide-react";
import { isCameraSupported, useWebcam } from "../../../hooks/useWebcam";
import { useSessionPhotoCapture, type PhotoRun } from "../../../hooks/useSessionPhotoCapture";
import { COUNTER_CAMERA_CONTENT as T } from "../../../constants/counterCameraContent";

export const STEP_ORDER = ["AWAITING_FINGERPRINT", "AWAITING_ASSET", "AWAITING_PHOTO", "AWAITING_APPROVAL", "AWAITING_CONFIRM"] as const;

export interface TestPhoto {
  file: File;
  url: string;
  width: number;
  height: number;
  takenAt: Date;
  cameraLabel: string;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function readImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}


export const PHASE_STYLE: Record<PhotoRun["phase"], { box: string; icon: React.ElementType; spin?: boolean }> = {
  capturing: { box: "border-blue-200 bg-blue-50 text-blue-800", icon: Loader2, spin: true },
  retrying: { box: "border-amber-200 bg-amber-50 text-amber-800", icon: RefreshCw, spin: true },
  uploaded: { box: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: CheckCircle2 },
  denied: { box: "border-rose-200 bg-rose-50 text-rose-800", icon: XCircle },
  denyFailed: { box: "border-rose-200 bg-rose-50 text-rose-800", icon: AlertTriangle },
  aborted: { box: "border-slate-200 bg-slate-50 text-slate-700", icon: Info },
};

export const useCounterCameraViewModel = () => {
  const cam = useWebcam();
  const supported = isCameraSupported();
  const photoStep = useSessionPhotoCapture({ captureWhenReady: cam.captureWhenReady, enabled: supported });
  const [photo, setPhoto] = useState<TestPhoto | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Free the previous object URL whenever the photo changes or the page closes.
  useEffect(() => {
    if (!photo) return;
    return () => URL.revokeObjectURL(photo.url);
  }, [photo]);

  const handleCapture = async () => {
    setCapturing(true);
    setCaptureError(null);
    try {
      const stamp = new Date();
      const file = await cam.capture(`counter-test-${stamp.toISOString().replace(/[:.]/g, "-")}.jpg`);
      const url = URL.createObjectURL(file);
      const size = await readImageSize(url);
      setPhoto({ file, url, ...size, takenAt: stamp, cameraLabel: cam.selectedCamera?.label ?? "—" });
    } catch {
      setCaptureError(T.captureFailed);
    } finally {
      setCapturing(false);
    }
  };

  const status: "live" | "starting" | "error" | "off" = cam.isLive ? "live" : cam.starting ? "starting" : cam.error ? "error" : "off";
  const statusClass = {
    live: "bg-emerald-50 text-emerald-700",
    starting: "bg-blue-50 text-blue-700",
    error: "bg-rose-50 text-rose-700",
    off: "bg-slate-100 text-slate-600",
  }[status];

  return {
    cam,
    supported,
    photoStep,
    photo,
    setPhoto,
    capturing,
    setCapturing,
    captureError,
    setCaptureError,
    handleCapture,
    status,
    statusClass,
  };
};

export type CounterCameraViewModel = ReturnType<typeof useCounterCameraViewModel>;
