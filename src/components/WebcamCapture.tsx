import { useState } from "react";
import { useWebcam } from "../hooks/useWebcam";

interface WebcamCaptureProps {
  onCapture: (file: File | null) => void;
  capturedPreview: string | null;
}

export const WebcamCapture = ({ onCapture, capturedPreview }: WebcamCaptureProps) => {
  const cam = useWebcam();
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const handleCapture = async () => {
    setIsCapturing(true);
    setCaptureError(null);
    try {
      const file = await cam.capture();
      cam.stop();
      onCapture(file);
    } catch {
      setCaptureError("Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = async () => {
    onCapture(null);
    setCaptureError(null);
    await cam.start(cam.selectedCameraId || undefined);
  };

  // ── Captured preview ──────────────────────────────────────────────────────
  if (capturedPreview) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-gray-700">Photo captured</p>
        <img
          src={capturedPreview}
          alt="Captured checkout photo"
          className="w-64 h-48 object-cover rounded-lg shadow-md border border-gray-200"
        />
        <button
          type="button"
          onClick={handleRetake}
          className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          Retake
        </button>
      </div>
    );
  }

  // ── Live viewfinder ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-gray-600 text-center">
        Capture a photo of the borrower for the checkout record. A photo is required before proceeding.
      </p>

      {/* Camera selector — only shown once the stream is live and multiple cameras exist */}
      {cam.isLive && cam.cameras.length > 1 && (
        <div className="w-full max-w-xs">
          <label htmlFor="camera-select" className="block text-xs font-medium text-gray-600 mb-1">
            Switch Camera
          </label>
          <select
            id="camera-select"
            value={cam.selectedCameraId}
            onChange={(e) => cam.switchCamera(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {cam.cameras.map((c) => (
              <option key={c.deviceId} value={c.deviceId}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Camera error */}
      {cam.error && (
        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {cam.error}
          <button
            type="button"
            onClick={() => cam.start()}
            className="ml-2 underline text-red-700 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Capture error */}
      {captureError && (
        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {captureError}
        </div>
      )}

      {/* Loading state while camera is starting */}
      {!cam.isLive && !cam.error && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Starting camera…
        </div>
      )}

      {/* Video preview */}
      {cam.isLive && (
        <div className="relative">
          <video
            ref={cam.videoRef}
            autoPlay
            playsInline
            muted
            className="w-64 h-48 object-cover rounded-lg shadow-md border border-gray-200 bg-black"
          />
        </div>
      )}

      {cam.isLive && (
        <button
          type="button"
          onClick={handleCapture}
          disabled={isCapturing}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCapturing ? "Capturing…" : "Capture Photo"}
        </button>
      )}
    </div>
  );
};
