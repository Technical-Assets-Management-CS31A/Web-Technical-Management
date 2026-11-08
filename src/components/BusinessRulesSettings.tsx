import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Clock,
  Gavel,
  Loader2,
  Lock,
  MonitorSmartphone,
  RadioTower,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { showToast } from "./AppToast";
import { getErrorMessage, SelectInput, TextInput } from "./form/FormKit";
import ErrorTable from "./ErrorTables";
import { useSystemSettings, useUpdateSettings } from "../hooks/settingsHooks";
import { useRuleDraftState } from "../states/settings-state";
import {
  CLASS_LENGTH_OPTIONS,
  EDITABLE_RULES,
  FIXED_POLICIES,
  MAX_LOAN_MINUTES,
  RULE_GROUPS,
  RULE_KEYS,
  UNIT_LABEL,
  formatMinutes,
  formatRuleValue,
  validateRules,
  type EditableRule,
} from "../constants/businessRules";

const GROUP_ICONS: Record<string, React.ElementType> = {
  loans: Clock,
  kiosk: MonitorSmartphone,
  stations: RadioTower,
  penalties: Gavel,
};

// Numbers from the backend may come back as "15" or "15.0"; compare them as numbers.
const sameValue = (a: string | undefined, b: string | undefined) =>
  a !== undefined && b !== undefined && a.trim() !== "" && b.trim() !== "" && Number(a) === Number(b);

type RuleRowProps = {
  rule: EditableRule;
  value: string;
  isEdited: boolean;
  isSet: boolean;
  error?: string;
  canEdit: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
};

