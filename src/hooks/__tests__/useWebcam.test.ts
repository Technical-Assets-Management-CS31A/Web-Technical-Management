import { describe, expect, it } from "vitest";
import { describeCameraError } from "../useWebcam";

const named = (name: string, message = "boom") => Object.assign(new Error(message), { name });

describe("describeCameraError", () => {
  it("explains a denied permission", () => {
    expect(describeCameraError(named("NotAllowedError"))).toMatch(/permission denied/i);
  });

  it("points at the USB webcam when no camera is found", () => {
    expect(describeCameraError(named("NotFoundError"))).toMatch(/USB webcam/);
  });

  it("flags a camera held by another app", () => {
    expect(describeCameraError(named("NotReadableError"))).toMatch(/already in use/);
    expect(describeCameraError(named("TrackStartError"))).toMatch(/already in use/);
  });

  it("falls back to the raw message for unknown errors", () => {
    expect(describeCameraError(named("WeirdError", "driver crashed"))).toBe("Camera unavailable: driver crashed");
    expect(describeCameraError("nope")).toBe("Camera unavailable.");
  });
});
