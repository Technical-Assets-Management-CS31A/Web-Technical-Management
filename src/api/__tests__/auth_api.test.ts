import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const tokens = vi.hoisted(() => ({ access: undefined as string | undefined, refresh: undefined as string | undefined }));
vi.mock("../../utils/token", () => ({
  getToken: () => tokens.access,
  setToken: (t: string) => { tokens.access = t; },
  getRefreshToken: () => tokens.refresh,
  setRefreshToken: (t: string) => { tokens.refresh = t; },
  removeToken: () => { tokens.access = undefined; tokens.refresh = undefined; },
}));

import { api, refreshAccessToken } from "../axios";
import { LoginUserApi, logoutUserApi } from "../auth_api";

beforeEach(() => {
  tokens.access = undefined;
  tokens.refresh = undefined;
});
afterEach(() => vi.restoreAllMocks());

describe("LoginUserApi", () => {
  const session = { accessToken: "a1", refreshToken: "r1", role: "ADMIN" };

  it("posts the credentials to /auth/login", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue({ data: session });
    await LoginUserApi({ email: "admin@example.com", password: "pw" });
    expect(post).toHaveBeenCalledWith("/auth/login", { email: "admin@example.com", password: "pw" });
  });

  it("returns the session from a flat body", async () => {
    vi.spyOn(api, "post").mockResolvedValue({ data: session });
    await expect(LoginUserApi({ email: "e", password: "p" })).resolves.toEqual(session);
  });

  it("returns the session from a { data } envelope", async () => {
    vi.spyOn(api, "post").mockResolvedValue({ data: { data: session } });
    await expect(LoginUserApi({ email: "e", password: "p" })).resolves.toEqual(session);
  });
});

describe("logoutUserApi", () => {
  it("sends the refresh token and clears the session even when the call fails", async () => {
    tokens.access = "a1";
    tokens.refresh = "r1";
    const post = vi.spyOn(api, "post").mockRejectedValue(new Error("down"));
    await expect(logoutUserApi()).rejects.toThrow("down");
    expect(post).toHaveBeenCalledWith("/auth/logout", { refreshToken: "r1" });
    expect(tokens.access).toBeUndefined();
    expect(tokens.refresh).toBeUndefined();
  });
});

describe("refreshAccessToken", () => {
  it("sends the stored refresh token in the body and keeps the rotated one", async () => {
    tokens.refresh = "r1";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { accessToken: "a2", refreshToken: "r2" } }), { status: 200 }),
    );
    await expect(refreshAccessToken()).resolves.toBe("a2");
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/auth\/refresh$/);
    expect(JSON.parse(String(init?.body))).toEqual({ refreshToken: "r1" });
    expect(tokens.access).toBe("a2");
    expect(tokens.refresh).toBe("r2");
  });

  it("fails without calling the server when no refresh token is stored", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    await expect(refreshAccessToken()).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
