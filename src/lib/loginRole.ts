import { jwtDecode } from "jwt-decode";

// ASP.NET puts the role under this long claim name unless the token handler maps it to "role".
const MS_ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

type JwtClaims = Record<string, unknown>;

const firstRole = (value: unknown): string | undefined => {
  const role = Array.isArray(value) ? value[0] : value;
  return typeof role === "string" && role ? role : undefined;
};

export const roleFromToken = (accessToken: string): string | undefined => {
  try {
    const claims = jwtDecode<JwtClaims>(accessToken);
    return firstRole(claims.role ?? claims[MS_ROLE_CLAIM] ?? claims.roles);
  } catch {
    return undefined;
  }
};

/**
 * The signed-in role from a /auth/login body, normalised to the app's UPPER_SNAKE values
 * ("Admin" → "ADMIN", "TechStaff" / "tech-staff" → "TECH_STAFF").
 * Looks at body.role, then body.user.role, then the access token's role claim.
 */
export const resolveLoginRole = (body: unknown, accessToken: string): string | undefined => {
  const res = (body ?? {}) as { role?: unknown; user?: { role?: unknown } };
  return normalizeRole(firstRole(res.role) ?? firstRole(res.user?.role) ?? roleFromToken(accessToken));
};

/** "Admin" → "ADMIN", "TechStaff" / "tech-staff" → "TECH_STAFF". */
export const normalizeRole = (raw: string | undefined): string | undefined =>
  raw
    ?.trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
