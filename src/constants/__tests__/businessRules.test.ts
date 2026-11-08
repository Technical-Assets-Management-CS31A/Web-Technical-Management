import { describe, expect, it } from "vitest";
import { EDITABLE_RULES, RULE_KEYS, validateRules } from "../businessRules";

const defaults = () => Object.fromEntries(EDITABLE_RULES.map((r) => [r.key, String(r.defaultValue)]));

describe("validateRules", () => {
  it("accepts the PRD 4.1 defaults", () => {
    expect(validateRules(defaults())).toEqual({});
  });

  it("enforces the 15 to 30 minute grace range", () => {
    expect(validateRules({ ...defaults(), [RULE_KEYS.returnGrace]: "14" })[RULE_KEYS.returnGrace]).toBeDefined();
    expect(validateRules({ ...defaults(), [RULE_KEYS.returnGrace]: "30" })[RULE_KEYS.returnGrace]).toBeUndefined();
    expect(validateRules({ ...defaults(), [RULE_KEYS.returnGrace]: "31" })[RULE_KEYS.returnGrace]).toBeDefined();
  });

  it("only allows the listed class lengths", () => {
    expect(validateRules({ ...defaults(), [RULE_KEYS.defaultClassLength]: "2.5" })).toEqual({});
    expect(validateRules({ ...defaults(), [RULE_KEYS.defaultClassLength]: "1.75" })[RULE_KEYS.defaultClassLength]).toBeDefined();
  });

  it("rejects blanks and fractions on whole-number rules", () => {
    const errors = validateRules({ ...defaults(), [RULE_KEYS.transitWindow]: "", [RULE_KEYS.lateWarningLimit]: "2.5" });
    expect(errors[RULE_KEYS.transitWindow]).toBeDefined();
    expect(errors[RULE_KEYS.lateWarningLimit]).toBeDefined();
  });

  it("requires Offline to come after Warning", () => {
    const errors = validateRules({ ...defaults(), [RULE_KEYS.stationWarningAfter]: "3", [RULE_KEYS.stationOfflineAfter]: "3" });
    expect(errors[RULE_KEYS.stationOfflineAfter]).toBeDefined();
  });
});
