import { describe, expect, it } from "vitest";
import { resolveLoginRole } from "../loginRole";

// Unsigned JWT with the given claims; jwt-decode only reads the payload.
const token = (claims: object) =>
  `e30.${btoa(JSON.stringify(claims)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_")}.sig`;

describe("resolveLoginRole", () => {
  it("reads a top-level role", () => {
    expect(resolveLoginRole({ role: "ADMIN" }, token({}))).toBe("ADMIN");
  });

  it("normalises casing", () => {
    expect(resolveLoginRole({ role: "Admin" }, token({}))).toBe("ADMIN");
    expect(resolveLoginRole({ role: "TechStaff" }, token({}))).toBe("TECH_STAFF");
    expect(resolveLoginRole({ role: "tech-staff" }, token({}))).toBe("TECH_STAFF");
  });

  it("reads a nested user.role", () => {
    expect(resolveLoginRole({ user: { role: "INSTRUCTOR" } }, token({}))).toBe("INSTRUCTOR");
  });

  it("falls back to the token's role claims", () => {
    expect(resolveLoginRole({}, token({ role: "Admin" }))).toBe("ADMIN");
    expect(
      resolveLoginRole({}, token({ "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": ["Custodian"] })),
    ).toBe("CUSTODIAN");
  });

  it("returns undefined when there is no role anywhere", () => {
    expect(resolveLoginRole({}, "not-a-jwt")).toBeUndefined();
  });
});
