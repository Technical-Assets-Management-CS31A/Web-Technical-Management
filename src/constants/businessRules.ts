// Business rules from PRD 4.1, edited on the Settings screen (FR-9.5).
// Each editable rule maps to one system_settings row ({ key, value }) served by GET/PUT /settings.
// Ranges marked "Team call" are not in the PRD; they keep values sane until the backend enforces its own.

export type RuleSource = "Team decision" | "Proposal" | "Assumption";
export type RuleUnit = "minutes" | "seconds" | "hours" | "count";

export interface EditableRule {
  key: string;
  label: string;
  description: string;
  unit: RuleUnit;
  defaultValue: number;
  min: number;
  max: number;
  /** When set, the value must be one of these (e.g. class lengths). */
  options?: readonly number[];
  source: RuleSource;
}

export interface FixedPolicy {
  label: string;
  description: string;
  source: RuleSource | "Proposal + team decision";
}

export interface RuleGroup {
  id: string;
  title: string;
  description: string;
  rules: EditableRule[];
}

export const RULE_KEYS = {
  transitWindow: "transit_window_minutes",
  defaultClassLength: "default_class_length_hours",
  returnGrace: "return_grace_minutes",
  kioskPollInterval: "kiosk_poll_interval_seconds",
  approvalTimeout: "instructor_approval_timeout_seconds",
  kioskIdleTimeout: "kiosk_idle_timeout_seconds",
  heartbeatInterval: "station_heartbeat_interval_seconds",
  stationWarningAfter: "station_warning_missed_windows",
  stationOfflineAfter: "station_offline_missed_windows",
  lateWarningLimit: "late_arrival_warning_limit",
  marksBeforeBlock: "non_compliance_marks_before_block",
} as const;

/** Class lengths an instructor can pick at approval (PRD 4.1). */
export const CLASS_LENGTH_OPTIONS = [1.5, 2, 2.5, 3] as const;
/** PRD 4.1: due_at = checkout + class length + grace, at most 3 h 30 min. */
export const MAX_LOAN_MINUTES = 210;

export const RULE_GROUPS: RuleGroup[] = [
  {
    id: "loans",
    title: "Loans and returns",
    description: "How long a borrow lasts and when it becomes overdue.",
    rules: [
      {
        key: RULE_KEYS.transitWindow,
        label: "Transit window",
        description: "Time from checkout to the room tap before the loan is flagged.",
        unit: "minutes",
        defaultValue: 10,
        min: 5, // Team call
        max: 30, // Team call
        source: "Proposal",
      },
      {
        key: RULE_KEYS.defaultClassLength,
        label: "Default class length",
        description: "Pre-selected when an instructor approves. They can still pick 1.5, 2, 2.5 or 3 hours.",
        unit: "hours",
        defaultValue: 1.5,
        min: 1.5,
        max: 3,
        options: CLASS_LENGTH_OPTIONS,
        source: "Team decision",
      },
      {
        key: RULE_KEYS.returnGrace,
        label: "Return grace period",
        description: "Extra time after class ends before the loan is due.",
        unit: "minutes",
        defaultValue: 15,
        min: 15,
        max: 30,
        source: "Team decision",
      },
    ],
  },
  {
    id: "kiosk",
    title: "Kiosk sessions",
    description: "Timing of the borrow flow at the kiosk.",
    rules: [
      {
        key: RULE_KEYS.kioskPollInterval,
        label: "Session polling interval",
        description: "How often the kiosk checks the session for updates.",
        unit: "seconds",
        defaultValue: 2,
        min: 1, // Team call
        max: 10, // Team call
        source: "Proposal",
      },
      {
        key: RULE_KEYS.approvalTimeout,
        label: "Instructor approval timeout",
        description: "After this, the session expires and the borrow is denied.",
        unit: "seconds",
        defaultValue: 120,
        min: 30, // Team call
        max: 600, // Team call
        source: "Assumption",
      },
      {
        key: RULE_KEYS.kioskIdleTimeout,
        label: "Session idle timeout",
        description: "Longest pause allowed between checkout steps.",
        unit: "seconds",
        defaultValue: 60,
        min: 15, // Team call
        max: 300, // Team call
        source: "Assumption",
      },
    ],
  },
  {
    id: "stations",
    title: "Stations",
    description: "Heartbeat and health status of kiosks and room readers.",
    rules: [
      {
        key: RULE_KEYS.heartbeatInterval,
        label: "Heartbeat interval",
        description: "How often each station reports that it is online.",
        unit: "seconds",
        defaultValue: 30,
        min: 30,
        max: 60,
        source: "Proposal",
      },
      {
        key: RULE_KEYS.stationWarningAfter,
        label: "Warning after",
        description: "Missed heartbeat windows before a station shows Warning.",
        unit: "count",
        defaultValue: 1,
        min: 1, // Team call
        max: 5, // Team call
        source: "Assumption",
      },
      {
        key: RULE_KEYS.stationOfflineAfter,
        label: "Offline after",
        description: "Missed heartbeat windows before a station shows Offline.",
        unit: "count",
        defaultValue: 2,
        min: 2, // Team call
        max: 10, // Team call
        source: "Assumption",
      },
    ],
  },
  {
    id: "penalties",
    title: "Warnings and penalties",
    description: "When students and instructors are penalized.",
    rules: [
      {
        key: RULE_KEYS.lateWarningLimit,
        label: "Late Arrival Warnings allowed",
        description: "Per student, per term. The next warning penalizes the student and the approving instructor.",
        unit: "count",
        defaultValue: 3,
        min: 1, // Team call
        max: 10, // Team call
        source: "Team decision",
      },
      {
        key: RULE_KEYS.marksBeforeBlock,
        label: "Non-Compliance Marks before block",
        description: "Marks a student can hold before they are blocked from borrowing.",
        unit: "count",
        defaultValue: 2,
        min: 1, // Team call
        max: 10, // Team call
        source: "Proposal",
      },
    ],
  },
];

