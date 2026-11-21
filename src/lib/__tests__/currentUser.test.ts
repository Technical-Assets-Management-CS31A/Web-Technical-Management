import { describe, expect, it } from "vitest";
import { userFromToken, userIdFromToken } from "../currentUser";

const token = (claims: object) =>
  `e30.${btoa(JSON.stringify(claims)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_")}.sig`;

describe("userFromToken", () => {
  it("reads short claim names", () => {
    const user = userFromToken(token({ sub: "u1", email: "admin@tams.test", role: "Admin", given_name: "Ada", family_name: "Lovelace" }));
    expect(user).toMatchObject({ id: "u1", email: "admin@tams.test", role: "ADMIN", firstName: "Ada", lastName: "Lovelace" });
  });

  it("reads ASP.NET long claim names and splits a full name", () => {
    const ms = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/";
    const user = userFromToken(
      token({
        [`${ms}nameidentifier`]: "u2",
        [`${ms}emailaddress`]: "staff@tams.test",
        [`${ms}name`]: "Grace Brewster Hopper",
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "TechStaff",
      }),
    );
    expect(user).toMatchObject({ id: "u2", email: "staff@tams.test", role: "TECH_STAFF", firstName: "Grace", lastName: "Brewster Hopper" });
  });

  it("returns an empty id for an unreadable token", () => {
    expect(userIdFromToken("garbage")).toBe("");
  });
});
