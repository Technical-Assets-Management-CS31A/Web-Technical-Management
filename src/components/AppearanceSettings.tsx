import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "../theme/theme";
import { SETTINGS_CONTENT as T } from "../constants/settingsContent";

const OPTIONS: { key: ThemePreference; icon: React.ElementType }[] = [
  { key: "light", icon: Sun },
  { key: "dark", icon: Moon },
  { key: "system", icon: Monitor },
];

// Hard-coded colors so each preview shows its own theme regardless of the active one
const PREVIEW = {
  light: { page: "#f8fafc", card: "#ffffff", line: "#e2e8f0", text: "#cbd5e1", accent: "#2563eb" },
  dark: { page: "#070d1c", card: "#0f172a", line: "#243044", text: "#334155", accent: "#3b82f6" },
};

function MiniPreview({ theme }: { theme: "light" | "dark" }) {
  const c = PREVIEW[theme];
  return (
    <div className="flex h-full w-full gap-1.5 p-2" style={{ backgroundColor: c.page }}>
      {/* Sidebar */}
      <div className="flex w-5 flex-col gap-1 rounded-md p-1" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }}>
        <span className="h-1.5 w-full rounded-sm" style={{ backgroundColor: c.accent }} />
        <span className="h-1 w-full rounded-sm" style={{ backgroundColor: c.text }} />
        <span className="h-1 w-full rounded-sm" style={{ backgroundColor: c.text }} />
      </div>
      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5">
        <span className="h-1.5 w-1/2 rounded-sm" style={{ backgroundColor: c.text }} />
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-4 rounded" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }} />
          ))}
        </div>
        <div className="flex-1 rounded" style={{ backgroundColor: c.card, border: `1px solid ${c.line}` }} />
      </div>
    </div>
  );
}

export default function AppearanceSettings() {
  const { preference, resolved, setPreference } = useTheme();

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">{T.appearance.title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{T.appearance.description}</p>
      </div>

      <div role="radiogroup" aria-label={T.appearance.title} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
        {OPTIONS.map(({ key, icon: Icon }) => {
          const isSelected = preference === key;
          const option = T.appearance.options[key];

          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setPreference(key)}
              className={`group flex flex-col overflow-hidden rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${
                isSelected
                  ? "border-blue-500 ring-1 ring-blue-500"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {/* Preview */}
              <div className="relative h-24 border-b border-slate-200">
                {key === "system" ? (
                  <div className="flex h-full">
                    <div className="w-1/2 overflow-hidden"><MiniPreview theme="light" /></div>
                    <div className="w-1/2 overflow-hidden"><MiniPreview theme="dark" /></div>
                  </div>
                ) : (
                  <MiniPreview theme={key} />
                )}
                {isSelected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="flex items-start gap-2.5 p-3">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{option.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="flex items-center gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
        {resolved === "dark" ? <Moon className="h-3.5 w-3.5 text-slate-400" /> : <Sun className="h-3.5 w-3.5 text-slate-400" />}
        {T.appearance.currentlyShowing(resolved)}
      </p>
    </section>
  );
}
