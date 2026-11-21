import { jwtDecode } from "jwt-decode";
import type { UserDto, UserRole } from "../@types/types";
import { normalizeRole, roleFromToken } from "./loginRole";

// ASP.NET long claim names, used when the token handler does not map them to short ones.
const MS = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/";

type Claims = Record<string, unknown>;

const str = (...values: unknown[]): string => {
  const hit = values.find((v) => typeof v === "string" && v);
  return (hit as string | undefined) ?? "";
};

const readClaims = (accessToken: string): Claims => {
  try {
    return jwtDecode<Claims>(accessToken);
  } catch {
    return {};
  }
};

/** The signed-in user's id from the access token (sub / nameid / nameidentifier). */
export const userIdFromToken = (accessToken: string): string => {
  const c = readClaims(accessToken);
  return str(c.sub, c.nameid, c[`${MS}nameidentifier`], c.userId, c.id);
};

/**
 * A UserDto built from the access token alone, for when GET /users/{id} is not reachable
 * (the backend has no /auth/me, and some roles may not read the users table).
 */
export const userFromToken = (accessToken: string): UserDto => {
  const c = readClaims(accessToken);
  const fullName = str(c.name, c.unique_name, c[`${MS}name`]);
  const [first = "", ...rest] = fullName.split(" ");
  return {
    id: userIdFromToken(accessToken),
    employeeNo: str(c.employeeNo, c.employee_no),
    firstName: str(c.given_name, c.firstName, c[`${MS}givenname`], first),
    lastName: str(c.family_name, c.lastName, c[`${MS}surname`], rest.join(" ")),
    email: str(c.email, c[`${MS}emailaddress`]),
    role: (normalizeRole(roleFromToken(accessToken)) ?? "") as UserRole,
    isEventCoordinator: c.isEventCoordinator === true || c.isEventCoordinator === "true",
    defaultRoomId: null,
    status: "ACTIVE",
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
  };
};
