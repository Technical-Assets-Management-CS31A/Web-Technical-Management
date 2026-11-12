import { useCallback, useEffect, useRef, useState } from "react";

// Shared USB webcam logic for the counter computer (replaces the ESP32-CAM from the proposal).
// Used by the standalone camera test page and by the kiosk checkout photo step.

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export interface CameraResolution {
  width: number;
  height: number;
}

// The counter PC may also have a built-in camera, so the USB webcam the staff picked is remembered.
export const PREFERRED_CAMERA_KEY = "tams.counter.cameraId";

const VIDEO_SIZE: MediaTrackConstraints = { width: { ideal: 1280 }, height: { ideal: 720 } };

function readPreferredCamera(): string | null {
  try {
    return localStorage.getItem(PREFERRED_CAMERA_KEY);
  } catch {
    return null;
  }
}

function writePreferredCamera(deviceId: string) {
  try {
    localStorage.setItem(PREFERRED_CAMERA_KEY, deviceId);
  } catch {
    // Storage blocked: the browser default camera is used next time.
  }
}

export function isCameraSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

export function describeCameraError(err: unknown): string {
  if (!(err instanceof Error)) return "Camera unavailable.";
  switch (err.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera permission denied. Please allow camera access in your browser settings.";
    case "NotFoundError":
      return "No camera found. Check that the USB webcam is plugged in.";
    case "NotReadableError":
    case "TrackStartError":
      return "Camera is already in use by another application (e.g. OBS, Teams, Zoom). Close that app or choose a different camera.";
    case "OverconstrainedError":
      return "Selected camera is no longer available. Please choose another.";
    default:
      return `Camera unavailable: ${err.message}`;
  }
}

async function listCameras(): Promise<CameraDevice[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((d) => d.kind === "videoinput")
    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }));
}

export function captureFrame(videoEl: HTMLVideoElement, fileName = "checkout-photo.jpg"): Promise<File> {
  if (!videoEl.videoWidth || !videoEl.videoHeight) {
    return Promise.reject(new Error("Camera is not ready yet"));
  }
  const canvas = document.createElement("canvas");
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Canvas 2D context unavailable"));
  ctx.drawImage(videoEl, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob returned null"));
          return;
        }
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  });
}

interface UseWebcamOptions {
  /** Open the camera on mount (default true). */
  autoStart?: boolean;
}

export function useWebcam({ autoStart = true }: UseWebcamOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Bumped on every start and on unmount so a slow getUserMedia can't win over a newer one.
  const requestRef = useRef(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [resolution, setResolution] = useState<CameraResolution | null>(null);

  const stopTracks = (s: MediaStream | null) => s?.getTracks().forEach((t) => t.stop());

  const stop = useCallback(() => {
    requestRef.current++;
    stopTracks(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setResolution(null);
    setStarting(false);
  }, []);

  const start = useCallback(async (deviceId?: string): Promise<MediaStream | null> => {
    if (!isCameraSupported()) {
      setError("This browser can't open a camera. Use Chrome or Edge over HTTPS (or localhost).");
      return null;
    }
    const requestId = ++requestRef.current;
    setStarting(true);
    setError(null);

    const open = (id: string | null) =>
      navigator.mediaDevices.getUserMedia({
        video: id ? { ...VIDEO_SIZE, deviceId: { exact: id } } : VIDEO_SIZE,
      });

    const explicit = !!deviceId;
    const targetId = deviceId ?? readPreferredCamera();

    try {
      let s: MediaStream;
      try {
        s = await open(targetId);
      } catch (err) {
        // A remembered camera that was unplugged shouldn't block the counter: fall back to the default.
        const missing = err instanceof Error && (err.name === "OverconstrainedError" || err.name === "NotFoundError");
        if (explicit || !targetId || !missing) throw err;
        s = await open(null);
      }

      if (requestId !== requestRef.current) {
        stopTracks(s);
        return null;
      }

      stopTracks(streamRef.current);
      streamRef.current = s;
      setStream(s);

      const track = s.getVideoTracks()[0];
      const settings = track?.getSettings() ?? {};
      setSelectedCameraId(settings.deviceId ?? "");
      if (settings.deviceId) writePreferredCamera(settings.deviceId);
      setResolution(settings.width && settings.height ? { width: settings.width, height: settings.height } : null);

      if (track) {
        track.onended = () => {
          if (streamRef.current !== s) return;
          streamRef.current = null;
          setStream(null);
          setResolution(null);
          setError("Camera disconnected. Reconnect the USB webcam and press Retry.");
        };
      }

      // Labels are only exposed after permission is granted.
      setCameras(await listCameras());
      return s;
    } catch (err) {
      if (requestId === requestRef.current) setError(describeCameraError(err));
      return null;
    } finally {
      if (requestId === requestRef.current) setStarting(false);
    }
  }, []);

  const switchCamera = useCallback(
    async (deviceId: string) => {
      const previousId = selectedCameraId;
      setSelectedCameraId(deviceId);
      const s = await start(deviceId);
      if (!s) setSelectedCameraId(previousId);
    },
    [selectedCameraId, start],
  );

  const capture = useCallback(async (fileName?: string) => {
    if (!videoRef.current) throw new Error("Camera is not ready yet");
    return captureFrame(videoRef.current, fileName);
  }, []);

  /**
   * Opens the camera if it is off, waits for the first frame, then captures.
   * Used by the unattended kiosk photo step, where nobody is there to press Start.
   */
  const captureWhenReady = useCallback(
    async (fileName?: string, timeoutMs = 5000) => {
      if (!streamRef.current && !(await start())) throw new Error("Camera could not be opened");
      const deadline = Date.now() + timeoutMs;
      while (!videoRef.current?.videoWidth) {
        if (Date.now() > deadline) throw new Error("Camera is not ready yet");
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return captureFrame(videoRef.current, fileName);
    },
    [start],
  );

  // Attach the stream once the <video> element is rendered.
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  // Keep the camera list current when a USB webcam is plugged in or removed.
  useEffect(() => {
    if (!isCameraSupported()) return;
    const onChange = () => {
      listCameras().then(setCameras).catch(() => {});
    };
    navigator.mediaDevices.addEventListener?.("devicechange", onChange);
    return () => navigator.mediaDevices.removeEventListener?.("devicechange", onChange);
  }, []);

  useEffect(() => {
    if (autoStart) start();
    return stop;
  }, [autoStart, start, stop]);

  const selectedCamera = cameras.find((c) => c.deviceId === selectedCameraId) ?? null;

  return {
    videoRef,
    stream,
    isLive: !!stream,
    starting,
    error,
    cameras,
    selectedCameraId,
    selectedCamera,
    resolution,
    start,
    stop,
    switchCamera,
    capture,
    captureWhenReady,
  };
}
