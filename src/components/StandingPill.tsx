import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import type { StudentStanding } from "../@types/types";

// Standing is computed by the backend: WARNED at 1 mark, BLOCKED at 2.
const STANDING_STYLES: Record<StudentStanding, { label: string; className: string; icon: typeof ShieldCheck }> = {
  GOOD: { label: "Good", className: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: ShieldCheck },
  WARNED: { label: "Warned", className: "bg-amber-50 text-amber-700 ring-amber-200", icon: ShieldAlert },
  BLOCKED: { label: "Blocked", className: "bg-rose-50 text-rose-700 ring-rose-200", icon: ShieldX },
};

export default function StandingPill({ standing }: { standing: StudentStanding }) {
  const style = STANDING_STYLES[standing] ?? STANDING_STYLES.GOOD;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style.className}`}>
      <style.icon className="h-3 w-3" />
      {style.label}
    </span>
  );
}