export const EDITABLE_RULES: EditableRule[] = RULE_GROUPS.flatMap((g) => g.rules);
export const RULES_BY_KEY: Record<string, EditableRule> = Object.fromEntries(EDITABLE_RULES.map((r) => [r.key, r]));

// Rules the PRD fixes as policy. Shown for reference; changing them needs code, not a setting.
export const FIXED_POLICIES: FixedPolicy[] = [
  {
    label: "Checkout factors",
    description: "Card, fingerprint, item tag, photo and instructor approval are all required. Any failure denies the borrow, with no override.",
    source: "Team decision",
  },
  {
    label: "Warning counter reset",
    description: "Late Arrival Warning counts reset at the start of each school term.",
    source: "Assumption",
  },
  {
    label: "Non-Compliance Mark issued",
    description: "As soon as a rule breaks: a loan becomes OVERDUE, or a student gets a Late Arrival Warning past the limit.",
    source: "Team decision",
  },
  {
    label: "Profile hold",
    description: "While any of the student's loans is OVERDUE or MISSING.",
    source: "Proposal",
  },
  {
    label: "Instructor approval freeze",
    description: "While a loan they approved is OVERDUE or MISSING, or after it causes a warning past the limit, until staff lift it.",
    source: "Proposal + team decision",
  },
];

export const UNIT_LABEL: Record<RuleUnit, string> = {
  minutes: "min",
  seconds: "sec",
  hours: "hr",
  count: "",
};

export const formatRuleValue = (rule: EditableRule, value: number) => {
  if (rule.unit === "count") return String(value);
  return `${value} ${UNIT_LABEL[rule.unit]}`;
};

export const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
};

/** Checks one raw input against its rule. Returns an error message, or undefined when valid. */
export const validateRuleValue = (rule: EditableRule, raw: string): string | undefined => {
  const trimmed = raw.trim();
  if (!trimmed) return "Enter a value.";
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return "Enter a number.";
  if (rule.options) {
    return rule.options.includes(value) ? undefined : `Pick one of ${rule.options.join(", ")}.`;
  }
  if (!Number.isInteger(value)) return "Enter a whole number.";
  if (value < rule.min || value > rule.max) return `Must be between ${rule.min} and ${rule.max}.`;
  return undefined;
};

/** Field and cross-field checks for the full set of values. Keys map to error messages. */
export const validateRules = (values: Record<string, string>): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const rule of EDITABLE_RULES) {
    const error = validateRuleValue(rule, values[rule.key] ?? "");
    if (error) errors[rule.key] = error;
  }

  const warningAfter = Number(values[RULE_KEYS.stationWarningAfter]);
  const offlineAfter = Number(values[RULE_KEYS.stationOfflineAfter]);
  if (!errors[RULE_KEYS.stationWarningAfter] && !errors[RULE_KEYS.stationOfflineAfter] && offlineAfter <= warningAfter) {
    errors[RULE_KEYS.stationOfflineAfter] = "Must be more than the Warning threshold.";
  }

  // The longest class plus the grace period must fit the PRD loan cap.
  const grace = Number(values[RULE_KEYS.returnGrace]);
  const longestClass = Math.max(...CLASS_LENGTH_OPTIONS) * 60;
  if (!errors[RULE_KEYS.returnGrace] && longestClass + grace > MAX_LOAN_MINUTES) {
    errors[RULE_KEYS.returnGrace] = `A 3 h class plus this grace period would pass the ${formatMinutes(MAX_LOAN_MINUTES)} loan limit.`;
  }

  return errors;
};