function RuleRow({ rule, value, isEdited, isSet, error, canEdit, disabled, onChange }: RuleRowProps) {
  const inputId = `rule-${rule.key}`;
  const isDefault = sameValue(value, String(rule.defaultValue));
  const unit = UNIT_LABEL[rule.unit];
  const rangeHint = rule.options ? null : `${rule.min} to ${rule.max}${unit ? ` ${unit}` : ""}`;

  return (
    <li className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 ${isEdited ? "bg-blue-50/40" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={inputId} className="text-sm font-medium text-slate-900">
            {rule.label}
          </label>
          {isEdited && (
            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
              Unsaved
            </span>
          )}
          {!isSet && !isEdited && (
            <span
              title="No value is saved on the server yet, so the PRD default applies."
              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200"
            >
              Using default
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{rule.description}</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Default {formatRuleValue(rule, rule.defaultValue)}
          {rangeHint && <> · Allowed {rangeHint}</>} · {rule.source}
        </p>
      </div>

      <div className="w-full shrink-0 sm:w-44">
        <div className="flex items-center gap-1.5">
          <div className="relative min-w-0 flex-1">
            {rule.options ? (
              <SelectInput
                id={inputId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={!canEdit || disabled}
                error={!!error}
              >
                {rule.options.map((option) => (
                  <option key={option} value={String(option)}>
                    {option} hours
                  </option>
                ))}
              </SelectInput>
            ) : (
              <>
                <TextInput
                  id={inputId}
                  type="number"
                  inputMode="numeric"
                  min={rule.min}
                  max={rule.max}
                  step={1}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  readOnly={!canEdit}
                  disabled={disabled}
                  error={!!error}
                  aria-describedby={error ? `${inputId}-error` : undefined}
                  className={`tabular-nums ${unit ? "pr-12" : ""}`}
                />
                {unit && (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{unit}</span>
                )}
              </>
            )}
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => onChange(String(rule.defaultValue))}
              disabled={isDefault || disabled}
              title={`Reset to default (${formatRuleValue(rule, rule.defaultValue)})`}
              aria-label={`Reset ${rule.label} to default`}
              className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:invisible"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 flex items-start gap-1 text-xs text-rose-600">
            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </li>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  footer,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {children}
      {footer}
    </section>
  );
}

export default function BusinessRulesSettings({ canEdit }: { canEdit: boolean }) {
  const { data: settings = [], isLoading, isError } = useQuery(useSystemSettings());
  const updateSettings = useUpdateSettings();
  const { ruleDraft, setRuleDraftValue, clearRuleDraft } = useRuleDraftState();

  // Saved value per key; a key missing on the server falls back to the PRD default.
  const saved = useMemo(() => {
    const byKey = new Map(settings.map((s) => [s.key, s.value]));
    return Object.fromEntries(
      EDITABLE_RULES.map((rule) => [rule.key, { value: byKey.get(rule.key) ?? String(rule.defaultValue), isSet: byKey.has(rule.key) }]),
    ) as Record<string, { value: string; isSet: boolean }>;
  }, [settings]);

  const values = useMemo(
    () => Object.fromEntries(EDITABLE_RULES.map((rule) => [rule.key, ruleDraft[rule.key] ?? saved[rule.key].value])),
    [ruleDraft, saved],
  );

  const errors = useMemo(() => validateRules(values), [values]);
  const changedKeys = EDITABLE_RULES.filter((rule) => ruleDraft[rule.key] !== undefined).map((rule) => rule.key);
  const hasErrors = Object.keys(errors).length > 0;
  const isSaving = updateSettings.isPending;

  const handleChange = (rule: EditableRule, value: string) => {
    // Typing the saved value back drops the draft, so the row stops showing as edited.
    setRuleDraftValue(rule.key, sameValue(value, saved[rule.key].value) ? null : value);
  };

  const handleSave = () => {
    if (!changedKeys.length || hasErrors || isSaving) return;
    const payload = changedKeys.map((key) => ({ key, value: String(Number(values[key])) }));
    updateSettings.mutate(payload, {
      onSuccess: () => {
        clearRuleDraft();
        showToast.success(
          "Business rules saved",
          `${payload.length} ${payload.length === 1 ? "rule was" : "rules were"} updated. New sessions and loans use them.`,
        );
      },
      onError: (err) => showToast.error("Failed", getErrorMessage(err, "Could not save the business rules.")),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        Loading business rules…
      </div>
    );
  }

  if (isError) return <ErrorTable />;

  const grace = Number(values[RULE_KEYS.returnGrace]);
  const longestClass = Math.max(...CLASS_LENGTH_OPTIONS) * 60;
  const loanSummary = errors[RULE_KEYS.returnGrace] ? null : (
    <p className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
      Loan due time = checkout + class length + grace period. Longest loan now:{" "}
      <span className="font-medium text-slate-700">{formatMinutes(longestClass + grace)}</span> (limit{" "}
      {formatMinutes(MAX_LOAN_MINUTES)}).
    </p>
  );

  return (
    <div className="space-y-6">
      {!canEdit && (
        <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>You can view these rules. Only an Admin can change them.</span>
        </div>
      )}

      {RULE_GROUPS.map((group) => (
        <SectionCard
          key={group.id}
          icon={GROUP_ICONS[group.id] ?? Clock}
          title={group.title}
          description={group.description}
          footer={group.id === "loans" ? loanSummary : undefined}
        >
          <ul className="divide-y divide-slate-100">
            {group.rules.map((rule) => (
              <RuleRow
                key={rule.key}
                rule={rule}
                value={values[rule.key]}
                isEdited={ruleDraft[rule.key] !== undefined}
                isSet={saved[rule.key].isSet}
                error={errors[rule.key]}
                canEdit={canEdit}
                disabled={isSaving}
                onChange={(value) => handleChange(rule, value)}
              />
            ))}
          </ul>
        </SectionCard>
      ))}

      <SectionCard icon={ShieldAlert} title="Fixed policies" description="Set by the PRD. Shown for reference; they cannot be changed here.">
        <ul className="divide-y divide-slate-100">
          {FIXED_POLICIES.map((policy) => (
            <li key={policy.label} className="px-5 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-900">{policy.label}</p>
                <Lock className="h-3 w-3 text-slate-400" aria-label="Fixed" />
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{policy.description}</p>
              <p className="mt-1 text-[11px] text-slate-400">{policy.source}</p>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Save bar: stays in view while there are unsaved edits */}
      {canEdit && changedKeys.length > 0 && (
        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-sm text-slate-700">
            {hasErrors ? (
              <span className="flex items-center gap-1.5 text-rose-600">
                <AlertCircle className="h-4 w-4" />
                Fix the highlighted rules before saving.
              </span>
            ) : (
              <>
                <span className="font-medium">{changedKeys.length}</span> unsaved {changedKeys.length === 1 ? "change" : "changes"}
              </>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearRuleDraft}
              disabled={isSaving}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || hasErrors}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
