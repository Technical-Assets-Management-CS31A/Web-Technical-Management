import { useSyncExternalStore } from "react";

export type ThemePreference = "light" | "dark" | "system";

// Keep in sync with the inline script in index.html
const STORAGE_KEY = "theme-preference";
const CHANGE_EVENT = "theme-preference-change";

const systemQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function getThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // Storage blocked (private mode, etc.) — fall through to default
  }
  return "system";
}

function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "system") return systemQuery().matches ? "dark" : "light";
  return preference;
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function setThemePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Storage blocked — theme still applies for this session
  }
  applyTheme(preference);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Call once at startup: applies the saved theme and follows OS changes in "system" mode. */
export function initTheme() {
  applyTheme(getThemePreference());
  systemQuery().addEventListener("change", () => {
    if (getThemePreference() === "system") {
      applyTheme("system");
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
  });
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Current preference plus the theme actually shown ("system" resolved). */
export function useTheme() {
  const preference = useSyncExternalStore(subscribe, getThemePreference, () => "system" as ThemePreference);
  const resolved = useSyncExternalStore(
    subscribe,
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light" as const,
  );
  return { preference, resolved, setPreference: setThemePreference };
}
