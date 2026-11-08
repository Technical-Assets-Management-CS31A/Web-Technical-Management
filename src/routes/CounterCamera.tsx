import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CameraOff,
  CheckCircle2,
  Circle,
  Download,
  ImageOff,
  Info,
  Loader2,
  Power,
  Trash2,
} from "lucide-react";
import { isCameraSupported, useWebcam } from "../hooks/useWebcam";
import { COUNTER_CAMERA_CONTENT as T } from "../constants/counterCameraContent";

// Standalone page for the counter computer: opens the USB webcam and takes a test photo.
// Not tied to a kiosk session; the session-linked capture lives on the Counter Station page.

interface TestPhoto {
  file: File;
  url: string;
  width: number;
  height: number;
  takenAt: Date;
  cameraLabel: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-slate-300" />
      )}
      <span className={ok ? "text-slate-900" : "text-slate-500"}>{label}</span>
    </li>
  );
}

export default function CounterCamera() {
  const cam = useWebcam();
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

  const supported = isCameraSupported();
  const status = cam.isLive ? "live" : cam.starting ? "starting" : cam.error ? "error" : "off";
  const statusClass = {
    live: "bg-emerald-50 text-emerald-700",
    starting: "bg-blue-50 text-blue-700",
    error: "bg-rose-50 text-rose-700",
    off: "bg-slate-100 text-slate-600",
  }[status];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 md:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">

        {/* Header */}
        <header className="space-y-3">
          <Link
            to="/home/rfid-controller"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {T.back}
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{T.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{T.description}</p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">

          {/* Viewfinder */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Camera className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {cam.selectedCamera?.label ?? T.cameraLabel}
                  </p>
                  <p className="text-xs text-slate-500">
                    {T.resolution}: {cam.resolution ? `${cam.resolution.width} × ${cam.resolution.height}` : "—"}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 self-start rounded-md px-2 py-0.5 text-xs font-medium sm:self-auto ${statusClass}`}>
                {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />}
                {T.status[status]}
              </span>
            </div>

            <div className="space-y-4 p-5">
              {/* Camera picker */}
              <div>
                <label htmlFor="counter-camera-select" className="mb-1 block text-xs font-medium text-slate-600">
                  {T.cameraLabel}
                </label>
                <select
                  id="counter-camera-select"
                  value={cam.selectedCameraId}
                  onChange={(e) => cam.switchCamera(e.target.value)}
                  disabled={cam.cameras.length === 0 || cam.starting}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                >
                  {cam.cameras.length === 0 ? (
                    <option value="">{T.noCameras}</option>
                  ) : (
                    cam.cameras.map((c) => (
                      <option key={c.deviceId} value={c.deviceId}>
                        {c.label}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Preview */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
                {cam.isLive ? (
                  <video ref={cam.videoRef} autoPlay playsInline muted className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-slate-300">
                    {cam.starting ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        {T.starting}
                      </>
                    ) : cam.error ? (
                      <>
                        <AlertTriangle className="h-6 w-6 text-amber-400" />
                        <span className="max-w-sm">{cam.error}</span>
                      </>
                    ) : (
                      <>
                        <CameraOff className="h-6 w-6 text-slate-500" />
                        <span className="font-medium text-slate-200">{T.offTitle}</span>
                        <span className="text-xs text-slate-400">{T.offHint}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {captureError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{captureError}</p>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={!cam.isLive || capturing}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {capturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  {capturing ? T.actions.capturing : T.actions.capture}
                </button>
                {cam.isLive ? (
                  <button
                    type="button"
                    onClick={cam.stop}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Power className="h-4 w-4" />
                    {T.actions.stop}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => cam.start(cam.selectedCameraId || undefined)}
                    disabled={cam.starting || !supported}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Power className="h-4 w-4" />
                    {cam.error ? T.actions.retry : T.actions.start}
                  </button>
                )}
              </div>
            </div>
          </section>

          <div className="space-y-6">
            {/* Test photo */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">{T.photo.title}</p>
              </div>
              <div className="space-y-4 p-5">
                {photo ? (
                  <>
                    <img
                      src={photo.url}
                      alt={T.photo.alt}
                      className="aspect-video w-full rounded-lg border border-slate-200 bg-slate-100 object-contain"
                    />
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-slate-500">{T.photo.takenAt}</dt>
                        <dd className="font-medium text-slate-900">{photo.takenAt.toLocaleTimeString()}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">{T.photo.size}</dt>
                        <dd className="font-medium text-slate-900">{formatBytes(photo.file.size)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">{T.photo.dimensions}</dt>
                        <dd className="font-medium text-slate-900">
                          {photo.width ? `${photo.width} × ${photo.height}` : "—"}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-slate-500">{T.photo.camera}</dt>
                        <dd className="truncate font-medium text-slate-900" title={photo.cameraLabel}>{photo.cameraLabel}</dd>
                      </div>
                    </dl>
                    <div className="flex gap-2">
                      <a
                        href={photo.url}
                        download={photo.file.name}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Download className="h-4 w-4" />
                        {T.actions.download}
                      </a>
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {T.actions.clear}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                    <ImageOff className="h-6 w-6 text-slate-300" />
                    <p className="text-sm font-medium text-slate-900">{T.photo.emptyTitle}</p>
                    <p className="max-w-xs text-sm text-slate-500">{T.photo.emptyHint}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Checks */}
            <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
              <p className="mb-3 text-sm font-semibold text-slate-900">{T.checks.title}</p>
              <ul className="space-y-2">
                <CheckRow ok={supported} label={T.checks.supported} />
                <CheckRow ok={cam.cameras.length > 0} label={T.checks.detected} />
                <CheckRow ok={cam.isLive} label={T.checks.live} />
                <CheckRow ok={!!photo} label={T.checks.captured} />
              </ul>
            </section>
          </div>
        </div>

        <p className="flex items-start gap-2 text-xs text-slate-500">
          <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{T.footerHint}</span>
        </p>
      </div>
    </div>
  );
}
